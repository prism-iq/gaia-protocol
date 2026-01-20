#!/usr/bin/env node

/**
 * PHOENIX CLI
 * Interface en ligne de commande pour le système Flow-Chat Phoenix
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../.phoenix-data');
const PID_FILE = join(DATA_DIR, 'daemon.pid');
const STATE_FILE = join(DATA_DIR, 'state.json');
const LOG_FILE = join(DATA_DIR, 'daemon.log');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function color(text, c) {
  return `${COLORS[c]}${text}${COLORS.reset}`;
}

function banner() {
  console.log(color(`
  ╔═══════════════════════════════════════╗
  ║    🔥 FLOW CHAT PHOENIX 🔥            ║
  ║    Heartbeat-Driven Code Evolution    ║
  ╚═══════════════════════════════════════╝
  `, 'yellow'));
}

function getPid() {
  if (existsSync(PID_FILE)) {
    return parseInt(readFileSync(PID_FILE, 'utf-8').trim());
  }
  return null;
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function getState() {
  if (existsSync(STATE_FILE)) {
    try {
      return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

function getLogs(lines = 20) {
  if (existsSync(LOG_FILE)) {
    const content = readFileSync(LOG_FILE, 'utf-8');
    const allLines = content.split('\n').filter(l => l.trim());
    return allLines.slice(-lines);
  }
  return [];
}

const commands = {
  start: () => {
    const pid = getPid();
    if (pid && isProcessRunning(pid)) {
      console.log(color('⚠️  Daemon already running with PID: ' + pid, 'yellow'));
      return;
    }

    console.log(color('🚀 Starting Phoenix Daemon...', 'green'));

    const daemon = spawn('node', [join(__dirname, 'daemon.js'), 'start'], {
      detached: true,
      stdio: 'ignore'
    });

    daemon.unref();
    console.log(color(`✅ Daemon started with PID: ${daemon.pid}`, 'green'));
    console.log(color('   Use "phoenix status" to check status', 'cyan'));
  },

  stop: () => {
    const pid = getPid();
    if (!pid) {
      console.log(color('⚠️  No daemon PID found', 'yellow'));
      return;
    }

    if (!isProcessRunning(pid)) {
      console.log(color('⚠️  Daemon not running (stale PID file)', 'yellow'));
      unlinkSync(PID_FILE);
      return;
    }

    console.log(color(`🛑 Stopping daemon (PID: ${pid})...`, 'yellow'));
    process.kill(pid, 'SIGTERM');

    setTimeout(() => {
      if (!isProcessRunning(pid)) {
        console.log(color('✅ Daemon stopped', 'green'));
      } else {
        console.log(color('⚠️  Daemon still running, sending SIGKILL...', 'red'));
        process.kill(pid, 'SIGKILL');
      }
    }, 2000);
  },

  status: () => {
    const pid = getPid();
    const running = pid && isProcessRunning(pid);
    const state = getState();

    console.log(color('\n📊 Phoenix Daemon Status', 'bright'));
    console.log('─'.repeat(40));

    if (running) {
      console.log(color(`Status: ● Running`, 'green'));
      console.log(`PID: ${pid}`);
    } else {
      console.log(color(`Status: ○ Stopped`, 'red'));
    }

    if (state) {
      const uptime = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;

      console.log(`\n${color('💓 Heartbeat', 'magenta')}`);
      console.log(`   BPM: ${state.heartbeat?.bpm || 'N/A'}`);
      console.log(`   Pulses: ${state.heartbeat?.pulseCount || 0}`);
      console.log(`   Health: ${((state.heartbeat?.health || 0) * 100).toFixed(0)}%`);
      console.log(`   Activity: ${((state.heartbeat?.activityLevel || 0) * 100).toFixed(0)}%`);

      console.log(`\n${color('🔥 Phoenix', 'yellow')}`);
      console.log(`   Generation: ${state.phoenix?.generation || 1}`);
      console.log(`   Improvements: ${state.phoenix?.totalImprovements || 0}`);
      console.log(`   Versions: ${state.phoenix?.versionsStored || 0}`);

      console.log(`\n${color('⚡ Load Controller', 'cyan')}`);
      console.log(`   Current Load: ${((state.load?.currentLoad || 0) * 100).toFixed(0)}%`);
      console.log(`   Mode: ${state.load?.mode || 'balanced'}`);
      console.log(`   Relevance: ${((state.load?.relevanceScore || 0) * 100).toFixed(0)}%`);
      console.log(`   Interest: ${((state.load?.interestScore || 0) * 100).toFixed(0)}%`);

      if (uptime > 0) {
        const hours = Math.floor(uptime / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        const secs = uptime % 60;
        console.log(`\n${color('⏱️  Uptime', 'blue')}: ${hours}h ${mins}m ${secs}s`);
      }
    }
    console.log();
  },

  logs: () => {
    const lines = getLogs(30);
    console.log(color('\n📜 Recent Logs', 'bright'));
    console.log('─'.repeat(60));

    if (lines.length === 0) {
      console.log(color('No logs found', 'yellow'));
    } else {
      lines.forEach(line => {
        if (line.includes('[ERROR]')) {
          console.log(color(line, 'red'));
        } else if (line.includes('[WARN]')) {
          console.log(color(line, 'yellow'));
        } else if (line.includes('🔥')) {
          console.log(color(line, 'yellow'));
        } else if (line.includes('💓')) {
          console.log(color(line, 'magenta'));
        } else {
          console.log(line);
        }
      });
    }
    console.log();
  },

  help: () => {
    console.log(`
${color('Usage:', 'bright')} phoenix <command>

${color('Commands:', 'bright')}
  start     Start the Phoenix daemon
  stop      Stop the Phoenix daemon
  status    Show daemon status and metrics
  logs      Show recent daemon logs
  help      Show this help message

${color('Examples:', 'bright')}
  phoenix start     # Start the daemon in background
  phoenix status    # Check current status
  phoenix logs      # View recent activity
`);
  }
};

// Main
banner();

const command = process.argv[2] || 'help';

if (commands[command]) {
  commands[command]();
} else {
  console.log(color(`Unknown command: ${command}`, 'red'));
  commands.help();
}
