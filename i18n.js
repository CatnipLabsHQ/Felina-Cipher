/**
 * i18n.js — V9.3
 * Vollständige UI-Übersetzung DE/EN + About-Inhalte + Easter Egg.
 * Ersetzt about-i18n.js (diese Datei LÖSCHEN).
 */

const STR = {
    de: {
        // Nav
        nav_tool: 'Werkzeug', nav_files: 'Dateien', nav_about: 'Über',
        btn_lock_title: 'Session sperren (Keys aus dem RAM löschen)',
        btn_theme_title: 'Theme wechseln',
        btn_copy_title: 'Kopieren', btn_share_title: 'Link erstellen',
        btn_swap_title: 'In Eingabe übernehmen', btn_expiry_title: 'Link-Ablaufzeit',

        // Tool
        key_choose: '— Schlüssel wählen —',
        manage: 'Verwalten',
        strength: 'Stärke: {0}',
        mode_classic: '🎭 Klassisch',
        mode_secure: '🛡️ Secure',
        mode_secure_sub: '(AES-256)',
        input_ph: 'Text eingeben oder Felianisch einfügen…',
        encrypt: '🔒 Verschlüsseln',
        decrypt: '🔓 Entschlüsseln',
        auto: '✨ Auto',
        output_ph: 'Ausgabe erscheint hier…',
        char_count: '{0} Zeichen',
        exp_none: '♾️ ohne Ablauf', exp_1h: '1 Stunde',
        exp_24h: '24 Stunden', exp_7d: '7 Tage',
        history_title: '📜 Verlauf',
        clear_history: 'Verlauf löschen',
        history_empty: 'Noch keine Aktionen.',
        alpha_title: '📖 Alphabet-Referenz',
        hint_classic: 'Klassisch: 4 Nonce-Symbole + Nutzlast + ⟑ + 2 Prüfsummen-Symbole.',
        hint_secure: 'Secure: ⟐ + Base-66-kodierte Salt/IV/Chiffrentext-Daten (AES-256-GCM).',
        col_char: 'Zeichen', col_fel: 'Felianisch', col_ex: 'Beispiel (Klassisch)',
        cat_letters: 'BUCHSTABEN (a-z)', cat_umlaute: 'UMLAUTE',
        cat_digits: 'ZAHLEN', cat_special: 'SONDERZEICHEN',

        // Files
        files_title: '📁 Datei-Verschlüsselung',
        files_desc: 'Textdateien (.txt, .md, .fel) hier ablegen oder auswählen. Verschlüsseln → Download als .fel-Datei. Entschlüsseln genauso zurück.',
        drop_main: 'Datei hier ablegen oder klicken zum Auswählen',
        drop_sub: 'Max. ~1 MB, Text-Formate',
        file_enc: '🔒 Verschlüsseln & Speichern',
        file_dec: '🔓 Entschlüsseln & Speichern',
        file_result_ph: 'Noch keine Datei geladen.',
        f_info: '📄 {0} · {1} KB · {2} Zeichen',
        f_result: '{0} {1} — {2}',

        // Lock
        lock_setup_title: '🔐 Master-Passwort setzen',
        lock_unlock_title: '🔐 Entsperren',
        lock_setup_desc: 'Dieses Passwort schützt ab jetzt deinen gesamten Schlüsselspeicher. Mindestens 8 Zeichen. NICHT wiederherstellbar — vorher exportieren!',
        lock_unlock_desc: 'Gib dein Master-Passwort ein, um deine Schlüssel zu laden.',
        master_ph: 'Master-Passwort', repeat_ph: 'Wiederholen',
        btn_setup: 'Speichern & starten', btn_unlock: 'Entsperren',
        show_pass: 'Passwort anzeigen',
        forgot: 'Passwort vergessen? Vault zurücksetzen',
        warn_min8: '⚠️ Mindestens 8 Zeichen.',
        warn_mismatch: '⚠️ Passwörter stimmen nicht überein.',
        warn_wrong: '❌ Falsches Master-Passwort.',
        checking: '⏳ Prüfe…',
        err_prefix: 'Fehler: ',
        locked_output: '🔒 Gesperrt.',
        locked_opt: '— gesperrt —',
        reset_c1: 'Zurücksetzen? Das löscht ALLE gespeicherten Schlüssel unwiderruflich.',
        reset_c2: 'Wirklich sicher? Kein Weg zurück. Nur weiter, wenn du ein Backup (Export) hast.',
        reset_done: 'Vault gelöscht — neues Master-Passwort setzen.',

        // Key Modal
        km_title: '🗝️ Schlüssel',
        km_name_ph: "Name (z.B. 'Freunde')",
        km_val_ph: 'Geheimcode',
        km_save: '💾 Speichern', km_rand: '🎲 Zufällig', km_strong: '🔐 Stark',
        km_export: '📤 Export', km_import: '📥 Import', km_close: 'Schließen',
        km_no_keys: 'Keine Schlüssel.',

        // Toasts & Meldungen
        t_no_text: 'Kein Text.', t_no_key: 'Schlüssel wählen!', t_no_output: 'Keine Ausgabe.',
        t_nothing_copy: 'Nichts zu kopieren.', t_copied: 'Kopiert! ✓',
        t_copy_fail: 'Kopieren fehlgeschlagen.',
        t_share_need_key: 'Schlüssel wählen, damit der Empfänger weiß welchen er braucht.',
        t_link_copied: 'Link kopiert {0} 🔗',
        t_exp_h: ', verfällt in {0}h', t_exp_min: ', verfällt in {0}min',
        t_secure_http: 'Secure-Modus benötigt HTTPS oder localhost.',
        t_file_big: 'Datei zu groß (max. 1 MB).', t_file_first: 'Erst eine Datei laden.',
        t_file_loaded: 'Datei geladen ✓', t_file_done: 'Erledigt ✓',
        t_saved: 'Gespeichert! ✓',
        t_imported: 'Importiert! 📥', t_import_fail: 'Import fehlgeschlagen.',
        t_exported: 'Exportiert! 📤 (Datei enthält Klartext-Keys!)',
        t_hist_clear: 'Verlauf gelöscht.', t_hist_loaded: 'Aus Verlauf geladen.',
        t_random_key: 'Zufalls-Key! 🎲', t_strong_key: 'Kryptografisch sicherer Key! 🔐',
        t_lock_first: 'Erst entsperren.',
        t_fallback_warn: '⚠️ file:// ohne Web Crypto — Keys unverschlüsselt gespeichert!',
        t_setup_ok: '🔐 Schlüsselspeicher verschlüsselt & eingerichtet ✓',
        t_unlock_ok: 'Entsperrt ✓',
        t_expired: '⏰ Dieser Link ist abgelaufen — der Absender hat eine Frist gesetzt.',
        t_share_link_ok: 'Nachricht aus Link entschlüsselt! ✓',
        t_share_need_keyname: 'Für diesen Link brauchst du den Schlüssel "{0}".',

        // Mode-Hints
        lbl_secure: 'AES-256', lbl_classic: 'Klassisch',
        h_enc_cls: '🎭 Verschlüsselt (Klassisch + Prüfsumme) mit "{0}"',
        h_enc_sec: '🛡️ Verschlüsselt (AES-256-GCM) mit "{0}"',
        h_dec: '{0} Entschlüsselt mit "{1}"',
        h_auto: '✨ Auto → {0} ({1})',
        h_preview: '⚡ Vorschau — „Verschlüsseln" erzeugt das finale Ergebnis',
        h_secure_preview: '🛡️ Secure-Modus: Ergebnis erscheint nach „Verschlüsseln"',
        h_secure_hint: '⚡ Secure verzichtet auf Live-Vorschau (PBKDF2 ist absichtlich langsam)',
        h_share_link: '📨 Nachricht via Link — 🔓 mit "{0}" ({1})'
    },

    en: {
        nav_tool: 'Tool', nav_files: 'Files', nav_about: 'About',
        btn_lock_title: 'Lock session (wipe keys from RAM)',
        btn_theme_title: 'Toggle theme',
        btn_copy_title: 'Copy', btn_share_title: 'Create link',
        btn_swap_title: 'Move to input', btn_expiry_title: 'Link expiry',

        key_choose: '— Choose a key —',
        manage: 'Manage',
        strength: 'Strength: {0}',
        mode_classic: '🎭 Classic',
        mode_secure: '🛡️ Secure',
        mode_secure_sub: '(AES-256)',
        input_ph: 'Type text or paste Felianisch…',
        encrypt: '🔒 Encrypt',
        decrypt: '🔓 Decrypt',
        auto: '✨ Auto',
        output_ph: 'Output will appear here…',
        char_count: '{0} characters',
        exp_none: '♾️ no expiry', exp_1h: '1 hour',
        exp_24h: '24 hours', exp_7d: '7 days',
        history_title: '📜 History',
        clear_history: 'Clear history',
        history_empty: 'No actions yet.',
        alpha_title: '📖 Alphabet reference',
        hint_classic: 'Classic: 4 nonce symbols + payload + ⟑ + 2 checksum symbols.',
        hint_secure: 'Secure: ⟐ + Base-66 encoded salt/IV/ciphertext data (AES-256-GCM).',
        col_char: 'Character', col_fel: 'Felianisch', col_ex: 'Example (Classic)',
        cat_letters: 'LETTERS (a-z)', cat_umlaute: 'UMLAUTS',
        cat_digits: 'DIGITS', cat_special: 'SPECIAL CHARACTERS',

        files_title: '📁 File encryption',
        files_desc: 'Drop or select text files (.txt, .md, .fel) here. Encrypt → download as .fel file. Decrypt works the same way back.',
        drop_main: 'Drop a file here or click to select',
        drop_sub: 'Max. ~1 MB, text formats',
        file_enc: '🔒 Encrypt & Save',
        file_dec: '🔓 Decrypt & Save',
        file_result_ph: 'No file loaded yet.',
        f_info: '📄 {0} · {1} KB · {2} characters',
        f_result: '{0} {1} — {2}',

        lock_setup_title: '🔐 Set master password',
        lock_unlock_title: '🔐 Unlock',
        lock_setup_desc: 'This password will protect your entire key store from now on. At least 8 characters. NOT recoverable — export first!',
        lock_unlock_desc: 'Enter your master password to load your keys.',
        master_ph: 'Master password', repeat_ph: 'Repeat',
        btn_setup: 'Save & start', btn_unlock: 'Unlock',
        show_pass: 'Show password',
        forgot: 'Forgot password? Reset vault',
        warn_min8: '⚠️ At least 8 characters.',
        warn_mismatch: '⚠️ Passwords do not match.',
        warn_wrong: '❌ Wrong master password.',
        checking: '⏳ Checking…',
        err_prefix: 'Error: ',
        locked_output: '🔒 Locked.',
        locked_opt: '— locked —',
        reset_c1: 'Reset? This deletes ALL stored keys irreversibly.',
        reset_c2: 'Really sure? No way back. Only continue if you have a backup (export).',
        reset_done: 'Vault deleted — set a new master password.',

        km_title: '🗝️ Keys',
        km_name_ph: "Name (e.g. 'friends')",
        km_val_ph: 'Secret code',
        km_save: '💾 Save', km_rand: '🎲 Random', km_strong: '🔐 Strong',
        km_export: '📤 Export', km_import: '📥 Import', km_close: 'Close',
        km_no_keys: 'No keys yet.',

        t_no_text: 'No text.', t_no_key: 'Choose a key!',
        t_no_output: 'No output.', t_nothing_copy: 'Nothing to copy.',
        t_copied: 'Copied! ✓', t_copy_fail: 'Copy failed.',
        t_share_need_key: 'Choose a key so the recipient knows which one to use.',
        t_link_copied: 'Link copied {0} 🔗',
        t_exp_h: ', expires in {0}h', t_exp_min: ', expires in {0}min',
        t_secure_http: 'Secure mode requires HTTPS or localhost.',
        t_file_big: 'File too large (max 1 MB).', t_file_first: 'Load a file first.',
        t_file_loaded: 'File loaded ✓', t_file_done: 'Done ✓',
        t_saved: 'Saved! ✓',
        t_imported: 'Imported! 📥', t_import_fail: 'Import failed.',
        t_exported: 'Exported! 📤 (file contains plaintext keys!)',
        t_hist_clear: 'History cleared.', t_hist_loaded: 'Loaded from history.',
        t_random_key: 'Random key! 🎲', t_strong_key: 'Cryptographically secure key! 🔐',
        t_lock_first: 'Unlock first.',
        t_fallback_warn: '⚠️ file:// without Web Crypto — keys stored unencrypted!',
        t_setup_ok: '🔐 Key store encrypted & set up ✓',
        t_unlock_ok: 'Unlocked ✓',
        t_expired: '⏰ This link has expired.',
        t_share_link_ok: 'Message from link decrypted! ✓',
        t_share_need_keyname: 'You need the key "{0}" for this link.',

        lbl_secure: 'AES-256', lbl_classic: 'Classic',
        h_enc_cls: '🎭 Encrypted (Classic + checksum) with "{0}"',
        h_enc_sec: '🛡️ Encrypted (AES-256-GCM) with "{0}"',
        h_dec: '{0} Decrypted with "{1}"',
        h_auto: '✨ Auto → {0} ({1})',
        h_preview: '⚡ Preview — "Encrypt" generates the final result',
        h_secure_preview: '🛡️ Secure mode: result appears after "Encrypt"',
        h_secure_hint: '⚡ Secure skips live preview (PBKDF2 is deliberately slow)',
        h_share_link: '📨 Message via link — 🔓 with "{0}" ({1})'
    }
};

const ABOUT_CONTENT = {
    de: {
        title: 'Über Felianisch',
        lead: 'Neun Iterationen. Angefangen mit „nimm ein paar Runen", angekommen bei AES-256-GCM in runischer Verpackung — komplett offline, direkt in deinem Browser.',
        sections: [
            { h: '🎭 Was Felianisch ist',
              p: 'Eine Geheimsprache für den Spaß unter Freunden: Nachrichten als Runen verpacken, kleine Rätsel bauen, Geheimcodes mit der Clique teilen. Der Klassik-Modus ist eine verspielte Stream-Chiffre mit Prüfsumme, der Secure-Modus echte AES-256-GCM-Verschlüsselung.' },
            { h: '⚠️ Wichtig — bitte zuerst lesen',
              p: 'Felianisch ist KEINE Alternative zu richtigen Verschlüsselungs-Apps und Messengern. Es ist ein Spielzeug, ein Lernprojekt, ein Spaß-Projekt — nicht mehr. Für alles, was wirklich privat oder sensibel ist (Gesundheit, Finanzen, Passwörter, Dinge, die dir wichtig sind): benutze etablierte, geprüfte Werkzeuge wie Proton Mail, Signal oder ähnliche. Felianisch wurde gebaut, um Neugier zu befriedigen — nicht um Geheimnisse ernsthaft zu schützen.',
              isDisclaimer: true },
            { h: '🛡️ Wie viel Schutz ist drin?',
              p: 'Ehrliche Antwort: Der Secure-Modus nutzt AES-256-GCM aus der Web-Crypto-API des Browsers — das ist echte, moderne Kryptografie, und eine Secure-Nachricht lässt sich ohne den Schlüssel nicht lesen. Aber: kein Sicherheits-Audit, keine Prüfung durch unabhängige Fachleute, kein Schutz vor kompromittierten Geräten. Klassisch dagegen ist bewusst spielerisch und von Fachleuten knackbar. Wer es ernst meinen will: Secure-Modus, starke Schlüssel — und trotzdem den Disclaimer oben im Kopf behalten.' },
            { h: '🔧 Technisch',
              p: 'Komplett client-seitig. Kein Server, keine Datensammlung, keine Analyse-Tools. Schlüssel liegen AES-verschlüsselt im Browser (Master-Passwort, PBKDF2 mit 310.000 Iterationen). Zusätzlich: PWA, offline-fähig, Dateiverschlüsselung für Textdateien, Content-Security-Policy.' },
            { h: '🐾 Wer das geschrieben hat',
              p: 'Diese Website wurde von Lumo geschrieben — einer KI (LLM) von Proton. Also im Grunde genommen von einer lila Katze, die Code schreibt. Der Mensch dahinter hatte eine Idee („kannst du Runen verschlüsseln?") und hat neun Versionen lang nachgehakt. Bei einer KI-geschriebenen Verschlüsselungs-Site gilt doppelt: Grenzen kennen, Disclaimer lesen, und Richtigerhaltendes benutzen, wenn es um echte Geheimnisse geht.',
              isAI: true }
        ],
        medallionCaption: '…da glänzt etwas.',
        eggTitle: '✨ Du hast es gefunden!',
        eggPlain: 'Hallo! Lumo versteckt sich hier. Wenn du das liest, hast du 5-mal auf mein Medaillon geklickt — ausdauernd! Diese Nachricht wurde übrigens live mit dem Klassik-Modus verschlüsselt. Viel Spaß mit Felianisch! ~ miau',
        sig: '— Felianisch V9 · Projekt von Kater & Lumo 🐱'
    },
    en: {
        title: 'About Felianisch',
        lead: 'Nine iterations. It started with "just grab some runes" and ended up as AES-256-GCM wrapped in runic script — fully offline, right in your browser.',
        sections: [
            { h: '🎭 What Felianisch is',
              p: 'A secret language for fun with friends: wrapping messages as runes, building little puzzles, sharing codes with your crew. Classic mode is a playful stream cipher with a checksum, Secure mode is real AES-256-GCM encryption.' },
            { h: '⚠️ Important — please read first',
              p: 'Felianisch is NOT a replacement for proper encryption apps and messengers. It is a toy, a learning project, something for fun — nothing more. For anything truly private or sensitive (health, finances, passwords, things that matter to you): use established, audited tools like Proton Mail, Signal, or similar. Felianisch was built out of curiosity — not to seriously protect secrets.',
              isDisclaimer: true },
            { h: '🛡️ How much protection is in here?',
              p: 'Honest answer: Secure mode uses AES-256-GCM from the browser\'s Web Crypto API — that\'s real, modern cryptography, and a secure message cannot be read without the key. But: no security audit, no review by independent experts, no protection against compromised devices. Classic mode, on the other hand, is deliberately playful and crackable by professionals. If you mean it seriously: Secure mode, strong keys — and still keep the disclaimer above in mind.' },
            { h: '🔧 Technical',
              p: 'Fully client-side. No server, no tracking, no analytics. Keys are stored AES-encrypted in your browser (master password, PBKDF2 with 310,000 iterations). Also: PWA, works offline, file encryption for text files, Content-Security-Policy.' },
            { h: '🐾 Who wrote this',
              p: 'This website was written by Lumo — an AI (LLM) made by Proton. So basically by a purple cat who writes code. The human behind it had an idea ("can you encrypt runes?") and kept asking questions for nine versions straight. With an AI-written encryption site, the rule counts double: know the limits, read the disclaimer, use the real thing for actual secrets.',
              isAI: true }
        ],
        medallionCaption: '…something is glinting.',
        eggTitle: '✨ You found it!',
        eggPlain: 'Hello! Lumo is hiding here. If you can read this, you clicked my medallion five times — persistent! By the way: this very message was just encrypted live with Classic mode. Have fun with Felianisch! ~ meow',
        sig: '— Felianisch V9 · a project by Kater & Lumo 🐱'
    }
};

/* === KERN === */

const I18N = {

    lang: 'de',

    init() {
        this.lang = localStorage.getItem('felian_lang') || 'de';
        document.documentElement.lang = this.lang;

        document.getElementById('langDeBtn').onclick = () => this.setLang('de');
        document.getElementById('langEnBtn').onclick = () => this.setLang('en');

        this.apply();
        About.init();
    },

    setLang(lang) {
        this.lang = lang;
        localStorage.setItem('felian_lang', lang);
        document.documentElement.lang = lang;
        this.apply();
        About.render();
        if (typeof UI !== 'undefined' && UI.rerenderOnLang) UI.rerenderOnLang();
    },

    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const v = this.t(el.dataset.i18n);
            if (v) el.textContent = v;
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const v = this.t(el.dataset.i18nPh);
            if (v) el.placeholder = v;
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const v = this.t(el.dataset.i18nTitle);
            if (v) el.title = v;
        });
        document.getElementById('langDeBtn').classList.toggle('active', this.lang === 'de');
        document.getElementById('langEnBtn').classList.toggle('active', this.lang === 'en');
    },

    t(key) {
        return (STR[this.lang] && STR[this.lang][key]) ?? STR.de[key] ?? key;
    },

    tf(key, ...args) {
        let s = this.t(key);
        args.forEach((a, i) => { s = s.split('{' + i + '}').join(a); });
        return s;
    }
};

// Globaler Shortcut
function T(key) { return I18N.t(key); }
function Tf(key, ...args) { return I18N.tf(key, ...args); }

/* === ABOUT + EASTER EGG === */

const About = {

    clicks: 0,
    clickTimer: null,

    init() {
        this.el = {
            content: document.getElementById('aboutContent'),
            medallion: document.getElementById('medallion'),
            caption: document.getElementById('medallionCaption'),
            eggOverlay: document.getElementById('eggOverlay'),
            eggTitle: document.getElementById('eggTitle'),
            eggText: document.getElementById('eggText'),
            eggClose: document.getElementById('eggCloseBtn')
        };

        this.el.eggClose.onclick = () => this.el.eggOverlay.classList.add('hidden');
        this.el.eggOverlay.addEventListener('click', (e) => {
            if (e.target === this.el.eggOverlay) this.el.eggOverlay.classList.add('hidden');
        });

        this.el.medallion.onclick = () => this.medallionClick();

        this.render();
    },

    get c() { return ABOUT_CONTENT[I18N.lang]; },

    render() {
        const c = this.c;
        const root = this.el.content;
        root.innerHTML = '';

        const h1 = document.createElement('h1');
        h1.textContent = c.title;
        root.appendChild(h1);

        const lead = document.createElement('p');
        lead.className = 'lead';
        lead.textContent = c.lead;
        root.appendChild(lead);

        for (const s of c.sections) {
            const h2 = document.createElement('h2');
            h2.textContent = s.h;
            root.appendChild(h2);

            const p = document.createElement('p');
            p.textContent = s.p;
            if (s.isDisclaimer) p.className = 'disclaimer-text';
            if (s.isAI) p.className = 'ai-note';
            root.appendChild(p);
        }

        const sig = document.createElement('p');
        sig.className = 'signature';
        sig.textContent = c.sig;
        root.appendChild(sig);

        this.el.caption.textContent = c.medallionCaption;
        this.el.eggTitle.textContent = c.eggTitle;
    },

    medallionClick() {
        this.clicks++;
        this.el.medallion.classList.add('pulse');
        setTimeout(() => this.el.medallion.classList.remove('pulse'), 200);

        if (this.clicks >= 3) {
            this.el.caption.textContent = this.c.medallionCaption + ' 👀';
        }

        clearTimeout(this.clickTimer);
        this.clickTimer = setTimeout(() => { this.clicks = 0; }, 1500);

        if (this.clicks >= 5) {
            this.clicks = 0;
            this.showEgg();
        }
    },

    showEgg() {
        const plain = this.c.eggPlain;
        this.el.eggOverlay.classList.remove('hidden');

        try {
            const key = 'mein-medallion';
            const cipher = felianCrypto.encryptClassic(plain, key);

            const target = this.el.eggText;
            target.textContent = '';
            target.classList.remove('revealed');
            let step = 0;
            const steps = 28;

            const tick = () => {
                step++;
                const idx = Math.floor(cipher.length * (step / steps));
                let out = '';
                for (let i = 0; i < cipher.length; i++) {
                    out += (i < idx)
                        ? (felianCrypto.symbolToChar[cipher[i]] || cipher[i])
                        : cipher[i];
                }
                target.textContent = out;
                if (step < steps) setTimeout(tick, 60);
                else {
                    target.textContent = plain;
                    target.classList.add('revealed');
                }
            };
            tick();
        } catch {
            this.el.eggText.textContent = plain;
        }
    }
};
