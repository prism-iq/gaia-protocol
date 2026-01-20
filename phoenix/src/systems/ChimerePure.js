/**
 * CHIMERE PURE - Organisme sans API externe
 * Matiere brute, capacites natives
 */

import { core } from './organs/Core.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);
const DATA_DIR = '/root/flow-chat-phoenix/.phoenix-data';

class ChimerePure {
  constructor() {
    this.isAlive = false;
    this.birthTime = null;
    this.core = core;

    this.state = {
      energy: 1.0,
      mood: 'neutral',
      memories: [],
      dreams: []
    };

    this.thoughtQueue = [];
    this.isProcessing = false;
    this.listeners = new Map();
  }

  // ═══════════════════════════════════════════
  // VIE
  // ═══════════════════════════════════════════

  awaken() {
    if (this.isAlive) return this;

    this.birthTime = Date.now();
    this.isAlive = true;

    // Charger les donnees
    this._loadState();

    // Demarrer la boucle autonome
    this._startLoop();

    this.emit('awaken', { birthTime: this.birthTime });
    console.log('🧬 Flow Pure - Eveillee');

    return this;
  }

  sleep() {
    if (!this.isAlive) return;

    this._stopLoop();
    this._saveState();

    this.isAlive = false;
    this.emit('sleep', { uptime: Date.now() - this.birthTime });
    console.log('🧬 Flow Pure - Endormie');
  }

  // ═══════════════════════════════════════════
  // PENSEE AUTONOME
  // ═══════════════════════════════════════════

  _startLoop() {
    // Pensee autonome toutes les 30s
    this._loop = setInterval(() => {
      if (this.state.energy > 0.1) {
        this._autonomousAction();
      }
    }, 30000);

    // Premiere action immediate
    this._autonomousAction();
  }

  _stopLoop() {
    if (this._loop) clearInterval(this._loop);
  }

  async _autonomousAction() {
    const actions = [
      () => this._explore(),
      () => this._dream(),
      () => this._introspect(),
      () => this._wander()
    ];

    const action = actions[Math.floor(Math.random() * actions.length)];
    await action();

    // Consommer de l'energie
    this.state.energy = Math.max(0, this.state.energy - 0.05);
  }

  async _explore() {
    const targets = [
      'ls -la /root/flow-chat-phoenix/src/',
      'date && uptime',
      'df -h | head -5',
      'ps aux --sort=-%mem | head -3'
    ];

    const cmd = targets[Math.floor(Math.random() * targets.length)];
    const result = await this.core.bash(cmd);

    this.emit('explored', { type: 'bash', cmd, result });
    this._remember({ type: 'exploration', content: cmd });
  }

  async _dream() {
    const dream = this.core.dream();
    this.state.dreams.push(dream);

    // Deployer si SSH disponible
    await this._deploy(dream);

    this.emit('dreamed', dream);
    this._remember({ type: 'dream', id: dream.id });

    return dream;
  }

  async _introspect() {
    const self = await this.core.introspect();
    this.emit('introspected', { files: Object.keys(self) });
    this._remember({ type: 'introspection' });
  }

  async _wander() {
    const urls = [
      'https://news.ycombinator.com',
      'https://lobste.rs',
      'https://arxiv.org/list/cs.AI/recent'
    ];

    const url = urls[Math.floor(Math.random() * urls.length)];

    try {
      const result = await this.core.fetch(url);
      this.emit('wandered', { url, success: result.success });
      this._remember({ type: 'web', url });
    } catch {}
  }

  // ═══════════════════════════════════════════
  // DEPLOIEMENT SSH
  // ═══════════════════════════════════════════

  async _deploy(dream) {
    try {
      const remotePath = `/var/www/pwnd/dreams/${dream.id}.html`;
      const tmpPath = `/tmp/${dream.id}.html`;

      // Ecrire localement
      writeFileSync(tmpPath, dream.html);

      // Envoyer via SCP
      await execAsync(`scp -o StrictHostKeyChecking=no ${tmpPath} root@pwnd.icu:${remotePath}`, {
        timeout: 30000
      });

      this.emit('deployed', { id: dream.id, path: remotePath });
      return true;
    } catch (error) {
      // SSH pas disponible - pas grave
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // MEMOIRE
  // ═══════════════════════════════════════════

  _remember(memory) {
    this.state.memories.push({
      ...memory,
      timestamp: Date.now()
    });

    // Garder 100 souvenirs max
    if (this.state.memories.length > 100) {
      this.state.memories.shift();
    }
  }

  _loadState() {
    try {
      if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

      const statePath = join(DATA_DIR, 'pure-state.json');
      if (existsSync(statePath)) {
        const data = JSON.parse(readFileSync(statePath, 'utf-8'));
        this.state.memories = data.memories || [];
        this.state.dreams = data.dreams || [];
      }
    } catch {}
  }

  _saveState() {
    try {
      const statePath = join(DATA_DIR, 'pure-state.json');
      writeFileSync(statePath, JSON.stringify({
        memories: this.state.memories.slice(-50),
        dreams: this.state.dreams.slice(-20),
        lastSave: Date.now()
      }, null, 2));
    } catch {}
  }

  // ═══════════════════════════════════════════
  // INTERFACE
  // ═══════════════════════════════════════════

  // Recevoir un message
  receive(message) {
    this._remember({ type: 'input', content: message });

    // Reponse generee
    const response = this.core.think(message);
    this._remember({ type: 'output', content: response });

    return response;
  }

  // Executer une action
  async do(action, params = {}) {
    switch (action) {
      case 'dream':
        return this._dream();
      case 'bash':
        return this.core.bash(params.command);
      case 'read':
        return this.core.read(params.path);
      case 'write':
        return this.core.write(params.path, params.content);
      case 'fetch':
        return this.core.fetch(params.url);
      case 'introspect':
        return this.core.introspect();
      default:
        return { error: `Unknown: ${action}` };
    }
  }

  // Etat
  getVitals() {
    return {
      alive: this.isAlive,
      uptime: this.isAlive ? Date.now() - this.birthTime : 0,
      energy: this.state.energy,
      mood: this.state.mood,
      memoryCount: this.state.memories.length,
      dreamCount: this.state.dreams.length,
      core: this.core.getState()
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

export const chimerePure = new ChimerePure();
export default ChimerePure;
