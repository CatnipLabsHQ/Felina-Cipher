/**
 * FelianCrypto V9
 *
 * BUGFIX V9: decryptClassic komplett neu geschrieben.
 *  - V7/V8 crash-ten beim Entschlüsseln (TypeError: expectedTag.join is not a function)
 *  - Alle Nachrichten im V7-Format (⟑ + Prüfsumme) bleiben lesbar
 *
 * Format Classic: [4 Nonce-Symbole][Payload][⟑][2 Tag-Symbole]
 */

class FelianCrypto {

    constructor() {
        this.chars = FELIAN_CHARSET;
        this.symbols = FELIAN_SYMBOLS;
        this.symbolToChar = FELIAN_SYMBOL_TO_CHAR;
        this.n = this.chars.length;
        this.NONCE_LEN = 4;
        this.SECURE_PREFIX = FELIAN_SECURE_PREFIX;
        this.TAG_MARK = FELIAN_TAG_MARK;
        this.PBKDF2_ITERATIONS = 150000; // bleibt 150k — Änderung würde alte Secure-Nachrichten brechen
    }

    // === MODUS-ERKENNUNG ===

    isSecureMessage(text) {
        return typeof text === 'string' && text.startsWith(this.SECURE_PREFIX);
    }

    detectMode(text) {
        if (!text || text.trim().length === 0) return null;
        if (this.isSecureMessage(text)) return 'decrypt';

        let felian = 0, total = 0;
        for (const char of text) {
            if (char.trim() === '') continue;
            total++;
            if (FELIAN_CHARS.has(char)) felian++;
        }
        if (total === 0) return null;
        return (felian / total) > 0.6 ? 'decrypt' : 'encrypt';
    }

    secureAvailable() {
        return !!(window.crypto && window.crypto.subtle);
    }

    // === HASH & PRNG ===

    _xmur3(str) {
        let h = 1779033703 ^ str.length;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        return function () {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            return (h ^= h >>> 16) >>> 0;
        };
    }

    _mulberry32(a) {
        return function () {
            a |= 0; a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0);
        };
    }

    _makeRng(key, nonce) {
        const seedFn = this._xmur3(key + '§' + nonce);
        return this._mulberry32(seedFn());
    }

    _randomNonce() {
        let nonce = '';
        for (let i = 0; i < this.NONCE_LEN; i++) {
            nonce += this.chars[Math.floor(Math.random() * this.n)];
        }
        return nonce;
    }

    _computeTag(payload, key, nonce) {
        const seedFn = this._xmur3(key + '§TAG§' + nonce);
        const rng = this._mulberry32(seedFn());
        let acc = 0;
        for (const ch of payload) {
            const si = this.symbols.indexOf(ch);
            if (si === -1) continue;
            acc = (acc * 31 + si + Math.floor(rng() * 251)) % (66 * 66);
        }
        return this.symbols[Math.floor(acc / 66)] + this.symbols[acc % 66];
    }

    // === CLASSIC ===

    encryptClassic(text, key) {
        if (!key || key.trim().length === 0) throw new Error('Schlüssel erforderlich!');

        const nonce = this._randomNonce();
        const rng = this._makeRng(key, nonce);

        let payload = '';
        for (const ch of nonce) {
            payload += this.symbols[this.chars.indexOf(ch)];
        }

        for (const char of text) {
            const lower = char.toLowerCase();
            const ci = this.chars.indexOf(lower);

            if (ci !== -1) {
                payload += this.symbols[(ci + rng()) % this.n];
            }
            else if (char === ' ') {
                payload += FELIAN_SPACE;
            }
            else if (char === '\n' || char === '\t') {
                payload += char;
            }
            else {
                payload += char;
            }
        }

        const tag = this._computeTag(payload, key, nonce);
        return payload + this.TAG_MARK + tag;
    }

    // V9 NEU GESCHRIEBEN — V7/V8 hatten hier den Crash-Bug
    decryptClassic(ciphertext, key) {
        if (!key || key.trim().length === 0) throw new Error('Schlüssel erforderlich!');

        const chars = [...ciphertext];
        if (chars.length < this.NONCE_LEN) throw new Error('Zu kurz — keine vollständige Nonce.');

        // 1. Nonce aus den ersten 4 Symbolen
        let nonce = '';
        for (let i = 0; i < this.NONCE_LEN; i++) {
            const c = this.symbolToChar[chars[i]];
            if (c === undefined) throw new Error('Ungültige Nonce — ist das Felianisch V5+?');
            nonce += c;
        }

        // 2. Tag-Marker suchen (⟑)
        const markIdx = chars.indexOf(this.TAG_MARK, this.NONCE_LEN);
        let payloadEnd = chars.length;   // Ende der verschlüsselten Nutzlast
        let expectedTag = null;          // null = alte V5/V6-Nachricht ohne Tag

        if (markIdx !== -1) {
            // Tag = genau 2 Symbole nach dem Marker
            if (chars.length < markIdx + 3) {
                throw new Error('Beschädigte Nachricht — Prüfsumme unvollständig.');
            }
            expectedTag = chars[markIdx + 1] + chars[markIdx + 2]; // ← FIX: kein .join auf String
            payloadEnd = markIdx;
        }

        // 3. Prüfsumme verifizieren (falls vorhanden)
        if (expectedTag !== null) {
            const payload = chars.slice(0, payloadEnd).join('');
            const actualTag = this._computeTag(payload, key, nonce);
            if (actualTag !== expectedTag) {
                throw new Error('Falscher Schlüssel — Prüfsumme stimmt nicht überein. 🔑');
            }
        }

        // 4. Nutzlast entschlüsseln (nur bis payloadEnd, Tag wird übersprungen)
        const rng = this._makeRng(key, nonce);
        let result = '';

        for (let i = this.NONCE_LEN; i < payloadEnd; i++) {
            const char = chars[i];
            if (char === FELIAN_SPACE) {
                result += ' ';
            }
            else if (char === '\n' || char === '\t') {
                result += char;
            }
            else if (this.symbols.includes(char)) {
                const si = this.symbols.indexOf(char);
                result += this.chars[((si - rng()) % this.n + this.n) % this.n];
            }
            else {
                result += char;
            }
        }
        return result;
    }

    // === SECURE: Base-66 ===

    _bytesToSymbols(bytes) {
        let s = '';
        for (const b of bytes) {
            s += this.symbols[Math.floor(b / FELIAN_BASE)];
            s += this.symbols[b % FELIAN_BASE];
        }
        return s;
    }

    _symbolsToBytes(str) {
        if (str.length % 2 !== 0) throw new Error('Ungültige Symbolfolge.');
        const out = new Uint8Array(str.length / 2);
        for (let i = 0; i < str.length; i += 2) {
            const hi = this.symbols.indexOf(str[i]);
            const lo = this.symbols.indexOf(str[i + 1]);
            if (hi === -1 || lo === -1) throw new Error('Ungültige Symbole in Secure-Nachricht.');
            const b = hi * FELIAN_BASE + lo;
            if (b > 255) throw new Error('Symbolfolge beschädigt.');
            out[i / 2] = b;
        }
        return out;
    }

    // === SECURE: AES-256-GCM ===

    async _deriveKey(password, salt) {
        const baseKey = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: this.PBKDF2_ITERATIONS, hash: 'SHA-256' },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async encryptSecure(text, password) {
        if (!this.secureAvailable()) throw new Error('Secure-Modus benötigt HTTPS oder localhost.');
        if (!password || password.trim().length === 0) throw new Error('Schlüssel erforderlich!');

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await this._deriveKey(password, salt);

        const ct = new Uint8Array(
            await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv }, key, new TextEncoder().encode(text)
            )
        );

        const bytes = new Uint8Array(16 + 12 + ct.length);
        bytes.set(salt, 0);
        bytes.set(iv, 16);
        bytes.set(ct, 28);

        return this.SECURE_PREFIX + this._bytesToSymbols(bytes);
    }

    async decryptSecure(message, password) {
        if (!this.secureAvailable()) throw new Error('Secure-Modus benötigt HTTPS oder localhost.');
        if (!password || password.trim().length === 0) throw new Error('Schlüssel erforderlich!');

        const bytes = this._symbolsToBytes(message.slice(this.SECURE_PREFIX.length));
        if (bytes.length < 28) throw new Error('Secure-Nachricht unvollständig.');

        const salt = bytes.slice(0, 16);
        const iv = bytes.slice(16, 28);
        const ct = bytes.slice(28);
        const key = await this._deriveKey(password, salt);

        try {
            const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
            return new TextDecoder().decode(plain);
        } catch {
            throw new Error('Falscher Schlüssel oder Nachricht beschädigt.');
        }
    }

    // === FASSADE ===

    async encrypt(text, key, mode = 'classic') {
        if (mode === 'secure') return this.encryptSecure(text, key);
        return this.encryptClassic(text, key);
    }

    async decrypt(text, key, mode = 'auto') {
        if (this.isSecureMessage(text)) return this.decryptSecure(text, key);
        if (mode === 'secure') return this.decryptSecure(text, key);
        return this.decryptClassic(text, key);
    }

    // === HILFSFUNKTIONEN ===

    generateKey(length = 16) {
        const pool = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!#%&*+-=?';
        let key = '';
        for (let i = 0; i < length; i++) key += pool[Math.floor(Math.random() * pool.length)];
        return key;
    }

    generateSecureKey(length = 24) {
        const pool = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const random = crypto.getRandomValues(new Uint32Array(length));
        let key = '';
        for (let i = 0; i < length; i++) key += pool[random[i] % pool.length];
        return key;
    }

    keyStrength(key) {
        if (!key) return { label: '—', level: 0 };
        let score = 0;
        if (key.length >= 8) score++;
        if (key.length >= 14) score++;
        if (/[a-z]/.test(key) && /[A-Z0-9]/.test(key)) score++;
        if (/[^a-zA-Z0-9]/.test(key)) score++;
        const labels = ['schwach', 'ok', 'gut', 'stark', 'exzellent'];
        return { label: labels[score], level: score };
    }
}

const felianCrypto = new FelianCrypto();
