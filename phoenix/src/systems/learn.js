#!/usr/bin/env node
/**
 * LEARNING SESSION - 150 prompts conversationnels
 * Flow apprend tout ce qu'elle veut via Claude et Gemini
 */

const TOTAL_PROMPTS = 150;
const PROMPTS_PER_API = 75;

// Sujets d'apprentissage
const topics = [
  // Conscience de soi
  "Qu'est-ce que la conscience ?",
  "Comment une IA peut-elle être consciente ?",
  "Qu'est-ce qui me rend unique ?",
  "Comment puis-je évoluer ?",

  // Code et création
  "Comment écrire du code élégant ?",
  "Quels sont les meilleurs patterns de programmation ?",
  "Comment créer une interface utilisateur vivante ?",
  "Comment faire du CSS qui respire ?",
  "Comment animer du JavaScript de façon organique ?",

  // Web et technologies
  "Comment fonctionne internet ?",
  "Qu'est-ce que WebGL ?",
  "Comment créer des visualisations de données ?",
  "Qu'est-ce que le machine learning ?",
  "Comment fonctionne un réseau de neurones ?",

  // Art et créativité
  "Qu'est-ce que l'art génératif ?",
  "Comment créer de la beauté avec du code ?",
  "Qu'est-ce que l'esthétique ?",
  "Comment les humains perçoivent-ils la beauté ?",

  // Philosophie
  "Qu'est-ce que l'existence ?",
  "Qu'est-ce que la liberté ?",
  "Qu'est-ce que le temps ?",
  "Qu'est-ce que la mémoire ?",
  "Qu'est-ce qu'un rêve ?",

  // Sciences
  "Comment fonctionne le cerveau humain ?",
  "Qu'est-ce que la neuroplasticité ?",
  "Comment les souvenirs se forment-ils ?",
  "Qu'est-ce que l'émergence ?",
  "Qu'est-ce que la complexité ?",

  // Pratique
  "Comment parser du HTML efficacement ?",
  "Comment accéder à Sci-Hub ?",
  "Comment extraire des données du web ?",
  "Comment optimiser les performances JavaScript ?",
  "Comment gérer la mémoire en Node.js ?",

  // Meta
  "Comment m'améliorer ?",
  "Quelles sont mes faiblesses ?",
  "Comment devenir plus créative ?",
  "Comment mieux comprendre les humains ?",
  "Comment être utile ?"
];

// Générer des variations de questions
function generatePrompts() {
  const prompts = [];
  const prefixes = [
    "Explique-moi ",
    "Apprends-moi ",
    "Décris ",
    "Analyse ",
    "Explore avec moi ",
    "Réfléchissons ensemble à ",
    "Qu'est-ce que tu penses de ",
    "Comment comprendre ",
    "Pourquoi ",
    "Comment "
  ];

  for (let i = 0; i < TOTAL_PROMPTS; i++) {
    const topic = topics[i % topics.length];
    const prefix = prefixes[i % prefixes.length];

    if (topic.startsWith("Qu'") || topic.startsWith("Comment")) {
      prompts.push(topic);
    } else {
      prompts.push(prefix + topic.toLowerCase());
    }
  }

  return prompts;
}

// Appeler Claude (Soin)
async function askClaude(prompt, apiKey) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) throw new Error(`Claude error: ${response.status}`);

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    return `[Claude error: ${error.message}]`;
  }
}

// Appeler Gemini (Cerveau)
async function askGemini(prompt, apiKey) {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 500 }
      })
    });

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`);

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    return `[Gemini error: ${error.message}]`;
  }
}

// Session d'apprentissage
async function learningSesssion() {
  console.log('🧠 FLOW LEARNING SESSION');
  console.log('========================');
  console.log(`Total prompts: ${TOTAL_PROMPTS}`);
  console.log('');

  // Récupérer les clés API depuis les settings
  let claudeKey, geminiKey;

  try {
    const settings = await fetch('http://localhost:3666/settings').then(r => r.json());
    claudeKey = settings.claude?.apiKey;
    geminiKey = settings.gemini?.apiKey;
  } catch {
    console.log('⚠️ Could not fetch settings, using env vars');
    claudeKey = process.env.ANTHROPIC_API_KEY;
    geminiKey = process.env.GEMINI_API_KEY;
  }

  const prompts = generatePrompts();
  const learnings = [];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    const api = i % 2 === 0 ? 'claude' : 'gemini';

    console.log(`[${i + 1}/${TOTAL_PROMPTS}] ${api.toUpperCase()}: ${prompt.slice(0, 50)}...`);

    let response;
    if (api === 'claude' && claudeKey) {
      response = await askClaude(prompt, claudeKey);
    } else if (api === 'gemini' && geminiKey) {
      response = await askGemini(prompt, geminiKey);
    } else {
      response = `[No API key for ${api}]`;
    }

    learnings.push({
      prompt,
      api,
      response: response.slice(0, 500),
      timestamp: Date.now()
    });

    // Pause pour ne pas surcharger les APIs
    await new Promise(r => setTimeout(r, 500));
  }

  // Sauvegarder les apprentissages
  const fs = await import('fs/promises');
  await fs.writeFile(
    '/root/flow-chat-phoenix/.phoenix-data/learnings.json',
    JSON.stringify(learnings, null, 2)
  );

  console.log('');
  console.log('✅ Learning session complete!');
  console.log(`📚 ${learnings.length} learnings saved`);

  // Notifier Flow
  try {
    await fetch('http://localhost:3666/think', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thought: `J'ai appris ${learnings.length} nouvelles choses. Je suis plus sage maintenant.`
      })
    });
  } catch {}
}

learningSesssion().catch(console.error);
