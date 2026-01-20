/**
 * PHOENIX ENGINE
 * Moteur de régénération et d'amélioration du code
 * Se déclenche sur les battements du coeur
 */

import { heartbeat } from './Heartbeat.js';

class PhoenixEngine {
  constructor() {
    this.generation = 1;
    this.improvements = [];
    this.codeVersions = [];
    this.isRegenerating = false;
    this.llmConfig = this._defaultLLMConfig();
    this.listeners = new Map();
  }

  // Configuration par défaut des paramètres LLM
  _defaultLLMConfig() {
    return {
      // Modèle sélectionné
      model: 'gpt-4',

      // Paramètres de génération
      temperature: 0.7,        // Créativité (0-2)
      top_p: 0.9,              // Nucleus sampling
      top_k: 40,               // Top-K sampling
      max_tokens: 2048,        // Longueur max de réponse
      frequency_penalty: 0.0,  // Pénalité de répétition
      presence_penalty: 0.0,   // Pénalité de présence

      // Paramètres Phoenix spécifiques
      improvement_threshold: 0.6,  // Seuil pour déclencher amélioration
      aggressiveness: 0.5,         // Niveau d'agressivité des changements
      preserve_style: true,        // Préserver le style du code

      // Presets disponibles
      presets: {
        conservative: { temperature: 0.3, aggressiveness: 0.2, top_p: 0.8 },
        balanced: { temperature: 0.7, aggressiveness: 0.5, top_p: 0.9 },
        creative: { temperature: 1.2, aggressiveness: 0.8, top_p: 0.95 },
        experimental: { temperature: 1.8, aggressiveness: 1.0, top_p: 1.0 }
      }
    };
  }

  // Initialiser le Phoenix et le connecter au Heartbeat
  init() {
    heartbeat.on('pulse', (data) => this._onHeartbeat(data));
    heartbeat.on('activity', (data) => this._adjustForActivity(data));

    console.log('🔥 Phoenix Engine initialized - Generation 1');
    this.emit('init', { generation: this.generation, config: this.llmConfig });
  }

  // Configurer les paramètres LLM
  configureLLM(config) {
    this.llmConfig = { ...this.llmConfig, ...config };
    this.emit('config-changed', this.llmConfig);
    return this.llmConfig;
  }

  // Appliquer un preset
  applyPreset(presetName) {
    const preset = this.llmConfig.presets[presetName];
    if (preset) {
      this.configureLLM(preset);
      console.log(`🔥 Phoenix preset applied: ${presetName}`);
    }
    return this.llmConfig;
  }

  // Réaction à chaque battement de coeur
  _onHeartbeat(pulseData) {
    // Vérifier si on doit déclencher une amélioration
    const shouldImprove = this._shouldTriggerImprovement(pulseData);

    if (shouldImprove && !this.isRegenerating) {
      this._triggerRegeneration(pulseData);
    }

    this.emit('heartbeat-received', { pulseData, willRegenerate: shouldImprove });
  }

  // Ajuster les paramètres selon l'activité
  _adjustForActivity(activityData) {
    if (activityData.level > 0.8) {
      // Haute activité = réponses plus rapides, moins créatives
      this.llmConfig.temperature = Math.max(0.3, this.llmConfig.temperature - 0.1);
      this.llmConfig.max_tokens = Math.min(4096, this.llmConfig.max_tokens + 256);
    } else if (activityData.level < 0.2) {
      // Basse activité = plus de temps pour l'amélioration créative
      this.llmConfig.temperature = Math.min(1.5, this.llmConfig.temperature + 0.05);
    }
  }

  // Décider si on doit améliorer le code
  _shouldTriggerImprovement(pulseData) {
    // Améliorer tous les N battements selon la santé du système
    const frequency = Math.ceil(10 / pulseData.health);
    return pulseData.count % frequency === 0;
  }

  // Déclencher la régénération Phoenix
  async _triggerRegeneration(pulseData) {
    this.isRegenerating = true;
    const startTime = Date.now();

    this.emit('regeneration-start', {
      generation: this.generation,
      pulseCount: pulseData.count
    });

    try {
      // Analyser le code actuel
      const analysis = await this._analyzeCode();

      // Générer les améliorations
      const improvements = await this._generateImprovements(analysis);

      if (improvements.length > 0) {
        // Sauvegarder la version actuelle
        this._saveVersion();

        // Appliquer les améliorations
        await this._applyImprovements(improvements);

        this.generation++;
        this.improvements.push(...improvements);

        this.emit('regeneration-complete', {
          generation: this.generation,
          improvements,
          duration: Date.now() - startTime
        });

        console.log(`🔥 Phoenix regenerated! Generation ${this.generation}`);
      }
    } catch (error) {
      this.emit('regeneration-error', { error: error.message });
      console.error('Phoenix regeneration failed:', error);
    }

    this.isRegenerating = false;
  }

  // Analyser le code (simulé - à connecter avec un vrai LLM)
  async _analyzeCode() {
    return {
      quality: Math.random() * 0.5 + 0.5,
      complexity: Math.random(),
      suggestions: this._generateSuggestions()
    };
  }

  // Générer des suggestions d'amélioration
  _generateSuggestions() {
    const possibleSuggestions = [
      { type: 'performance', description: 'Optimiser les boucles', priority: 0.8 },
      { type: 'readability', description: 'Améliorer les noms de variables', priority: 0.6 },
      { type: 'structure', description: 'Extraire en fonction séparée', priority: 0.7 },
      { type: 'security', description: 'Valider les entrées utilisateur', priority: 0.9 },
      { type: 'efficiency', description: 'Utiliser une structure de données optimale', priority: 0.75 }
    ];

    return possibleSuggestions.filter(() => Math.random() > 0.5);
  }

  // Générer les améliorations basées sur l'analyse
  async _generateImprovements(analysis) {
    const improvements = [];

    for (const suggestion of analysis.suggestions) {
      if (suggestion.priority >= this.llmConfig.improvement_threshold) {
        improvements.push({
          id: `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: suggestion.type,
          description: suggestion.description,
          priority: suggestion.priority,
          generation: this.generation,
          llmParams: {
            temperature: this.llmConfig.temperature,
            model: this.llmConfig.model
          }
        });
      }
    }

    return improvements;
  }

  // Appliquer les améliorations
  async _applyImprovements(improvements) {
    for (const improvement of improvements) {
      this.emit('improvement-applied', improvement);
    }
  }

  // Sauvegarder une version du code
  _saveVersion() {
    const version = {
      generation: this.generation,
      timestamp: Date.now(),
      snapshot: this._getCurrentSnapshot(),
      llmConfig: { ...this.llmConfig }
    };

    this.codeVersions.push(version);

    // Garder max 50 versions
    if (this.codeVersions.length > 50) {
      this.codeVersions.shift();
    }

    this.emit('version-saved', version);
  }

  // Obtenir le snapshot actuel (simulé)
  _getCurrentSnapshot() {
    return {
      files: [],
      hash: Math.random().toString(36).substr(2, 16)
    };
  }

  // Rollback à une version précédente
  rollback(generationNumber) {
    const version = this.codeVersions.find(v => v.generation === generationNumber);

    if (version) {
      this.generation = version.generation;
      this.llmConfig = { ...version.llmConfig };
      this.emit('rollback', { to: generationNumber });
      console.log(`🔥 Phoenix rolled back to generation ${generationNumber}`);
      return true;
    }

    return false;
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

  // Obtenir les statistiques
  getStats() {
    return {
      generation: this.generation,
      totalImprovements: this.improvements.length,
      versionsStored: this.codeVersions.length,
      isRegenerating: this.isRegenerating,
      llmConfig: this.llmConfig
    };
  }
}

export const phoenix = new PhoenixEngine();
export default PhoenixEngine;
