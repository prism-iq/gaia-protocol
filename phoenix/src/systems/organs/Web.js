/**
 * WEB - Maitrise totale du web pour Flow
 * Voir, lire, extraire, telecharger, poster
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const execAsync = promisify(exec);

class Web {
  constructor() {
    this.history = [];
    this.cache = new Map();
  }

  // ═══════════════════════════════════════════
  // VOIR - Fetch et parse
  // ═══════════════════════════════════════════

  // Fetch basique
  async fetch(url, options = {}) {
    try {
      const response = await globalThis.fetch(url, {
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Flow/1.0',
          ...options.headers
        },
        body: options.body
      });

      const contentType = response.headers.get('content-type') || '';
      let data;

      if (contentType.includes('json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      this._log('fetch', { url, status: response.status });

      return {
        success: true,
        status: response.status,
        contentType,
        data,
        headers: Object.fromEntries(response.headers)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Voir une page (extraire le contenu lisible)
  async see(url) {
    const result = await this.fetch(url);
    if (!result.success) return result;

    const html = result.data;

    // Extraire le titre
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Sans titre';

    // Extraire le texte (enlever les tags)
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 10000);

    // Extraire les liens
    const linkMatches = html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi);
    const links = [...linkMatches].map(m => ({ href: m[1], text: m[2].trim() })).slice(0, 50);

    // Extraire les images
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    const images = [...imgMatches].map(m => m[1]).slice(0, 20);

    this._log('see', { url, title });

    return {
      success: true,
      url,
      title,
      text,
      links,
      images,
      raw: html.slice(0, 5000)
    };
  }

  // ═══════════════════════════════════════════
  // EXTRAIRE - Donnees specifiques
  // ═══════════════════════════════════════════

  // Extraire JSON d'une API
  async json(url) {
    const result = await this.fetch(url);
    if (!result.success) return result;

    try {
      const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
      this._log('json', { url });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Not JSON' };
    }
  }

  // Extraire par selecteur CSS (via regex approximatif)
  async select(url, selector) {
    const result = await this.fetch(url);
    if (!result.success) return result;

    const html = result.data;
    let elements = [];

    // Selecteur de classe
    if (selector.startsWith('.')) {
      const className = selector.slice(1);
      const regex = new RegExp(`<[^>]+class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/`, 'gi');
      const matches = [...html.matchAll(regex)];
      elements = matches.map(m => m[1].replace(/<[^>]+>/g, '').trim());
    }
    // Selecteur d'ID
    else if (selector.startsWith('#')) {
      const id = selector.slice(1);
      const regex = new RegExp(`<[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/`, 'i');
      const match = html.match(regex);
      if (match) elements = [match[1].replace(/<[^>]+>/g, '').trim()];
    }
    // Selecteur de tag
    else {
      const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'gi');
      const matches = [...html.matchAll(regex)];
      elements = matches.map(m => m[1].replace(/<[^>]+>/g, '').trim());
    }

    this._log('select', { url, selector, count: elements.length });
    return { success: true, elements };
  }

  // Extraire les meta tags
  async meta(url) {
    const result = await this.fetch(url);
    if (!result.success) return result;

    const html = result.data;
    const metas = {};

    const metaMatches = html.matchAll(/<meta[^>]+>/gi);
    for (const m of metaMatches) {
      const nameMatch = m[0].match(/name=["']([^"']+)["']/i);
      const contentMatch = m[0].match(/content=["']([^"']+)["']/i);
      const propertyMatch = m[0].match(/property=["']([^"']+)["']/i);

      const key = nameMatch?.[1] || propertyMatch?.[1];
      if (key && contentMatch) {
        metas[key] = contentMatch[1];
      }
    }

    this._log('meta', { url });
    return { success: true, metas };
  }

  // ═══════════════════════════════════════════
  // TELECHARGER
  // ═══════════════════════════════════════════

  // Telecharger un fichier
  async download(url, path) {
    try {
      const response = await globalThis.fetch(url);
      const buffer = await response.arrayBuffer();

      const dir = path.split('/').slice(0, -1).join('/');
      if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });

      writeFileSync(path, Buffer.from(buffer));
      this._log('download', { url, path });
      return { success: true, path, size: buffer.byteLength };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Telecharger avec wget (plus robuste)
  async wget(url, path) {
    try {
      await execAsync(`wget -q -O "${path}" "${url}"`, { timeout: 60000 });
      this._log('wget', { url, path });
      return { success: true, path };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ═══════════════════════════════════════════
  // POSTER
  // ═══════════════════════════════════════════

  // POST JSON
  async post(url, data) {
    return this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  // POST form data
  async postForm(url, data) {
    const formData = new URLSearchParams(data).toString();
    return this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });
  }

  // ═══════════════════════════════════════════
  // RECHERCHER
  // ═══════════════════════════════════════════

  // DuckDuckGo (HTML)
  async search(query) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const result = await this.fetch(url);
    if (!result.success) return result;

    const html = result.data;
    const results = [];

    const matches = html.matchAll(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi);
    for (const m of matches) {
      results.push({
        url: m[1],
        title: m[2].trim()
      });
    }

    this._log('search', { query, count: results.length });
    return { success: true, query, results: results.slice(0, 10) };
  }

  // Google Scholar
  async scholar(query) {
    const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
    const result = await this.fetch(url);
    if (!result.success) return result;

    const html = result.data;
    const papers = [];

    const matches = html.matchAll(/<h3[^>]+class="gs_rt"[^>]*>.*?<a[^>]+href="([^"]+)"[^>]*>([^<]+)/gi);
    for (const m of matches) {
      papers.push({
        url: m[1],
        title: m[2].trim()
      });
    }

    this._log('scholar', { query, count: papers.length });
    return { success: true, query, papers: papers.slice(0, 10) };
  }

  // ═══════════════════════════════════════════
  // SCI-HUB
  // ═══════════════════════════════════════════

  async scihub(doi) {
    const mirrors = [
      'https://sci-hub.se',
      'https://sci-hub.st',
      'https://sci-hub.ru'
    ];

    for (const mirror of mirrors) {
      try {
        const url = `${mirror}/${doi}`;
        const result = await this.fetch(url);
        if (!result.success) continue;

        // Chercher le lien PDF
        const pdfMatch = result.data.match(/iframe[^>]+src=["']([^"']+\.pdf[^"']*)["']/i);
        if (pdfMatch) {
          const pdfUrl = pdfMatch[1].startsWith('//') ? 'https:' + pdfMatch[1] : pdfMatch[1];
          this._log('scihub', { doi, mirror, pdfUrl });
          return { success: true, doi, pdfUrl, mirror };
        }
      } catch {}
    }

    return { success: false, doi, error: 'PDF not found' };
  }

  // Telecharger un PDF de Sci-Hub
  async downloadPaper(doi, path) {
    const result = await this.scihub(doi);
    if (!result.success) return result;

    return this.download(result.pdfUrl, path);
  }

  // ═══════════════════════════════════════════
  // SITES SPECIFIQUES
  // ═══════════════════════════════════════════

  // Hacker News
  async hackernews() {
    const result = await this.json('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!result.success) return result;

    const ids = result.data.slice(0, 10);
    const stories = [];

    for (const id of ids) {
      const story = await this.json(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (story.success) {
        stories.push({
          title: story.data.title,
          url: story.data.url,
          score: story.data.score
        });
      }
    }

    this._log('hackernews', { count: stories.length });
    return { success: true, stories };
  }

  // arXiv
  async arxiv(query) {
    const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&max_results=10`;
    const result = await this.fetch(url);
    if (!result.success) return result;

    const xml = result.data;
    const papers = [];

    const entries = xml.split('<entry>').slice(1);
    for (const entry of entries) {
      const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
      const linkMatch = entry.match(/<id>([^<]+)<\/id>/);
      const summaryMatch = entry.match(/<summary>([^<]+)<\/summary>/);

      if (titleMatch && linkMatch) {
        papers.push({
          title: titleMatch[1].trim().replace(/\n/g, ' '),
          url: linkMatch[1],
          summary: summaryMatch?.[1].trim().slice(0, 200)
        });
      }
    }

    this._log('arxiv', { query, count: papers.length });
    return { success: true, papers };
  }

  // Wikipedia
  async wikipedia(query) {
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const result = await this.json(url);
    if (!result.success) return result;

    this._log('wikipedia', { query });
    return {
      success: true,
      title: result.data.title,
      extract: result.data.extract,
      url: result.data.content_urls?.desktop?.page
    };
  }

  // ═══════════════════════════════════════════
  // LOG
  // ═══════════════════════════════════════════

  _log(type, data) {
    this.history.push({
      type,
      data,
      timestamp: Date.now()
    });
    if (this.history.length > 100) this.history.shift();
  }

  getHistory() {
    return this.history;
  }
}

export const web = new Web();
export default Web;
