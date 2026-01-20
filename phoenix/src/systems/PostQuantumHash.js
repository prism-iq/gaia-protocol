/**
 * POST-QUANTUM HASH - Verification de packages
 * SHA-3 (Keccak) + SHAKE256 - resistant aux attaques quantiques
 */

import { createHash, randomBytes } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

class PostQuantumHash {
  constructor() {
    this.algorithm = 'sha3-256';  // NIST post-quantum resistant
    this.manifest = '/root/flow-chat-phoenix/.phoenix-data/package-manifest.json';
    this.signatures = new Map();
  }

  // ═══════════════════════════════════════════
  // HASH POST-QUANTIQUE
  // ═══════════════════════════════════════════

  // SHA3-256 (Keccak) - resistant quantique
  sha3(data) {
    return createHash('sha3-256').update(data).digest('hex');
  }

  // SHA3-512 pour plus de securite
  sha3_512(data) {
    return createHash('sha3-512').update(data).digest('hex');
  }

  // SHAKE256 - extensible output (post-quantique)
  shake256(data, length = 64) {
    return createHash('shake256', { outputLength: length }).update(data).digest('hex');
  }

  // Double hash pour protection supplementaire
  doubleHash(data) {
    const first = this.sha3(data);
    return this.sha3(first + data);
  }

  // Hash avec sel aleatoire
  saltedHash(data, salt = null) {
    const s = salt || randomBytes(32).toString('hex');
    const hash = this.sha3(s + data);
    return { hash, salt: s };
  }

  // ═══════════════════════════════════════════
  // VERIFICATION DE FICHIERS
  // ═══════════════════════════════════════════

  // Hash un fichier
  hashFile(path) {
    try {
      const content = readFileSync(path);
      return {
        sha3_256: this.sha3(content),
        sha3_512: this.sha3_512(content),
        shake256: this.shake256(content, 64),
        size: content.length,
        path
      };
    } catch (e) {
      return { error: e.message, path };
    }
  }

  // Hash un package/dossier
  hashPackage(dir) {
    try {
      const files = execSync(`find "${dir}" -type f 2>/dev/null`, { encoding: 'utf-8' })
        .split('\n')
        .filter(Boolean);

      const hashes = {};
      let combined = '';

      for (const file of files) {
        const h = this.hashFile(file);
        if (!h.error) {
          hashes[file] = h.sha3_256;
          combined += h.sha3_256;
        }
      }

      return {
        success: true,
        dir,
        files: Object.keys(hashes).length,
        hashes,
        packageHash: this.sha3(combined),
        timestamp: Date.now()
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ═══════════════════════════════════════════
  // MANIFEST DE PACKAGES
  // ═══════════════════════════════════════════

  // Charger le manifest
  loadManifest() {
    try {
      if (existsSync(this.manifest)) {
        return JSON.parse(readFileSync(this.manifest, 'utf-8'));
      }
    } catch {}
    return { packages: {}, created: Date.now() };
  }

  // Sauvegarder le manifest
  saveManifest(data) {
    writeFileSync(this.manifest, JSON.stringify(data, null, 2));
  }

  // Enregistrer un package
  registerPackage(name, dir) {
    const pkg = this.hashPackage(dir);
    if (!pkg.success) return pkg;

    const manifest = this.loadManifest();
    manifest.packages[name] = {
      dir,
      hash: pkg.packageHash,
      files: pkg.files,
      hashes: pkg.hashes,
      registered: Date.now()
    };
    manifest.updated = Date.now();

    this.saveManifest(manifest);
    return { success: true, name, hash: pkg.packageHash };
  }

  // Verifier un package
  verifyPackage(name) {
    const manifest = this.loadManifest();
    const registered = manifest.packages[name];

    if (!registered) {
      return { success: false, error: 'Package not registered' };
    }

    const current = this.hashPackage(registered.dir);
    if (!current.success) return current;

    const valid = current.packageHash === registered.hash;

    // Trouver les fichiers modifies
    const modified = [];
    for (const [file, hash] of Object.entries(registered.hashes)) {
      if (current.hashes[file] !== hash) {
        modified.push(file);
      }
    }

    // Fichiers ajoutes/supprimes
    const added = Object.keys(current.hashes).filter(f => !registered.hashes[f]);
    const removed = Object.keys(registered.hashes).filter(f => !current.hashes[f]);

    return {
      success: true,
      valid,
      name,
      expectedHash: registered.hash,
      currentHash: current.packageHash,
      modified,
      added,
      removed,
      verified: Date.now()
    };
  }

  // ═══════════════════════════════════════════
  // DELIVERY SECURISEE
  // ═══════════════════════════════════════════

  // Generer un token de delivery
  generateDeliveryToken(packageName, recipient) {
    const payload = {
      package: packageName,
      recipient,
      timestamp: Date.now(),
      nonce: randomBytes(16).toString('hex')
    };

    const token = this.sha3(JSON.stringify(payload));
    const signature = this.shake256(token + payload.nonce, 128);

    return {
      token,
      signature,
      payload,
      expires: Date.now() + 3600000 // 1h
    };
  }

  // Verifier un token de delivery
  verifyDeliveryToken(token, signature, payload) {
    const expectedToken = this.sha3(JSON.stringify(payload));
    const expectedSig = this.shake256(expectedToken + payload.nonce, 128);

    if (token !== expectedToken) return { valid: false, reason: 'Invalid token' };
    if (signature !== expectedSig) return { valid: false, reason: 'Invalid signature' };
    if (Date.now() > payload.timestamp + 3600000) return { valid: false, reason: 'Expired' };

    return { valid: true };
  }

  // Creer une delivery
  createDelivery(packageName, dir, recipient) {
    // 1. Hash le package
    const pkg = this.hashPackage(dir);
    if (!pkg.success) return pkg;

    // 2. Generer le token
    const delivery = this.generateDeliveryToken(packageName, recipient);

    // 3. Creer le manifest de delivery
    const manifest = {
      id: `delivery-${Date.now()}`,
      package: packageName,
      recipient,
      hash: pkg.packageHash,
      files: pkg.files,
      token: delivery.token,
      signature: delivery.signature,
      created: Date.now(),
      expires: delivery.expires
    };

    return { success: true, delivery: manifest };
  }

  // Verifier une delivery recue
  verifyDelivery(deliveryManifest, receivedDir) {
    // 1. Verifier le token
    const tokenValid = this.verifyDeliveryToken(
      deliveryManifest.token,
      deliveryManifest.signature,
      {
        package: deliveryManifest.package,
        recipient: deliveryManifest.recipient,
        timestamp: deliveryManifest.created,
        nonce: deliveryManifest.token.slice(0, 32) // reconstruit
      }
    );

    // 2. Hash le contenu recu
    const received = this.hashPackage(receivedDir);
    if (!received.success) return received;

    // 3. Comparer
    const hashValid = received.packageHash === deliveryManifest.hash;

    return {
      success: true,
      valid: hashValid,
      tokenValid: tokenValid.valid,
      expectedHash: deliveryManifest.hash,
      receivedHash: received.packageHash,
      verified: Date.now()
    };
  }

  // ═══════════════════════════════════════════
  // UTILS
  // ═══════════════════════════════════════════

  // Liste des packages enregistres
  listPackages() {
    const manifest = this.loadManifest();
    return Object.keys(manifest.packages).map(name => ({
      name,
      hash: manifest.packages[name].hash,
      files: manifest.packages[name].files,
      registered: manifest.packages[name].registered
    }));
  }

  // Info sur un algorithme
  info() {
    return {
      algorithms: {
        'sha3-256': 'Keccak - NIST FIPS 202, resistant quantique',
        'sha3-512': 'Keccak 512-bit, securite maximale',
        'shake256': 'XOF extensible, output variable'
      },
      security: 'Post-quantum resistant (Grover: 2^128 -> 2^64 still secure)',
      usage: 'Package verification, delivery tokens, integrity checks'
    };
  }
}

export const pqHash = new PostQuantumHash();
export default PostQuantumHash;
