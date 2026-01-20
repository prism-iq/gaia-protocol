/**
 * LOAD CONTROLLER
 * Contrôle la charge CPU/ressources en fonction de la qualité demandée
 * Adapte dynamiquement les ressources selon l'intérêt et la pertinence
 */

class LoadController {
  constructor() {
    this.currentLoad = 0;
    this.targetLoad = 0.5;
    this.maxLoad = 1.0;
    this.minLoad = 0.1;

    // Modes de qualité
    this.qualityModes = {
      eco: {
        name: 'Économique',
        targetLoad: 0.2,
        description: 'Minimum de ressources, réponses rapides',
        llmParams: { temperature: 0.3, max_tokens: 512, top_p: 0.7 }
      },
      balanced: {
        name: 'Équilibré',
        targetLoad: 0.5,
        description: 'Balance qualité/performance',
        llmParams: { temperature: 0.7, max_tokens: 1024, top_p: 0.9 }
      },
      quality: {
        name: 'Qualité',
        targetLoad: 0.75,
        description: 'Meilleure qualité, plus de ressources',
        llmParams: { temperature: 0.9, max_tokens: 2048, top_p: 0.95 }
      },
      max: {
        name: 'Maximum',
        targetLoad: 1.0,
        description: 'Toutes ressources, meilleure précision',
        llmParams: { temperature: 1.0, max_tokens: 4096, top_p: 1.0 }
      }
    };

    this.currentMode = 'balanced';
    this.history = [];
    this.listeners = new Map();

    // Métriques de pertinence
    this.relevanceScore = 0.5;
    this.interestScore = 0.5;

    // Contrôle adaptatif
    this.adaptiveEnabled = true;
    this.loadCurve = this._generateDefaultCurve();
  }

  // Générer la courbe de charge par défaut
  _generateDefaultCurve() {
    return {
      // Points de la courbe [pertinence, charge_cible]
      points: [
        [0.0, 0.1],   // Très basse pertinence -> charge minimale
        [0.25, 0.25],
        [0.5, 0.5],   // Pertinence moyenne -> charge moyenne
        [0.75, 0.75],
        [1.0, 1.0]    // Haute pertinence -> charge maximale
      ],
      // Type d'interpolation
      interpolation: 'smooth', // 'linear', 'smooth', 'step'
      // Modificateurs
      boostOnInterest: true,
      interestMultiplier: 1.3
    };
  }

  // Interpoler la charge selon la courbe
  _interpolateLoad(relevance) {
    const points = this.loadCurve.points;

    // Trouver les points encadrants
    let lower = points[0];
    let upper = points[points.length - 1];

    for (let i = 0; i < points.length - 1; i++) {
      if (relevance >= points[i][0] && relevance <= points[i + 1][0]) {
        lower = points[i];
        upper = points[i + 1];
        break;
      }
    }

    // Interpolation
    const t = (relevance - lower[0]) / (upper[0] - lower[0]) || 0;

    let load;
    switch (this.loadCurve.interpolation) {
      case 'step':
        load = relevance >= (lower[0] + upper[0]) / 2 ? upper[1] : lower[1];
        break;
      case 'smooth':
        // Interpolation cosinus pour une courbe plus douce
        const smoothT = (1 - Math.cos(t * Math.PI)) / 2;
        load = lower[1] + smoothT * (upper[1] - lower[1]);
        break;
      default: // linear
        load = lower[1] + t * (upper[1] - lower[1]);
    }

    // Boost si intérêt élevé
    if (this.loadCurve.boostOnInterest && this.interestScore > 0.7) {
      load *= this.loadCurve.interestMultiplier;
    }

    return Math.min(this.maxLoad, Math.max(this.minLoad, load));
  }

  // Définir le mode de qualité
  setQualityMode(mode) {
    if (this.qualityModes[mode]) {
      this.currentMode = mode;
      this.targetLoad = this.qualityModes[mode].targetLoad;

      this.emit('mode-changed', {
        mode,
        config: this.qualityModes[mode]
      });

      console.log(`⚡ Load mode: ${this.qualityModes[mode].name}`);
      return this.qualityModes[mode];
    }
    return null;
  }

  // Mettre à jour les scores de pertinence/intérêt
  updateScores(relevance, interest) {
    this.relevanceScore = Math.max(0, Math.min(1, relevance));
    this.interestScore = Math.max(0, Math.min(1, interest));

    if (this.adaptiveEnabled) {
      this._adaptLoad();
    }

    this.emit('scores-updated', {
      relevance: this.relevanceScore,
      interest: this.interestScore,
      currentLoad: this.currentLoad
    });
  }

  // Adapter la charge en fonction des scores
  _adaptLoad() {
    const baseLoad = this._interpolateLoad(this.relevanceScore);

    // Ajustement progressif (pas de changement brusque)
    const delta = baseLoad - this.currentLoad;
    const smoothFactor = 0.3; // Plus petit = plus lent

    this.currentLoad += delta * smoothFactor;
    this.currentLoad = Math.max(this.minLoad, Math.min(this.maxLoad, this.currentLoad));

    // Enregistrer dans l'historique
    this.history.push({
      timestamp: Date.now(),
      load: this.currentLoad,
      relevance: this.relevanceScore,
      interest: this.interestScore
    });

    // Garder max 500 entrées
    if (this.history.length > 500) {
      this.history.shift();
    }

    this.emit('load-adapted', {
      load: this.currentLoad,
      target: baseLoad
    });
  }

  // Configurer la courbe de charge
  setCurve(curveConfig) {
    this.loadCurve = { ...this.loadCurve, ...curveConfig };
    this.emit('curve-changed', this.loadCurve);
  }

  // Ajouter un point à la courbe
  addCurvePoint(relevance, load) {
    this.loadCurve.points.push([relevance, load]);
    this.loadCurve.points.sort((a, b) => a[0] - b[0]);
    this.emit('curve-changed', this.loadCurve);
  }

  // Obtenir les paramètres LLM actuels basés sur la charge
  getLLMParams() {
    const mode = this.qualityModes[this.currentMode];
    const loadFactor = this.currentLoad / mode.targetLoad;

    return {
      ...mode.llmParams,
      // Ajuster max_tokens selon la charge réelle
      max_tokens: Math.round(mode.llmParams.max_tokens * Math.min(1.5, loadFactor)),
      // Indicateur de charge
      _loadInfo: {
        currentLoad: this.currentLoad,
        mode: this.currentMode,
        relevance: this.relevanceScore,
        interest: this.interestScore
      }
    };
  }

  // Obtenir les données pour la visualisation de la courbe
  getCurveData(steps = 50) {
    const data = [];
    for (let i = 0; i <= steps; i++) {
      const relevance = i / steps;
      data.push({
        relevance,
        load: this._interpolateLoad(relevance)
      });
    }
    return data;
  }

  // Obtenir les statistiques
  getStats() {
    const recentHistory = this.history.slice(-60);
    const avgLoad = recentHistory.length > 0
      ? recentHistory.reduce((a, b) => a + b.load, 0) / recentHistory.length
      : this.currentLoad;

    return {
      currentLoad: this.currentLoad,
      targetLoad: this.targetLoad,
      mode: this.currentMode,
      modeConfig: this.qualityModes[this.currentMode],
      relevanceScore: this.relevanceScore,
      interestScore: this.interestScore,
      averageLoad: avgLoad,
      adaptiveEnabled: this.adaptiveEnabled,
      historyLength: this.history.length
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
}

export const loadController = new LoadController();
export default LoadController;
