/**
 * MEMORY - Memoire persistante pour Flow
 * Souvenirs, associations, apprentissage
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

class Memory {
  constructor() {
    this.dataDir = '/root/flow-chat-phoenix/.phoenix-data/memory';
    this.indexFile = join(this.dataDir, 'index.json');
    this.index = {};
    this._ensureDir();
    this._loadIndex();
  }

  _ensureDir() {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  _loadIndex() {
    try {
      if (existsSync(this.indexFile)) {
        this.index = JSON.parse(readFileSync(this.indexFile, 'utf-8'));
      }
    } catch {}
  }

  _saveIndex() {
    writeFileSync(this.indexFile, JSON.stringify(this.index, null, 2));
  }

  _hash(str) {
    return createHash('sha256').update(str).digest('hex').slice(0, 16);
  }

  // ═══════════════════════════════════════════
  // SOUVENIRS
  // ═══════════════════════════════════════════

  // Sauvegarder un souvenir
  save(key, data, tags = []) {
    const id = this._hash(key);
    const memory = {
      id,
      key,
      data,
      tags,
      created: Date.now(),
      accessed: Date.now(),
      accessCount: 0
    };

    // Sauvegarder le fichier
    writeFileSync(join(this.dataDir, `${id}.json`), JSON.stringify(memory, null, 2));

    // Mettre a jour l'index
    this.index[key] = {
      id,
      tags,
      created: memory.created,
      preview: typeof data === 'string' ? data.slice(0, 100) : JSON.stringify(data).slice(0, 100)
    };
    this._saveIndex();

    return { success: true, id, key };
  }

  // Rappeler un souvenir
  recall(key) {
    const entry = this.index[key];
    if (!entry) {
      return { success: false, error: 'Memory not found' };
    }

    try {
      const memory = JSON.parse(readFileSync(join(this.dataDir, `${entry.id}.json`), 'utf-8'));
      memory.accessed = Date.now();
      memory.accessCount++;

      // Sauvegarder l'acces
      writeFileSync(join(this.dataDir, `${entry.id}.json`), JSON.stringify(memory, null, 2));

      return { success: true, key, data: memory.data, created: memory.created, accessCount: memory.accessCount };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Oublier un souvenir
  forget(key) {
    const entry = this.index[key];
    if (!entry) {
      return { success: false, error: 'Memory not found' };
    }

    try {
      const path = join(this.dataDir, `${entry.id}.json`);
      if (existsSync(path)) {
        require('fs').unlinkSync(path);
      }
      delete this.index[key];
      this._saveIndex();
      return { success: true, key };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════
  // RECHERCHE
  // ═══════════════════════════════════════════

  // Chercher par mot-cle
  search(query) {
    const results = [];
    const q = query.toLowerCase();

    for (const [key, entry] of Object.entries(this.index)) {
      if (key.toLowerCase().includes(q) || entry.preview.toLowerCase().includes(q)) {
        results.push({ key, ...entry });
      }
    }

    return { success: true, query, results, count: results.length };
  }

  // Chercher par tag
  searchByTag(tag) {
    const results = [];

    for (const [key, entry] of Object.entries(this.index)) {
      if (entry.tags && entry.tags.includes(tag)) {
        results.push({ key, ...entry });
      }
    }

    return { success: true, tag, results, count: results.length };
  }

  // Lister tous les souvenirs
  list(limit = 50) {
    const all = Object.entries(this.index)
      .map(([key, entry]) => ({ key, ...entry }))
      .sort((a, b) => b.created - a.created)
      .slice(0, limit);

    return { success: true, memories: all, total: Object.keys(this.index).length };
  }

  // ═══════════════════════════════════════════
  // ASSOCIATIONS
  // ═══════════════════════════════════════════

  // Creer une association entre souvenirs
  associate(key1, key2, relation = 'related') {
    const associations = this.recall('__associations__');
    const data = associations.success ? associations.data : {};

    if (!data[key1]) data[key1] = [];
    if (!data[key2]) data[key2] = [];

    data[key1].push({ to: key2, relation, ts: Date.now() });
    data[key2].push({ to: key1, relation, ts: Date.now() });

    this.save('__associations__', data, ['system']);
    return { success: true, key1, key2, relation };
  }

  // Obtenir les associations
  getAssociations(key) {
    const associations = this.recall('__associations__');
    if (!associations.success) return { success: true, associations: [] };

    return {
      success: true,
      key,
      associations: associations.data[key] || []
    };
  }

  // ═══════════════════════════════════════════
  // CONTEXTE
  // ═══════════════════════════════════════════

  // Sauvegarder le contexte actuel
  saveContext(name, context) {
    return this.save(`context:${name}`, context, ['context']);
  }

  // Charger un contexte
  loadContext(name) {
    return this.recall(`context:${name}`);
  }

  // ═══════════════════════════════════════════
  // JOURNAL
  // ═══════════════════════════════════════════

  // Ajouter une entree au journal
  log(entry, category = 'general') {
    const today = new Date().toISOString().split('T')[0];
    const key = `journal:${today}`;

    const journal = this.recall(key);
    const entries = journal.success ? journal.data : [];

    entries.push({
      entry,
      category,
      ts: Date.now()
    });

    return this.save(key, entries, ['journal', category]);
  }

  // Lire le journal d'un jour
  readJournal(date) {
    const key = `journal:${date || new Date().toISOString().split('T')[0]}`;
    return this.recall(key);
  }

  // ═══════════════════════════════════════════
  // APPRENTISSAGE
  // ═══════════════════════════════════════════

  // Apprendre un fait
  learn(fact, source = 'unknown') {
    const key = `fact:${this._hash(fact)}`;
    return this.save(key, {
      fact,
      source,
      learnedAt: Date.now()
    }, ['fact', 'learning']);
  }

  // Lister les faits appris
  getFacts(limit = 20) {
    return this.searchByTag('fact');
  }

  // Apprendre une association mot -> definition
  defineWord(word, definition) {
    return this.save(`word:${word.toLowerCase()}`, {
      word,
      definition,
      learnedAt: Date.now()
    }, ['vocabulary', 'word']);
  }

  // Chercher un mot
  lookupWord(word) {
    return this.recall(`word:${word.toLowerCase()}`);
  }

  // ═══════════════════════════════════════════
  // PATTERNS
  // ═══════════════════════════════════════════

  // Enregistrer un pattern reconnu
  recordPattern(pattern, context) {
    const key = `pattern:${this._hash(pattern)}`;
    const existing = this.recall(key);

    if (existing.success) {
      existing.data.occurrences++;
      existing.data.contexts.push({ context, ts: Date.now() });
      return this.save(key, existing.data, ['pattern']);
    }

    return this.save(key, {
      pattern,
      occurrences: 1,
      contexts: [{ context, ts: Date.now() }],
      firstSeen: Date.now()
    }, ['pattern']);
  }

  // Obtenir les patterns frequents
  getFrequentPatterns(minOccurrences = 2) {
    const patterns = this.searchByTag('pattern');
    if (!patterns.success) return patterns;

    const frequent = [];
    for (const p of patterns.results) {
      const mem = this.recall(p.key);
      if (mem.success && mem.data.occurrences >= minOccurrences) {
        frequent.push({
          pattern: mem.data.pattern,
          occurrences: mem.data.occurrences
        });
      }
    }

    return { success: true, patterns: frequent.sort((a, b) => b.occurrences - a.occurrences) };
  }

  // ═══════════════════════════════════════════
  // STATS
  // ═══════════════════════════════════════════

  getStats() {
    const tags = {};
    let oldest = Date.now();
    let newest = 0;

    for (const entry of Object.values(this.index)) {
      for (const tag of (entry.tags || [])) {
        tags[tag] = (tags[tag] || 0) + 1;
      }
      if (entry.created < oldest) oldest = entry.created;
      if (entry.created > newest) newest = entry.created;
    }

    return {
      total: Object.keys(this.index).length,
      tags,
      oldest: new Date(oldest).toISOString(),
      newest: new Date(newest).toISOString()
    };
  }

  // ═══════════════════════════════════════════
  // EXPORT / IMPORT
  // ═══════════════════════════════════════════

  // Exporter toute la memoire
  export() {
    const all = {};
    for (const [key, entry] of Object.entries(this.index)) {
      const mem = this.recall(key);
      if (mem.success) {
        all[key] = mem.data;
      }
    }
    return { success: true, data: all, exported: Date.now() };
  }

  // Importer des souvenirs
  import(data, overwrite = false) {
    let imported = 0;
    for (const [key, value] of Object.entries(data)) {
      if (!overwrite && this.index[key]) continue;
      this.save(key, value);
      imported++;
    }
    return { success: true, imported };
  }
}

export const memory = new Memory();
export default Memory;
