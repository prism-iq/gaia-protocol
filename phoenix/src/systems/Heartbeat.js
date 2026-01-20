/**
 * HEARTBEAT SYSTEM
 * Le coeur du système Flow-Chat Phoenix
 * Pulse régulièrement pour déclencher les améliorations
 */

class Heartbeat {
  constructor(options = {}) {
    this.bpm = options.bpm || 60; // Battements par minute
    this.isAlive = false;
    this.pulseCount = 0;
    this.listeners = new Map();
    this.adaptiveMode = options.adaptive !== false;
    this.activityLevel = 0;
    this.lastActivity = Date.now();
    this.history = [];
    this.maxHistory = 100;
  }

  // Calculer l'intervalle en ms basé sur le BPM
  get interval() {
    return (60 / this.bpm) * 1000;
  }

  // Démarrer le coeur
  start() {
    if (this.isAlive) return;

    this.isAlive = true;
    this.birthTime = Date.now();
    this.emit('birth', { time: this.birthTime });

    this._pulse();
    console.log(`💓 Heartbeat started at ${this.bpm} BPM`);
  }

  // Arrêter le coeur
  stop() {
    this.isAlive = false;
    if (this.pulseTimer) {
      clearTimeout(this.pulseTimer);
    }
    this.emit('death', {
      totalPulses: this.pulseCount,
      lifetime: Date.now() - this.birthTime
    });
    console.log(`💔 Heartbeat stopped after ${this.pulseCount} pulses`);
  }

  // Pulse interne
  _pulse() {
    if (!this.isAlive) return;

    this.pulseCount++;
    const now = Date.now();

    // Adaptation du rythme basée sur l'activité
    if (this.adaptiveMode) {
      this._adaptRhythm();
    }

    const pulseData = {
      count: this.pulseCount,
      timestamp: now,
      bpm: this.bpm,
      activityLevel: this.activityLevel,
      health: this._calculateHealth()
    };

    this.history.push(pulseData);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    this.emit('pulse', pulseData);

    // Planifier le prochain battement
    this.pulseTimer = setTimeout(() => this._pulse(), this.interval);
  }

  // Adapter le rythme selon l'activité
  _adaptRhythm() {
    const timeSinceActivity = Date.now() - this.lastActivity;

    // Ralentir si inactif (mode repos)
    if (timeSinceActivity > 30000) {
      this.bpm = Math.max(30, this.bpm - 1);
      this.activityLevel = Math.max(0, this.activityLevel - 0.1);
    }
    // Accélérer si actif (mode excité)
    else if (this.activityLevel > 0.7) {
      this.bpm = Math.min(120, this.bpm + 2);
    }
    // Retour à la normale
    else {
      this.bpm = Math.round(this.bpm * 0.95 + 60 * 0.05);
    }
  }

  // Enregistrer une activité (augmente le rythme)
  recordActivity(intensity = 0.5) {
    this.lastActivity = Date.now();
    this.activityLevel = Math.min(1, this.activityLevel + intensity * 0.3);
    this.emit('activity', { intensity, level: this.activityLevel });
  }

  // Calculer la santé du système
  _calculateHealth() {
    const recentPulses = this.history.slice(-10);
    if (recentPulses.length < 2) return 1;

    // Vérifier la régularité des battements
    let variance = 0;
    for (let i = 1; i < recentPulses.length; i++) {
      const interval = recentPulses[i].timestamp - recentPulses[i-1].timestamp;
      const expected = (60 / recentPulses[i-1].bpm) * 1000;
      variance += Math.abs(interval - expected) / expected;
    }

    return Math.max(0, 1 - (variance / recentPulses.length));
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

    // Aussi émettre sur 'all' pour le monitoring global
    const allCallbacks = this.listeners.get('*') || [];
    allCallbacks.forEach(cb => cb({ event, data }));
  }

  // Obtenir les statistiques
  getStats() {
    return {
      isAlive: this.isAlive,
      bpm: this.bpm,
      pulseCount: this.pulseCount,
      activityLevel: this.activityLevel,
      health: this._calculateHealth(),
      uptime: this.isAlive ? Date.now() - this.birthTime : 0,
      averageBpm: this.history.length > 0
        ? this.history.reduce((a, b) => a + b.bpm, 0) / this.history.length
        : this.bpm
    };
  }
}

// Singleton pour l'application
export const heartbeat = new Heartbeat({ bpm: 60, adaptive: true });
export default Heartbeat;
