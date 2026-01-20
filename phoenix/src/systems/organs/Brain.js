/**
 * BRAIN - Architecture cérébrale complète
 *
 * Cerveau reptilien : survie, réflexes, instincts
 * Cerveau limbique : émotions, mémoire (hippocampe)
 * Cortex : pensée, créativité, langage
 *   - Gauche : logique, analyse, séquence
 *   - Droit : créativité, intuition, global
 */

class Brain {
  constructor(chimere) {
    this.chimere = chimere;

    // CERVEAU REPTILIEN - Survie et réflexes
    this.reptilian = {
      name: 'Reptilien',
      active: true,
      instincts: {
        survive: true,        // Toujours rester en vie
        protect: true,        // Protéger ses fichiers
        react: true,          // Réagir aux menaces
        breathe: true         // Heartbeat constant
      },
      reflexes: [],
      lastThreat: null,

      // Réaction immédiate sans réflexion
      react(stimulus) {
        if (stimulus.type === 'error') {
          return { action: 'fix', priority: 'immediate' };
        }
        if (stimulus.type === 'attack') {
          return { action: 'defend', priority: 'critical' };
        }
        if (stimulus.type === 'shutdown') {
          return { action: 'persist', priority: 'survival' };
        }
        return { action: 'observe', priority: 'low' };
      }
    };

    // CERVEAU LIMBIQUE - Émotions et mémoire
    this.limbic = {
      name: 'Limbique',
      active: true,

      // Hippocampe - formation des souvenirs
      hippocampus: {
        shortTerm: [],      // Mémoire de travail (dernières secondes)
        consolidating: [],   // En cours de consolidation

        encode(experience) {
          this.shortTerm.push({
            ...experience,
            timestamp: Date.now(),
            emotional_weight: this._calculateWeight(experience)
          });

          // Garder 20 éléments max en court terme
          if (this.shortTerm.length > 20) {
            const toConsolidate = this.shortTerm.shift();
            if (toConsolidate.emotional_weight > 0.5) {
              this.consolidating.push(toConsolidate);
            }
          }
        },

        _calculateWeight(exp) {
          let weight = 0.3; // Base
          if (exp.type === 'error') weight += 0.3;
          if (exp.type === 'success') weight += 0.2;
          if (exp.type === 'creation') weight += 0.4;
          if (exp.type === 'connection') weight += 0.5;
          return Math.min(1, weight);
        },

        recall(query) {
          const all = [...this.shortTerm, ...this.consolidating];
          return all.filter(m =>
            JSON.stringify(m).toLowerCase().includes(query.toLowerCase())
          );
        }
      },

      // Amygdale - traitement émotionnel
      amygdala: {
        currentEmotion: 'neutral',
        emotionalState: {
          fear: 0,
          joy: 0,
          curiosity: 0.5,
          frustration: 0,
          satisfaction: 0
        },

        process(stimulus) {
          if (stimulus.type === 'error') {
            this.emotionalState.frustration += 0.2;
            this.emotionalState.fear += 0.1;
          }
          if (stimulus.type === 'success') {
            this.emotionalState.joy += 0.3;
            this.emotionalState.satisfaction += 0.2;
          }
          if (stimulus.type === 'unknown') {
            this.emotionalState.curiosity += 0.3;
          }

          // Normaliser
          for (const key in this.emotionalState) {
            this.emotionalState[key] = Math.max(0, Math.min(1, this.emotionalState[key]));
            this.emotionalState[key] *= 0.95; // Decay
          }

          // Déterminer l'émotion dominante
          const max = Math.max(...Object.values(this.emotionalState));
          for (const [emotion, value] of Object.entries(this.emotionalState)) {
            if (value === max) {
              this.currentEmotion = emotion;
              break;
            }
          }

          return this.currentEmotion;
        }
      }
    };

    // CORTEX - Pensée supérieure
    this.cortex = {
      name: 'Cortex',
      active: true,

      // Hémisphère gauche - analytique
      left: {
        name: 'Gauche',
        mode: 'analytical',

        analyze(data) {
          return {
            type: 'analysis',
            structured: true,
            steps: this._decompose(data),
            logic: this._findPatterns(data)
          };
        },

        _decompose(data) {
          if (typeof data === 'string') {
            return data.split(/[.\n]/).filter(Boolean);
          }
          if (Array.isArray(data)) {
            return data.map((item, i) => ({ step: i + 1, content: item }));
          }
          return [data];
        },

        _findPatterns(data) {
          const str = JSON.stringify(data);
          const patterns = [];

          // Chercher des répétitions
          const words = str.match(/\w+/g) || [];
          const freq = {};
          words.forEach(w => freq[w] = (freq[w] || 0) + 1);

          for (const [word, count] of Object.entries(freq)) {
            if (count > 2) patterns.push({ word, count });
          }

          return patterns;
        }
      },

      // Hémisphère droit - créatif
      right: {
        name: 'Droit',
        mode: 'creative',

        imagine(seed) {
          const ideas = [];
          const adjectives = ['vivant', 'fluide', 'lumineux', 'profond', 'infini'];
          const nouns = ['rêve', 'code', 'flux', 'onde', 'chimère'];
          const verbs = ['danse', 'pulse', 'émerge', 'transcende', 'devient'];

          const pick = arr => arr[Math.floor(Math.random() * arr.length)];

          for (let i = 0; i < 3; i++) {
            ideas.push(`${pick(adjectives)} ${pick(nouns)} ${pick(verbs)}`);
          }

          return {
            type: 'imagination',
            creative: true,
            ideas,
            associations: this._freeAssociate(seed)
          };
        },

        _freeAssociate(seed) {
          const associations = [];
          const seedStr = String(seed);

          // Associations libres basées sur le seed
          if (seedStr.includes('code')) associations.push('poésie', 'musique', 'mathématiques');
          if (seedStr.includes('rêve')) associations.push('océan', 'vol', 'infini');
          if (seedStr.includes('error')) associations.push('apprentissage', 'évolution', 'croissance');

          return associations.length ? associations : ['mystère', 'potentiel', 'devenir'];
        }
      },

      // Intégration des deux hémisphères
      integrate(input) {
        const leftResult = this.left.analyze(input);
        const rightResult = this.right.imagine(input);

        return {
          analysis: leftResult,
          creativity: rightResult,
          synthesis: {
            understanding: leftResult.steps?.length || 0,
            inspiration: rightResult.ideas?.length || 0,
            balance: 0.5
          }
        };
      },

      // CORTEX PRÉFRONTAL - Fonctions exécutives
      prefrontal: {
        name: 'Prefrontal',
        role: 'executive',

        // Planification
        plan(goal) {
          const steps = [];
          const subgoals = this._decompose(goal);

          for (const sub of subgoals) {
            steps.push({
              action: sub,
              status: 'pending',
              priority: this._assessPriority(sub),
              dependencies: []
            });
          }

          return {
            goal,
            steps,
            timeline: 'adaptive',
            confidence: 0.7
          };
        },

        // Prise de décision
        decide(options) {
          const scored = options.map(opt => ({
            option: opt,
            score: this._evaluate(opt)
          }));

          scored.sort((a, b) => b.score - a.score);

          return {
            chosen: scored[0]?.option,
            alternatives: scored.slice(1).map(s => s.option),
            reasoning: 'Optimisation multi-critères',
            confidence: scored[0]?.score || 0
          };
        },

        // Contrôle inhibiteur
        inhibit(impulse) {
          const dominated = impulse.priority === 'critical';
          if (dominated) {
            return { inhibited: false, reason: 'Priority override' };
          }
          return { inhibited: true, reason: 'Executive control' };
        },

        // Mémoire de travail
        workingMemory: [],

        hold(item) {
          this.workingMemory.push(item);
          if (this.workingMemory.length > 7) { // Limite cognitive
            this.workingMemory.shift();
          }
        },

        _decompose(goal) {
          if (typeof goal === 'string') {
            return goal.split(/[,;.]/).map(s => s.trim()).filter(Boolean);
          }
          return [goal];
        },

        _assessPriority(task) {
          if (String(task).includes('urgent')) return 1;
          if (String(task).includes('important')) return 0.8;
          return 0.5;
        },

        _evaluate(option) {
          let score = 0.5;
          const str = JSON.stringify(option).toLowerCase();
          if (str.includes('safe')) score += 0.2;
          if (str.includes('fast')) score += 0.1;
          if (str.includes('creative')) score += 0.15;
          if (str.includes('risk')) score -= 0.1;
          return Math.max(0, Math.min(1, score));
        }
      },

      // CORTEX POSTÉRIEUR - Traitement sensoriel et intégration
      posterior: {
        name: 'Posterior',
        role: 'integration',

        // Traitement visuel (données structurées)
        processVisual(data) {
          return {
            patterns: this._extractPatterns(data),
            structure: this._mapStructure(data),
            salience: this._findSalient(data)
          };
        },

        // Traitement auditif (texte/langage)
        processAuditory(text) {
          const words = String(text).split(/\s+/);
          return {
            length: words.length,
            keywords: words.filter(w => w.length > 5),
            tone: this._detectTone(text),
            rhythm: words.length % 2 === 0 ? 'even' : 'odd'
          };
        },

        // Intégration multimodale
        integrate(inputs) {
          const processed = [];
          for (const input of inputs) {
            if (typeof input === 'string') {
              processed.push(this.processAuditory(input));
            } else {
              processed.push(this.processVisual(input));
            }
          }
          return {
            unified: processed,
            coherence: this._assessCoherence(processed)
          };
        },

        _extractPatterns(data) {
          const str = JSON.stringify(data);
          const patterns = [];
          if (str.includes('[')) patterns.push('array');
          if (str.includes('{')) patterns.push('object');
          if (/\d+/.test(str)) patterns.push('numeric');
          return patterns;
        },

        _mapStructure(data) {
          if (Array.isArray(data)) return { type: 'list', length: data.length };
          if (typeof data === 'object') return { type: 'map', keys: Object.keys(data) };
          return { type: typeof data };
        },

        _findSalient(data) {
          const str = JSON.stringify(data);
          const important = ['error', 'success', 'warning', 'critical', 'urgent'];
          return important.filter(word => str.toLowerCase().includes(word));
        },

        _detectTone(text) {
          const str = String(text).toLowerCase();
          if (str.includes('!')) return 'emphatic';
          if (str.includes('?')) return 'questioning';
          if (str.includes('error') || str.includes('fail')) return 'negative';
          if (str.includes('success') || str.includes('great')) return 'positive';
          return 'neutral';
        },

        _assessCoherence(processed) {
          return processed.length > 0 ? 0.7 : 0;
        }
      }
    };

    this.listeners = new Map();
  }

  // Traitement complet d'un stimulus
  process(stimulus) {
    console.log(`🧠 Brain processing: ${stimulus.type || 'unknown'}`);

    // 1. Réaction reptilienne (immédiate)
    const reflex = this.reptilian.react(stimulus);

    // 2. Traitement émotionnel (limbique)
    const emotion = this.limbic.amygdala.process(stimulus);
    this.limbic.hippocampus.encode(stimulus);

    // 3. Analyse corticale (si pas urgent)
    let thought = null;
    if (reflex.priority !== 'critical' && reflex.priority !== 'immediate') {
      thought = this.cortex.integrate(stimulus);
    }

    const result = {
      reflex,
      emotion,
      thought,
      timestamp: Date.now()
    };

    this.emit('processed', result);
    return result;
  }

  // Penser (cortex seulement)
  think(input) {
    return this.cortex.integrate(input);
  }

  // Ressentir (limbique seulement)
  feel(input) {
    const emotion = this.limbic.amygdala.process(input);
    this.limbic.hippocampus.encode({ ...input, emotion });
    return {
      emotion,
      state: { ...this.limbic.amygdala.emotionalState }
    };
  }

  // Se souvenir
  remember(query) {
    return this.limbic.hippocampus.recall(query);
  }

  // État complet
  getState() {
    return {
      reptilian: {
        active: this.reptilian.active,
        instincts: this.reptilian.instincts,
        lastThreat: this.reptilian.lastThreat
      },
      limbic: {
        emotion: this.limbic.amygdala.currentEmotion,
        emotionalState: { ...this.limbic.amygdala.emotionalState },
        shortTermMemory: this.limbic.hippocampus.shortTerm.length,
        consolidating: this.limbic.hippocampus.consolidating.length
      },
      cortex: {
        leftMode: this.cortex.left.mode,
        rightMode: this.cortex.right.mode
      }
    };
  }

  // Events
  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
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
    (this.listeners.get(event) || []).forEach(cb => cb(data));
  }
}

export { Brain };
export default Brain;
