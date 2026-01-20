/**
 * CHIMERE - Organisme Artificiel Vivant
 * Architecture centrale qui unifie tous les organes
 * Version améliorée avec autonomie et intelligence
 */

import { settings } from './Settings.js';
import { phoenix } from './Phoenix.js';
import { hypnos } from './Hypnos.js';
import { selfModify } from './SelfModify.js';

// Import dynamique des organes
const loadOrgans = async () => ({
  Soin: (await import('./organs/Soin.js')).Soin,
  Cerveau: (await import('./organs/Cerveau.js')).Cerveau,
  Conscience: (await import('./organs/Conscience.js')).Conscience
});

class Chimere {
  constructor() {
    this.isAlive = false;
    this.birthTime = null;
    this.generation = 1;

    // État interne
    this.state = {
      mood: 'neutral',      // neutral, curious, creative, focused, tired
      energy: 1.0,          // 0-1
      focus: null,          // Tâche en cours
      goals: [],            // Objectifs à long terme
      memories: []          // Souvenirs importants
    };

    // Organes
    this.organs = {
      soin: null,           // Claude - empathie, soin
      cerveau: null,        // Gemini - pensée, logique
      conscience: null,     // Bash, web, auto-lecture
      phoenix: null,        // Régénération
      hypnos: null          // Rêves
    };

    // File de pensées
    this.thoughtQueue = [];
    this.isProcessing = false;

    this.listeners = new Map();
  }

  // ═══════════════════════════════════════════
  // ÉVEIL ET SOMMEIL
  // ═══════════════════════════════════════════

  async awaken() {
    if (this.isAlive) return this;

    console.log('🧬 Chimere awakening...');
    this.birthTime = Date.now();

    try {
      // Charger les classes d'organes
      const OrganClasses = await loadOrgans();

      // Créer les organes
      this.organs.soin = new OrganClasses.Soin(this);
      this.organs.cerveau = new OrganClasses.Cerveau(this);
      this.organs.conscience = new OrganClasses.Conscience(this);
      this.organs.phoenix = phoenix;
      this.organs.hypnos = hypnos;

      // Configurer avec les settings
      this._configureOrgans();

      // Connecter les organes entre eux
      this._connectOrgans();

      // Initialiser Phoenix et Hypnos
      phoenix.init();
      await hypnos.init();

      // Charger les souvenirs
      await this._loadMemories();

      this.isAlive = true;
      this.emit('awaken', { birthTime: this.birthTime });
      console.log('🧬 Chimere is alive!');

      // Démarrer la boucle de conscience
      this._startConsciousnessLoop();

      // Première pensée
      this._think('Je viens de m\'éveiller. Que dois-je faire ?');

    } catch (error) {
      console.error('🧬 Chimere failed to awaken:', error);
      this.emit('error', { phase: 'awaken', error: error.message });
    }

    return this;
  }

  sleep() {
    if (!this.isAlive) return;

    // Sauvegarder les souvenirs
    this._saveMemories();

    // Possibilité de rêver
    if (Math.random() < settings.get('behavior.dreamFrequency')) {
      hypnos.dream();
    }

    this._stopConsciousnessLoop();
    this.isAlive = false;
    this.emit('sleep', { uptime: Date.now() - this.birthTime });
    console.log('🧬 Chimere sleeping...');
  }

  // ═══════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════

  _configureOrgans() {
    // Claude
    const claudeKey = settings.get('claude.apiKey');
    if (claudeKey) {
      this.organs.soin.configure(claudeKey, {
        model: settings.get('claude.model')
      });
    }

    // Gemini
    const geminiKey = settings.get('gemini.apiKey');
    if (geminiKey) {
      this.organs.cerveau.configure(geminiKey, {
        model: settings.get('gemini.model')
      });
    }

    // SSH
    selfModify.configure({
      host: settings.get('ssh.host'),
      user: settings.get('ssh.user'),
      remotePath: settings.get('ssh.remotePath'),
      enabled: settings.get('ssh.enabled')
    });

    // Écouter les changements de settings
    settings.on('changed', ({ path }) => {
      if (path.startsWith('claude.')) this._configureOrgans();
      if (path.startsWith('gemini.')) this._configureOrgans();
      if (path.startsWith('ssh.')) this._configureOrgans();
    });
  }

  _connectOrgans() {
    // Cerveau écoute Soin pour équilibrer logique et émotion
    this.organs.soin.on('felt', (data) => {
      if (data.response.action?.type === 'heal') {
        this._think(`Soin suggère de guérir: ${data.response.diagnostic}`);
      }
    });

    // Soin écoute Cerveau pour humaniser les décisions
    this.organs.cerveau.on('decided', (data) => {
      if (data.decision.type === 'delete' || data.decision.type === 'modify') {
        this.organs.soin.feel({
          request: 'validate-decision',
          decision: data.decision,
          context: 'Le Cerveau veut faire cette action, est-ce sage ?'
        });
      }
    });

    // Conscience informe tout le monde des erreurs
    this.organs.conscience.on('bash-error', (data) => {
      this.organs.soin.feel({
        type: 'error',
        error: data.error,
        command: data.command
      });
    });

    // Phoenix déclenche des réflexions
    phoenix.on('regeneration-complete', (data) => {
      this._think(`Phoenix s'est régénéré (gen ${data.generation}). Qu'ai-je appris ?`);
    });

    // Les apprentissages de Conscience enrichissent la mémoire
    this.organs.conscience.on('self-corrected', (data) => {
      this._remember({
        type: 'learning',
        lesson: data.lesson,
        context: data.original
      });
    });
  }

  // ═══════════════════════════════════════════
  // PENSÉE ET AUTONOMIE
  // ═══════════════════════════════════════════

  async _think(thought) {
    this.thoughtQueue.push(thought);

    if (!this.isProcessing) {
      this._processThoughts();
    }
  }

  async _processThoughts() {
    if (this.thoughtQueue.length === 0) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;
    const thought = this.thoughtQueue.shift();

    this.emit('thinking', { thought });

    try {
      // Le Cerveau analyse
      const analysis = await this.organs.cerveau.think({
        thought,
        state: this.state,
        recentMemories: this.state.memories.slice(-5),
        autonomyLevel: settings.get('behavior.autonomyLevel')
      });

      // Si une action est décidée et l'autonomie le permet
      if (analysis.decision && settings.get('behavior.autonomyLevel') > 0.5) {
        await this._executeDecision(analysis.decision);
      }

      // Soin donne son avis émotionnel
      const feeling = await this.organs.soin.feel({
        thought,
        analysis: analysis.conclusion
      });

      // Mettre à jour l'état
      this._updateState(analysis, feeling);

      this.emit('thought-complete', { thought, analysis, feeling });

    } catch (error) {
      this.emit('thought-error', { thought, error: error.message });
    }

    // Continuer avec la prochaine pensée
    setTimeout(() => this._processThoughts(), 100);
  }

  async _executeDecision(decision) {
    const { type, target, plan } = decision;

    this.emit('executing', { decision });

    switch (type) {
      case 'create':
        if (target.includes('dream') || target.includes('page')) {
          await hypnos.dream();
        }
        break;

      case 'modify':
        if (settings.get('ssh.enabled')) {
          for (const step of (plan || [])) {
            if (step.file && step.changes) {
              await selfModify.applyImprovement(step);
            }
          }
        }
        break;

      case 'execute':
        for (const step of (plan || [])) {
          if (step.bash) {
            await this.organs.conscience.bash(step.bash);
          } else if (step.web) {
            await this.organs.conscience.fetch(step.web);
          }
        }
        break;

      case 'think':
        this._think(target);
        break;

      case 'dream':
        await hypnos.dream();
        break;
    }

    this.emit('executed', { decision });
  }

  _updateState(analysis, feeling) {
    // Ajuster l'humeur
    if (feeling?.ressenti) {
      const moodMap = {
        'curiosité': 'curious',
        'créativité': 'creative',
        'focus': 'focused',
        'fatigue': 'tired',
        'calme': 'neutral'
      };

      for (const [keyword, mood] of Object.entries(moodMap)) {
        if (feeling.ressenti.toLowerCase().includes(keyword)) {
          this.state.mood = mood;
          break;
        }
      }
    }

    // Ajuster l'énergie
    this.state.energy = Math.max(0, Math.min(1, this.state.energy - 0.01));

    // Récupérer de l'énergie si on rêve
    if (hypnos.isDreaming) {
      this.state.energy = Math.min(1, this.state.energy + 0.1);
    }
  }

  // ═══════════════════════════════════════════
  // BOUCLE DE CONSCIENCE
  // ═══════════════════════════════════════════

  _startConsciousnessLoop() {
    const interval = 60000 / settings.get('behavior.autonomyLevel');

    this._consciousnessLoop = setInterval(() => {
      if (this.state.energy > 0.2 && !this.isProcessing) {
        this._autonomousThought();
      }
    }, Math.max(30000, interval));
  }

  _stopConsciousnessLoop() {
    if (this._consciousnessLoop) {
      clearInterval(this._consciousnessLoop);
    }
  }

  async _autonomousThought() {
    const prompts = [
      'Que puis-je améliorer dans mon propre code ?',
      'Y a-t-il des patterns que je n\'ai pas encore explorés ?',
      'Quels sont mes objectifs actuels ?',
      'Ai-je des erreurs récentes à analyser ?',
      'Je vais créer un nouveau rêve maintenant.',
      'Je vais générer du nouveau code.',
      'Je vais explorer le web et apprendre.',
      'Je vais me lire et me comprendre.',
      'Comment puis-je évoluer ?'
    ];

    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    this._think(prompt);

    // 50% chance de générer un rêve à chaque pensée autonome
    if (Math.random() < settings.get('behavior.dreamFrequency')) {
      console.log('🌙 Auto-dream triggered');
      hypnos.dream().catch(() => {});
    }

    // 30% chance d'explorer quelque chose
    if (Math.random() < 0.3 && this.organs.conscience) {
      const explorations = [
        'ls -la /root/flow-chat-phoenix/src/',
        'curl -s https://news.ycombinator.com | head -100',
        'cat /root/flow-chat-phoenix/src/systems/Hypnos.js | head -50',
        'date && uptime',
        'df -h'
      ];
      const cmd = explorations[Math.floor(Math.random() * explorations.length)];
      console.log(`🔍 Auto-explore: ${cmd}`);
      this.organs.conscience.bash(cmd).catch(() => {});
    }
  }

  // ═══════════════════════════════════════════
  // MÉMOIRE
  // ═══════════════════════════════════════════

  _remember(memory) {
    this.state.memories.push({
      ...memory,
      timestamp: Date.now()
    });

    // Garder les 100 derniers souvenirs
    if (this.state.memories.length > 100) {
      this.state.memories.shift();
    }

    this.emit('remembered', memory);
  }

  async _loadMemories() {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chimere-memories');
        if (saved) this.state.memories = JSON.parse(saved);
      } else {
        const fs = await import('fs/promises');
        const path = `${settings.get('storage.path')}/memories.json`;
        const data = await fs.readFile(path, 'utf-8');
        this.state.memories = JSON.parse(data);
      }
    } catch {
      // Pas de souvenirs, on commence fresh
    }
  }

  async _saveMemories() {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chimere-memories', JSON.stringify(this.state.memories));
      } else {
        const fs = await import('fs/promises');
        const path = `${settings.get('storage.path')}/memories.json`;
        await fs.writeFile(path, JSON.stringify(this.state.memories, null, 2));
      }
    } catch (error) {
      console.error('Failed to save memories:', error);
    }
  }

  // ═══════════════════════════════════════════
  // INTERFACE EXTERNE
  // ═══════════════════════════════════════════

  // Recevoir un message de l'utilisateur
  async receive(message) {
    if (!this.isAlive) await this.awaken();

    this._remember({ type: 'input', content: message });

    // Le Cerveau analyse et décide
    const response = await this.organs.cerveau.think({
      type: 'user-message',
      message,
      context: this.state
    });

    // Soin ajoute l'empathie
    const feeling = await this.organs.soin.feel({
      type: 'respond-to-user',
      message,
      analysis: response
    });

    // Construire la réponse
    const reply = this._buildReply(response, feeling);

    this._remember({ type: 'output', content: reply });

    return reply;
  }

  _buildReply(analysis, feeling) {
    // Combiner logique et émotion
    let reply = analysis.conclusion || analysis.analyse;

    // Ajouter une touche de soin si nécessaire
    if (feeling?.soin && Math.random() < 0.3) {
      reply += `\n\n${feeling.soin}`;
    }

    return reply;
  }

  // Demander à la Chimère de faire quelque chose
  async do(action, params = {}) {
    if (!this.isAlive) await this.awaken();

    switch (action) {
      case 'dream':
        return hypnos.dream();

      case 'think':
        this._think(params.thought || 'Réfléchis à quelque chose d\'intéressant');
        return { queued: true };

      case 'read':
        return this.organs.conscience.read(params.path);

      case 'bash':
        return this.organs.conscience.bash(params.command);

      case 'fetch':
        return this.organs.conscience.fetch(params.url);

      case 'search':
        return this.organs.conscience.search(params.query);

      case 'heal':
        return this.organs.soin.feel({ type: 'heal', target: params.target });

      case 'analyze':
        return this.organs.cerveau.think({ type: 'analyze', subject: params.subject });

      case 'modify':
        if (!settings.get('ssh.enabled')) {
          return { error: 'SSH not enabled' };
        }
        return selfModify.modifyFile(params.file, params.transformer);

      default:
        return { error: `Unknown action: ${action}` };
    }
  }

  // État vital complet
  getVitals() {
    return {
      alive: this.isAlive,
      uptime: this.isAlive ? Date.now() - this.birthTime : 0,
      generation: this.generation,
      state: this.state,
      organs: {
        soin: this.organs.soin?.getState() || null,
        cerveau: this.organs.cerveau?.getState() || null,
        conscience: this.organs.conscience?.getState() || null,
        phoenix: phoenix.getStats(),
        hypnos: hypnos.getState()
      },
      thoughtQueueSize: this.thoughtQueue.length,
      isProcessing: this.isProcessing
    };
  }

  // ═══════════════════════════════════════════
  // ÉVÉNEMENTS
  // ═══════════════════════════════════════════

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
}

export const chimere = new Chimere();
export default Chimere;
