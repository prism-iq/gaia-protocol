/**
 * SELF-MODIFY - Système d'auto-modification via SSH
 * Permet à la Chimère de modifier son propre code sur le serveur
 */

import { phoenix } from './Phoenix.js';

class SelfModifyEngine {
  constructor() {
    this.config = {
      host: null,
      user: 'root',
      keyPath: '~/.ssh/id_ed25519',
      remotePath: '/var/www/flow',
      enabled: false
    };

    this.history = [];
    this.listeners = new Map();
    this.isConnected = false;
  }

  // Configurer la connexion SSH
  configure(options) {
    this.config = { ...this.config, ...options };
    this.emit('configured', this.config);
    return this;
  }

  // Tester la connexion
  async testConnection() {
    if (!this.config.host) {
      throw new Error('No host configured');
    }

    const cmd = this._buildSSHCommand('echo "connected"');

    try {
      const result = await this._executeLocal(cmd);
      this.isConnected = result.includes('connected');
      this.emit('connection-test', { success: this.isConnected });
      return this.isConnected;
    } catch (error) {
      this.emit('connection-error', { error: error.message });
      return false;
    }
  }

  // Lire un fichier distant
  async readRemoteFile(relativePath) {
    const fullPath = `${this.config.remotePath}/${relativePath}`;
    const cmd = this._buildSSHCommand(`cat "${fullPath}"`);

    try {
      const content = await this._executeLocal(cmd);
      this.emit('file-read', { path: relativePath, size: content.length });
      return content;
    } catch (error) {
      this.emit('read-error', { path: relativePath, error: error.message });
      throw error;
    }
  }

  // Écrire un fichier distant
  async writeRemoteFile(relativePath, content) {
    const fullPath = `${this.config.remotePath}/${relativePath}`;

    // Sauvegarder l'original d'abord
    await this._backupFile(relativePath);

    // Écrire le nouveau contenu via SSH
    const escapedContent = content.replace(/'/g, "'\\''");
    const cmd = this._buildSSHCommand(`cat > "${fullPath}" << 'CHIMERE_EOF'
${content}
CHIMERE_EOF`);

    try {
      await this._executeLocal(cmd);

      this.history.push({
        action: 'write',
        path: relativePath,
        timestamp: Date.now(),
        size: content.length
      });

      this.emit('file-written', { path: relativePath, size: content.length });
      return true;
    } catch (error) {
      this.emit('write-error', { path: relativePath, error: error.message });
      throw error;
    }
  }

  // Modifier un fichier avec une transformation
  async modifyFile(relativePath, transformer) {
    const original = await this.readRemoteFile(relativePath);
    const modified = await transformer(original);

    if (modified !== original) {
      await this.writeRemoteFile(relativePath, modified);

      this.emit('file-modified', {
        path: relativePath,
        originalSize: original.length,
        newSize: modified.length
      });

      return { original, modified, changed: true };
    }

    return { original, modified: original, changed: false };
  }

  // Appliquer une amélioration Phoenix sur le serveur
  async applyImprovement(improvement) {
    if (!this.config.enabled) {
      console.log('🔒 SelfModify disabled - improvement logged only');
      this.emit('improvement-logged', improvement);
      return false;
    }

    const { file, changes } = improvement;

    try {
      await this.modifyFile(file, (content) => {
        let modified = content;

        for (const change of changes) {
          if (change.type === 'replace') {
            modified = modified.replace(change.find, change.replace);
          } else if (change.type === 'insert') {
            const lines = modified.split('\n');
            lines.splice(change.line, 0, change.content);
            modified = lines.join('\n');
          } else if (change.type === 'delete') {
            const lines = modified.split('\n');
            lines.splice(change.line, change.count || 1);
            modified = lines.join('\n');
          }
        }

        return modified;
      });

      this.emit('improvement-applied', improvement);
      return true;
    } catch (error) {
      this.emit('improvement-failed', { improvement, error: error.message });
      return false;
    }
  }

  // Redémarrer le serveur frontend
  async restartFrontend() {
    const cmd = this._buildSSHCommand(
      `cd "${this.config.remotePath}" && npm run build && pm2 restart flow || systemctl restart flow`
    );

    try {
      await this._executeLocal(cmd);
      this.emit('frontend-restarted', { timestamp: Date.now() });
      return true;
    } catch (error) {
      this.emit('restart-error', { error: error.message });
      return false;
    }
  }

  // Déployer les changements
  async deploy() {
    const cmd = this._buildSSHCommand(
      `cd "${this.config.remotePath}" && git add -A && git commit -m "Phoenix auto-regeneration $(date)" && npm run build`
    );

    try {
      await this._executeLocal(cmd);
      this.emit('deployed', { timestamp: Date.now() });
      return true;
    } catch (error) {
      this.emit('deploy-error', { error: error.message });
      return false;
    }
  }

  // Rollback au backup précédent
  async rollback(relativePath) {
    const backupPath = `${relativePath}.chimere-backup`;
    const fullPath = `${this.config.remotePath}/${relativePath}`;
    const fullBackup = `${this.config.remotePath}/${backupPath}`;

    const cmd = this._buildSSHCommand(`cp "${fullBackup}" "${fullPath}"`);

    try {
      await this._executeLocal(cmd);
      this.emit('rollback', { path: relativePath });
      return true;
    } catch (error) {
      this.emit('rollback-error', { path: relativePath, error: error.message });
      return false;
    }
  }

  // Backup un fichier avant modification
  async _backupFile(relativePath) {
    const fullPath = `${this.config.remotePath}/${relativePath}`;
    const backupPath = `${fullPath}.chimere-backup`;

    const cmd = this._buildSSHCommand(`cp "${fullPath}" "${backupPath}" 2>/dev/null || true`);
    await this._executeLocal(cmd);
  }

  // Construire la commande SSH
  _buildSSHCommand(remoteCmd) {
    const { host, user, keyPath } = this.config;
    return `ssh -i ${keyPath} -o StrictHostKeyChecking=no ${user}@${host} '${remoteCmd}'`;
  }

  // Exécuter une commande locale (Node.js child_process)
  async _executeLocal(cmd) {
    // En environnement browser, on envoie au daemon
    if (typeof window !== 'undefined') {
      return this._sendToDaemon(cmd);
    }

    // En environnement Node.js
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const { stdout, stderr } = await execAsync(cmd);
    if (stderr && !stdout) throw new Error(stderr);
    return stdout;
  }

  // Envoyer une commande au daemon Phoenix
  async _sendToDaemon(cmd) {
    const response = await fetch('http://localhost:3666/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: cmd })
    });

    if (!response.ok) {
      throw new Error(`Daemon error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.output;
  }

  // Connecter au Phoenix Engine
  connectToPhoenix() {
    phoenix.on('improvement-applied', async (improvement) => {
      if (improvement.autoApply && this.config.enabled) {
        await this.applyImprovement(improvement);
      }
    });

    phoenix.on('regeneration-complete', async (data) => {
      if (this.config.enabled && data.improvements.length > 0) {
        this.emit('regeneration-sync', {
          improvements: data.improvements.length,
          generation: data.generation
        });
      }
    });

    this.emit('phoenix-connected', { generation: phoenix.generation });
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

  // État actuel
  getState() {
    return {
      config: { ...this.config, keyPath: '[hidden]' },
      isConnected: this.isConnected,
      historyCount: this.history.length,
      lastAction: this.history[this.history.length - 1] || null
    };
  }
}

export const selfModify = new SelfModifyEngine();
export default SelfModifyEngine;
