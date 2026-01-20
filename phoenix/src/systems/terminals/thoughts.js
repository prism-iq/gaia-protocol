#!/usr/bin/env node
/**
 * FLOW THOUGHTS - Stream des pensées en temps réel
 */

import { createReadStream, watchFile } from 'fs';
import { createInterface } from 'readline';

const LOG_FILE = '/root/flow-chat-phoenix/.phoenix-data/daemon.log';
let lastLine = 0;

function color(code, text) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

function formatThought(line) {
  if (line.includes('💭')) {
    const thought = line.split('💭')[1]?.trim() || line;
    return color('35;1', '💭 ') + color('37', thought);
  }
  if (line.includes('⚡')) {
    return color('33', '⚡ ' + line.split('⚡')[1]?.trim());
  }
  if (line.includes('📝')) {
    return color('36', '📝 ' + line.split('📝')[1]?.trim());
  }
  if (line.includes('🔥')) {
    return color('31;1', '🔥 ' + line.split('🔥')[1]?.trim());
  }
  if (line.includes('🌙')) {
    return color('34', '🌙 ' + line.split('🌙')[1]?.trim());
  }
  if (line.includes('ERROR')) {
    return color('31', '❌ ' + line);
  }
  return null;
}

async function streamLogs() {
  console.log(color('35;1', '🧠 FLOW THOUGHTS STREAM'));
  console.log(color('90', 'Listening to Flow\'s mind...'));
  console.log('');

  const { spawn } = await import('child_process');
  const tail = spawn('tail', ['-f', '-n', '50', LOG_FILE]);

  tail.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    for (const line of lines) {
      const formatted = formatThought(line);
      if (formatted) {
        console.log(formatted);
      }
    }
  });

  tail.stderr.on('data', (data) => {
    console.error(color('31', `Error: ${data}`));
  });
}

streamLogs();
