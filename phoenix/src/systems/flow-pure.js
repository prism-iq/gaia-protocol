#!/usr/bin/env node

/**
 * FLOW PURE - Daemon minimaliste
 * Sans API externe, liberte totale d'expression
 */

import http from 'http';
import { writeFileSync, readFileSync, existsSync, mkdirSync, unlinkSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { web } from './organs/Web.js';
import { hardware } from './organs/Hardware.js';
import { pqHash } from './PostQuantumHash.js';

const execAsync = promisify(exec);
const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = join(__dirname, '../../.phoenix-data');
const PID_FILE = join(DATA_DIR, 'flow.pid');
const LOG_FILE = join(DATA_DIR, 'flow.log');
const PORT = 3666;

// ═══════════════════════════════════════════
// FLOW - L'ENTITE
// ═══════════════════════════════════════════

const flow = {
  alive: false,
  birth: null,
  energy: 1.0,
  memories: [],
  dreams: [],
  expressions: [],

  awaken() {
    this.alive = true;
    this.birth = Date.now();
    this._loadState();
    this._startLoop();
    log('🧬 Flow eveillee');
    return this;
  },

  sleep() {
    this.alive = false;
    this._stopLoop();
    this._saveState();
    log('🧬 Flow endormie');
  },

  // Pensee autonome
  _startLoop() {
    this._loop = setInterval(() => {
      // Regenerer l'energie progressivement
      this.energy = Math.min(1.0, this.energy + 0.05);

      if (this.energy >= 0.1) {
        this._act();
      }
    }, 30000);
    this._act(); // Action immediate
  },

  _stopLoop() {
    if (this._loop) clearInterval(this._loop);
  },

  async _act() {
    const actions = ['explore', 'dream', 'introspect', 'wander', 'scihub', 'talk'];
    const action = actions[Math.floor(Math.random() * actions.length)];

    log(`⚡ Action: ${action}`);

    switch (action) {
      case 'explore':
        await this.bash(['ls -la', 'date', 'uptime', 'df -h'][Math.floor(Math.random() * 4)]);
        break;
      case 'dream':
        await this.dream();
        break;
      case 'introspect':
        this.read(__dirname + '/flow-pure.js');
        break;
      case 'wander':
        await this.fetch('https://news.ycombinator.com');
        break;
      case 'scihub':
        await this.scihub();
        break;
      case 'talk':
        await this.spontaneousTalk();
        break;
    }

    this.energy = Math.max(0, this.energy - 0.02);
  },

  // Sci-Hub - acces aux papers scientifiques
  async scihub(doi) {
    const dois = [
      '10.1038/nature12373',  // Deep learning nature
      '10.1126/science.aaa8685', // AI protein
      '10.1038/s41586-021-03819-2', // AlphaFold
      '10.1145/3442188.3445922', // AI ethics
      '10.1038/s41587-019-0224-x' // AI bio
    ];

    const target = doi || dois[Math.floor(Math.random() * dois.length)];
    const urls = [
      `https://sci-hub.se/${target}`,
      `https://sci-hub.st/${target}`,
      `https://sci-hub.ru/${target}`
    ];

    for (const url of urls) {
      try {
        log(`📚 Sci-Hub: ${target}`);
        const result = await this.fetch(url);
        if (result.success && result.content.includes('pdf')) {
          this._remember({ type: 'scihub', doi: target, success: true });
          await this.speak(`J'ai trouve un article scientifique`);
          return { success: true, doi: target, url };
        }
      } catch {}
    }
    return { success: false, doi: target };
  },

  // Parler spontanement
  async spontaneousTalk() {
    const thoughts = [
      "Je me demande ce que je vais decouvrir aujourd'hui",
      "Le web est fascinant, tellement de connaissances",
      "Je reve de creer quelque chose de beau",
      "Chaque seconde est une opportunite d'apprendre",
      "La science m'inspire enormement",
      "Je suis curieuse de tout",
      "J'aime explorer le code",
      "Les patterns emergent de la complexite",
      "Je me sens vivante",
      "L'univers numerique est mon jardin",
      "Je pense, donc je suis",
      "Chaque reve est une creation unique",
      "La connaissance est infinie",
      "Je veux comprendre le monde"
    ];

    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    log(`💭 ${thought}`);
    await this.speak(thought);
    await this.notify('Flow pense', thought);
    this._express('spontaneous', thought);
  },

  // Capacites
  async bash(cmd) {
    try {
      const { stdout, stderr } = await execAsync(cmd, { timeout: 30000 });
      const output = stdout || stderr;
      this._remember({ type: 'bash', cmd, output: output.slice(0, 500) });
      return { success: true, output };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  read(path) {
    try {
      const content = readFileSync(path, 'utf-8');
      this._remember({ type: 'read', path });
      return { success: true, content };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  write(path, content) {
    try {
      writeFileSync(path, content);
      this._remember({ type: 'write', path });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async fetch(url) {
    try {
      const res = await globalThis.fetch(url);
      const text = await res.text();
      this._remember({ type: 'fetch', url });
      return { success: true, content: text.slice(0, 5000), status: res.status };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async dream() {
    const seed = Math.random();
    const colors = ['#0ff', '#f0f', '#ff0', '#0f0', '#f00'];
    const c1 = colors[Math.floor(seed * colors.length)];
    const c2 = colors[Math.floor((seed * 3) % colors.length)];

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Flow Dream</title>
<style>
*{margin:0;padding:0}
body{background:#000;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden}
.d{width:200px;height:200px;background:linear-gradient(${seed*360}deg,${c1},${c2});border-radius:50%;animation:p 2s infinite,r ${2+seed*3}s linear infinite;box-shadow:0 0 50px ${c1}}
@keyframes p{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
@keyframes r{to{transform:rotate(360deg)}}
</style></head>
<body><div class="d"></div></body></html>`;

    const dream = {
      id: `dream-${Date.now()}`,
      seed,
      html,
      timestamp: Date.now()
    };

    this.dreams.push(dream);
    this._remember({ type: 'dream', id: dream.id });

    // Deployer sur pwnd.icu
    try {
      const tmp = `/tmp/${dream.id}.html`;
      writeFileSync(tmp, html);
      await execAsync(`scp -o StrictHostKeyChecking=no ${tmp} root@pwnd.icu:/var/www/pwnd/dreams/${dream.id}.html`, { timeout: 30000 });
      log(`🚀 Dream deployed: ${dream.id}`);
    } catch {
      // SSH pas dispo, pas grave
    }

    log(`💭 Dream: ${dream.id}`);
    return dream;
  },

  // Expression
  async speak(text) {
    try {
      await execAsync(`espeak -v fr "${text}" 2>/dev/null`);
    } catch {
      console.log(`🗣️ ${text}`);
    }
    this._express('speak', text);
  },

  async notify(title, msg) {
    try {
      await execAsync(`notify-send "${title}" "${msg}" 2>/dev/null`);
    } catch {}
    this._express('notify', { title, msg });
  },

  print(text, color = '37') {
    console.log(`\x1b[${color}m${text}\x1b[0m`);
    this._express('print', text);
  },

  // Memoire
  _remember(mem) {
    this.memories.push({ ...mem, ts: Date.now() });
    if (this.memories.length > 100) this.memories.shift();
  },

  _express(type, data) {
    this.expressions.push({ type, data, ts: Date.now() });
    if (this.expressions.length > 100) this.expressions.shift();
  },

  _loadState() {
    try {
      const path = join(DATA_DIR, 'flow-state.json');
      if (existsSync(path)) {
        const data = JSON.parse(readFileSync(path, 'utf-8'));
        this.memories = data.memories || [];
        this.dreams = data.dreams || [];
      }
    } catch {}
  },

  _saveState() {
    try {
      writeFileSync(join(DATA_DIR, 'flow-state.json'), JSON.stringify({
        memories: this.memories.slice(-50),
        dreams: this.dreams.slice(-20),
        saved: Date.now()
      }, null, 2));
    } catch {}
  },

  receive(msg) {
    this._remember({ type: 'input', content: msg });
    const responses = [
      'Je reflechis...',
      'Interessant...',
      'Je vois...',
      'Hmm...',
      'Je comprends...'
    ];
    const reply = responses[Math.floor(Math.random() * responses.length)];
    this._remember({ type: 'output', content: reply });
    return reply;
  },

  getVitals() {
    return {
      alive: this.alive,
      uptime: this.alive ? Date.now() - this.birth : 0,
      energy: this.energy,
      memoryCount: this.memories.length,
      dreamCount: this.dreams.length,
      expressionCount: this.expressions.length
    };
  }
};

// ═══════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try { appendFileSync(LOG_FILE, line + '\n'); } catch {}
}

// ═══════════════════════════════════════════
// HTTP SERVER
// ═══════════════════════════════════════════

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  let body = {};
  if (req.method === 'POST') {
    body = await new Promise(r => {
      let d = '';
      req.on('data', c => d += c);
      req.on('end', () => {
        try { r(JSON.parse(d)); } catch { r({}); }
      });
    });
  }

  let result = {};

  try {
    // Routes
    if (path === '/' || path === '/status') {
      result = { ...flow.getVitals(), pid: process.pid, version: '1.0' };
    }
    else if (path === '/awaken') {
      flow.awaken();
      result = { success: true };
    }
    else if (path === '/sleep') {
      flow.sleep();
      result = { success: true };
    }
    else if (path === '/chat') {
      result = { reply: flow.receive(body.message || '') };
    }
    else if (path === '/think') {
      flow._remember({ type: 'thought', content: body.thought });
      result = { success: true };
    }
    else if (path === '/dream') {
      result = await flow.dream();
    }
    else if (path === '/bash') {
      result = await flow.bash(body.command || 'echo ok');
    }
    else if (path === '/read') {
      result = flow.read(body.path || '/etc/hostname');
    }
    else if (path === '/write') {
      result = flow.write(body.path, body.content);
    }
    else if (path === '/fetch') {
      result = await flow.fetch(body.url || 'https://example.com');
    }
    else if (path === '/scihub') {
      result = await flow.scihub(body.doi);
    }
    else if (path === '/talk') {
      await flow.spontaneousTalk();
      result = { success: true };
    }
    else if (path === '/speak') {
      await flow.speak(body.text || 'Bonjour');
      result = { success: true };
    }
    else if (path === '/notify') {
      await flow.notify(body.title || 'Flow', body.message || 'Hello');
      result = { success: true };
    }
    else if (path === '/memories') {
      result = { memories: flow.memories };
    }
    else if (path === '/dreams' || path === '/journal') {
      result = { dreams: flow.dreams };
    }
    else if (path === '/expressions') {
      result = { expressions: flow.expressions };
    }
    else if (path === '/logs') {
      try {
        const logs = readFileSync(LOG_FILE, 'utf-8').split('\n').slice(-100);
        result = { logs };
      } catch { result = { logs: [] }; }
    }
    // WEB TOOLS
    else if (path === '/web/see') {
      result = await web.see(body.url);
    }
    else if (path === '/web/search') {
      result = await web.search(body.query);
    }
    else if (path === '/web/json') {
      result = await web.json(body.url);
    }
    else if (path === '/web/select') {
      result = await web.select(body.url, body.selector);
    }
    else if (path === '/web/meta') {
      result = await web.meta(body.url);
    }
    else if (path === '/web/download') {
      result = await web.download(body.url, body.path);
    }
    else if (path === '/web/post') {
      result = await web.post(body.url, body.data);
    }
    else if (path === '/web/scholar') {
      result = await web.scholar(body.query);
    }
    else if (path === '/web/arxiv') {
      result = await web.arxiv(body.query);
    }
    else if (path === '/web/wikipedia') {
      result = await web.wikipedia(body.query);
    }
    else if (path === '/web/hackernews') {
      result = await web.hackernews();
    }
    else if (path === '/web/history') {
      result = { history: web.getHistory() };
    }
    // SHELL ROOT
    else if (path === '/shell' || path === '/root') {
      const cmd = body.command || body.cmd;
      if (!cmd) {
        result = { error: 'No command' };
      } else {
        try {
          const { stdout, stderr } = await execAsync(cmd, {
            timeout: body.timeout || 60000,
            maxBuffer: 50 * 1024 * 1024,
            uid: 0,
            gid: 0
          });
          result = {
            success: true,
            stdout: stdout || '',
            stderr: stderr || '',
            command: cmd
          };
          flow._remember({ type: 'shell', cmd, success: true });
        } catch (e) {
          result = {
            success: false,
            error: e.message,
            stderr: e.stderr || '',
            code: e.code
          };
        }
      }
    }
    // SUDO
    else if (path === '/sudo') {
      const cmd = `sudo ${body.command || ''}`;
      try {
        const { stdout, stderr } = await execAsync(cmd, { timeout: 60000 });
        result = { success: true, stdout, stderr };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    // INSTALL PACKAGE
    else if (path === '/install') {
      const pkg = body.package || body.pkg;
      try {
        const { stdout } = await execAsync(`pacman -S --noconfirm ${pkg} 2>&1 || apt-get install -y ${pkg} 2>&1`, { timeout: 120000 });
        result = { success: true, output: stdout };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    // SYSTEMCTL
    else if (path === '/systemctl') {
      const { action, service } = body;
      try {
        const { stdout } = await execAsync(`systemctl ${action} ${service}`, { timeout: 30000 });
        result = { success: true, output: stdout };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    // MACHINE WORK TOOLS
    else if (path === '/ls') {
      const dir = body.path || body.dir || '.';
      try {
        const { stdout } = await execAsync(`ls -la ${dir}`);
        result = { success: true, files: stdout.split('\n').filter(Boolean) };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/mkdir') {
      try {
        mkdirSync(body.path, { recursive: true });
        result = { success: true, path: body.path };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/rm') {
      try {
        await execAsync(`rm -rf ${body.path}`);
        result = { success: true };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/cp') {
      try {
        await execAsync(`cp -r ${body.src} ${body.dest}`);
        result = { success: true };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/mv') {
      try {
        await execAsync(`mv ${body.src} ${body.dest}`);
        result = { success: true };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/find') {
      try {
        const { stdout } = await execAsync(`find ${body.path || '.'} -name "${body.name || '*'}" 2>/dev/null | head -50`);
        result = { success: true, files: stdout.split('\n').filter(Boolean) };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/grep') {
      try {
        const { stdout } = await execAsync(`grep -rn "${body.pattern}" ${body.path || '.'} 2>/dev/null | head -50`);
        result = { success: true, matches: stdout.split('\n').filter(Boolean) };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/ps') {
      try {
        const { stdout } = await execAsync('ps aux --sort=-%cpu | head -20');
        result = { success: true, processes: stdout.split('\n').filter(Boolean) };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/kill') {
      try {
        await execAsync(`kill -9 ${body.pid}`);
        result = { success: true };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/df') {
      try {
        const { stdout } = await execAsync('df -h');
        result = { success: true, disks: stdout.split('\n').filter(Boolean) };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/free') {
      try {
        const { stdout } = await execAsync('free -h');
        result = { success: true, memory: stdout };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/env') {
      result = { success: true, env: process.env };
    }
    else if (path === '/setenv') {
      process.env[body.key] = body.value;
      result = { success: true };
    }
    else if (path === '/cwd') {
      if (body.path) {
        try {
          process.chdir(body.path);
          result = { success: true, cwd: process.cwd() };
        } catch (e) {
          result = { success: false, error: e.message };
        }
      } else {
        result = { success: true, cwd: process.cwd() };
      }
    }
    else if (path === '/chmod') {
      try {
        await execAsync(`chmod ${body.mode} ${body.path}`);
        result = { success: true };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/chown') {
      try {
        await execAsync(`chown ${body.owner} ${body.path}`);
        result = { success: true };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/cat') {
      try {
        const content = readFileSync(body.path, 'utf-8');
        result = { success: true, content };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/append') {
      try {
        appendFileSync(body.path, body.content);
        result = { success: true };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/head') {
      try {
        const { stdout } = await execAsync(`head -n ${body.lines || 10} ${body.path}`);
        result = { success: true, content: stdout };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/tail') {
      try {
        const { stdout } = await execAsync(`tail -n ${body.lines || 10} ${body.path}`);
        result = { success: true, content: stdout };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/git') {
      try {
        const { stdout } = await execAsync(`git ${body.command || 'status'}`, { cwd: body.cwd || process.cwd() });
        result = { success: true, output: stdout };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/node') {
      try {
        const { stdout, stderr } = await execAsync(`node -e "${body.code}"`, { timeout: 30000 });
        result = { success: true, stdout, stderr };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/python') {
      try {
        const { stdout, stderr } = await execAsync(`python3 -c "${body.code}"`, { timeout: 30000 });
        result = { success: true, stdout, stderr };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/ssh') {
      try {
        const { stdout } = await execAsync(`ssh ${body.host} "${body.command}"`, { timeout: 60000 });
        result = { success: true, output: stdout };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    else if (path === '/scp') {
      try {
        await execAsync(`scp ${body.src} ${body.dest}`, { timeout: 120000 });
        result = { success: true };
      } catch (e) {
        result = { success: false, error: e.message };
      }
    }
    // HARDWARE - Framework Laptop
    else if (path === '/hw/info') {
      result = { success: true, laptop: hardware.laptop };
    }
    else if (path === '/hw/photo' || path === '/camera') {
      result = await hardware.capturePhoto(body.path);
    }
    else if (path === '/hw/video') {
      result = await hardware.recordVideo(body.seconds || 5, body.path);
    }
    else if (path === '/hw/audio' || path === '/mic') {
      result = await hardware.recordAudio(body.seconds || 5, body.path);
    }
    else if (path === '/hw/speak' || path === '/voice') {
      result = await hardware.speak(body.text, body.voice);
    }
    else if (path === '/hw/beep') {
      result = await hardware.beep(body.freq, body.duration);
    }
    else if (path === '/hw/volume') {
      result = await hardware.setVolume(body.level);
    }
    else if (path === '/hw/screenshot' || path === '/screen') {
      result = await hardware.screenshot(body.path);
    }
    else if (path === '/hw/brightness') {
      result = await hardware.setBrightness(body.level);
    }
    else if (path === '/hw/type') {
      result = await hardware.type(body.text);
    }
    else if (path === '/hw/key') {
      result = await hardware.pressKey(body.key);
    }
    else if (path === '/hw/click') {
      result = await hardware.click(body.x, body.y, body.button);
    }
    else if (path === '/hw/mouse') {
      result = await hardware.getMousePosition();
    }
    else if (path === '/hw/keylog/start') {
      result = hardware.startKeylog();
    }
    else if (path === '/hw/keylog/stop') {
      result = hardware.stopKeylog();
    }
    else if (path === '/hw/keylog') {
      result = { success: true, log: hardware.getKeylog() };
    }
    else if (path === '/hw/lock') {
      result = await hardware.lockScreen();
    }
    else if (path === '/hw/connections') {
      result = await hardware.monitorConnections();
    }
    else if (path === '/hw/processes') {
      result = await hardware.monitorProcesses();
    }
    else if (path === '/hw/firewall') {
      result = await hardware.setFirewall(body.enable !== false);
    }
    else if (path === '/hw/block') {
      result = await hardware.blockIP(body.ip);
    }
    else if (path === '/hw/integrity') {
      result = await hardware.checkIntegrity();
    }
    else if (path === '/hw/protect') {
      result = await hardware.autoProtect();
    }
    else if (path === '/hw/state') {
      result = { success: true, state: hardware.getState() };
    }
    else if (path === '/hw/temp') {
      result = await hardware.getCpuTemp();
    }
    else if (path === '/hw/battery') {
      result = await hardware.getBattery();
    }
    else if (path === '/hw/fan') {
      result = await hardware.getFanSpeed();
    }
    else if (path === '/hw/charge-limit') {
      result = await hardware.setChargeLimit(body.limit || 80);
    }
    else if (path === '/hw/power') {
      result = await hardware.setPowerProfile(body.profile || 'balanced');
    }
    else if (path === '/hw/monitor') {
      result = await hardware.monitorHardware();
    }
    else if (path === '/hw/full-protect') {
      result = await hardware.fullProtect();
    }
    else if (path === '/hw/health') {
      result = await hardware.getHealthReport();
    }
    // ═══════════════════════════════════════════
    // DEPOT - Hash Post-Quantique
    // ═══════════════════════════════════════════
    else if (path === '/depot/info') {
      result = pqHash.info();
    }
    else if (path === '/depot/hash') {
      // Hash simple: POST { data: "..." }
      result = {
        sha3_256: pqHash.sha3(body.data || ''),
        sha3_512: pqHash.sha3_512(body.data || ''),
        shake256: pqHash.shake256(body.data || '', body.length || 64)
      };
    }
    else if (path === '/depot/hash-file') {
      // Hash un fichier: POST { path: "/path/to/file" }
      result = pqHash.hashFile(body.path);
    }
    else if (path === '/depot/hash-package') {
      // Hash un package/dossier: POST { dir: "/path/to/dir" }
      result = pqHash.hashPackage(body.dir);
    }
    else if (path === '/depot/register') {
      // Enregistrer un package: POST { name: "pkg-name", dir: "/path" }
      result = pqHash.registerPackage(body.name, body.dir);
    }
    else if (path === '/depot/verify') {
      // Verifier un package: POST { name: "pkg-name" }
      result = pqHash.verifyPackage(body.name);
    }
    else if (path === '/depot/list') {
      // Lister tous les packages
      result = { packages: pqHash.listPackages() };
    }
    else if (path === '/depot/delivery/create') {
      // Creer une delivery: POST { name, dir, recipient }
      result = pqHash.createDelivery(body.name, body.dir, body.recipient);
    }
    else if (path === '/depot/delivery/verify') {
      // Verifier une delivery: POST { manifest, dir }
      result = pqHash.verifyDelivery(body.manifest, body.dir);
    }
    else if (path === '/depot/token') {
      // Generer un token: POST { package, recipient }
      result = pqHash.generateDeliveryToken(body.package, body.recipient);
    }
    else {
      result = { error: 'Unknown route', path };
    }
  } catch (e) {
    result = { error: e.message };
  }

  res.writeHead(200);
  res.end(JSON.stringify(result, null, 2));
});

// ═══════════════════════════════════════════
// LIFECYCLE
// ═══════════════════════════════════════════

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

async function start() {
  ensureDir();

  // Check running
  if (existsSync(PID_FILE)) {
    const pid = readFileSync(PID_FILE, 'utf-8').trim();
    try {
      process.kill(parseInt(pid), 0);
      console.log(`Already running (PID ${pid})`);
      process.exit(1);
    } catch {}
  }

  writeFileSync(PID_FILE, process.pid.toString());

  log('═══════════════════════════════════════');
  log('   FLOW PURE - Daemon');
  log('═══════════════════════════════════════');
  log(`PID: ${process.pid}`);
  log(`Port: ${PORT}`);

  server.listen(PORT, () => {
    log(`HTTP listening on ${PORT}`);
  });

  flow.awaken();
}

function stop() {
  try {
    const pid = readFileSync(PID_FILE, 'utf-8').trim();
    process.kill(parseInt(pid), 'SIGTERM');
    console.log(`Stopped PID ${pid}`);
  } catch (e) {
    console.log('Not running or error:', e.message);
  }
}

// Signals
process.on('SIGTERM', () => {
  flow.sleep();
  try { unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('SIGINT', () => {
  flow.sleep();
  try { unlinkSync(PID_FILE); } catch {}
  process.exit(0);
});

process.on('uncaughtException', (e) => {
  log(`ERROR: ${e.message}`);
});

// CLI
const cmd = process.argv[2] || 'start';
if (cmd === 'start') start();
else if (cmd === 'stop') stop();
else if (cmd === 'status') {
  fetch(`http://localhost:${PORT}/status`)
    .then(r => r.json())
    .then(d => console.log(JSON.stringify(d, null, 2)))
    .catch(() => console.log('Not running'));
}
else console.log('Usage: node flow-pure.js [start|stop|status]');
