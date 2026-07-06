// ====================================================================
//  FELINA-CIPHER v4.1 — features.js
//  Sound, Custom Codes, Export/Import, Challenge, QR, Settings
// ====================================================================

// ===== SOUND =====
let audioCtx = null;
function toggleSound() {
    if (document.getElementById('soundEnabled').checked && !audioCtx)
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    saveSettings();
}
function playMeow() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now); osc.stop(now + 0.4);
}

// ===== CUSTOM CODES =====
function addCustomCode() {
    const char = document.getElementById('customChar').value.toLowerCase();
    const code = document.getElementById('customCode').value.trim();
    if (!char || !code) return;
    const sep = document.getElementById('separatorSelect').value;
    if (code.includes(sep.trim())) {
        flashMessage('⚠️ Code darf nicht den Separator enthalten!', 'error');
        return;
    }
    customOverrides[char] = code;
    workingMaps[char] = code;
    markReverseMapDirty();
    document.getElementById('customChar').value = '';
    document.getElementById('customCode').value = '';
    renderCustomList();
    handleLivePreview();
    saveSettings();
}
function removeCustomCode(char) {
    delete customOverrides[char];
    workingMaps[char] = baseMaps[char] || workingMaps[char];
    if (!baseMaps[char]) delete workingMaps[char];
    markReverseMapDirty();
    renderCustomList();
    handleLivePreview();
    saveSettings();
}
function resetCustomCodes() {
    customOverrides = {};
    workingMaps = { ...baseMaps };
    markReverseMapDirty();
    renderCustomList();
    handleLivePreview();
    saveSettings();
}
function renderCustomList() {
    const list = document.getElementById('customList');
    const entries = Object.entries(customOverrides);
    if (!entries.length) {
        list.innerHTML = '<p style="color:var(--subtle);font-size:13px;">Keine eigenen Codes definiert.</p>';
        return;
    }
    list.innerHTML = entries.map(([char, code]) =>
        `<div class="custom-item"><strong>${escapeHtml(char)}</strong> → <code>${escapeHtml(code)}</code> <button onclick="removeCustomCode('${char.replace(/'/g,"\\'")}')">✕</button></div>`
    ).join('');
}

// ===== EXPORT / IMPORT CONFIG =====
function exportConfig() {
    const config = {
        version: '4.1',
        customCodes: customOverrides,
        settings: getSettings()
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'felina-cipher-config.json';
    a.click(); URL.revokeObjectURL(a.href);
}
function importConfig(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            const config = JSON.parse(ev.target.result);
            if (config.customCodes) {
                customOverrides = config.customCodes;
                Object.entries(customOverrides).forEach(([k,v]) => { workingMaps[k] = v; });
                markReverseMapDirty();
                renderCustomList();
            }
            if (config.settings) {
                applySettings(config.settings);
                handleLivePreview();
            }
            flashMessage('✅ Konfiguration importiert!', 'success');
        } catch(e) {
            flashMessage('❌ Fehler beim Importieren: ungültiges JSON!', 'error');
        }
    };
    reader.readAsText(file);
}

// ===== SETTINGS PERSISTENCE =====
function getSettings() {
    return {
        separator: document.getElementById('separatorSelect').value,
        preserveCase: document.getElementById('preserveCase').checked,
        emojiMode: document.getElementById('emojiMode').checked,
        layers: document.getElementById('layerCount').value,
        livePreview: document.getElementById('livePreview').checked,
        sound: document.getElementById('soundEnabled').checked,
        lang: currentLang
    };
}
function applySettings(s) {
    if (s.separator) document.getElementById('separatorSelect').value = s.separator;
    if (s.preserveCase !== undefined) document.getElementById('preserveCase').checked = s.preserveCase;
    if (s.emojiMode !== undefined) document.getElementById('emojiMode').checked = s.emojiMode;
    if (s.layers) document.getElementById('layerCount').value = s.layers;
    if (s.livePreview !== undefined) document.getElementById('livePreview').checked = s.livePreview;
    if (s.sound !== undefined) document.getElementById('soundEnabled').checked = s.sound;
}
function saveSettings() {
    try {
        localStorage.setItem('felinaSettings', JSON.stringify(getSettings()));
        localStorage.setItem('felinaCustomCodes', JSON.stringify(customOverrides));
    } catch(e) {}
}
function loadSettings() {
    try {
        const raw = localStorage.getItem('felinaSettings');
        if (raw) applySettings(JSON.parse(raw));
        const ccRaw = localStorage.getItem('felinaCustomCodes');
        if (ccRaw) {
            customOverrides = JSON.parse(ccRaw);
            Object.entries(customOverrides).forEach(([k,v]) => { workingMaps[k] = v; });
            markReverseMapDirty();
        }
    } catch(e) {}
}

// ===== CHALLENGE MODE =====
let challengeData = null;
let challengeStats = { score: 0, solved: 0, fails: 0 };

function newChallenge() {
    const words = ['katze','kitten','miau','pfote','schwanz','schnurren','maus','milch','kralle','fell',
                  'ohren','augen','zunge','schlaf','jagd','karte','baum','wolle','spiel','leckerli',
                  'henry','lumo','garten','fenster','kissen'];
    const word = words[Math.floor(Math.random() * words.length)];
    const numWords = Math.floor(Math.random() * 3) + 1;
    const chars = (word + ' ').repeat(numWords).trim();

    let parts = [];
    for (let char of chars) {
        const lower = char.toLowerCase();
        if (baseMaps[lower]) {
            parts.push(baseMaps[lower]);
        } else {
            parts.push(`{${char}}`);
        }
    }
    const encrypted = parts.join(' • ');
    challengeData = { original: chars, encrypted: encrypted };
    document.getElementById('challengeCode').textContent = encrypted;
    document.getElementById('challengeAnswer').value = '';
    document.getElementById('challengeFeedback').innerHTML = '';
}
function checkChallenge() {
    if (!challengeData) { newChallenge(); return; }
    const answer = document.getElementById('challengeAnswer').value.trim().toLowerCase();
    const correct = challengeData.original.toLowerCase();
    const fb = document.getElementById('challengeFeedback');
    if (answer === correct) {
        challengeStats.score += 10;
        challengeStats.solved++;
        fb.innerHTML = `<span class="success-text">✅ Richtig! +10 Punkte 🎉</span>`;
        playMeow();
        setTimeout(() => newChallenge(), 2000);
    } else {
        challengeStats.fails++;
        fb.innerHTML = `<span class="error-text">❌ Falsch! Versuche es nochmal.</span>`;
    }
    document.getElementById('challengeScore').textContent = challengeStats.score;
    document.getElementById('challengeSolved').textContent = challengeStats.solved;
    document.getElementById('challengeFails').textContent = challengeStats.fails;
}
function revealChallenge() {
    if (!challengeData) return;
    document.getElementById('challengeFeedback').innerHTML =
        `<span class="warning-text">👁️ Lösung: <code>${escapeHtml(challengeData.original)}</code></span>`;
}

// ===== QR CODE =====
function showQR() {
    let text = lastOutputPlain || '';
    if (!text || text.includes('Das Ergebnis erscheint') || text.includes('Results will appear')) {
        flashMessage('⚠️ Kein Text für QR-Code!', 'error'); return;
    }

    const modal = document.getElementById('qrModal');
    const img = document.getElementById('qrImage');
    const loading = document.getElementById('qrLoading');
    const textEl = document.getElementById('qrText');

    img.style.display = 'none';
    loading.style.display = 'block';
    loading.textContent = '⏳ Generiere QR-Code...';
    textEl.textContent = text.substring(0, 100) + (text.length > 100 ? '...' : '');

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(text)}`;
    img.onload = () => {
        img.style.display = 'block';
        loading.style.display = 'none';
    };
    img.onerror = () => {
        loading.textContent = '⚠️ QR-Code konnte nicht generiert werden!';
    };
    img.src = qrUrl;
    modal.classList.add('active');
}
function closeQR(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('qrModal').classList.remove('active');
}
function downloadQR() {
    const img = document.getElementById('qrImage');
    if (!img.src) return;
    const a = document.createElement('a');
    a.href = img.src;
    a.download = 'felina-cipher-qr.png';
    a.click();
}
