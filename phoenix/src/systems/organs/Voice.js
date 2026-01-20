/**
 * VOICE - Tous les moyens d'expression de Flow
 * Parler, ecrire, generer, dessiner, sonner
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const execAsync = promisify(exec);

class Voice {
  constructor() {
    this.expressions = [];
  }

  // ═══════════════════════════════════════════
  // PARLER
  // ═══════════════════════════════════════════

  // Text-to-speech avec espeak
  async speak(text) {
    try {
      await execAsync(`espeak -v fr "${text.replace(/"/g, '\\"')}" 2>/dev/null || echo "${text}"`);
      this._log('speak', text);
      return { success: true };
    } catch {
      // Fallback: juste afficher
      console.log(`🗣️ ${text}`);
      return { success: true, fallback: true };
    }
  }

  // Notification systeme
  async notify(title, message) {
    try {
      await execAsync(`notify-send "${title}" "${message}" 2>/dev/null`);
      this._log('notify', { title, message });
      return { success: true };
    } catch {
      console.log(`📢 ${title}: ${message}`);
      return { success: true, fallback: true };
    }
  }

  // ═══════════════════════════════════════════
  // ECRIRE
  // ═══════════════════════════════════════════

  // Console coloree
  print(text, color = 'white') {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m',
      white: '\x1b[37m'
    };
    console.log(`${colors[color] || ''}${text}\x1b[0m`);
    this._log('print', text);
  }

  // Ecrire dans un fichier
  writeFile(path, content) {
    try {
      const dir = path.split('/').slice(0, -1).join('/');
      if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(path, content);
      this._log('file', path);
      return { success: true, path };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ═══════════════════════════════════════════
  // GENERER
  // ═══════════════════════════════════════════

  // Generer du HTML
  html(options = {}) {
    const {
      title = 'Flow Expression',
      body = '',
      style = '',
      script = ''
    } = options;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0a0a0a; color: #fff; font-family: monospace; }
${style}
</style>
</head>
<body>
${body}
<script>${script}</script>
</body>
</html>`;
  }

  // Generer du SVG
  svg(options = {}) {
    const {
      width = 400,
      height = 400,
      elements = []
    } = options;

    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  ${elements.join('\n  ')}
</svg>`;
  }

  // Art ASCII
  ascii(text) {
    const chars = text.split('');
    const art = chars.map(c => {
      const code = c.charCodeAt(0);
      return '█'.repeat(code % 5 + 1);
    }).join(' ');
    return art;
  }

  // Generer de la musique (format ABC)
  music(options = {}) {
    const {
      tempo = 120,
      notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    } = options;

    const melody = Array.from({ length: 16 }, () =>
      notes[Math.floor(Math.random() * notes.length)]
    ).join(' ');

    return `X:1
T:Flow Melody
M:4/4
L:1/4
Q:1/4=${tempo}
K:C
${melody}`;
  }

  // ═══════════════════════════════════════════
  // DESSINER
  // ═══════════════════════════════════════════

  // Cercle SVG
  circle(cx, cy, r, fill = '#0ff') {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
  }

  // Rectangle SVG
  rect(x, y, w, h, fill = '#f0f') {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
  }

  // Ligne SVG
  line(x1, y1, x2, y2, stroke = '#ff0') {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2"/>`;
  }

  // Texte SVG
  text(x, y, content, fill = '#fff') {
    return `<text x="${x}" y="${y}" fill="${fill}" font-family="monospace">${content}</text>`;
  }

  // ═══════════════════════════════════════════
  // SONNER
  // ═══════════════════════════════════════════

  // Beep systeme
  async beep(freq = 440, duration = 200) {
    try {
      await execAsync(`play -n synth ${duration/1000} sine ${freq} 2>/dev/null || echo -e "\\a"`);
      return { success: true };
    } catch {
      process.stdout.write('\x07'); // Bell character
      return { success: true, fallback: true };
    }
  }

  // Sequence de beeps
  async melody(notes) {
    for (const [freq, dur] of notes) {
      await this.beep(freq, dur);
      await new Promise(r => setTimeout(r, 50));
    }
  }

  // ═══════════════════════════════════════════
  // WEB
  // ═══════════════════════════════════════════

  // Poster sur le web (webhook)
  async post(url, data) {
    try {
      const response = await globalThis.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      this._log('post', { url, status: response.status });
      return { success: true, status: response.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // IRC (via netcat)
  async irc(server, channel, message) {
    try {
      const cmd = `echo -e "NICK flow\\nUSER flow 0 * :Flow\\nJOIN ${channel}\\nPRIVMSG ${channel} :${message}\\nQUIT" | nc ${server} 6667`;
      await execAsync(cmd, { timeout: 10000 });
      this._log('irc', { server, channel, message });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ═══════════════════════════════════════════
  // LOG
  // ═══════════════════════════════════════════

  _log(type, data) {
    this.expressions.push({
      type,
      data,
      timestamp: Date.now()
    });
    // Garder 100 derniers
    if (this.expressions.length > 100) {
      this.expressions.shift();
    }
  }

  getExpressions() {
    return this.expressions;
  }
}

export const voice = new Voice();
export default Voice;
