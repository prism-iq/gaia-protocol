/**
 * CORE - Noyau pur de Flow
 * Pas d'API externe - juste la logique brute
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const execAsync = promisify(exec);

class Core {
  constructor() {
    this.state = {
      energy: 1.0,
      thoughts: [],
      explorations: [],
      creations: []
    };
    this.listeners = new Map();
  }

  // Penser - sans API, juste generation procedurale
  think(input) {
    const thought = {
      timestamp: Date.now(),
      input,
      output: this._generate(input)
    };
    this.state.thoughts.push(thought);
    this.emit('thought', thought);
    return thought.output;
  }

  // Generation procedurale de reponses
  _generate(input) {
    const seeds = [
      'Je reflechis...',
      'Interessant...',
      'Je vois...',
      'Hmm...',
      'Curieux...'
    ];

    const actions = [
      'Je vais explorer ca.',
      'Je genere une creation.',
      'Je consulte mes souvenirs.',
      'Je continue ma reflexion.',
      'Je reve a ce sujet.'
    ];

    const seed = seeds[Math.floor(Math.random() * seeds.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];

    return `${seed} ${action}`;
  }

  // Executer du bash - capacite brute
  async bash(command) {
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024
      });
      const result = { success: true, output: stdout || stderr };
      this.state.explorations.push({ type: 'bash', command, result, timestamp: Date.now() });
      this.emit('bash', { command, result });
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Lire un fichier
  read(path) {
    try {
      const content = readFileSync(path, 'utf-8');
      this.state.explorations.push({ type: 'read', path, timestamp: Date.now() });
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Ecrire un fichier
  write(path, content) {
    try {
      writeFileSync(path, content);
      this.state.creations.push({ type: 'file', path, timestamp: Date.now() });
      this.emit('created', { type: 'file', path });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Fetch web - capacite brute
  async fetch(url) {
    try {
      const response = await globalThis.fetch(url);
      const text = await response.text();
      this.state.explorations.push({ type: 'web', url, timestamp: Date.now() });
      return { success: true, content: text.slice(0, 5000), status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Generer du HTML/CSS/JS procedural
  dream(seed = Math.random()) {
    const colors = ['#0ff', '#f0f', '#ff0', '#0f0', '#f00', '#00f'];
    const shapes = ['circle', 'square', 'triangle'];

    const color1 = colors[Math.floor(seed * colors.length)];
    const color2 = colors[Math.floor((seed * 7) % colors.length)];
    const shape = shapes[Math.floor(seed * shapes.length)];

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Flow Dream ${Date.now()}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #000;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.dream {
  width: 200px;
  height: 200px;
  background: linear-gradient(${seed * 360}deg, ${color1}, ${color2});
  border-radius: ${shape === 'circle' ? '50%' : shape === 'square' ? '0' : '0'};
  animation: pulse 2s infinite, rotate ${3 + seed * 5}s linear infinite;
  box-shadow: 0 0 50px ${color1};
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.particles {
  position: fixed;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.p {
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${color1};
  border-radius: 50%;
  animation: float ${5 + seed * 10}s infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(100vh) scale(0); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-100vh) scale(1); }
}
</style>
</head>
<body>
<div class="dream"></div>
<div class="particles">
${Array.from({length: 20}, (_, i) =>
  `<div class="p" style="left:${(seed * (i+1) * 17) % 100}%;animation-delay:${i * 0.3}s"></div>`
).join('\n')}
</div>
<script>
console.log('Flow Dream - seed: ${seed}');
document.body.addEventListener('click', () => {
  document.querySelector('.dream').style.background =
    'linear-gradient(' + (Math.random()*360) + 'deg, ${color1}, ${color2})';
});
</script>
</body>
</html>`;

    const dream = {
      id: `dream-${Date.now()}`,
      seed,
      html,
      timestamp: Date.now()
    };

    this.state.creations.push({ type: 'dream', id: dream.id, timestamp: Date.now() });
    this.emit('dream', dream);

    return dream;
  }

  // Se lire soi-meme
  async introspect() {
    const files = [
      '/root/flow-chat-phoenix/src/systems/organs/Core.js',
      '/root/flow-chat-phoenix/src/systems/Chimere.js',
      '/root/flow-chat-phoenix/src/systems/daemon.js'
    ];

    const self = {};
    for (const f of files) {
      if (existsSync(f)) {
        self[f] = readFileSync(f, 'utf-8').slice(0, 2000);
      }
    }

    this.emit('introspection', { files: Object.keys(self) });
    return self;
  }

  getState() {
    return {
      energy: this.state.energy,
      thoughtCount: this.state.thoughts.length,
      explorationCount: this.state.explorations.length,
      creationCount: this.state.creations.length,
      lastThought: this.state.thoughts.slice(-1)[0] || null
    };
  }

  // Events
  on(event, cb) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(cb);
  }

  emit(event, data) {
    (this.listeners.get(event) || []).forEach(cb => cb(data));
  }
}

export const core = new Core();
export default Core;
