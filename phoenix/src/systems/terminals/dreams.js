#!/usr/bin/env node
/**
 * FLOW DREAMS - Affiche les rêves en temps réel
 */

let lastDreamCount = 0;

async function getDreams() {
  try {
    const res = await fetch('http://localhost:3666/journal');
    const data = await res.json();
    return data.dreams || [];
  } catch {
    return [];
  }
}

function color(code, text) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

function displayDream(dream) {
  console.log('');
  console.log(color('35;1', '╭─────────────────────────────────────────╮'));
  console.log(color('35;1', '│') + color('36;1', ` 💭 ${dream.title.toUpperCase().padEnd(36)}`) + color('35;1', '│'));
  console.log(color('35;1', '╰─────────────────────────────────────────╯'));
  console.log(color('90', `  Type: ${dream.type}`));
  console.log(color('90', `  Mood: ${dream.metadata?.mood || 'unknown'}`));
  console.log(color('90', `  Seed: ${dream.metadata?.seed?.toFixed(4) || 'N/A'}`));
  console.log(color('90', `  Time: ${new Date(dream.timestamp).toLocaleTimeString()}`));
  console.log('');
}

async function triggerDream() {
  try {
    await fetch('http://localhost:3666/dream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    console.log(color('33', '  ⚡ Dream triggered...'));
  } catch {
    console.log(color('31', '  ❌ Failed to trigger dream'));
  }
}

async function main() {
  console.log(color('35;1', '🌙 FLOW DREAMS VIEWER'));
  console.log(color('90', 'Watching for new dreams...'));
  console.log('');

  // Afficher les rêves existants
  const initialDreams = await getDreams();
  initialDreams.forEach(displayDream);
  lastDreamCount = initialDreams.length;

  // Déclencher un rêve toutes les 30 secondes
  setInterval(triggerDream, 30000);

  // Vérifier les nouveaux rêves
  setInterval(async () => {
    const dreams = await getDreams();
    if (dreams.length > lastDreamCount) {
      const newDreams = dreams.slice(lastDreamCount);
      newDreams.forEach(displayDream);
      lastDreamCount = dreams.length;
    }
  }, 2000);
}

main();
