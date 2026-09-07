/**
 * KeyManager V9.2
 *
 * FIXES:
 *  - persistNow()/blobSave() überschreiben im gesperrten Zustand NICHTS mehr
 *    (vorher: stiller Klartext-Fallback zerstörte den verschlüsselten Store)
 *  - lock() cancelt ausstehende persist-Timer
 *  - resetStore(): sauberer Werksreset für "Passwort vergessen"
 */

const B64 = {
    enc(bytes) {
        let s = '';
        for (const b of bytes) s += String.fromCharCode(b);
        return btoa(s);
    },
    dec(str) {
        const bin = atob(str);
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
        return out;
    }
};

class KeyManager {

    constructor() {
        this.STORE = 'felian_v9_keystore';
        this.SALT_KEY = 'felian_v9_salt';
        this.LEGACY = ['felian_v8_keys', 'felian_v7_keys', 'felian_v6_keys', 'felian_v5_keys'];

        this.MASTER_PBKDF2_ITER = 310000;

        this.sessionKey = null;   // CryptoKey (nur im RAM)
        this.keys = {};           // Klartext-Keys (nur im RAM, wenn entsperrt)
        this.active = null;

        this.fallback = false;
        this._persistTimer = null;
    }

    get secureCtx() {
        return !!(window.crypto && window.crypto.subtle);
    }

    // === STORE-TYP ERKENNEN ===

    hasSecureStore() {
        return !!(localStorage.getItem(this.SALT_KEY) && localStorage.getItem(this.STORE));
    }

    hasFallbackStore() {
        try {
            const m = JSON.parse(localStorage.getItem(this.STORE));
            return !!(m && m.fb);
        } catch { return false; }
    }

    isUnlocked() {
        return this.fallback || !!this.sessionKey;
    }

    // === MASTER-KEY HANDLING ===

    async _deriveMaster(pass, salt) {
        const base = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: this.MASTER_PBKDF2_ITER, hash: 'SHA-256' },
            base,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    async _encrypt(data) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ct = new Uint8Array(await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv }, this.sessionKey, new TextEncoder().encode(data)
        ));
        return { iv: B64.enc(iv), ct: B64.enc(ct) };
    }

    async _decrypt(blob) {
        const pt = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: B64.dec(blob.iv) }, this.sessionKey, B64.dec(blob.ct)
        );
        return new TextDecoder().decode(pt);
    }

    /** Erstmaliges Setup. Salt wird VOR dem Payload persistiert. */
    async setup(pass) {
        if (!this.secureCtx) { this.enableFallback(); return; }

        const salt = crypto.getRandomValues(new Uint8Array(16));
        this.sessionKey = await this._deriveMaster(pass, salt);

        localStorage.setItem(this.SALT_KEY, B64.enc(salt));

        this.keys = {};
        this.active = null;
        this._migrateLegacy();
        await this.persistNow();
    }

    /** Entsperren. false = falsches Passwort ODER Store beschädigt. */
    async unlock(pass) {
        const saltB64 = localStorage.getItem(this.SALT_KEY);
        const blobRaw = localStorage.getItem(this.STORE);
        if (!saltB64 || !blobRaw) return false;

        let blob;
        try { blob = JSON.parse(blobRaw); } catch { return false; }
        if (!blob.iv || !blob.ct) return false; // Klartext-Rest → kein gültiger Secure-Store

        try {
            const key = await this._deriveMaster(pass, B64.dec(saltB64));
            const pt = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: B64.dec(blob.iv) }, key, B64.dec(blob.ct)
            );
            const data = JSON.parse(new TextDecoder().decode(pt));
            this.sessionKey = key;
            this.keys = data.keys || {};
            this.active = data.active || null;
            return true;
        } catch {
            return false;
        }
    }

    /** Session sperren — Keys aus dem RAM, anstehende Persistenz ABGESAGT. */
    lock() {
        clearTimeout(this._persistTimer);
        this.sessionKey = null;
        this.keys = {};
        this.active = null;
    }

    /** Werksreset: gesamter Vault weg. KEIN Undo. */
    resetStore() {
        clearTimeout(this._persistTimer);
        localStorage.removeItem(this.STORE);
        localStorage.removeItem(this.SALT_KEY);
        localStorage.removeItem('felian_v9_draft_blob');
        localStorage.removeItem('felian_v9_history_blob');
        this.sessionKey = null;
        this.keys = {};
        this.active = null;
        this.fallback = false;
    }

    /** Unsicherer Kontext (file://) — Klartext, aber ausdrücklich markiert. */
    enableFallback() {
        this.fallback = true;
        this.keys = {};
        this.active = null;
        this._migrateLegacy();
        this.persistNow();
    }

    loadFallback() {
        try {
            const meta = JSON.parse(localStorage.getItem(this.STORE));
            if (meta && meta.fb) {
                this.fallback = true;
                this.keys = meta.keys || {};
                this.active = meta.active || null;
            }
        } catch { /* kaputter Store → neu anfangen */ }
    }

    _migrateLegacy() {
        for (const lk of this.LEGACY) {
            try {
                const raw = localStorage.getItem(lk);
                if (!raw) continue;
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') Object.assign(this.keys, parsed);
                localStorage.removeItem(lk);
            } catch { /* ignorieren */ }
        }
    }

    // === PERSISTENZ ===

    _persistSoon() {
        clearTimeout(this._persistTimer);
        this._persistTimer = setTimeout(() => {
            this._persistTimer = null;
            this.persistNow();
        }, 200);
    }

    /**
     * FIX: Gesperrt (kein SessionKey) und kein Fallback → GAR NICHTS schreiben.
     * Vorher wurde in dem Fall Klartext über den verschlüsselten Store geklatscht.
     */
    async persistNow() {
        if (this.fallback) {
            localStorage.setItem(this.STORE, JSON.stringify({
                v: 1, fb: true, keys: this.keys, active: this.active
            }));
            return;
        }
        if (!this.sessionKey) return; // gesperrt → Finger weg vom Store

        const data = { keys: this.keys, active: this.active };
        const blob = await this._encrypt(JSON.stringify(data));
        localStorage.setItem(this.STORE, JSON.stringify({ v: 1, iv: blob.iv, ct: blob.ct }));
    }

    // === VERSCHLÜSSELTE BLOBS (Draft & History) ===

    async blobSave(name, str) {
        if (this.fallback) { localStorage.setItem(name, str); return; }
        if (!this.sessionKey) return; // FIX: gesperrt → nicht überschreiben

        const blob = await this._encrypt(str);
        localStorage.setItem(name, JSON.stringify(blob));
    }

    async blobLoad(name) {
        const raw = localStorage.getItem(name);
        if (!raw) return null;
        if (this.fallback) return raw;
        if (!this.sessionKey) return null; // gesperrt → nichts lesbares
        try { return await this._decrypt(JSON.parse(raw)); }
        catch { return null; }
    }

    // === KEY-OPERATIONEN ===

    getAll() { return this.keys; }

    save(name, key) {
        if (!name?.trim() || !key?.trim()) throw new Error('Name und Schlüssel dürfen nicht leer sein.');
        this.keys[name.trim()] = String(key).trim();
        this._persistSoon();
    }

    get(name) { return this.keys[name] || null; }

    delete(name) {
        delete this.keys[name];
        if (this.active === name) this.active = null;
        this._persistSoon();
    }

    setActive(name) {
        this.active = (name && this.get(name)) ? name : null;
        this._persistSoon();
    }

    getActiveValue() {
        return this.active ? this.get(this.active) : null;
    }

    export() { return JSON.stringify(this.keys, null, 2); }

    import(jsonString) {
        const parsed = JSON.parse(jsonString);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Ungültiges Format.');
        this.keys = { ...this.keys, ...parsed };
        this._persistSoon();
    }
}

const keyManager = new KeyManager();
