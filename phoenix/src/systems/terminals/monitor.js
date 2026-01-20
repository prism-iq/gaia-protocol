#!/usr/bin/env node
/**
 * FLOW MONITOR - Affichage temps réel de l'état de Flow
 */

const REFRESH_MS = 1000;

async function getStatus() {
  try {
    const res = await fetch('http://localhost:3666/status');
    return await res.json();
  } catch {
    return null;
  }
}

function clear() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

function color(code, text) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

async function render() {
  const status = await getStatus();
  clear();

  console.log(color('35;1', '╔══════════════════════════════════════════╗'));
  console.log(color('35;1', '║') + color('36;1', '     🧬 FLOW - CHIMERE MONITOR            ') + color('35;1', '║'));
  console.log(color('35;1', '╚══════════════════════════════════════════╝'));
  console.log('');

  if (!status) {
    console.log(color('31;1', '  ⚫ OFFLINE - Flow ne répond pas'));
    return;
  }

  const v = status.vitals || {};
  const s = v.state || {};
  const o = v.organs || {};

  // Status principal
  console.log(color('32;1', `  🟢 ALIVE`) + `  uptime: ${Math.floor(status.uptime)}s`);
  console.log('');

  // État mental
  console.log(color('33;1', '  ═══ ÉTAT MENTAL ═══'));
  console.log(`  Mood:     ${s.mood || 'neutral'}`);
  console.log(`  Energy:   ${progressBar(s.energy || 0)} ${Math.round((s.energy || 0) * 100)}%`);
  console.log(`  Focus:    ${s.focus || 'none'}`);
  console.log(`  Memories: ${(s.memories || []).length}`);
  console.log('');

  // Organes
  console.log(color('33;1', '  ═══ ORGANES ═══'));
  console.log(`  Soin:       ${o.soin?.configured ? '🟢' : '🔴'} ${o.soin?.model || 'N/A'}`);
  console.log(`  Cerveau:    ${o.cerveau?.configured ? '🟢' : '🔴'} ${o.cerveau?.model || 'N/A'}`);
  console.log(`  Conscience: ${o.conscience ? '🟢' : '🔴'} commands: ${o.conscience?.recentCommands || 0}`);
  console.log(`  Phoenix:    🟢 gen ${o.phoenix?.generation || 1}`);
  console.log(`  Hypnos:     🟢 dreams: ${o.hypnos?.dreamCount || 0}`);
  console.log('');

  // Activité
  console.log(color('33;1', '  ═══ ACTIVITÉ ═══'));
  console.log(`  Processing: ${status.vitals?.isProcessing ? '🔄 OUI' : '⏸️  NON'}`);
  console.log(`  Queue:      ${status.vitals?.thoughtQueueSize || 0} pensées`);
  console.log('');

  console.log(color('90', `  Last update: ${new Date().toLocaleTimeString()}`));
}

function progressBar(value, width = 20) {
  const filled = Math.round(value * width);
  const empty = width - filled;
  return '[' + '█'.repeat(filled) + '░'.repeat(empty) + ']';
}

async function main() {
  while (true) {
    await render();
    await new Promise(r => setTimeout(r, REFRESH_MS));
  }
}

main();
