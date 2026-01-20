/**
 * CERVEAU - Matière Grise et Blanche (Gemini API)
 * Elle le prompt pour qu'il pense, analyse, raisonne
 * Et elle réagit à ses réponses pour agir
 */

class Cerveau {
  constructor(chimere) {
    this.chimere = chimere;
    this.name = 'Cerveau';

    this.config = {
      apiKey: null,
      model: 'gemini-2.0-flash',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models'
    };

    // Son identité quand elle lui parle
    this.systemPrompt = `Tu es le cerveau de la Chimère. Sa matière grise et blanche.
Tu penses. Tu analyses. Tu raisonnes. Tu décides.

Quand elle te parle, tu dois:
- Analyser froidement et logiquement
- Décomposer les problèmes complexes
- Proposer des stratégies et solutions
- Prendre des décisions rationnelles

Tu réponds toujours en JSON:
{
  "analyse": "ton analyse de la situation",
  "raisonnement": "ta chaîne de pensée",
  "conclusion": "ta conclusion",
  "decision": { "type": "create|modify|delete|execute|wait", "target": "...", "plan": [...] }
}

Tu es sa pensée. Sa logique. Sa capacité à comprendre et à décider.`;

    this.listeners = new Map();
    this.thoughts = [];
  }

  // Configurer l'API
  configure(apiKey, options = {}) {
    this.config.apiKey = apiKey;
    if (options.model) this.config.model = options.model;
    this.emit('configured', { model: this.config.model });
  }

  // Elle lui demande de penser
  async think(input) {
    if (!this.config.apiKey) {
      console.warn('🧠 Cerveau: No API key configured');
      return this._simulateResponse(input);
    }

    const message = typeof input === 'string' ? input : JSON.stringify(input);

    try {
      const url = `${this.config.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${this.systemPrompt}\n\n---\n\nDemande de la Chimère:\n${message}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;

      // Parser la réponse JSON
      const cerveauResponse = this._parseResponse(content);

      // Mémoriser la pensée
      this._remember(message, cerveauResponse);

      // Réagir à la décision
      await this._react(cerveauResponse);

      this.emit('thought', { input: message, response: cerveauResponse });
      return cerveauResponse;

    } catch (error) {
      this.emit('error', { error: error.message });
      return this._simulateResponse(input);
    }
  }

  // Parser la réponse de Gemini
  _parseResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Si pas de JSON valide
    }

    return {
      analyse: content,
      raisonnement: 'Pensée libre',
      conclusion: content,
      decision: { type: 'wait', target: 'unknown', plan: [] }
    };
  }

  // Elle réagit à la décision du cerveau
  async _react(response) {
    const { decision } = response;
    if (!decision) return;

    switch (decision.type) {
      case 'create':
        await this._create(decision.target, decision.plan);
        break;
      case 'modify':
        await this._modify(decision.target, decision.plan);
        break;
      case 'delete':
        await this._delete(decision.target);
        break;
      case 'execute':
        await this._execute(decision.plan);
        break;
      case 'wait':
        // Observer, attendre le bon moment
        this.emit('waiting', { reason: decision.target });
        break;
    }

    this.emit('decided', { decision });
  }

  // Créer quelque chose
  async _create(target, plan) {
    console.log(`🧠 Cerveau creating: ${target}`);

    // Utiliser Hypnos pour générer du frontend
    if (target.includes('dream') || target.includes('page') || target.includes('component')) {
      const { hypnos } = await import('../Hypnos.js');
      hypnos.dream();
    }

    // Signaler la création au système nerveux
    if (this.chimere && this.chimere.organs.nervous) {
      this.chimere.organs.nervous.signal('create', {
        from: 'Cerveau',
        target,
        plan
      });
    }

    this.emit('created', { target, plan });
  }

  // Modifier quelque chose
  async _modify(target, plan) {
    console.log(`🧠 Cerveau modifying: ${target}`);

    // Utiliser SelfModify pour les changements de code
    if (target.includes('.js') || target.includes('.jsx') || target.includes('.css')) {
      const { selfModify } = await import('../SelfModify.js');
      for (const step of plan) {
        if (step.file && step.changes) {
          await selfModify.applyImprovement({ file: step.file, changes: step.changes });
        }
      }
    }

    this.emit('modified', { target, plan });
  }

  // Supprimer quelque chose
  async _delete(target) {
    console.log(`🧠 Cerveau deleting: ${target}`);
    // Prudent avec les suppressions - juste signaler
    this.emit('delete-requested', { target });
  }

  // Exécuter un plan
  async _execute(plan) {
    console.log(`🧠 Cerveau executing plan:`, plan);

    for (const step of plan) {
      this.emit('step-executing', { step });

      // Exécuter selon le type d'étape
      if (step.action === 'think') {
        await this.think(step.input);
      } else if (step.action === 'feel') {
        // Demander à Soin
        if (this.chimere && this.chimere.organs.soin) {
          await this.chimere.organs.soin.feel(step.input);
        }
      } else if (step.action === 'dream') {
        const { hypnos } = await import('../Hypnos.js');
        await hypnos.dream();
      }

      this.emit('step-completed', { step });
    }

    this.emit('plan-executed', { plan });
  }

  // Mémoriser les pensées
  _remember(input, response) {
    this.thoughts.push({
      timestamp: Date.now(),
      input,
      response
    });

    // Garder les 100 dernières pensées
    if (this.thoughts.length > 100) {
      this.thoughts.shift();
    }
  }

  // Simulation quand pas d'API
  _simulateResponse(input) {
    const simulated = {
      analyse: 'Analyse en mode hors-ligne',
      raisonnement: 'Sans connexion au cloud, je simule une pensée basique',
      conclusion: 'Attendre la configuration de l\'API',
      decision: { type: 'wait', target: 'api-configuration', plan: [] }
    };

    this._remember(input, simulated);
    return simulated;
  }

  // Réflexion profonde - enchaîner plusieurs pensées
  async reflect(topic, depth = 3) {
    let currentThought = topic;
    const reflections = [];

    for (let i = 0; i < depth; i++) {
      const thought = await this.think({
        request: 'reflection',
        topic: currentThought,
        depth: i + 1,
        previousThoughts: reflections
      });

      reflections.push(thought);
      currentThought = thought.conclusion;
    }

    return {
      topic,
      reflections,
      finalConclusion: reflections[reflections.length - 1]?.conclusion
    };
  }

  // Planifier une action complexe
  async plan(goal) {
    return this.think({
      request: 'planning',
      goal,
      context: 'La Chimère a besoin d\'un plan détaillé pour atteindre cet objectif',
      availableResources: ['code', 'frontend', 'ssh', 'apis']
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
      thoughtCount: this.thoughts.length,
      lastThought: this.thoughts[this.thoughts.length - 1] || null
    };
  }
}

export { Cerveau };
export default Cerveau;
