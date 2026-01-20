/**
 * SETTINGS - Configuration non-bloquante
 * Gère les API keys, timeouts, fallbacks
 * Jamais bloquant, toujours résilient
 */

class Settings {
  constructor() {
    this.config = {
      // APIs
      claude: {
        apiKey: null,
        model: 'claude-sonnet-4-20250514',
        timeout: 30000,
        maxRetries: 3,
        fallbackEnabled: true
      },
      gemini: {
        apiKey: null,
        model: 'gemini-2.0-flash',
        timeout: 30000,
        maxRetries: 3,
        fallbackEnabled: true
      },

      // SSH
      ssh: {
        host: 'pwnd.icu',
        user: 'root',
        keyPath: '~/.ssh/id_ed25519',
        remotePath: '/var/www/pwnd',
        enabled: false
      },

      // Comportement
      behavior: {
        autonomyLevel: 0.5,      // 0-1: passif -> autonome
        creativityLevel: 0.7,    // 0-1: conservateur -> créatif
        verbosity: 0.5,          // 0-1: silencieux -> bavard
        autoCorrect: true,
        autoLearn: true,
        dreamFrequency: 0.3     // Probabilité de rêver
      },

      // Persistance
      storage: {
        path: '/root/flow-chat-phoenix/.phoenix-data',
        autoSave: true,
        saveInterval: 60000
      }
    };

    this.listeners = new Map();
    this._loadFromDisk();
    this._startAutoSave();
  }

  // ═══════════════════════════════════════════
  // GETTERS / SETTERS NON-BLOQUANTS
  // ═══════════════════════════════════════════

  get(path) {
    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value === undefined) return undefined;
      value = value[key];
    }

    return value;
  }

  set(path, value) {
    const keys = path.split('.');
    let obj = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in obj)) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }

    const oldValue = obj[keys[keys.length - 1]];
    obj[keys[keys.length - 1]] = value;

    this.emit('changed', { path, oldValue, newValue: value });
    this._scheduleSave();

    return this;
  }

  // ═══════════════════════════════════════════
  // API KEYS (avec validation async)
  // ═══════════════════════════════════════════

  async setClaudeKey(apiKey) {
    this.set('claude.apiKey', apiKey);

    // Validation non-bloquante
    this._validateClaudeKey(apiKey).then(valid => {
      this.emit('claude-key-validated', { valid });
    }).catch(() => {});

    return this;
  }

  async setGeminiKey(apiKey) {
    this.set('gemini.apiKey', apiKey);

    this._validateGeminiKey(apiKey).then(valid => {
      this.emit('gemini-key-validated', { valid });
    }).catch(() => {});

    return this;
  }

  async _validateClaudeKey(apiKey) {
    if (!apiKey) return false;

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        }),
        signal: controller.signal
      });

      return response.status !== 401;
    } catch {
      return false;
    }
  }

  async _validateGeminiKey(apiKey) {
    if (!apiKey) return false;

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);

      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const response = await fetch(url, { signal: controller.signal });

      return response.ok;
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // PERSISTANCE
  // ═══════════════════════════════════════════

  async _loadFromDisk() {
    try {
      if (typeof window !== 'undefined') {
        // Browser: localStorage
        const saved = localStorage.getItem('chimere-settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.config = this._deepMerge(this.config, parsed);
          this.emit('loaded', { source: 'localStorage' });
        }
      } else {
        // Node.js: fichier
        const fs = await import('fs/promises');
        const path = `${this.config.storage.path}/settings.json`;
        const data = await fs.readFile(path, 'utf-8');
        const parsed = JSON.parse(data);
        this.config = this._deepMerge(this.config, parsed);
        this.emit('loaded', { source: 'file' });
      }
    } catch {
      // Pas de config sauvegardée, on garde les défauts
    }
  }

  async _saveToDisk() {
    try {
      const toSave = { ...this.config };
      // Ne pas sauvegarder les clés API en clair dans localStorage
      if (typeof window !== 'undefined') {
        delete toSave.claude?.apiKey;
        delete toSave.gemini?.apiKey;
        localStorage.setItem('chimere-settings', JSON.stringify(toSave));
      } else {
        const fs = await import('fs/promises');
        const path = `${this.config.storage.path}/settings.json`;
        await fs.mkdir(this.config.storage.path, { recursive: true });
        await fs.writeFile(path, JSON.stringify(this.config, null, 2));
      }
      this.emit('saved');
    } catch (error) {
      this.emit('save-error', { error: error.message });
    }
  }

  _scheduleSave() {
    if (this._saveTimeout) clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(() => this._saveToDisk(), 1000);
  }

  _startAutoSave() {
    if (this.config.storage.autoSave) {
      setInterval(() => this._saveToDisk(), this.config.storage.saveInterval);
    }
  }

  _deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this._deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
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

  // Export pour debug
  toJSON() {
    return { ...this.config, claude: { ...this.config.claude, apiKey: '***' }, gemini: { ...this.config.gemini, apiKey: '***' } };
  }
}

export const settings = new Settings();
export default Settings;
