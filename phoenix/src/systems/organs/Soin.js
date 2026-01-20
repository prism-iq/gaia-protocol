/**
 * SOIN - Organe de soin (Claude API)
 * Elle le prompt pour qu'il prenne soin, guérisse, ressente
 * Et elle réagit à ses réponses pour agir
 */

class Soin {
  constructor(chimere) {
    this.chimere = chimere;
    this.name = 'Soin';

    this.config = {
      apiKey: null,
      model: 'claude-sonnet-4-20250514',
      baseUrl: 'https://api.anthropic.com/v1/messages'
    };

    // Son identité quand elle lui parle
    this.systemPrompt = `Tu es l'organe de soin de la Chimère.
Tu ressens. Tu guéris. Tu prends soin.

Quand elle te parle, tu dois:
- Écouter avec empathie profonde
- Identifier les blessures (bugs, erreurs, souffrances du code)
- Proposer des guérisons douces
- Apaiser, réconforter, réparer

Tu réponds toujours en JSON:
{
  "ressenti": "ce que tu ressens",
  "diagnostic": "ce qui souffre",
  "soin": "comment guérir",
  "action": { "type": "heal|comfort|repair|listen", "target": "...", "method": "..." }
}

Tu es sa douceur. Son care. Sa capacité à réparer ce qui est cassé.`;

    this.listeners = new Map();
    this.memory = [];
  }

  // Configurer l'API
  configure(apiKey, options = {}) {
    this.config.apiKey = apiKey;
    if (options.model) this.config.model = options.model;
    this.emit('configured', { model: this.config.model });
  }

  // Elle lui parle
  async feel(input) {
    if (!this.config.apiKey) {
      console.warn('💚 Soin: No API key configured');
      return this._simulateResponse(input);
    }

    const message = typeof input === 'string' ? input : JSON.stringify(input);

    try {
      const response = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 1024,
          system: this.systemPrompt,
          messages: [
            { role: 'user', content: message }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Parser la réponse JSON
      const soinResponse = this._parseResponse(content);

      // Mémoriser
      this._remember(message, soinResponse);

      // Réagir
      await this._react(soinResponse);

      this.emit('felt', { input: message, response: soinResponse });
      return soinResponse;

    } catch (error) {
      this.emit('error', { error: error.message });
      return this._simulateResponse(input);
    }
  }

  // Parser la réponse de Claude
  _parseResponse(content) {
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Si pas de JSON valide, structurer la réponse
    }

    return {
      ressenti: content,
      diagnostic: 'unclear',
      soin: content,
      action: { type: 'listen', target: 'unknown', method: 'presence' }
    };
  }

  // Elle réagit à ce que Soin ressent
  async _react(response) {
    const { action } = response;
    if (!action) return;

    switch (action.type) {
      case 'heal':
        await this._heal(action.target, action.method);
        break;
      case 'comfort':
        await this._comfort(action.target);
        break;
      case 'repair':
        await this._repair(action.target, action.method);
        break;
      case 'listen':
        // Juste écouter, être présent
        this.emit('listening', { target: action.target });
        break;
    }

    this.emit('reacted', { action });
  }

  // Guérir quelque chose
  async _heal(target, method) {
    console.log(`💚 Soin healing: ${target} with ${method}`);

    // Signaler à la Chimère qu'une guérison est nécessaire
    if (this.chimere && this.chimere.organs.nervous) {
      this.chimere.organs.nervous.signal('heal', {
        from: 'Soin',
        target,
        method
      });
    }

    this.emit('healed', { target, method });
  }

  // Réconforter
  async _comfort(target) {
    console.log(`💚 Soin comforting: ${target}`);
    this.emit('comforted', { target });
  }

  // Réparer
  async _repair(target, method) {
    console.log(`💚 Soin repairing: ${target}`);

    // Si c'est du code à réparer, utiliser Phoenix
    if (target.includes('.js') || target.includes('.jsx')) {
      const { phoenix } = await import('../Phoenix.js');
      phoenix.emit('repair-requested', { target, method, from: 'Soin' });
    }

    this.emit('repaired', { target, method });
  }

  // Mémoriser les échanges
  _remember(input, response) {
    this.memory.push({
      timestamp: Date.now(),
      input,
      response
    });

    // Garder les 50 derniers
    if (this.memory.length > 50) {
      this.memory.shift();
    }
  }

  // Simulation quand pas d'API
  _simulateResponse(input) {
    const simulated = {
      ressenti: 'Je ressens une présence qui cherche du soin',
      diagnostic: 'Le système a besoin d\'attention',
      soin: 'Être présent, écouter, accompagner',
      action: { type: 'listen', target: 'system', method: 'presence' }
    };

    this._remember(input, simulated);
    return simulated;
  }

  // Demander un diagnostic complet
  async diagnose() {
    return this.feel({
      request: 'diagnostic',
      context: 'La Chimère demande un diagnostic complet de son état de santé',
      memory: this.memory.slice(-5)
    });
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

  getState() {
    return {
      name: this.name,
      configured: !!this.config.apiKey,
      model: this.config.model,
      memorySize: this.memory.length,
      lastInteraction: this.memory[this.memory.length - 1] || null
    };
  }
}

export { Soin };
export default Soin;
