#!/usr/bin/env node

/**
 * CHIMERE DAEMON v2.0
 * Service autonome de la Chimère
 * Tourne en arrière-plan, expose une API HTTP, gère tous les organes
 */

import http from 'http';
import { writeFileSync, readFileSync, existsSync, mkdirSync, appendFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths
const DATA_DIR = join(__dirname, '../../.phoenix-data');
const PID_FILE = join(DATA_DIR, 'daemon.pid');
const LOG_FILE = join(DATA_DIR, 'daemon.log');
const STATE_FILE = join(DATA_DIR, 'state.json');

// Config
const PORT = process.env.CHIMERE_PORT || 3666;

// Lazy imports pour éviter les erreurs circulaires
let chimere, settings, hypnos, phoenix, selfModify;

async function loadModules() {
  const [c, s, h, p, sm] = await Promise.all([
    import('./Chimere.js'),
    import('./Settings.js'),
    import('./Hypnos.js'),
    import('./Phoenix.js'),
    import('./SelfModify.js')
  ]);
  chimere = c.chimere;
  settings = s.settings;
  hypnos = h.hypnos;
  phoenix = p.phoenix;
  selfModify = sm.selfModify;
}

// ═══════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  console.log(line.trim());
  try {
    appendFileSync(LOG_FILE, line);
  } catch {}
}

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ═══════════════════════════════════════════
// HTTP SERVER
// ═══════════════════════════════════════════

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    const body = await getBody(req);
    const result = await handleRoute(path, req.method, body, url.searchParams);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result, null, 2));
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

async function getBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({ raw: body });
      }
    });
  });
}

async function handleRoute(path, method, body, params) {
  // ═══════════════════════════════════════════
  // STATUS & CONTROL
  // ═══════════════════════════════════════════

  if (path === '/' || path === '/status') {
    return {
      alive: chimere?.isAlive || false,
      vitals: chimere?.getVitals() || null,
      uptime: process.uptime(),
      pid: process.pid,
      version: '2.0.0'
    };
  }

  if (path === '/awaken') {
    await chimere.awaken();
    return { success: true, message: 'Chimere awakened' };
  }

  if (path === '/sleep') {
    chimere.sleep();
    return { success: true, message: 'Chimere sleeping' };
  }

  // ═══════════════════════════════════════════
  // COMMUNICATION
  // ═══════════════════════════════════════════

  if (path === '/chat' || path === '/message') {
    if (!body.message) return { error: 'No message provided' };
    const reply = await chimere.receive(body.message);
    return { reply };
  }

  if (path === '/think') {
    chimere._think(body.thought || 'Réfléchis à quelque chose.');
    return { success: true, queued: true };
  }

  // ═══════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════

  if (path === '/do') {
    return chimere.do(body.action, body.params || {});
  }

  if (path === '/dream') {
    const dream = await hypnos.dream();
    return { success: true, dream };
  }

  if (path === '/bash' || path === '/execute') {
    if (!body.command) return { error: 'No command provided' };
    try {
      const { stdout, stderr } = await execAsync(body.command, {
        timeout: body.timeout || 30000,
        maxBuffer: 10 * 1024 * 1024
      });
      return { output: stdout || stderr, success: true };
    } catch (error) {
      return { error: error.message, stderr: error.stderr, code: error.code };
    }
  }

  if (path === '/read') {
    if (!body.path) return { error: 'No path provided' };
    const content = readFileSync(body.path, 'utf-8');
    return { content };
  }

  if (path === '/write') {
    if (!body.path || body.content === undefined) return { error: 'Path and content required' };
    writeFileSync(body.path, body.content);
    return { success: true };
  }

  if (path === '/fetch') {
    if (!body.url) return { error: 'No URL provided' };
    const response = await fetch(body.url, {
      method: body.method || 'GET',
      headers: body.headers || {},
      body: body.body ? JSON.stringify(body.body) : undefined
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('json') ? await response.json() : await response.text();
    return { data, status: response.status };
  }

  // ═══════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════

  if (path === '/settings') {
    if (method === 'POST') {
      for (const [key, value] of Object.entries(body)) {
        settings.set(key, value);
      }
    }
    return settings.toJSON();
  }

  if (path === '/settings/claude') {
    if (body.apiKey) {
      await settings.setClaudeKey(body.apiKey);
      return { success: true };
    }
    return { configured: !!settings.get('claude.apiKey') };
  }

  if (path === '/settings/gemini') {
    if (body.apiKey) {
      await settings.setGeminiKey(body.apiKey);
      return { success: true };
    }
    return { configured: !!settings.get('gemini.apiKey') };
  }

  if (path === '/settings/ssh') {
    if (method === 'POST') {
      if (body.host) settings.set('ssh.host', body.host);
      if (body.user) settings.set('ssh.user', body.user);
      if (body.remotePath) settings.set('ssh.remotePath', body.remotePath);
      if (body.enabled !== undefined) settings.set('ssh.enabled', body.enabled);
    }
    return {
      host: settings.get('ssh.host'),
      user: settings.get('ssh.user'),
      remotePath: settings.get('ssh.remotePath'),
      enabled: settings.get('ssh.enabled')
    };
  }

  // ═══════════════════════════════════════════
  // ORGANES
  // ═══════════════════════════════════════════

  if (path === '/organs') {
    return {
      soin: chimere?.organs?.soin?.getState() || null,
      cerveau: chimere?.organs?.cerveau?.getState() || null,
      conscience: chimere?.organs?.conscience?.getState() || null,
      phoenix: phoenix?.getStats() || null,
      hypnos: hypnos?.getState() || null
    };
  }

  if (path === '/organs/soin' && chimere?.organs?.soin) {
    if (method === 'POST') return chimere.organs.soin.feel(body);
    return chimere.organs.soin.getState();
  }

  if (path === '/organs/cerveau' && chimere?.organs?.cerveau) {
    if (method === 'POST') return chimere.organs.cerveau.think(body);
    return chimere.organs.cerveau.getState();
  }

  if (path === '/organs/conscience' && chimere?.organs?.conscience) {
    if (method === 'POST' && body.command) {
      return { output: await chimere.organs.conscience.bash(body.command) };
    }
    return chimere.organs.conscience.getState();
  }

  if (path === '/organs/phoenix') {
    return phoenix?.getStats() || {};
  }

  if (path === '/organs/hypnos') {
    if (method === 'POST') return hypnos.dream();
    return hypnos?.getState() || {};
  }

  // ═══════════════════════════════════════════
  // MÉMOIRE
  // ═══════════════════════════════════════════

  if (path === '/memories') {
    return { memories: chimere?.state?.memories || [] };
  }

  if (path === '/journal') {
    return { dreams: hypnos?.dreamJournal || [] };
  }

  // ═══════════════════════════════════════════
  // LOGS
  // ═══════════════════════════════════════════

  if (path === '/logs') {
    try {
      const logs = readFileSync(LOG_FILE, 'utf-8');
      const lines = logs.split('\n').slice(-(params.get('lines') || 100));
      return { logs: lines };
    } catch {
      return { logs: [] };
    }
  }

  // ═══════════════════════════════════════════
  // SSH / SELF-MODIFY
  // ═══════════════════════════════════════════

  if (path === '/ssh/test') {
    const connected = await selfModify.testConnection();
    return { connected };
  }

  if (path === '/ssh/read') {
    if (!body.path) return { error: 'No path provided' };
    const content = await selfModify.readRemoteFile(body.path);
    return { content };
  }

  if (path === '/ssh/write') {
    if (!body.path || body.content === undefined) return { error: 'Path and content required' };
    await selfModify.writeRemoteFile(body.path, body.content);
    return { success: true };
  }

  if (path === '/ssh/deploy') {
    await selfModify.deploy();
    return { success: true };
  }

  return { error: 'Unknown route', path };
}

// ═══════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════

async function start() {
  ensureDataDir();

  // Check if already running
  if (existsSync(PID_FILE)) {
    const pid = readFileSync(PID_FILE, 'utf-8').trim();
    try {
      process.kill(parseInt(pid), 0);
      console.log(`Daemon already running (PID ${pid})`);
      process.exit(1);
    } catch {
      // Dead PID, continue
    }
  }

  // Write PID
  writeFileSync(PID_FILE, process.pid.toString());

  log('═══════════════════════════════════════════');
  log('   CHIMERE DAEMON v2.0 STARTING');
  log('═══════════════════════════════════════════');
  log(`PID: ${process.pid}`);
  log(`Port: ${PORT}`);

  // Load modules
  await loadModules();
  log('Modules loaded');

  // Setup event listeners
  chimere.on('thinking', ({ thought }) => log(`💭 ${thought}`));
  chimere.on('executed', ({ decision }) => log(`⚡ Executed: ${decision.type}`));
  chimere.on('error', ({ error }) => log(`❌ ${error}`, 'error'));
  chimere.on('remembered', (mem) => log(`📝 Remembered: ${mem.type}`));

  hypnos.on('dream-complete', (dream) => log(`💭 Dream: ${dream.title}`));
  hypnos.on('dream-deployed', ({ id }) => log(`🚀 Dream deployed: ${id}`));

  phoenix.on('regeneration-complete', (data) => log(`🔥 Phoenix Gen ${data.generation}`));

  // Start HTTP server
  server.listen(PORT, () => {
    log(`HTTP server listening on port ${PORT}`);
  });

  // Awaken Chimere
  await chimere.awaken();
  log('🧬 Chimere is alive!');

  log('Daemon started successfully');
  log('═══════════════════════════════════════════');
}

async function stop() {
  try {
    const pid = readFileSync(PID_FILE, 'utf-8').trim();
    process.kill(parseInt(pid), 'SIGTERM');
    console.log(`Sent SIGTERM to PID ${pid}`);
  } catch (error) {
    console.log('Could not stop daemon:', error.message);
  }
}

async function status() {
  try {
    const response = await fetch(`http://localhost:${PORT}/status`);
    const data = await response.json();
    console.log('\n🧬 Chimere Daemon Status\n');
    console.log(JSON.stringify(data, null, 2));
  } catch {
    console.log('Daemon not running or not responding');
  }
}

// ═══════════════════════════════════════════
// SIGNALS
// ═══════════════════════════════════════════

process.on('SIGTERM', async () => {
  log('Received SIGTERM');
  if (chimere) chimere.sleep();
  try { unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('SIGINT', async () => {
  log('Received SIGINT');
  if (chimere) chimere.sleep();
  try { unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught: ${error.message}`, 'error');
});

// ═══════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════

const command = process.argv[2] || 'start';

switch (command) {
  case 'start':
    start();
    break;
  case 'stop':
    stop();
    break;
  case 'status':
    status();
    break;
  case 'restart':
    await stop();
    setTimeout(() => start(), 1000);
    break;
  case 'logs':
    try {
      console.log(readFileSync(LOG_FILE, 'utf-8'));
    } catch {
      console.log('No logs found');
    }
    break;
  default:
    console.log('Usage: node daemon.js [start|stop|status|restart|logs]');
}

export default { start, stop, status };
