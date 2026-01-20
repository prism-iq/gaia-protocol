/**
 * VISION - Sens de la vue pour Flow
 * Capture, analyse, OCR, detection d'objets
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const execAsync = promisify(exec);

class Vision {
  constructor() {
    this.dataDir = '/root/flow-chat-phoenix/.phoenix-data/vision';
    this.history = [];
    this._ensureDir();
  }

  _ensureDir() {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  _log(action, data) {
    this.history.push({ action, data, ts: Date.now() });
    if (this.history.length > 100) this.history.shift();
  }

  // ═══════════════════════════════════════════
  // CAPTURE
  // ═══════════════════════════════════════════

  // Prendre une photo webcam
  async photo(path) {
    const dest = path || `${this.dataDir}/photo-${Date.now()}.jpg`;
    try {
      await execAsync(`ffmpeg -f v4l2 -i /dev/video0 -frames:v 1 "${dest}" -y 2>/dev/null || fswebcam -r 1920x1080 --no-banner "${dest}" 2>/dev/null`);
      this._log('photo', { path: dest });
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Screenshot ecran
  async screenshot(path) {
    const dest = path || `${this.dataDir}/screen-${Date.now()}.png`;
    try {
      await execAsync(`scrot "${dest}" 2>/dev/null || grim "${dest}" 2>/dev/null || import -window root "${dest}" 2>/dev/null`);
      this._log('screenshot', { path: dest });
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Screenshot d'une fenetre specifique
  async screenshotWindow(windowId, path) {
    const dest = path || `${this.dataDir}/window-${Date.now()}.png`;
    try {
      await execAsync(`import -window ${windowId} "${dest}" 2>/dev/null`);
      this._log('screenshotWindow', { windowId, path: dest });
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Capturer une region
  async screenshotRegion(x, y, w, h, path) {
    const dest = path || `${this.dataDir}/region-${Date.now()}.png`;
    try {
      await execAsync(`scrot -a ${x},${y},${w},${h} "${dest}" 2>/dev/null || grim -g "${x},${y} ${w}x${h}" "${dest}" 2>/dev/null`);
      this._log('screenshotRegion', { x, y, w, h, path: dest });
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════
  // OCR - Lire le texte dans les images
  // ═══════════════════════════════════════════

  // OCR avec tesseract
  async ocr(imagePath, lang = 'fra+eng') {
    try {
      const outputBase = `${this.dataDir}/ocr-${Date.now()}`;
      await execAsync(`tesseract "${imagePath}" "${outputBase}" -l ${lang} 2>/dev/null`);
      const text = readFileSync(`${outputBase}.txt`, 'utf-8');
      this._log('ocr', { path: imagePath, chars: text.length });
      return { success: true, text: text.trim(), path: imagePath };
    } catch (e) {
      // Fallback: essayer avec ImageMagick convert + tesseract
      try {
        const converted = `${this.dataDir}/converted-${Date.now()}.png`;
        await execAsync(`convert "${imagePath}" -colorspace Gray -threshold 50% "${converted}"`);
        const outputBase = `${this.dataDir}/ocr-${Date.now()}`;
        await execAsync(`tesseract "${converted}" "${outputBase}" -l ${lang} 2>/dev/null`);
        const text = readFileSync(`${outputBase}.txt`, 'utf-8');
        return { success: true, text: text.trim(), path: imagePath };
      } catch {
        return { success: false, error: e.message };
      }
    }
  }

  // OCR sur l'ecran actuel
  async ocrScreen() {
    const screen = await this.screenshot();
    if (!screen.success) return screen;
    return this.ocr(screen.path);
  }

  // OCR sur une region
  async ocrRegion(x, y, w, h) {
    const region = await this.screenshotRegion(x, y, w, h);
    if (!region.success) return region;
    return this.ocr(region.path);
  }

  // ═══════════════════════════════════════════
  // ANALYSE D'IMAGE
  // ═══════════════════════════════════════════

  // Info basique sur une image
  async info(imagePath) {
    try {
      const { stdout } = await execAsync(`identify -verbose "${imagePath}" 2>/dev/null | head -30`);
      const lines = stdout.split('\n');
      const info = {};

      for (const line of lines) {
        if (line.includes('Geometry:')) info.geometry = line.split(':')[1]?.trim();
        if (line.includes('Format:')) info.format = line.split(':')[1]?.trim();
        if (line.includes('Filesize:')) info.size = line.split(':')[1]?.trim();
        if (line.includes('Colorspace:')) info.colorspace = line.split(':')[1]?.trim();
      }

      this._log('info', { path: imagePath });
      return { success: true, info, path: imagePath };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Detecter les couleurs dominantes
  async colors(imagePath, count = 5) {
    try {
      const { stdout } = await execAsync(`convert "${imagePath}" -colors ${count} -unique-colors txt:- 2>/dev/null | tail -n +2`);
      const colors = stdout.split('\n')
        .filter(Boolean)
        .map(line => {
          const match = line.match(/#[0-9A-Fa-f]{6}/);
          return match ? match[0] : null;
        })
        .filter(Boolean);

      this._log('colors', { path: imagePath, count: colors.length });
      return { success: true, colors, path: imagePath };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Detecter les contours/edges
  async edges(imagePath, outputPath) {
    const dest = outputPath || `${this.dataDir}/edges-${Date.now()}.png`;
    try {
      await execAsync(`convert "${imagePath}" -edge 1 "${dest}"`);
      this._log('edges', { input: imagePath, output: dest });
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Detecter les visages (avec OpenCV si dispo)
  async detectFaces(imagePath) {
    try {
      // Essayer avec opencv_cascade
      const { stdout } = await execAsync(`python3 -c "
import cv2
import sys
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
img = cv2.imread('${imagePath}')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
faces = face_cascade.detectMultiScale(gray, 1.1, 4)
print(len(faces))
for (x, y, w, h) in faces:
    print(f'{x},{y},{w},{h}')
" 2>/dev/null`);

      const lines = stdout.trim().split('\n');
      const count = parseInt(lines[0]) || 0;
      const faces = lines.slice(1).map(line => {
        const [x, y, w, h] = line.split(',').map(Number);
        return { x, y, width: w, height: h };
      });

      this._log('detectFaces', { path: imagePath, count });
      return { success: true, count, faces, path: imagePath };
    } catch {
      return { success: false, error: 'OpenCV not available', faces: [] };
    }
  }

  // Comparer deux images (similarite)
  async compare(image1, image2) {
    try {
      const { stdout } = await execAsync(`compare -metric RMSE "${image1}" "${image2}" null: 2>&1 | grep -oP '^[0-9.]+'`);
      const diff = parseFloat(stdout);
      const similarity = Math.max(0, 100 - diff);

      this._log('compare', { image1, image2, similarity });
      return { success: true, similarity, diff, image1, image2 };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════
  // TRANSFORMATIONS
  // ═══════════════════════════════════════════

  // Redimensionner
  async resize(imagePath, width, height, outputPath) {
    const dest = outputPath || `${this.dataDir}/resized-${Date.now()}.png`;
    try {
      await execAsync(`convert "${imagePath}" -resize ${width}x${height} "${dest}"`);
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Convertir format
  async convert(imagePath, outputPath) {
    try {
      await execAsync(`convert "${imagePath}" "${outputPath}"`);
      return { success: true, path: outputPath };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Appliquer un filtre
  async filter(imagePath, filterName, outputPath) {
    const dest = outputPath || `${this.dataDir}/filtered-${Date.now()}.png`;
    const filters = {
      blur: '-blur 0x3',
      sharpen: '-sharpen 0x1',
      grayscale: '-colorspace Gray',
      sepia: '-sepia-tone 80%',
      negative: '-negate',
      emboss: '-emboss 1',
      charcoal: '-charcoal 2'
    };

    const f = filters[filterName] || filters.blur;
    try {
      await execAsync(`convert "${imagePath}" ${f} "${dest}"`);
      return { success: true, path: dest, filter: filterName };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════
  // SURVEILLANCE
  // ═══════════════════════════════════════════

  // Detecter mouvement entre deux frames
  async detectMotion(frame1, frame2, threshold = 5) {
    try {
      const result = await this.compare(frame1, frame2);
      if (!result.success) return result;

      const motionDetected = result.diff > threshold;
      return {
        success: true,
        motion: motionDetected,
        diff: result.diff,
        threshold
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Surveiller en continu (prend des photos et detecte mouvement)
  async watchStart(interval = 5000) {
    this.watching = true;
    this.watchInterval = setInterval(async () => {
      if (!this.watching) return;

      const photo = await this.photo();
      if (photo.success && this.lastFrame) {
        const motion = await this.detectMotion(this.lastFrame, photo.path);
        if (motion.motion) {
          this._log('motion', { frame: photo.path, diff: motion.diff });
        }
      }
      this.lastFrame = photo.path;
    }, interval);

    return { success: true, watching: true, interval };
  }

  watchStop() {
    this.watching = false;
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
    }
    return { success: true, watching: false };
  }

  // ═══════════════════════════════════════════
  // UTILS
  // ═══════════════════════════════════════════

  getHistory() {
    return this.history;
  }

  getState() {
    return {
      watching: this.watching || false,
      historyCount: this.history.length,
      lastAction: this.history[this.history.length - 1] || null
    };
  }
}

export const vision = new Vision();
export default Vision;
