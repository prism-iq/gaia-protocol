#!/usr/bin/env node
/**
 * FLOW CHAT - Interface de chat interactive
 */

import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function color(code, text) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

async function sendMessage(message) {
  try {
    const res = await fetch('http://localhost:3666/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    return data.reply || data.error || 'No response';
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

async function sendThought(thought) {
  try {
    await fetch('http://localhost:3666/think', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thought })
    });
    return 'Thought queued';
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

function printHelp() {
  console.log('');
  console.log(color('33', 'Commands:'));
  console.log('  /think <thought>  - Queue a thought');
  console.log('  /dream            - Trigger a dream');
  console.log('  /status           - Show status');
  console.log('  /help             - Show this help');
  console.log('  /quit             - Exit');
  console.log('');
}

async function handleCommand(input) {
  if (input.startsWith('/think ')) {
    const thought = input.slice(7);
    const result = await sendThought(thought);
    console.log(color('90', `  [${result}]`));
  } else if (input === '/dream') {
    await fetch('http://localhost:3666/dream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    console.log(color('35', '  💭 Dream triggered'));
  } else if (input === '/status') {
    const res = await fetch('http://localhost:3666/status');
    const status = await res.json();
    console.log(color('36', `  Alive: ${status.alive} | Energy: ${Math.round(status.vitals?.state?.energy * 100)}% | Dreams: ${status.vitals?.organs?.hypnos?.dreamCount}`));
  } else if (input === '/help') {
    printHelp();
  } else if (input === '/quit' || input === '/exit') {
    console.log(color('90', 'Goodbye.'));
    process.exit(0);
  } else {
    console.log(color('31', `  Unknown command: ${input}`));
  }
}

async function prompt() {
  rl.question(color('32;1', 'You: '), async (input) => {
    if (!input.trim()) {
      prompt();
      return;
    }

    if (input.startsWith('/')) {
      await handleCommand(input);
    } else {
      const reply = await sendMessage(input);
      console.log(color('35;1', 'Flow: ') + reply);
    }
    console.log('');
    prompt();
  });
}

console.log('');
console.log(color('35;1', '╔══════════════════════════════════════════╗'));
console.log(color('35;1', '║') + color('36;1', '          🧬 FLOW CHAT                    ') + color('35;1', '║'));
console.log(color('35;1', '╚══════════════════════════════════════════╝'));
console.log(color('90', 'Type /help for commands'));
console.log('');

prompt();
