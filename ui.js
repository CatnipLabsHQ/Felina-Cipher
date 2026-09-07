/**
 * UI Controller V9.3 — komplett i18n-fähig (T()/Tf() statt Hartkodiertem).
 */

const UI = {

    el: {},
    autoMode: false,
    cryptoMode: 'classic',
    fileCryptoMode: 'classic',
    loadedFile: null,
    lockMode: 'unlock',
    HISTORY_MAX: 20,
    DRAFT_KEY: 'felian_v9_draft_blob',
    HISTORY_KEY: 'felian_v9_history_blob',

    // === BOOT ===

    async boot() {
        this.cache();
        this.bindStatic();
        this.renderAlphabetTable();
        this.loadTheme();
        this.checkSecureAvailability();
        this.el.charsetCount.textContent = `${FELIAN_CHARSET.length}`;

        if (!keyManager.secureCtx) {
            keyManager.enableFallback();
            keyManager.loadFallback();
            this.finishBoot();
            this.toast(T('t_fallback_warn'), 'error');
        }
        else if (keyManager.hasSecureStore()) {
            this.showLock('unlock');
        }
        else if (keyManager.hasFallbackStore()) {
            keyManager.loadFallback();
            this.finishBoot();
        }
        else {
            this.showLock('setup');
        }
    },

    finishBoot() {
        this.refreshKeySelect();
        this.refreshFileKeySelect();
        this.updateKeyStrength();
        this.updateAlphabetTable();
        this.renderHistory();
        this.loadDraft();
        this.loadIncomingShareLink();
    },

    /** V9.3: Nach Sprachwechsel alle dynamisch gerenderten Texte neu aufbauen. */
    rerenderOnLang() {
        this.renderAlphabetTable();
        this.updateAlphabetTable();
        this.renderHistory();
        this.updateCharCount();

        if (keyManager.isUnlocked()) {
            this.refreshKeySelect();
            this.refreshFileKeySelect();
            if (!this.el.keyModal.classList.contains('hidden')) this.renderKeyList();
        } else {
            this.el.keySelect.innerHTML = `<option value="">${T('locked_opt')}</option>`;
            this.el.fileKeySelect.innerHTML = `<option value="">${T('locked_opt')}</option>`;
        }

        if (this.el.fileProgress.classList.contains('hidden')) {
            this.el.fileResult.textContent = T('file_result_ph');
        }
        if (!this.el.lockOverlay.classList.contains('hidden')) {
            this.showLock(this.lockMode);
        }
    },

    // === LOCK SCREEN ===

    showLock(mode) {
        this.lockMode = mode;
        const isSetup = mode === 'setup';

        this.el.lockTitle.textContent = isSetup ? T('lock_setup_title') : T('lock_unlock_title');
        this.el.lockDesc.textContent = isSetup ? T('lock_setup_desc') : T('lock_unlock_desc');

        this.el.masterPassConfirm.classList.toggle('hidden', !isSetup);
        this.el.lockSubmitBtn.textContent = isSetup ? T('btn_setup') : T('btn_unlock');
        this.el.lockResetBtn.classList.toggle('hidden', isSetup);
        this.el.masterPassInput.value = '';
        this.el.masterPassConfirm.value = '';
        this.el.lockWarn.textContent = '';

        this.el.lockOverlay.classList.remove('hidden');
        this.el.masterPassInput.focus();
    },

    hideLock() {
        this.el.lockOverlay.classList.add('hidden');
    },

    async handleLockSubmit() {
        const pass = this.el.masterPassInput.value;

        if (this.lockMode === 'setup') {
            if (pass.length < 8) { this.el.lockWarn.textContent = T('warn_min8'); return; }
            if (pass !== this.el.masterPassConfirm.value) { this.el.lockWarn.textContent = T('warn_mismatch'); return; }
            try {
                await keyManager.setup(pass);
                this.hideLock();
                this.finishBoot();
                this.toast(T('t_setup_ok'), 'success');
            } catch (e) {
                this.el.lockWarn.textContent = T('err_prefix') + e.message;
            }
        }
        else {
            this.el.lockSubmitBtn.textContent = T('checking');
            this.el.lockSubmitBtn.disabled = true;
            const ok = await keyManager.unlock(pass);
            this.el.lockSubmitBtn.disabled = false;
            this.el.lockSubmitBtn.textContent = T('btn_unlock');

            if (!ok) {
                this.el.lockWarn.textContent = T('warn_wrong');
                this.el.masterPassInput.select();
                return;
            }
            this.hideLock();
            this.finishBoot();
            this.toast(T('t_unlock_ok'), 'success');
        }
    },

    confirmReset() {
        if (this.lockMode !== 'unlock') return;
        if (!confirm(T('reset_c1'))) return;
        if (!confirm(T('reset_c2'))) return;

        keyManager.resetStore();
        this._clearSensitiveUI();
        this.showLock('setup');
        this.toast(T('reset_done'), 'error');
    },

    lockNow() {
        keyManager.lock();
        this._clearSensitiveUI();
        this.showLock('unlock');
    },

    _clearSensitiveUI() {
        this.el.result.textContent = T('locked_output');
        this.el.result.className = 'output-box';
        this.el.modeHint.classList.add('hidden');
        this.el.inputText.value = '';
        this.el.keyStrength.textContent = '';
        this.el.fileKeyStrength.textContent = '';
        this.el.keySelect.innerHTML = `<option value="">${T('locked_opt')}</option>`;
        this.el.fileKeySelect.innerHTML = `<option value="">${T('locked_opt')}</option>`;
        this.el.historyList.innerHTML = '';
        this.el.historyCount.textContent = '';
        this.el.fileInfo.textContent = '';
        this.el.filePreview.textContent = '';
        this.el.fileResult.textContent = T('file_result_ph');
        this.el.fileResult.className = 'output-box';
        this.loadedFile = null;
        this.el.fileProgress.classList.add('hidden');
    },

    // === CACHE & BINDING ===

    cache() {
        const ids = [
            'inputText', 'result', 'charCount', 'modeHint',
            'encryptBtn', 'decryptBtn', 'autoBtn', 'clearBtn',
            'copyBtn', 'swapBtn', 'shareBtn', 'expirySelect',
            'keySelect', 'manageKeysBtn', 'keyStrength',
            'modeClassicBtn', 'modeSecureBtn',
            'fileKeySelect', 'fileKeyStrength',
            'fileModeClassicBtn', 'fileModeSecureBtn',
            'dropZone', 'fileInput', 'fileProgress', 'fileInfo',
            'fileEncryptBtn', 'fileDecryptBtn', 'filePreview', 'fileResult',
            'keyModal', 'newKeyName', 'newKeyValue',
            'saveKeyBtn', 'genKeyBtn', 'genSecureKeyBtn', 'keyList',
            'exportKeysBtn', 'importKeysBtn', 'importFile',
            'closeKeyModalBtn', 'alphabetTable', 'charsetCount',
            'historyList', 'historyCount', 'clearHistoryBtn',
            'toast', 'themeToggle', 'lockBtn',
            'lockOverlay', 'lockTitle', 'lockDesc',
            'masterPassInput', 'masterPassConfirm',
            'lockSubmitBtn', 'lockResetBtn', 'showPassChk', 'lockWarn'
        ];
        ids.forEach(id => this.el[id] = document.getElementById(id));
    },

    bindStatic() {
        this.el.lockSubmitBtn.onclick = () => this.handleLockSubmit();
        this.el.lockResetBtn.onclick = () => this.confirmReset();
        this.el.masterPassInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleLockSubmit();
        });
        this.el.masterPassConfirm.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleLockSubmit();
        });
        this.el.showPassChk.onchange = (e) => {
            const type = e.target.checked ? 'text' : 'password';
            this.el.masterPassInput.type = type;
            this.el.masterPassConfirm.type = type;
        };

        this.el.themeToggle.onclick = () => this.toggleTheme();
        this.el.lockBtn.onclick = () => this.lockNow();

        document.querySelectorAll('[data-page]').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                this.switchPage(link.dataset.page);
            };
        });

        this.el.inputText.addEventListener('input', () => {
            this.updateCharCount();
            this.saveDraft();
            this.autoMode ? this.handleAuto() : this.livePreview();
        });

        this.el.encryptBtn.onclick = () => this.doEncrypt();
        this.el.decryptBtn.onclick = () => this.doDecrypt();
        this.el.autoBtn.onclick = () => this.toggleAuto();
        this.el.clearBtn.onclick = () => this.clearAll();
        this.el.copyBtn.onclick = () => this.copyResult();
        this.el.swapBtn.onclick = () => this.swapToInput();
        this.el.shareBtn.onclick = () => this.shareResult();
        this.el.clearHistoryBtn.onclick = () => this.clearHistory();

        this.el.modeClassicBtn.onclick = () => this.setCryptoMode('classic');
        this.el.modeSecureBtn.onclick = () => this.setCryptoMode('secure');

        this.el.keySelect.onchange = (e) => {
            keyManager.setActive(e.target.value);
            this.refreshFileKeySelect();
            this.updateKeyStrength();
            this.updateAlphabetTable();
            this.livePreview();
        };

        this.el.fileModeClassicBtn.onclick = () => this.setFileCryptoMode('classic');
        this.el.fileModeSecureBtn.onclick = () => this.setFileCryptoMode('secure');

        this.el.fileKeySelect.onchange = (e) => {
            keyManager.setActive(e.target.value);
            this.refreshKeySelect();
            this.updateKeyStrength();
        };

        this.el.dropZone.onclick = () => this.el.fileInput.click();
        this.el.fileInput.onchange = (e) => this.loadFile(e.target.files[0]);
        this.el.fileEncryptBtn.onclick = () => this.processFile('encrypt');
        this.el.fileDecryptBtn.onclick = () => this.processFile('decrypt');

        this.el.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.el.dropZone.classList.add('dragover');
        });
        this.el.dropZone.addEventListener('dragleave', () => {
            this.el.dropZone.classList.remove('dragover');
        });
        this.el.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.el.dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) this.loadFile(file);
        });

        this.el.manageKeysBtn.onclick = () => this.openKeyModal();
        this.el.closeKeyModalBtn.onclick = () => this.closeKeyModal();
        this.el.saveKeyBtn.onclick = () => this.saveNewKey();
        this.el.genKeyBtn.onclick = () => this.generateRandomKey(false);
        this.el.genSecureKeyBtn.onclick = () => this.generateRandomKey(true);
        this.el.exportKeysBtn.onclick = () => this.exportKeys();
        this.el.importKeysBtn.onclick = () => this.el.importFile.click();
        this.el.importFile.onchange = (e) => this.importKeys(e);

        document.addEventListener('keydown', (e) => {
            const typingField = e.target.matches('input, textarea');
            if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); this.doEncrypt(); }
            if (e.ctrlKey && e.key === 'd' && !typingField) { e.preventDefault(); this.doDecrypt(); }
            if (e.key === 'l' && e.ctrlKey && e.shiftKey) { e.preventDefault(); this.lockNow(); }
            if (e.key === 'Escape') this.closeKeyModal();
        });
    },

    // === NAV & MODI ===

    switchPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-' + page).classList.add('active');
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        document.querySelector(`.nav-links a[data-page="${page}"]`)?.classList.add('active');
    },

    setCryptoMode(mode) {
        if (mode === 'secure' && !felianCrypto.secureAvailable()) {
            return this.toast(T('t_secure_http'), 'error');
        }
        this.cryptoMode = mode;
        this.el.modeClassicBtn.classList.toggle('active', mode === 'classic');
        this.el.modeSecureBtn.classList.toggle('active', mode === 'secure');
        this.livePreview();
    },

    setFileCryptoMode(mode) {
        if (mode === 'secure' && !felianCrypto.secureAvailable()) {
            return this.toast(T('t_secure_http'), 'error');
        }
        this.fileCryptoMode = mode;
        this.el.fileModeClassicBtn.classList.toggle('active', mode === 'classic');
        this.el.fileModeSecureBtn.classList.toggle('active', mode === 'secure');
    },

    checkSecureAvailability() {
        if (!felianCrypto.secureAvailable()) {
            this.el.modeSecureBtn.classList.add('disabled');
            this.el.fileModeSecureBtn.classList.add('disabled');
        }
    },

    effectiveMode(text) {
        if (felianCrypto.isSecureMessage(text)) return 'secure';
        return this.cryptoMode;
    },

    // === DATEI-HANDLING ===

    async loadFile(file) {
        if (!file) return;
        if (file.size > 1024 * 1024) {
            return this.toast(T('t_file_big'), 'error');
        }

        const text = await file.text();
        this.loadedFile = { name: file.name, text };

        this.el.fileInfo.textContent = Tf('f_info', file.name, (file.size / 1024).toFixed(1), text.length);
        this.el.filePreview.textContent =
            text.substring(0, 300) + (text.length > 300 ? '\n…' : '');
        this.el.fileProgress.classList.remove('hidden');
        this.toast(T('t_file_loaded'), 'success');
    },

    async processFile(direction) {
        if (!this.loadedFile) return this.toast(T('t_file_first'), 'error');
        const key = keyManager.getActiveValue();
        if (!key) return this.toast(T('t_no_key'), 'error');

        const { name, text } = this.loadedFile;
        const mode = direction === 'encrypt' ? this.fileCryptoMode
                   : (felianCrypto.isSecureMessage(text) ? 'secure' : 'classic');

        try {
            let result, downloadName;
            if (direction === 'encrypt') {
                result = await felianCrypto.encrypt(text, key, mode);
                downloadName = name.replace(/\.(txt|md|fel)$/i, '') + '.fel';
            } else {
                result = await felianCrypto.decrypt(text, key, mode);
                downloadName = name.replace(/\.fel$/i, '') + '.decrypted.txt';
            }

            this.downloadBlob(result, downloadName);
            const icon = mode === 'secure' ? '🛡️ ' + T('lbl_secure') : '🎭 ' + T('lbl_classic');
            this.el.fileResult.textContent = Tf('f_result',
                direction === 'encrypt' ? '🔒' : '🔓', icon, downloadName);
            this.el.fileResult.className = 'output-box live';
            this.toast(T('t_file_done'), 'success');
        } catch (e) {
            this.el.fileResult.textContent = '❌ ' + e.message;
            this.el.fileResult.className = 'output-box error';
        }
    },

    downloadBlob(text, filename) {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    // === TOOL-AKTIONEN ===

    async doEncrypt() {
        const text = this.el.inputText.value;
        const key = keyManager.getActiveValue();
        if (!text) return this.toast(T('t_no_text'), 'error');
        if (!key) return this.toast(T('t_no_key'), 'error');

        const mode = this.effectiveMode(text);
        try {
            const result = await felianCrypto.encrypt(text, key, mode);
            this.display(result);
            this.el.result.classList.toggle('secure', mode === 'secure');
            this.setModeHint(mode === 'secure'
                ? Tf('h_enc_sec', keyManager.active)
                : Tf('h_enc_cls', keyManager.active));
            this.addToHistory(text, result, 'encrypt', mode);
        } catch (e) { this.error(e.message); }
    },

    async doDecrypt() {
        const text = this.el.inputText.value;
        const key = keyManager.getActiveValue();
        if (!text) return this.toast(T('t_no_text'), 'error');
        if (!key) return this.toast(T('t_no_key'), 'error');

        const mode = this.effectiveMode(text);
        try {
            const result = await felianCrypto.decrypt(text, key, mode);
            this.display(result);
            const icon = mode === 'secure' ? '🛡️' : '🎭';
            this.setModeHint(Tf('h_dec', icon, keyManager.active));
            this.addToHistory(text, result, 'decrypt', mode);
        } catch (e) { this.error(e.message); }
    },

    async handleAuto() {
        const text = this.el.inputText.value;
        const mode = felianCrypto.detectMode(text);
        const key = keyManager.getActiveValue();
        if (!mode || !key) return;
        try {
            const eff = this.effectiveMode(text);
            const result = mode === 'encrypt'
                ? await felianCrypto.encrypt(text, key, this.cryptoMode)
                : await felianCrypto.decrypt(text, key, eff);
            this.display(result);
            this.setModeHint(Tf('h_auto',
                mode === 'encrypt' ? '🔒' : '🔓',
                eff === 'secure' ? T('lbl_secure') : T('lbl_classic')));
        } catch (e) { this.error(e.message); }
    },

    toggleAuto() {
        this.autoMode = !this.autoMode;
        this.el.autoBtn.classList.toggle('active', this.autoMode);
        if (this.autoMode) this.handleAuto();
    },

    livePreview() {
        const text = this.el.inputText.value;
        const key = keyManager.getActiveValue();

        if (!text || !key) {
            this.el.result.textContent = T('output_ph');
            this.el.result.className = 'output-box';
            this.setModeHint(null);
            return;
        }
        if (this.cryptoMode === 'secure') {
            this.el.result.className = 'output-box live';
            this.el.result.textContent = T('h_secure_preview');
            this.setModeHint(T('h_secure_hint'));
            return;
        }
        try {
            const preview = felianCrypto.encryptClassic(text.substring(0, 100), key);
            this.el.result.textContent = preview + (text.length > 100 ? '…' : '');
            this.el.result.className = 'output-box live';
            this.setModeHint(T('h_preview'));
        } catch {}
    },

    display(text) {
        this.el.result.textContent = text;
        this.el.result.className = 'output-box';
    },

    error(msg) {
        this.el.result.textContent = '❌ ' + msg;
        this.el.result.className = 'output-box error';
    },

    setModeHint(text) {
        if (!text) { this.el.modeHint.classList.add('hidden'); return; }
        this.el.modeHint.textContent = text;
        this.el.modeHint.classList.remove('hidden');
    },

    // === SHARE LINKS ===

    shareResult() {
        const text = this.el.result.textContent;
        if (!text || text.includes('Ausgabe') || text.includes('here…') || text.includes('❌') || text.includes('🔒')) {
            return this.toast(T('t_no_output'), 'error');
        }
        if (!keyManager.active) return this.toast(T('t_share_need_key'), 'error');

        const encoded = btoa(unescape(encodeURIComponent(text)));
        const baseUrl = location.href.split('#')[0];
        const expiry = this.el.expirySelect.value;

        let url = `${baseUrl}#msg=${encoded}&key=${encodeURIComponent(keyManager.active)}`;
        if (expiry) url += `&exp=${Date.now() + parseInt(expiry, 10) * 1000}`;

        navigator.clipboard.writeText(url).then(() => {
            const modeTag = felianCrypto.isSecureMessage(text) ? '🛡️' : '🎭';
            let expTag = '';
            if (expiry) {
                const h = expiry / 3600;
                expTag = h >= 1 ? Tf('t_exp_h', h) : Tf('t_exp_min', expiry / 60);
            }
            this.toast(Tf('t_link_copied', modeTag + expTag), 'success');
        }).catch(() => this.toast(T('t_copy_fail'), 'error'));
    },

    async loadIncomingShareLink() {
        const hash = location.hash;
        if (!hash.startsWith('#msg=')) return;
        try {
            const params = new URLSearchParams(hash.slice(1));
            const encoded = params.get('msg');
            const keyName = params.get('key');
            const exp = params.get('exp');
            if (!encoded) return;

            if (exp && Date.now() > parseInt(exp, 10)) {
                this.el.inputText.value = decodeURIComponent(escape(atob(encoded)));
                this.updateCharCount();
                this.error(T('t_expired'));
                history.replaceState(null, '', location.pathname + location.search);
                return;
            }

            const text = decodeURIComponent(escape(atob(encoded)));
            this.el.inputText.value = text;

            if (keyName && keyManager.get(keyName)) {
                keyManager.setActive(keyName);
                this.refreshKeySelect();
                this.refreshFileKeySelect();
                this.updateKeyStrength();
                try {
                    const result = await felianCrypto.decrypt(text, keyManager.getActiveValue(), 'auto');
                    this.display(result);
                    const tag = felianCrypto.isSecureMessage(text) ? T('lbl_secure') : T('lbl_classic');
                    this.setModeHint(Tf('h_share_link', keyName, tag));
                    this.toast(T('t_share_link_ok'), 'success');
                } catch (e) { this.error(e.message); }
            } else {
                this.toast(Tf('t_share_need_keyname', keyName), 'error');
            }
            history.replaceState(null, '', location.pathname + location.search);
        } catch { /* defekter Hash */ }
    },

    // === DRAFT & HISTORY ===

    saveDraft() {
        keyManager.blobSave(this.DRAFT_KEY, this.el.inputText.value).catch(() => {});
    },

    async loadDraft() {
        const draft = await keyManager.blobLoad(this.DRAFT_KEY);
        if (draft) {
            this.el.inputText.value = draft;
            this.updateCharCount();
        }
    },

    async addToHistory(input, output, type, mode = 'classic') {
        let history = [];
        try { history = JSON.parse(await keyManager.blobLoad(this.HISTORY_KEY) || '[]'); } catch {}
        history.unshift({
            type, mode,
            input: input.substring(0, 120),
            output: output.substring(0, 120),
            keyName: keyManager.active,
            time: new Date().toLocaleTimeString(I18N.lang === 'en' ? 'en-US' : 'de-DE')
        });
        history = history.slice(0, this.HISTORY_MAX);
        await keyManager.blobSave(this.HISTORY_KEY, JSON.stringify(history));
        this.renderHistory();
    },

    async renderHistory() {
        let history = [];
        try { history = JSON.parse(await keyManager.blobLoad(this.HISTORY_KEY) || '[]'); } catch {}

        this.el.historyCount.textContent = history.length || '';
        this.el.historyList.innerHTML = '';

        if (!history.length) {
            const p = document.createElement('p');
            p.className = 'placeholder';
            p.style.fontSize = '0.85rem';
            p.textContent = T('history_empty');
            this.el.historyList.appendChild(p);
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';

            const meta = document.createElement('div');
            meta.className = 'history-meta';

            const act = document.createElement('span');
            act.className = 'history-action ' + item.type;
            act.textContent = item.type === 'encrypt' ? '🔒' : '🔓';
            meta.appendChild(act);

            const modeIcon = document.createElement('span');
            modeIcon.textContent = item.mode === 'secure' ? '🛡️' : '🎭';
            meta.appendChild(modeIcon);

            const time = document.createElement('span');
            time.textContent = item.time;
            meta.appendChild(time);

            if (item.keyName) {
                const kn = document.createElement('span');
                kn.className = 'history-key';
                kn.textContent = '🔑 ' + item.keyName;
                meta.appendChild(kn);
            }

            const txt = document.createElement('div');
            txt.className = 'history-text';
            txt.textContent = item.output;

            div.appendChild(meta);
            div.appendChild(txt);
            div.onclick = () => {
                this.el.inputText.value = item.output;
                this.updateCharCount();
                this.saveDraft();
                this.livePreview();
            };
            this.el.historyList.appendChild(div);
        });
    },

    async clearHistory() {
        localStorage.removeItem(this.HISTORY_KEY);
        this.renderHistory();
        this.toast(T('t_hist_clear'), 'success');
    },

    // === HELPERS ===

    updateCharCount() {
        this.el.charCount.textContent = Tf('char_count', this.el.inputText.value.length);
    },

    updateKeyStrength() {
        const key = keyManager.getActiveValue();
        const s = felianCrypto.keyStrength(key);
        const label = key ? Tf('strength', s.label) : '';
        this.el.keyStrength.textContent = label;
        this.el.fileKeyStrength.textContent = label;
        this.el.keyStrength.dataset.level = s.level;
        this.el.fileKeyStrength.dataset.level = s.level;
    },

    clearAll() {
        this.el.inputText.value = '';
        this.el.result.textContent = T('output_ph');
        this.el.result.className = 'output-box';
        this.updateCharCount();
        this.saveDraft();
        this.setModeHint(null);
    },

    async copyResult() {
        const text = this.el.result.textContent;
        if (!text || text.includes('Ausgabe') || text.includes('here…') || text.includes('❌') || text.includes('🔒')) {
            return this.toast(T('t_nothing_copy'), 'error');
        }
        try { await navigator.clipboard.writeText(text); this.toast(T('t_copied'), 'success'); }
        catch { this.toast(T('t_copy_fail'), 'error'); }
    },

    swapToInput() {
        const text = this.el.result.textContent;
        if (!text || text.includes('Ausgabe') || text.includes('here…') || text.includes('❌') || text.includes('🔒')) return;
        this.el.inputText.value = text;
        this.updateCharCount();
        this.saveDraft();
        this.livePreview();
    },

    // === KEY MODAL ===

    openKeyModal() {
        if (!keyManager.isUnlocked()) return this.toast(T('t_lock_first'), 'error');
        this.renderKeyList();
        this.el.keyModal.classList.remove('hidden');
    },

    closeKeyModal() {
        this.el.keyModal.classList.add('hidden');
    },

    saveNewKey() {
        try {
            keyManager.save(this.el.newKeyName.value, this.el.newKeyValue.value);
            this.el.newKeyName.value = '';
            this.el.newKeyValue.value = '';
            this.renderKeyList();
            this.refreshKeySelect();
            this.refreshFileKeySelect();
            this.toast(T('t_saved'), 'success');
        } catch (e) { this.toast(e.message, 'error'); }
    },

    generateRandomKey(secure) {
        this.el.newKeyValue.value = secure
            ? felianCrypto.generateSecureKey(24)
            : felianCrypto.generateKey(16);
        this.toast(secure ? T('t_strong_key') : T('t_random_key'), 'success');
    },

    renderKeyList() {
        const keys = keyManager.getAll();
        this.el.keyList.innerHTML = '';

        if (!Object.keys(keys).length) {
            const li = document.createElement('li');
            li.style.opacity = '0.5';
            li.textContent = T('km_no_keys');
            this.el.keyList.appendChild(li);
            return;
        }

        for (const [name, key] of Object.entries(keys)) {
            const li = document.createElement('li');
            if (keyManager.active === name) li.className = 'active';

            const info = document.createElement('div');
            info.className = 'key-info';
            const strong = document.createElement('strong');
            strong.textContent = name;
            const small = document.createElement('small');
            small.textContent = '•'.repeat(Math.min(String(key).length, 12));
            info.appendChild(strong);
            info.appendChild(small);

            const actions = document.createElement('div');
            actions.className = 'key-actions';

            const btnA = document.createElement('button');
            btnA.className = 'icon-btn';
            btnA.title = '✅';
            btnA.textContent = '✅';
            btnA.onclick = () => {
                keyManager.setActive(name);
                this.renderKeyList();
                this.refreshKeySelect();
                this.refreshFileKeySelect();
                this.updateKeyStrength();
                this.updateAlphabetTable();
                this.livePreview();
            };

            const btnD = document.createElement('button');
            btnD.className = 'icon-btn';
            btnD.title = '🗑️';
            btnD.textContent = '🗑️';
            btnD.onclick = () => {
                keyManager.delete(name);
                this.renderKeyList();
                this.refreshKeySelect();
                this.refreshFileKeySelect();
                this.updateKeyStrength();
                this.updateAlphabetTable();
                this.livePreview();
            };

            actions.appendChild(btnA);
            actions.appendChild(btnD);
            li.appendChild(info);
            li.appendChild(actions);
            this.el.keyList.appendChild(li);
        }
    },

    _fillKeySelect(select) {
        const keys = keyManager.getAll();
        select.innerHTML = `<option value="">${T('key_choose')}</option>`;
        for (const name of Object.keys(keys)) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            if (name === keyManager.active) opt.selected = true;
            select.appendChild(opt);
        }
    },

    refreshKeySelect() { this._fillKeySelect(this.el.keySelect); },
    refreshFileKeySelect() { this._fillKeySelect(this.el.fileKeySelect); },

    exportKeys() {
        const blob = new Blob([keyManager.export()], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'felianisch_keys.json';
        a.click();
        URL.revokeObjectURL(url);
        this.toast(T('t_exported'), 'success');
    },

    importKeys(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                keyManager.import(ev.target.result);
                this.renderKeyList();
                this.refreshKeySelect();
                this.refreshFileKeySelect();
                this.toast(T('t_imported'), 'success');
            } catch { this.toast(T('t_import_fail'), 'error'); }
        };
        reader.readAsText(file);
        e.target.value = '';
    },

    // === ALPHABET TABLE ===

    renderAlphabetTable() {
        const t = this.el.alphabetTable;
        t.innerHTML = '';

        const hr = t.insertRow();
        [T('col_char'), T('col_fel'), T('col_ex')].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            hr.appendChild(th);
        });

        const categories = [
            [T('cat_letters'), FELIAN_ALPHABET],
            [T('cat_umlaute'), FELIAN_UMLAUT],
            [T('cat_digits'), FELIAN_DIGITS],
            [T('cat_special'), FELIAN_SPECIAL]
        ];

        for (const [label, map] of categories) {
            this._addCategoryRow(t, label);
            for (const [original, rune] of Object.entries(map)) {
                this._addSymbolRow(t, original, rune);
            }
        }
    },

    _addCategoryRow(table, label) {
        const row = table.insertRow();
        row.style.background = 'var(--accent-dim)';
        row.style.fontWeight = 'bold';
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.textContent = label;
        cell.style.textAlign = 'center';
    },

    _addSymbolRow(table, original, rune) {
        const row = table.insertRow();
        row.insertCell().textContent = original;
        row.insertCell().textContent = rune;
        const td3 = row.insertCell();
        td3.className = 'key-cell';
        td3.dataset.original = original;
        td3.textContent = '—';
    },

    updateAlphabetTable() {
        const key = keyManager.getActiveValue();
        document.querySelectorAll('.key-cell').forEach(cell => {
            const original = cell.dataset.original;
            if (!key) { cell.textContent = '—'; cell.style.color = ''; return; }
            try {
                const rng = felianCrypto._makeRng(key, 'abcd');
                const ci = FELIAN_CHARSET.indexOf(original);
                if (ci === -1) { cell.textContent = '—'; return; }
                cell.textContent = FELIAN_SYMBOLS[(ci + rng()) % FELIAN_CHARSET.length];
                cell.style.color = 'var(--success)';
            } catch { cell.textContent = '?'; }
        });
    },

    // === TOAST & THEME ===

    toast(msg, type = '') {
        const t = this.el.toast;
        t.textContent = msg;
        t.className = `toast ${type}`;
        t.classList.remove('hidden');
        clearTimeout(this._tt);
        this._tt = setTimeout(() => t.classList.add('hidden'), 3500);
    },

    toggleTheme() {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('felian_theme', next);
        this.el.themeToggle.textContent = next === 'light' ? '☀️' : '🌙';
    },

    loadTheme() {
        const saved = localStorage.getItem('felian_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        this.el.themeToggle.textContent = saved === 'light' ? '☀️' : '🌙';
    }
};
