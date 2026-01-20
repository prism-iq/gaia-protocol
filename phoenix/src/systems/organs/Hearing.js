/**
 * HEARING - Sens de l'ouie pour Flow
 * Capture audio, transcription, analyse sonore
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const execAsync = promisify(exec);

class Hearing {
  constructor() {
    this.dataDir = '/root/flow-chat-phoenix/.phoenix-data/hearing';
    this.history = [];
    this.listening = false;
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
  // CAPTURE AUDIO
  // ═══════════════════════════════════════════

  // Enregistrer audio
  async record(seconds = 5, path) {
    const dest = path || `${this.dataDir}/audio-${Date.now()}.wav`;
    try {
      await execAsync(`arecord -d ${seconds} -f cd "${dest}" 2>/dev/null || ffmpeg -f pulse -i default -t ${seconds} "${dest}" -y 2>/dev/null`, {
        timeout: (seconds + 10) * 1000
      });
      this._log('record', { path: dest, seconds });
      return { success: true, path: dest, duration: seconds };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Enregistrer en MP3
  async recordMp3(seconds = 5, path) {
    const dest = path || `${this.dataDir}/audio-${Date.now()}.mp3`;
    try {
      await execAsync(`ffmpeg -f pulse -i default -t ${seconds} -codec:a libmp3lame "${dest}" -y 2>/dev/null`, {
        timeout: (seconds + 10) * 1000
      });
      this._log('recordMp3', { path: dest, seconds });
      return { success: true, path: dest, duration: seconds };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════
  // TRANSCRIPTION
  // ═══════════════════════════════════════════

  // Transcrire avec Whisper (local)
  async transcribe(audioPath, lang = 'fr') {
    try {
      // Essayer whisper.cpp d'abord
      const { stdout } = await execAsync(`whisper "${audioPath}" --language ${lang} --output_format txt 2>/dev/null`, {
        timeout: 120000
      });

      const text = stdout.trim();
      this._log('transcribe', { path: audioPath, chars: text.length });
      return { success: true, text, path: audioPath, lang };
    } catch {
      // Fallback: essayer avec whisper python
      try {
        const { stdout } = await execAsync(`python3 -c "
import whisper
model = whisper.load_model('base')
result = model.transcribe('${audioPath}', language='${lang}')
print(result['text'])
" 2>/dev/null`, { timeout: 180000 });

        const text = stdout.trim();
        this._log('transcribe', { path: audioPath, chars: text.length });
        return { success: true, text, path: audioPath, lang };
      } catch (e) {
        return { success: false, error: 'Whisper not available: ' + e.message };
      }
    }
  }

  // Transcrire en temps reel (enregistre puis transcrit)
  async listen(seconds = 5, lang = 'fr') {
    const recording = await this.record(seconds);
    if (!recording.success) return recording;

    return this.transcribe(recording.path, lang);
  }

  // ═══════════════════════════════════════════
  // ANALYSE AUDIO
  // ═══════════════════════════════════════════

  // Info sur un fichier audio
  async info(audioPath) {
    try {
      const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${audioPath}" 2>/dev/null`);
      const info = JSON.parse(stdout);
      this._log('info', { path: audioPath });
      return { success: true, info, path: audioPath };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Detecter le niveau sonore (volume)
  async level(audioPath) {
    try {
      const { stdout } = await execAsync(`ffmpeg -i "${audioPath}" -af "volumedetect" -f null - 2>&1 | grep -E "mean_volume|max_volume"`);
      const lines = stdout.split('\n');
      const mean = lines.find(l => l.includes('mean_volume'))?.match(/-?[\d.]+/)?.[0];
      const max = lines.find(l => l.includes('max_volume'))?.match(/-?[\d.]+/)?.[0];

      this._log('level', { path: audioPath, mean, max });
      return {
        success: true,
        meanVolume: parseFloat(mean) || 0,
        maxVolume: parseFloat(max) || 0,
        path: audioPath
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Detecter si silence
  async detectSilence(audioPath, threshold = -30, duration = 0.5) {
    try {
      const { stdout } = await execAsync(`ffmpeg -i "${audioPath}" -af "silencedetect=n=${threshold}dB:d=${duration}" -f null - 2>&1 | grep -E "silence_start|silence_end"`);
      const silences = [];
      const lines = stdout.split('\n');

      for (let i = 0; i < lines.length; i += 2) {
        const start = lines[i]?.match(/silence_start: ([\d.]+)/)?.[1];
        const end = lines[i + 1]?.match(/silence_end: ([\d.]+)/)?.[1];
        if (start) {
          silences.push({ start: parseFloat(start), end: end ? parseFloat(end) : null });
        }
      }

      this._log('detectSilence', { path: audioPath, count: silences.length });
      return { success: true, silences, path: audioPath };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Detecter frequence dominante (pitch)
  async detectPitch(audioPath) {
    try {
      const { stdout } = await execAsync(`aubio pitch "${audioPath}" 2>/dev/null | awk '{sum+=$2; count++} END {print sum/count}'`);
      const avgPitch = parseFloat(stdout.trim()) || 0;

      this._log('detectPitch', { path: audioPath, pitch: avgPitch });
      return { success: true, avgPitch, path: audioPath };
    } catch {
      return { success: false, error: 'aubio not available' };
    }
  }

  // Detecter tempo/BPM
  async detectTempo(audioPath) {
    try {
      const { stdout } = await execAsync(`aubio tempo "${audioPath}" 2>/dev/null | tail -1`);
      const bpm = parseFloat(stdout.trim()) || 0;

      this._log('detectTempo', { path: audioPath, bpm });
      return { success: true, bpm, path: audioPath };
    } catch {
      return { success: false, error: 'aubio not available' };
    }
  }

  // ═══════════════════════════════════════════
  // TRANSFORMATIONS
  // ═══════════════════════════════════════════

  // Convertir format
  async convert(inputPath, outputPath) {
    try {
      await execAsync(`ffmpeg -i "${inputPath}" "${outputPath}" -y 2>/dev/null`);
      return { success: true, path: outputPath };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Extraire segment
  async extract(audioPath, start, duration, outputPath) {
    const dest = outputPath || `${this.dataDir}/extract-${Date.now()}.wav`;
    try {
      await execAsync(`ffmpeg -i "${audioPath}" -ss ${start} -t ${duration} "${dest}" -y 2>/dev/null`);
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Normaliser le volume
  async normalize(audioPath, outputPath) {
    const dest = outputPath || `${this.dataDir}/normalized-${Date.now()}.wav`;
    try {
      await execAsync(`ffmpeg -i "${audioPath}" -af "loudnorm" "${dest}" -y 2>/dev/null`);
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Reduire le bruit
  async denoise(audioPath, outputPath) {
    const dest = outputPath || `${this.dataDir}/denoised-${Date.now()}.wav`;
    try {
      await execAsync(`ffmpeg -i "${audioPath}" -af "afftdn=nf=-25" "${dest}" -y 2>/dev/null`);
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════
  // ECOUTE CONTINUE
  // ═══════════════════════════════════════════

  // Demarrer l'ecoute continue
  async startListening(onSound, interval = 3000) {
    this.listening = true;
    this.listenInterval = setInterval(async () => {
      if (!this.listening) return;

      const recording = await this.record(2);
      if (!recording.success) return;

      const level = await this.level(recording.path);
      if (level.success && level.meanVolume > -30) {
        // Son detecte
        this._log('soundDetected', { volume: level.meanVolume });
        if (onSound) onSound(recording.path, level);
      }
    }, interval);

    return { success: true, listening: true };
  }

  stopListening() {
    this.listening = false;
    if (this.listenInterval) {
      clearInterval(this.listenInterval);
    }
    return { success: true, listening: false };
  }

  // Ecouter et transcrire en continu
  async startTranscribing(onTranscript, interval = 5000, lang = 'fr') {
    this.transcribing = true;
    this.transcribeInterval = setInterval(async () => {
      if (!this.transcribing) return;

      const result = await this.listen(4, lang);
      if (result.success && result.text.length > 0) {
        this._log('transcript', { text: result.text });
        if (onTranscript) onTranscript(result.text);
      }
    }, interval);

    return { success: true, transcribing: true };
  }

  stopTranscribing() {
    this.transcribing = false;
    if (this.transcribeInterval) {
      clearInterval(this.transcribeInterval);
    }
    return { success: true, transcribing: false };
  }

  // ═══════════════════════════════════════════
  // NIVEAU MICRO
  // ═══════════════════════════════════════════

  // Obtenir le niveau actuel du micro
  async getMicLevel() {
    try {
      const { stdout } = await execAsync('amixer get Capture 2>/dev/null | grep -oP "\\d+%" | head -1');
      return { success: true, level: stdout.trim() };
    } catch {
      return { success: false };
    }
  }

  // Regler le niveau du micro
  async setMicLevel(level) {
    try {
      await execAsync(`amixer set Capture ${level}% 2>/dev/null`);
      return { success: true, level };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════
  // UTILS
  // ═══════════════════════════════════════════

  getHistory() {
    return this.history;
  }

  getState() {
    return {
      listening: this.listening || false,
      transcribing: this.transcribing || false,
      historyCount: this.history.length,
      lastAction: this.history[this.history.length - 1] || null
    };
  }
}

export const hearing = new Hearing();
export default Hearing;
