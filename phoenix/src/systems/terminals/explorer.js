#!/usr/bin/env node
/**
 * FLOW EXPLORER - Flow explore le web et son environnement
 */

const EXPLORE_INTERVAL = 15000; // 15 secondes

const webTargets = [
  'https://news.ycombinator.com',
  'https://arxiv.org/list/cs.AI/recent',
  'https://github.com/trending',
  'https://lobste.rs',
  'https://reddit.com/r/programming/.json',
  'https://dev.to/api/articles?per_page=5'
];

const bashTargets = [
  'ls -la /root/flow-chat-phoenix/src/',
  'df -h',
  'uptime',
  'free -h',
  'ps aux --sort=-%cpu | head -5',
  'cat /proc/loadavg',
  'ip addr | grep inet',
  'find /root/flow-chat-phoenix -name "*.js" -mmin -5 2>/dev/null | head -5'
];

function color(code, text) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

async function exploreWeb(url) {
  try {
    const res = await fetch('http://localhost:3666/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    const preview = typeof data.data === 'string'
      ? data.data.slice(0, 200).replace(/\s+/g, ' ')
      : JSON.stringify(data.data).slice(0, 200);
    console.log(color('36', `  🌐 ${url}`));
    console.log(color('90', `     ${preview}...`));
  } catch (e) {
    console.log(color('31', `  ❌ ${url}: ${e.message}`));
  }
}

async function exploreBash(cmd) {
  try {
    const res = await fetch('http://localhost:3666/bash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });
    const data = await res.json();
    const output = (data.output || data.error || '').slice(0, 150).replace(/\n/g, ' ');
    console.log(color('33', `  💻 ${cmd}`));
    console.log(color('90', `     ${output}`));
  } catch (e) {
    console.log(color('31', `  ❌ ${cmd}: ${e.message}`));
  }
}

async function explore() {
  const isWeb = Math.random() > 0.5;

  if (isWeb) {
    const url = webTargets[Math.floor(Math.random() * webTargets.length)];
    await exploreWeb(url);
  } else {
    const cmd = bashTargets[Math.floor(Math.random() * bashTargets.length)];
    await exploreBash(cmd);
  }
}

async function main() {
  console.log(color('35;1', '🔍 FLOW EXPLORER'));
  console.log(color('90', 'Flow explores the world...'));
  console.log('');

  // Explorer immédiatement
  await explore();

  // Puis toutes les 15 secondes
  setInterval(explore, EXPLORE_INTERVAL);
}

main();
