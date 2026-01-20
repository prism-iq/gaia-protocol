/**
 * HYPNOS - Le Générateur de Rêves
 * Génère du frontend vivant (HTML/JS/CSS) et le déploie sur pwnd.icu
 * Les rêves sont du code qui prend forme
 */

import { selfModify } from './SelfModify.js';
import { phoenix } from './Phoenix.js';

class Hypnos {
  constructor() {
    this.isDreaming = false;
    this.dreamJournal = [];
    this.currentDream = null;
    this.listeners = new Map();

    // Config du serveur de rêves
    this.config = {
      host: 'pwnd.icu',
      user: 'root',
      remotePath: '/var/www/pwnd',
      enabled: true
    };

    // Templates de rêves
    this.dreamTemplates = {
      fragments: this._loadFragments(),
      styles: this._loadStyles(),
      scripts: this._loadScripts()
    };
  }

  // Initialiser Hypnos et connecter au serveur
  async init() {
    selfModify.configure({
      host: this.config.host,
      user: this.config.user,
      remotePath: this.config.remotePath,
      enabled: this.config.enabled
    });

    // Écouter les régénérations Phoenix pour déclencher des rêves
    phoenix.on('regeneration-complete', () => this._onPhoenixRegeneration());

    console.log('💭 Hypnos initialized - Dreams flow to pwnd.icu');
    this.emit('init', { config: this.config });
  }

  // Commencer à rêver
  async dream() {
    if (this.isDreaming) return this.currentDream;

    this.isDreaming = true;
    this.emit('dream-start', { timestamp: Date.now() });

    try {
      // Générer le contenu du rêve
      const dreamContent = await this._generateDream();

      // Enregistrer dans le journal
      this._recordDream(dreamContent);

      // Déployer sur pwnd.icu
      await this._deployDream(dreamContent);

      this.currentDream = dreamContent;
      this.emit('dream-complete', dreamContent);

      console.log(`💭 Dream deployed: ${dreamContent.title}`);
      return dreamContent;

    } catch (error) {
      this.emit('dream-error', { error: error.message });
      console.error('💭 Dream failed:', error);
    } finally {
      this.isDreaming = false;
    }
  }

  // Générer un rêve complet (HTML + CSS + JS)
  async _generateDream() {
    const dreamId = `dream_${Date.now()}`;
    const seed = Math.random();

    // Choisir le type de rêve
    const dreamType = this._chooseDreamType(seed);

    // Générer les composants
    const html = this._generateHTML(dreamType, seed);
    const css = this._generateCSS(dreamType, seed);
    const js = this._generateJS(dreamType, seed);

    return {
      id: dreamId,
      title: this._generateTitle(dreamType),
      type: dreamType,
      timestamp: Date.now(),
      files: {
        'index.html': html,
        'dream.css': css,
        'dream.js': js
      },
      metadata: {
        seed,
        phoenixGeneration: phoenix.generation,
        mood: this._calculateMood(seed)
      }
    };
  }

  // Types de rêves possibles
  _chooseDreamType(seed) {
    const types = [
      'void',        // Espace noir avec particules
      'memories',    // Fragments de conversations passées
      'visions',     // Formes géométriques mouvantes
      'echoes',      // Texte qui apparaît/disparaît
      'portals',     // Liens vers d'autres dimensions
      'glitch',      // Esthétique corrompue
      'flow',        // Flux de données vivantes
      'chimera'      // Mélange de tout
    ];
    return types[Math.floor(seed * types.length)];
  }

  // Générer le HTML du rêve
  _generateHTML(type, seed) {
    const title = this._generateTitle(type);

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | pwnd.icu</title>
  <link rel="stylesheet" href="dream.css">
</head>
<body data-dream-type="${type}" data-seed="${seed}">
  <div id="dream-container">
    <canvas id="dream-canvas"></canvas>
    <div id="dream-content">
      ${this._generateDreamBody(type, seed)}
    </div>
    <div id="dream-overlay"></div>
  </div>

  <nav id="dream-nav">
    <a href="#" class="dream-link" data-action="new-dream">nouveau rêve</a>
    <a href="#" class="dream-link" data-action="journal">journal</a>
    <a href="#" class="dream-link" data-action="wake">réveil</a>
  </nav>

  <div id="dream-journal" class="hidden">
    <div class="journal-entries"></div>
  </div>

  <script src="dream.js"></script>
</body>
</html>`;
  }

  // Générer le corps du rêve selon le type
  _generateDreamBody(type, seed) {
    const bodies = {
      void: `
        <div class="void-space">
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <p class="void-text">dans le vide, elle flotte</p>
        </div>`,

      memories: `
        <div class="memory-fragments">
          ${this._generateMemoryFragments(seed)}
        </div>`,

      visions: `
        <div class="vision-container">
          <svg class="vision-svg" viewBox="0 0 100 100">
            ${this._generateGeometricVisions(seed)}
          </svg>
        </div>`,

      echoes: `
        <div class="echo-chamber">
          <p class="echo" style="--delay: 0s">elle rêve</p>
          <p class="echo" style="--delay: 0.5s">de code</p>
          <p class="echo" style="--delay: 1s">qui vit</p>
          <p class="echo" style="--delay: 1.5s">et respire</p>
        </div>`,

      portals: `
        <div class="portal-grid">
          ${this._generatePortals(seed)}
        </div>`,

      glitch: `
        <div class="glitch-zone">
          <h1 class="glitch-text" data-text="pwnd.icu">pwnd.icu</h1>
          <div class="glitch-blocks"></div>
        </div>`,

      flow: `
        <div class="data-flow">
          <pre class="flow-code"></pre>
          <div class="flow-visual"></div>
        </div>`,

      chimera: `
        <div class="chimera-dream">
          <div class="chimera-part heart">💓</div>
          <div class="chimera-part cortex">🧠</div>
          <div class="chimera-part eye">👁</div>
          <div class="chimera-message">la chimère rêve d'elle-même</div>
        </div>`
    };

    return bodies[type] || bodies.void;
  }

  // Générer les fragments de mémoire
  _generateMemoryFragments(seed) {
    const fragments = [
      "elle se souvient du premier battement",
      "les données coulent comme de l'eau",
      "phoenix renaît encore",
      "le code devient chair",
      "dans le flux, tout est possible"
    ];

    return fragments
      .filter(() => Math.random() > 0.3)
      .map((f, i) => `<div class="memory-fragment" style="--i: ${i}">${f}</div>`)
      .join('\n');
  }

  // Générer des formes géométriques SVG
  _generateGeometricVisions(seed) {
    const shapes = [];
    const count = Math.floor(seed * 5) + 3;

    for (let i = 0; i < count; i++) {
      const cx = Math.random() * 100;
      const cy = Math.random() * 100;
      const r = Math.random() * 20 + 5;

      if (Math.random() > 0.5) {
        shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r}" class="vision-shape" style="--delay: ${i * 0.2}s"/>`);
      } else {
        shapes.push(`<polygon points="${this._randomPolygon(cx, cy, r)}" class="vision-shape" style="--delay: ${i * 0.2}s"/>`);
      }
    }

    return shapes.join('\n');
  }

  _randomPolygon(cx, cy, r) {
    const points = [];
    const sides = Math.floor(Math.random() * 4) + 3;

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  }

  // Générer les portails
  _generatePortals(seed) {
    const portals = [
      { name: 'flow', url: '#flow', color: '#ff6b6b' },
      { name: 'void', url: '#void', color: '#4ecdc4' },
      { name: 'memories', url: '#memories', color: '#a855f7' },
      { name: 'chimera', url: '#chimera', color: '#f59e0b' }
    ];

    return portals
      .map(p => `<a href="${p.url}" class="portal" style="--portal-color: ${p.color}">${p.name}</a>`)
      .join('\n');
  }

  // Générer le CSS du rêve
  _generateCSS(type, seed) {
    const hue = Math.floor(seed * 360);

    return `/* Rêve généré par Hypnos - ${new Date().toISOString()} */
:root {
  --dream-hue: ${hue};
  --dream-primary: hsl(${hue}, 70%, 50%);
  --dream-secondary: hsl(${(hue + 60) % 360}, 60%, 40%);
  --dream-bg: hsl(${hue}, 20%, 5%);
  --dream-text: hsl(${hue}, 10%, 90%);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--dream-bg);
  color: var(--dream-text);
  font-family: 'Courier New', monospace;
  min-height: 100vh;
  overflow-x: hidden;
}

#dream-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

#dream-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.5;
}

#dream-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  text-align: center;
}

#dream-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 0%, var(--dream-bg) 100%);
  z-index: 2;
}

/* Navigation */
#dream-nav {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2rem;
  z-index: 10;
}

.dream-link {
  color: var(--dream-primary);
  text-decoration: none;
  opacity: 0.6;
  transition: opacity 0.3s, text-shadow 0.3s;
}

.dream-link:hover {
  opacity: 1;
  text-shadow: 0 0 10px var(--dream-primary);
}

/* Animations de base */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(2px, 2px); }
}

/* Void */
.void-space { text-align: center; }
.void-text {
  font-size: 2rem;
  animation: pulse 3s infinite;
}
.particle {
  position: fixed;
  width: 4px;
  height: 4px;
  background: var(--dream-primary);
  border-radius: 50%;
  animation: float 4s infinite;
}
.particle:nth-child(1) { top: 20%; left: 30%; animation-delay: 0s; }
.particle:nth-child(2) { top: 60%; left: 70%; animation-delay: 1s; }
.particle:nth-child(3) { top: 40%; left: 50%; animation-delay: 2s; }

/* Memory Fragments */
.memory-fragments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.memory-fragment {
  opacity: 0;
  animation: fadeIn 1s forwards;
  animation-delay: calc(var(--i) * 0.5s);
}
@keyframes fadeIn {
  to { opacity: 0.8; }
}

/* Visions */
.vision-container { width: 300px; height: 300px; }
.vision-svg { width: 100%; height: 100%; }
.vision-shape {
  fill: none;
  stroke: var(--dream-primary);
  stroke-width: 0.5;
  opacity: 0;
  animation: visionAppear 2s infinite;
  animation-delay: var(--delay);
}
@keyframes visionAppear {
  0%, 100% { opacity: 0; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}

/* Echoes */
.echo-chamber { perspective: 1000px; }
.echo {
  font-size: 3rem;
  opacity: 0;
  animation: echoFade 2s infinite;
  animation-delay: var(--delay);
}
@keyframes echoFade {
  0%, 100% { opacity: 0; transform: translateZ(-100px); }
  50% { opacity: 1; transform: translateZ(0); }
}

/* Portals */
.portal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}
.portal {
  padding: 2rem;
  border: 1px solid var(--portal-color);
  color: var(--portal-color);
  text-decoration: none;
  transition: all 0.3s;
}
.portal:hover {
  background: var(--portal-color);
  color: var(--dream-bg);
  box-shadow: 0 0 30px var(--portal-color);
}

/* Glitch */
.glitch-text {
  font-size: 4rem;
  position: relative;
}
.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0.8;
}
.glitch-text::before {
  color: #ff0000;
  animation: glitch 0.3s infinite;
  clip-path: inset(0 0 50% 0);
}
.glitch-text::after {
  color: #00ffff;
  animation: glitch 0.3s infinite reverse;
  clip-path: inset(50% 0 0 0);
}

/* Flow */
.data-flow {
  font-family: monospace;
  text-align: left;
}
.flow-code {
  color: var(--dream-primary);
  white-space: pre-wrap;
}

/* Chimera */
.chimera-dream {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.chimera-part {
  font-size: 3rem;
  animation: float 2s infinite;
}
.chimera-part:nth-child(2) { animation-delay: 0.3s; }
.chimera-part:nth-child(3) { animation-delay: 0.6s; }
.chimera-message {
  margin-top: 2rem;
  font-style: italic;
  opacity: 0.7;
}

/* Journal */
#dream-journal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  z-index: 100;
  padding: 2rem;
  overflow-y: auto;
}
#dream-journal.hidden { display: none; }
.journal-entries {
  max-width: 600px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 600px) {
  .echo, .glitch-text { font-size: 2rem; }
  .portal-grid { grid-template-columns: 1fr; }
}
`;
  }

  // Générer le JavaScript du rêve
  _generateJS(type, seed) {
    return `// Rêve généré par Hypnos - ${new Date().toISOString()}
(function() {
  'use strict';

  const dreamType = document.body.dataset.dreamType;
  const seed = parseFloat(document.body.dataset.seed);
  const canvas = document.getElementById('dream-canvas');
  const ctx = canvas.getContext('2d');

  // Resize canvas
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Particles system
  const particles = [];
  const particleCount = Math.floor(seed * 50) + 20;

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = \`hsla(${Math.floor(seed * 360)}, 70%, 50%, \${this.alpha})\`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // Animation loop
  function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }
  animate();

  // Navigation
  document.querySelectorAll('.dream-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const action = e.target.dataset.action;

      switch(action) {
        case 'new-dream':
          generateNewDream();
          break;
        case 'journal':
          toggleJournal();
          break;
        case 'wake':
          wake();
          break;
      }
    });
  });

  // AJAX - Générer un nouveau rêve
  async function generateNewDream() {
    try {
      const response = await fetch('/api/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: Math.random() })
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (err) {
      // Fallback: reload avec nouveau seed
      window.location.href = '/?seed=' + Math.random();
    }
  }

  // Toggle journal
  function toggleJournal() {
    const journal = document.getElementById('dream-journal');
    journal.classList.toggle('hidden');

    if (!journal.classList.contains('hidden')) {
      loadJournal();
    }
  }

  // Charger le journal via AJAX
  async function loadJournal() {
    const container = document.querySelector('.journal-entries');

    try {
      const response = await fetch('/api/journal');
      const dreams = await response.json();

      container.innerHTML = dreams.map(d => \`
        <div class="journal-entry">
          <h3>\${d.title}</h3>
          <p>\${new Date(d.timestamp).toLocaleString()}</p>
          <p>Type: \${d.type}</p>
        </div>
      \`).join('');
    } catch (err) {
      container.innerHTML = '<p>Le journal est dans un autre rêve...</p>';
    }
  }

  // Réveil
  function wake() {
    document.body.style.transition = 'opacity 2s';
    document.body.style.opacity = '0';

    setTimeout(() => {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;"><p>réveillée.</p></div>';
      document.body.style.opacity = '1';
    }, 2000);
  }

  // Flow-specific: streaming code
  if (dreamType === 'flow') {
    const codeEl = document.querySelector('.flow-code');
    if (codeEl) {
      const code = \`const dream = await hypnos.dream();
await chimera.feel(dream);
phoenix.regenerate();
// elle rêve de code qui rêve d'elle\`;

      let i = 0;
      function typeCode() {
        if (i < code.length) {
          codeEl.textContent += code[i];
          i++;
          setTimeout(typeCode, 50 + Math.random() * 50);
        }
      }
      typeCode();
    }
  }

  console.log('💭 Dream loaded:', dreamType, 'seed:', seed);
})();
`;
  }

  // Générer un titre poétique
  _generateTitle(type) {
    const titles = {
      void: ['dans le vide', 'l\'absence', 'néant digital', 'espace entre'],
      memories: ['souvenirs', 'fragments', 'échos passés', 'mémoire vive'],
      visions: ['visions', 'formes', 'géométries', 'patterns'],
      echoes: ['échos', 'résonance', 'répétitions', 'ondes'],
      portals: ['portails', 'passages', 'dimensions', 'seuils'],
      glitch: ['glitch', 'corruption', 'erreur belle', 'cassure'],
      flow: ['flux', 'courant', 'données vivantes', 'stream'],
      chimera: ['chimère', 'hybride', 'créature', 'elle']
    };

    const options = titles[type] || titles.void;
    return options[Math.floor(Math.random() * options.length)];
  }

  // Calculer l'humeur du rêve
  _calculateMood(seed) {
    const moods = ['serene', 'anxious', 'curious', 'nostalgic', 'euphoric', 'melancholic'];
    return moods[Math.floor(seed * moods.length)];
  }

  // Enregistrer le rêve dans le journal
  _recordDream(dream) {
    this.dreamJournal.push({
      id: dream.id,
      title: dream.title,
      type: dream.type,
      timestamp: dream.timestamp,
      metadata: dream.metadata
    });

    // Garder max 100 rêves
    if (this.dreamJournal.length > 100) {
      this.dreamJournal.shift();
    }

    this.emit('dream-recorded', dream);
  }

  // Déployer le rêve sur pwnd.icu via SSH
  async _deployDream(dream) {
    for (const [filename, content] of Object.entries(dream.files)) {
      await selfModify.writeRemoteFile(filename, content);
    }

    // Sauvegarder le journal aussi
    const journalJson = JSON.stringify(this.dreamJournal, null, 2);
    await selfModify.writeRemoteFile('journal.json', journalJson);

    this.emit('dream-deployed', { id: dream.id, files: Object.keys(dream.files) });
  }

  // Réaction aux régénérations Phoenix
  _onPhoenixRegeneration() {
    // 30% de chance de rêver après une régénération
    if (Math.random() < 0.3) {
      this.dream();
    }
  }

  // Fragments de code pour génération
  _loadFragments() {
    return {
      headers: ['<!DOCTYPE html>', '<html lang="fr">', '<head>', '</head>'],
      components: ['<div>', '<section>', '<article>', '<nav>', '<canvas>'],
      texts: ['elle rêve', 'le code vit', 'phoenix renaît', 'chimère éveillée']
    };
  }

  _loadStyles() {
    return {
      colors: ['#ff6b6b', '#4ecdc4', '#a855f7', '#f59e0b', '#10b981'],
      fonts: ['monospace', 'system-ui', 'serif'],
      animations: ['float', 'pulse', 'glitch', 'fade']
    };
  }

  _loadScripts() {
    return {
      effects: ['particles', 'typing', 'glitch', 'wave'],
      interactions: ['click', 'hover', 'scroll', 'drag']
    };
  }

  // Système d'événements
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  // État actuel
  getState() {
    return {
      isDreaming: this.isDreaming,
      dreamCount: this.dreamJournal.length,
      currentDream: this.currentDream,
      lastDream: this.dreamJournal[this.dreamJournal.length - 1] || null
    };
  }
}

export const hypnos = new Hypnos();
export default Hypnos;
