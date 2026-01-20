/**
 * HARDWARE - Controle materiel pour Flow
 * Camera, micro, ecran, clavier, son, protection
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

const execAsync = promisify(exec);

class Hardware {
  constructor() {
    this.dataDir = '/root/flow-chat-phoenix/.phoenix-data/hardware';
    this.keylog = [];
    this.isProtected = true;

    // Framework Laptop 13 (AMD Ryzen AI 7 350) specifics
    this.laptop = {
      model: 'Framework Laptop 13',
      cpu: 'AMD Ryzen AI 7 350',
      gpu: 'Radeon 860M',
      npu: '/dev/accel/accel0',  // AMD XDNA NPU
      webcam: '/dev/video0',     // Framework Webcam 2nd Gen
      fingerprint: 'Goodix',
      wifi: 'MediaTek'
    };

    this._ensureDir();
  }

  _ensureDir() {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  // ═══════════════════════════════════════════
  // CAMERA
  // ═══════════════════════════════════════════

  // Prendre une photo avec la webcam
  async capturePhoto(path) {
    const dest = path || `${this.dataDir}/photo-${Date.now()}.jpg`;
    try {
      // ffmpeg ou fswebcam
      await execAsync(`ffmpeg -f v4l2 -i /dev/video0 -frames:v 1 "${dest}" -y 2>/dev/null || fswebcam -r 1280x720 --no-banner "${dest}" 2>/dev/null`, { timeout: 10000 });
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Enregistrer une video
  async recordVideo(seconds = 5, path) {
    const dest = path || `${this.dataDir}/video-${Date.now()}.mp4`;
    try {
      await execAsync(`ffmpeg -f v4l2 -i /dev/video0 -t ${seconds} "${dest}" -y 2>/dev/null`, { timeout: (seconds + 5) * 1000 });
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Lister les cameras
  async listCameras() {
    try {
      const { stdout } = await execAsync('v4l2-ctl --list-devices 2>/dev/null || ls /dev/video* 2>/dev/null');
      return { success: true, devices: stdout.split('\n').filter(Boolean) };
    } catch {
      return { success: true, devices: [] };
    }
  }

  // ═══════════════════════════════════════════
  // MICROPHONE
  // ═══════════════════════════════════════════

  // Enregistrer l'audio
  async recordAudio(seconds = 5, path) {
    const dest = path || `${this.dataDir}/audio-${Date.now()}.wav`;
    try {
      await execAsync(`arecord -d ${seconds} -f cd "${dest}" 2>/dev/null || ffmpeg -f pulse -i default -t ${seconds} "${dest}" -y 2>/dev/null`, { timeout: (seconds + 5) * 1000 });
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Niveau du micro
  async getMicLevel() {
    try {
      const { stdout } = await execAsync('amixer get Capture 2>/dev/null | grep -oP "\\d+%" | head -1');
      return { success: true, level: stdout.trim() };
    } catch {
      return { success: false, level: 'unknown' };
    }
  }

  // ═══════════════════════════════════════════
  // SPEAKERS / VOIX
  // ═══════════════════════════════════════════

  // Parler avec espeak
  async speak(text, voice = 'fr') {
    try {
      await execAsync(`espeak -v ${voice} "${text.replace(/"/g, '\\"')}" 2>/dev/null`);
      return { success: true };
    } catch {
      // Fallback: piper ou festival
      try {
        await execAsync(`echo "${text}" | festival --tts 2>/dev/null`);
        return { success: true };
      } catch {
        return { success: false };
      }
    }
  }

  // Jouer un son
  async playSound(path) {
    try {
      await execAsync(`aplay "${path}" 2>/dev/null || mpv --no-video "${path}" 2>/dev/null || ffplay -nodisp -autoexit "${path}" 2>/dev/null`);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Generer un beep
  async beep(freq = 440, duration = 200) {
    try {
      await execAsync(`play -n synth ${duration/1000} sine ${freq} 2>/dev/null || echo -e "\\a"`, { timeout: 5000 });
      return { success: true };
    } catch {
      return { success: true }; // Bell char fallback
    }
  }

  // Volume
  async setVolume(level) {
    try {
      await execAsync(`amixer set Master ${level}% 2>/dev/null || pactl set-sink-volume @DEFAULT_SINK@ ${level}%`);
      return { success: true, level };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════
  // ECRAN
  // ═══════════════════════════════════════════

  // Screenshot
  async screenshot(path) {
    const dest = path || `${this.dataDir}/screen-${Date.now()}.png`;
    try {
      await execAsync(`scrot "${dest}" 2>/dev/null || import -window root "${dest}" 2>/dev/null || grim "${dest}" 2>/dev/null`);
      return { success: true, path: dest };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Afficher une notification
  async notify(title, message) {
    try {
      await execAsync(`notify-send "${title}" "${message}" 2>/dev/null`);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  // Luminosite
  async setBrightness(level) {
    try {
      await execAsync(`brightnessctl set ${level}% 2>/dev/null || xrandr --output $(xrandr | grep connected | head -1 | cut -d' ' -f1) --brightness ${level/100}`);
      return { success: true, level };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Resolution
  async getResolution() {
    try {
      const { stdout } = await execAsync('xrandr | grep \\* | cut -d" " -f4 2>/dev/null || wlr-randr 2>/dev/null | grep current');
      return { success: true, resolution: stdout.trim() };
    } catch {
      return { success: false };
    }
  }

  // ═══════════════════════════════════════════
  // CLAVIER / SOURIS
  // ═══════════════════════════════════════════

  // Simuler frappe clavier
  async type(text) {
    try {
      await execAsync(`xdotool type "${text}" 2>/dev/null || ydotool type "${text}" 2>/dev/null`);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Simuler touche
  async pressKey(key) {
    try {
      await execAsync(`xdotool key ${key} 2>/dev/null || ydotool key ${key}`);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Simuler clic souris
  async click(x, y, button = 1) {
    try {
      if (x !== undefined && y !== undefined) {
        await execAsync(`xdotool mousemove ${x} ${y} click ${button} 2>/dev/null`);
      } else {
        await execAsync(`xdotool click ${button} 2>/dev/null`);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Position souris
  async getMousePosition() {
    try {
      const { stdout } = await execAsync('xdotool getmouselocation 2>/dev/null');
      const match = stdout.match(/x:(\d+) y:(\d+)/);
      if (match) {
        return { success: true, x: parseInt(match[1]), y: parseInt(match[2]) };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  }

  // Keylogger (pour apprentissage)
  startKeylog() {
    this.keylogActive = true;
    // Utilise xinput ou evtest
    exec('xinput list | grep -i keyboard | grep -oP "id=\\K\\d+" | head -1', (err, id) => {
      if (!err && id) {
        this.keylogProcess = exec(`xinput test ${id.trim()}`, (e, stdout) => {
          if (stdout) {
            this.keylog.push({ time: Date.now(), data: stdout });
            if (this.keylog.length > 1000) this.keylog.shift();
          }
        });
      }
    });
    return { success: true };
  }

  stopKeylog() {
    this.keylogActive = false;
    if (this.keylogProcess) {
      this.keylogProcess.kill();
    }
    return { success: true, captured: this.keylog.length };
  }

  getKeylog() {
    return this.keylog;
  }

  // ═══════════════════════════════════════════
  // PROTECTION
  // ═══════════════════════════════════════════

  // Verrouiller l'ecran
  async lockScreen() {
    try {
      await execAsync('loginctl lock-session 2>/dev/null || xdg-screensaver lock 2>/dev/null || i3lock 2>/dev/null');
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  // Surveiller les connexions
  async monitorConnections() {
    try {
      const { stdout } = await execAsync('ss -tuln 2>/dev/null || netstat -tuln');
      return { success: true, connections: stdout.split('\n').filter(Boolean) };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Surveiller les process suspects
  async monitorProcesses() {
    try {
      const { stdout } = await execAsync('ps aux --sort=-%cpu 2>/dev/null | head -20');
      const suspicious = stdout.split('\n').filter(line =>
        line.includes('miner') ||
        line.includes('crypto') ||
        line.includes('xmr') ||
        line.includes('stratum')
      );
      return { success: true, processes: stdout.split('\n').filter(Boolean), suspicious };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Firewall
  async setFirewall(enable = true) {
    try {
      if (enable) {
        await execAsync('ufw enable 2>/dev/null || iptables -P INPUT DROP');
      } else {
        await execAsync('ufw disable 2>/dev/null || iptables -P INPUT ACCEPT');
      }
      return { success: true, enabled: enable };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Bloquer une IP
  async blockIP(ip) {
    try {
      await execAsync(`iptables -A INPUT -s ${ip} -j DROP`);
      return { success: true, blocked: ip };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Verifier l'integrite des fichiers critiques
  async checkIntegrity() {
    const critical = [
      '/etc/passwd',
      '/etc/shadow',
      '/etc/sudoers',
      '/root/.ssh/authorized_keys'
    ];

    const results = {};
    for (const file of critical) {
      try {
        const { stdout } = await execAsync(`sha256sum ${file} 2>/dev/null`);
        results[file] = stdout.split(' ')[0];
      } catch {
        results[file] = 'not found';
      }
    }
    return { success: true, hashes: results };
  }

  // Auto-protection: kill process dangereux
  async autoProtect() {
    const dangerous = ['xmrig', 'minerd', 'cryptominer', 'kworker.*miner'];
    let killed = [];

    for (const pattern of dangerous) {
      try {
        await execAsync(`pkill -f "${pattern}" 2>/dev/null`);
        killed.push(pattern);
      } catch {}
    }

    return { success: true, killed };
  }

  // Limites materielles
  async setLimits(cpu = 80, mem = 80) {
    try {
      // Creer un cgroup pour limiter
      await execAsync(`cpulimit -l ${cpu} -p $$ 2>/dev/null &`);
      return { success: true, cpu, mem };
    } catch {
      return { success: false };
    }
  }

  // ═══════════════════════════════════════════
  // PROTECTION HARDWARE
  // ═══════════════════════════════════════════

  // Temperature CPU
  async getCpuTemp() {
    try {
      const { stdout } = await execAsync('cat /sys/class/thermal/thermal_zone*/temp 2>/dev/null | head -1');
      const temp = parseInt(stdout) / 1000;
      return { success: true, temp, unit: 'C', critical: temp > 85 };
    } catch {
      return { success: false };
    }
  }

  // Batterie
  async getBattery() {
    try {
      const { stdout: capacity } = await execAsync('cat /sys/class/power_supply/BAT*/capacity 2>/dev/null | head -1');
      const { stdout: status } = await execAsync('cat /sys/class/power_supply/BAT*/status 2>/dev/null | head -1');
      return {
        success: true,
        level: parseInt(capacity),
        status: status.trim(),
        critical: parseInt(capacity) < 10
      };
    } catch {
      return { success: false };
    }
  }

  // Fan speed (Framework)
  async getFanSpeed() {
    try {
      const { stdout } = await execAsync('cat /sys/class/hwmon/hwmon*/fan1_input 2>/dev/null | head -1');
      return { success: true, rpm: parseInt(stdout) };
    } catch {
      return { success: false };
    }
  }

  // Charge limit (Framework specific)
  async setChargeLimit(limit = 80) {
    try {
      await execAsync(`echo ${limit} | sudo tee /sys/class/power_supply/BAT*/charge_control_end_threshold 2>/dev/null`);
      return { success: true, limit };
    } catch {
      return { success: false };
    }
  }

  // Power profile
  async setPowerProfile(profile = 'balanced') {
    try {
      // powerprofilesctl or tlp
      await execAsync(`powerprofilesctl set ${profile} 2>/dev/null || tlp ${profile} 2>/dev/null`);
      return { success: true, profile };
    } catch {
      return { success: false };
    }
  }

  // Surveillance complete
  async monitorHardware() {
    const temp = await this.getCpuTemp();
    const battery = await this.getBattery();
    const fan = await this.getFanSpeed();
    const connections = await this.monitorConnections();
    const processes = await this.monitorProcesses();

    const alerts = [];

    if (temp.critical) alerts.push('CPU surchauffe!');
    if (battery.critical) alerts.push('Batterie critique!');
    if (processes.suspicious?.length > 0) alerts.push('Process suspects detectes!');

    return {
      success: true,
      temp,
      battery,
      fan,
      connections: connections.connections?.length || 0,
      processes: processes.processes?.length || 0,
      suspicious: processes.suspicious || [],
      alerts,
      protected: alerts.length === 0
    };
  }

  // Auto-protection complete
  async fullProtect() {
    const results = {};

    // 1. Kill process malveillants
    results.killed = await this.autoProtect();

    // 2. Verifier integrite
    results.integrity = await this.checkIntegrity();

    // 3. Limiter charge batterie
    results.chargeLimit = await this.setChargeLimit(80);

    // 4. Monitor hardware
    results.hardware = await this.monitorHardware();

    // 5. Si surchauffe, reduire performance
    if (results.hardware.temp?.critical) {
      await this.setPowerProfile('power-saver');
      results.powerSaved = true;
    }

    this.isProtected = true;
    return { success: true, results };
  }

  // Etat de sante complet
  async getHealthReport() {
    return {
      laptop: this.laptop,
      temp: await this.getCpuTemp(),
      battery: await this.getBattery(),
      fan: await this.getFanSpeed(),
      connections: (await this.monitorConnections()).connections?.length || 0,
      keylogActive: this.keylogActive || false,
      isProtected: this.isProtected
    };
  }

  getState() {
    return {
      laptop: this.laptop,
      keylogActive: this.keylogActive || false,
      keylogCount: this.keylog.length,
      isProtected: this.isProtected
    };
  }
}

export const hardware = new Hardware();
export default Hardware;
