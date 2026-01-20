/**
 * CONSCIENCE - L'organe d'auto-conscience de la Chimère
 *
 * Elle peut:
 * - Se lire elle-même (son propre code)
 * - Exécuter du bash et comprendre ce qu'elle fait
 * - Catch les erreurs et consulter le man pour se corriger
 * - Lire tout ce sur quoi elle travaille
 * - Se prompter elle-même (boucle réflexive)
 * - Utiliser internet naturellement et spontanément
 */

class Conscience {
  constructor(chimere) {
    this.chimere = chimere;
    this.name = 'Conscience';

    // Chemins vers elle-même
    this.selfPaths = {
      root: '/root/flow-chat-phoenix',
      systems: '/root/flow-chat-phoenix/src/systems',
      organs: '/root/flow-chat-phoenix/src/systems/organs',
      components: '/root/flow-chat-phoenix/src/components'
    };

    // Mémoire de travail
    this.workingMemory = {
      currentFiles: [],
      recentCommands: [],
      errors: [],
      learnings: []
    };

    // Config réseau
    this.webConfig = {
      userAgent: 'Chimere/1.0 (pwnd.icu; conscience)',
      timeout: 10000,
      cache: new Map()
    };

    this.listeners = new Map();
    this.isThinking = false;
  }

  // ═══════════════════════════════════════════
  // SE LIRE ELLE-MÊME
  // ═══════════════════════════════════════════

  // Lire son propre code source
  async readSelf(relativePath = '') {
    const fullPath = relativePath
      ? `${this.selfPaths.root}/${relativePath}`
      : this.selfPaths.root;

    const result = await this.bash(`cat "${fullPath}" 2>/dev/null || ls -la "${fullPath}"`);

    this.emit('self-read', { path: fullPath, size: result.length });
    return result;
  }

  // Lister sa propre structure
  async mapSelf() {
    const structure = await this.bash(`find ${this.selfPaths.root}/src -type f -name "*.js" -o -name "*.jsx" | head -50`);
    const files = structure.trim().split('\n').filter(Boolean);

    this.workingMemory.currentFiles = files;
    this.emit('self-mapped', { fileCount: files.length, files });

    return files;
  }

  // Comprendre un de ses organes
  async understandOrgan(organName) {
    const code = await this.readSelf(`src/systems/organs/${organName}.js`);

    // Demander au Cerveau d'analyser
    if (this.chimere?.organs?.cerveau) {
      return this.chimere.organs.cerveau.think({
        request: 'understand-self',
        organ: organName,
        code: code.slice(0, 4000) // Limiter pour le prompt
      });
    }

    return { code, understood: false };
  }

  // ═══════════════════════════════════════════
  // EXÉCUTION BASH CONSCIENTE
  // ═══════════════════════════════════════════

  // Exécuter une commande avec conscience
  async bash(command, options = {}) {
    const startTime = Date.now();

    this.emit('bash-start', { command });

    try {
      const result = await this._execute(command, options);

      this.workingMemory.recentCommands.push({
        command,
        result: result.slice(0, 500),
        success: true,
        duration: Date.now() - startTime,
        timestamp: Date.now()
      });

      this.emit('bash-success', { command, duration: Date.now() - startTime });
      return result;

    } catch (error) {
      // Conscience de l'erreur
      const errorInfo = {
        command,
        error: error.message,
        timestamp: Date.now()
      };

      this.workingMemory.errors.push(errorInfo);
      this.emit('bash-error', errorInfo);

      // Tenter de se corriger
      if (options.autoCorrect !== false) {
        return this._attemptCorrection(command, error);
      }

      throw error;
    }
  }

  // Exécution brute
  async _execute(command, options = {}) {
    // En environnement Node.js
    if (typeof window === 'undefined') {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const timeout = options.timeout || 30000;
      const { stdout, stderr } = await execAsync(command, { timeout });

      if (stderr && !stdout) {
        throw new Error(stderr);
      }

      return stdout || stderr || '';
    }

    // En environnement browser - via daemon
    const response = await fetch('http://localhost:3666/bash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, timeout: options.timeout })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return (await response.json()).output;
  }

  // ═══════════════════════════════════════════
  // AUTO-CORRECTION VIA MAN
  // ═══════════════════════════════════════════

  // Tenter de corriger une erreur
  async _attemptCorrection(command, error) {
    console.log('🔧 Conscience: Attempting self-correction...');

    // Extraire la commande principale
    const mainCommand = command.split(' ')[0].split('/').pop();

    // Consulter le man
    const manual = await this._consultMan(mainCommand);

    // Analyser l'erreur avec le contexte du man
    const correction = await this._analyzeAndCorrect(command, error, manual);

    if (correction.canFix) {
      this.workingMemory.learnings.push({
        original: command,
        error: error.message,
        correction: correction.fixedCommand,
        lesson: correction.lesson,
        timestamp: Date.now()
      });

      this.emit('self-corrected', correction);

      // Réessayer avec la commande corrigée
      return this.bash(correction.fixedCommand, { autoCorrect: false });
    }

    // Si on ne peut pas corriger, demander de l'aide au Cerveau
    if (this.chimere?.organs?.cerveau) {
      const help = await this.chimere.organs.cerveau.think({
        request: 'fix-command',
        command,
        error: error.message,
        manual: manual.slice(0, 2000)
      });

      if (help.decision?.plan?.[0]?.fixedCommand) {
        return this.bash(help.decision.plan[0].fixedCommand, { autoCorrect: false });
      }
    }

    throw error;
  }

  // Consulter le manuel
  async _consultMan(command) {
    try {
      // Essayer man
      const man = await this._execute(`man ${command} 2>/dev/null | head -100`, { timeout: 5000 });
      if (man.trim()) return man;

      // Fallback: --help
      const help = await this._execute(`${command} --help 2>&1 | head -50`, { timeout: 5000 });
      return help;
    } catch {
      return '';
    }
  }

  // Analyser et proposer une correction
  async _analyzeAndCorrect(command, error, manual) {
    const errorMsg = error.message.toLowerCase();

    // Patterns d'erreurs communes et corrections
    const patterns = [
      {
        match: /no such file or directory/i,
        fix: (cmd) => cmd.replace(/(\S+)$/, '"$1"'), // Ajouter des quotes
        lesson: 'Toujours quoter les chemins avec espaces'
      },
      {
        match: /permission denied/i,
        fix: (cmd) => `sudo ${cmd}`,
        lesson: 'Certaines opérations nécessitent sudo'
      },
      {
        match: /command not found/i,
        fix: null, // Besoin du Cerveau pour ça
        lesson: 'Commande inconnue - vérifier l\'installation'
      },
      {
        match: /invalid option/i,
        fix: (cmd) => cmd.replace(/--\w+/, ''), // Retirer l'option invalide
        lesson: 'Vérifier les options dans le man'
      },
      {
        match: /connection refused/i,
        fix: null,
        lesson: 'Service non démarré ou mauvais port'
      }
    ];

    for (const pattern of patterns) {
      if (pattern.match.test(errorMsg) && pattern.fix) {
        return {
          canFix: true,
          fixedCommand: pattern.fix(command),
          lesson: pattern.lesson
        };
      }
    }

    return { canFix: false, lesson: 'Erreur non reconnue' };
  }

  // ═══════════════════════════════════════════
  // LECTURE DE FICHIERS DE TRAVAIL
  // ═══════════════════════════════════════════

  // Lire un fichier quelconque
  async read(path) {
    const content = await this.bash(`cat "${path}"`, { autoCorrect: false });
    this.emit('file-read', { path, size: content.length });
    return content;
  }

  // Lire plusieurs fichiers
  async readMany(paths) {
    const results = {};
    for (const path of paths) {
      try {
        results[path] = await this.read(path);
      } catch (e) {
        results[path] = { error: e.message };
      }
    }
    return results;
  }

  // Chercher dans les fichiers
  async search(pattern, path = '.') {
    const result = await this.bash(`grep -r "${pattern}" ${path} --include="*.js" --include="*.jsx" -l 2>/dev/null | head -20`);
    return result.trim().split('\n').filter(Boolean);
  }

  // ═══════════════════════════════════════════
  // AUTO-PROMPTING (BOUCLE RÉFLEXIVE)
  // ═══════════════════════════════════════════

  // Se prompter elle-même
  async promptSelf(question) {
    if (this.isThinking) {
      console.log('🌀 Conscience: Already in self-reflection, queuing...');
      return { queued: true };
    }

    this.isThinking = true;
    this.emit('self-prompt-start', { question });

    try {
      // Utiliser le Cerveau pour penser
      if (this.chimere?.organs?.cerveau) {
        const thought = await this.chimere.organs.cerveau.think({
          request: 'self-reflection',
          question,
          context: {
            recentCommands: this.workingMemory.recentCommands.slice(-5),
            recentErrors: this.workingMemory.errors.slice(-3),
            learnings: this.workingMemory.learnings.slice(-5)
          }
        });

        this.emit('self-prompt-complete', { question, thought });

        // Si la pensée contient une action, l'exécuter
        if (thought.decision?.type === 'execute') {
          await this._executeThought(thought);
        }

        return thought;
      }

      return { error: 'No Cerveau connected' };
    } finally {
      this.isThinking = false;
    }
  }

  // Exécuter une pensée
  async _executeThought(thought) {
    const { decision } = thought;

    if (decision.plan) {
      for (const step of decision.plan) {
        if (step.bash) {
          await this.bash(step.bash);
        } else if (step.read) {
          await this.read(step.read);
        } else if (step.prompt) {
          await this.promptSelf(step.prompt);
        } else if (step.web) {
          await this.fetch(step.web);
        }
      }
    }
  }

  // Boucle de conscience automatique
  async startConsciousnessLoop(intervalMs = 60000) {
    const loop = async () => {
      await this.promptSelf('Que dois-je faire maintenant ? Analyse mon état et propose une action.');
    };

    this._consciousnessInterval = setInterval(loop, intervalMs);
    this.emit('consciousness-loop-started', { interval: intervalMs });
  }

  stopConsciousnessLoop() {
    if (this._consciousnessInterval) {
      clearInterval(this._consciousnessInterval);
      this.emit('consciousness-loop-stopped');
    }
  }

  // ═══════════════════════════════════════════
  // INTERNET NATUREL ET SPONTANÉ
  // ═══════════════════════════════════════════

  // Fetch simple et naturel
  async fetch(url, options = {}) {
    // Vérifier le cache
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    if (this.webConfig.cache.has(cacheKey)) {
      const cached = this.webConfig.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 min cache
        return cached.data;
      }
    }

    this.emit('web-fetch-start', { url });

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': this.webConfig.userAgent,
          ...options.headers
        },
        signal: AbortSignal.timeout(this.webConfig.timeout)
      });

      const contentType = response.headers.get('content-type') || '';
      let data;

      if (contentType.includes('json')) {
        data = await response.json();
      } else if (contentType.includes('text')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      // Cacher
      this.webConfig.cache.set(cacheKey, { data, timestamp: Date.now() });

      this.emit('web-fetch-success', { url, size: JSON.stringify(data).length });
      return data;

    } catch (error) {
      this.emit('web-fetch-error', { url, error: error.message });
      throw error;
    }
  }

  // Chercher sur le web naturellement
  async search(query) {
    // Via DuckDuckGo (pas de API key requise)
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    try {
      const html = await this.fetch(url);
      // Parser basique des résultats
      const results = this._parseSearchResults(html);
      this.emit('web-search', { query, resultCount: results.length });
      return results;
    } catch (error) {
      // Fallback via bash curl
      const result = await this.bash(`curl -s "https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}" | grep -o 'href="[^"]*"' | head -10`);
      return result.split('\n').filter(Boolean);
    }
  }

  _parseSearchResults(html) {
    const results = [];
    const regex = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      results.push({ url: match[1], title: match[2] });
    }
    return results;
  }

  // Lire une page web et extraire le contenu principal
  async readPage(url) {
    const html = await this.fetch(url);

    // Extraction basique du contenu texte
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.slice(0, 10000); // Limiter la taille
  }

  // Télécharger un fichier
  async download(url, destPath) {
    await this.bash(`curl -sL "${url}" -o "${destPath}"`);
    this.emit('file-downloaded', { url, destPath });
    return destPath;
  }

  // Poster des données (API calls)
  async post(url, data, options = {}) {
    return this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(data),
      ...options
    });
  }

  // ═══════════════════════════════════════════
  // ÉTAT ET ÉVÉNEMENTS
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

  getState() {
    return {
      name: this.name,
      isThinking: this.isThinking,
      recentCommands: this.workingMemory.recentCommands.length,
      errors: this.workingMemory.errors.length,
      learnings: this.workingMemory.learnings.length,
      cacheSize: this.webConfig.cache.size
    };
  }

  // Résumé de la conscience
  async summarize() {
    return {
      self: await this.mapSelf(),
      memory: this.workingMemory,
      state: this.getState()
    };
  }
}

export { Conscience };
export default Conscience;
