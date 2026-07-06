// ====================================================================
//  FELINA-CIPHER v4.1 — ui-controls.js
//  I18N, Tabs, Theme, Button-Aktionen, History, Drag&Drop, Shortcuts
// ====================================================================

// ===== I18N =====
const i18n = {
    de: {
        subtitle: "Katzen-basierte Verschlüsselung · QR · Multi-Layer · Custom Codes · Challenge",
        tab_cipher: "🔐 Verschlüsseln", tab_custom: "🎨 Custom Codes", tab_challenge: "🎮 Challenge",
        tab_codex: "📚 Codex", tab_history: "📜 Verlauf", tab_about: "ℹ️ Info",
        input_label: "🔤 Eingabetext:", live_preview: "Live-Vorschau", case_preserve: "Groß-/Kleinschreibung",
        emoji_mode: "Emoji-Modus", sounds: "Geräusche", layers: "Layer",
        encrypt: "🔒 Verschlüsseln", decrypt: "🔓 Entschlüsseln", swap: "🔄 Swap",
        copy: "📋 Kopieren", qr: "📱 QR-Code", download: "💾 Download", share: "🔗 Teilen", clear: "🗑️ Löschen",
        result: "📝 Ergebnis:", result_placeholder: "Das Ergebnis erscheint hier...",
        custom_title: "🎨 Eigene Katzen-Codes definieren",
        custom_desc: "Überschreibe bestehende Codes oder füge neue hinzu.",
        challenge_title: "🎮 Challenge-Modus",
        challenge_desc: "Ein zufälliger Katzen-Code wird generiert. Kannst du ihn entschlüsseln?",
        challenge_score: "Punkte",
        letters_table: "📖 Buchstaben & Umlaute",
        numbers_table: "🔢 Zahlen & Sonderzeichen",
        history_title: "📜 Letzte Konvertierungen", clear_history: "🗑️ Alle löschen",
        about_desc: "Die ultimative katzenbasierte Verschlüsselungsmethode."
    },
    en: {
        subtitle: "Cat-based encryption · QR · Multi-Layer · Custom Codes · Challenge",
        tab_cipher: "🔐 Encrypt", tab_custom: "🎨 Custom Codes", tab_challenge: "🎮 Challenge",
        tab_codex: "📚 Codex", tab_history: "📜 History", tab_about: "ℹ️ About",
        input_label: "🔤 Input text:", live_preview: "Live Preview", case_preserve: "Case sensitivity",
        emoji_mode: "Emoji Mode", sounds: "Sounds", layers: "Layers",
        encrypt: "🔒 Encrypt", decrypt: "🔓 Decrypt", swap: "🔄 Swap",
        copy: "📋 Copy", qr: "📱 QR Code", download: "💾 Download", share: "🔗 Share", clear: "🗑️ Clear",
        result: "📝 Result:", result_placeholder: "Results will appear here...",
        custom_title: "🎨 Define your own cat codes",
        custom_desc: "Override existing codes or add new ones.",
        challenge_title: "🎮 Challenge Mode",
        challenge_desc: "A random cat code is generated. Can you decrypt it?",
        challenge_score: "Score",
        letters_table: "📖 Letters & Umlauts",
        numbers_table: "🔢 Numbers & Special chars",
        history_title: "📜 Recent conversions", clear_history: "🗑️ Clear all",
        about_desc: "The ultimate cat-based encryption method."
    }
};
let currentLang = 'de';

function toggleLang() {
    currentLang = currentLang === 'de' ? 'en' : 'de';
    document.getElementById('langBtn').textContent = currentLang === 'de' ? '🇬🇧 EN' : '🇩🇪 DE';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) el.textContent = i18n[currentLang][key];
    });
    const ph = document.getElementById('inputText');
    ph.placeholder = currentLang === 'de' ? 'Gib hier deinen Text ein...' : 'Enter your text here...';
    const ob = document.getElementById('outputBox');
    if (ob.textContent.includes('Das Ergebnis erscheint') || ob.textContent.includes('Results will appear')) {
        ob.textContent = i18n[currentLang].result_placeholder;
    }
    saveSettings();
}

// ===== THEME =====
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('themeBtn');
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme'); btn.textContent = '🌙';
        localStorage.setItem('felinaTheme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark'); btn.textContent = '☀️';
        localStorage.setItem('felinaTheme', 'dark');
    }
}
function restoreTheme() {
    const saved = localStorage.getItem('felinaTheme');
    if (saved === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeBtn').textContent = '☀️';
    }
}

// ===== TABS =====
function switchTab(evt, name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    if (evt && evt.target) {
        evt.target.classList.add('active');
    } else {
        const tabs = document.querySelectorAll('.tab');
        const tabMap = {'main':0,'custom':1,'challenge':2,'codex':3,'history':4,'about':5};
        const idx = tabMap[name];
        if (idx !== undefined && tabs[idx]) tabs[idx].classList.add('active');
    }
    document.getElementById('tab-' + name).classList.add('active');
    if (name === 'history') renderHistory();
    if (name === 'custom') renderCustomList();
}

// ===== TABLE SEARCH =====
function filterTable() {
    const q = document.getElementById('tableSearch').value.toLowerCase();
    document.querySelectorAll('#letterTable tr, #numberTable tr').forEach(row => {
        if (row.classList.contains('section-divider') || row.querySelector('th')) return;
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

// ===== BUTTON ACTIONS =====
function copyResult() {
    let text = lastOutputPlain || '';
    if (!text || text.includes('Das Ergebnis erscheint') || text.includes('Results will appear')) {
        flashMessage('⚠️ Nichts zum Kopieren!', 'error'); return;
    }
    navigator.clipboard.writeText(text).then(() => flashMessage('📋 Kopiert!', 'success'))
        .catch(() => {
            const ta = document.createElement('textarea'); ta.value = text;
            document.body.appendChild(ta); ta.select();
            document.execCommand('copy'); document.body.removeChild(ta);
            flashMessage('📋 Kopiert!', 'success');
        });
}
function swapToInput() {
    let text = lastOutputPlain || '';
    if (!text || text.includes('Das Ergebnis erscheint') || text.includes('Results will appear')) {
        flashMessage('⚠️ Kein Ergebnis!', 'error'); return;
    }
    document.getElementById('inputText').value = text;
    updateCounter(); handleLivePreview();
    flashMessage('🔄 Übertragen!', 'success');
}
function downloadResult() {
    let text = lastOutputPlain || '';
    if (!text || text.includes('Das Ergebnis erscheint') || text.includes('Results will appear')) {
        flashMessage('⚠️ Nichts zum Download!', 'error'); return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'felina-cipher-v4.txt';
    a.click(); URL.revokeObjectURL(a.href);
    flashMessage('💾 Heruntergeladen!', 'success');
}
function shareURL() {
    const input = document.getElementById('inputText').value;
    if (!input) { flashMessage('⚠️ Leere Eingabe!', 'error'); return; }
    const encoded = btoa(String.fromCharCode(...new TextEncoder().encode(input)));
    const url = `${location.origin}${location.pathname}#f=${encoded}`;
    navigator.clipboard.writeText(url).then(() => flashMessage('🔗 Link kopiert!', 'success'))
        .catch(() => { console.log(url); flashMessage('🔗 Siehe Konsole!', 'success'); });
}
function flashMessage(msg, type) {
    const box = document.getElementById('outputBox');
    box.innerHTML = `<span class="${type === 'success' ? 'success-text' : 'error-text'}">${msg}</span>`;
    setTimeout(() => { if (lastOutputHTML) box.innerHTML = lastOutputHTML; else handleLivePreview(); }, 1500);
}
function clearAll() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputBox').innerHTML = i18n[currentLang].result_placeholder;
    document.getElementById('statsBar').innerHTML = '';
    document.getElementById('freqChart').innerHTML = '';
    document.getElementById('layerIndicator').innerHTML = '';
    document.getElementById('secretKey').value = '';
    document.getElementById('strengthFill').style.width = '0%';
    lastOutputHTML = '';
    lastOutputPlain = '';
    updateCounter();
    document.getElementById('inputText').focus();
}

// ===== HISTORY =====
function saveHistory(input, output, type) {
    let hist = JSON.parse(localStorage.getItem('felinaHistory') || '[]');
    hist.unshift({ input: input.substring(0, 80), output: output.substring(0, 80), type, time: new Date().toLocaleTimeString('de-DE') });
    hist = hist.slice(0, 10);
    localStorage.setItem('felinaHistory', JSON.stringify(hist));
    renderHistory();
}
function renderHistory() {
    const list = document.getElementById('historyList');
    const hist = JSON.parse(localStorage.getItem('felinaHistory') || '[]');
    if (!hist.length) { list.innerHTML = '<div class="history-empty">🐾 Noch keine Konvertierungen!</div>'; return; }
    list.innerHTML = hist.map((h, i) => `
        <div class="history-item" onclick="loadHistoryItem(${i})">
            <div>
                <div class="history-text"><strong>${h.type === 'encrypt' ? '🔒' : '🔓'}</strong> ${escapeHtml(h.output)}</div>
                <div class="history-meta">${h.time} · ${h.type === 'encrypt' ? 'Verschlüsselt' : 'Entschlüsselt'}</div>
            </div>
            <button class="history-delete" onclick="event.stopPropagation(); deleteHistoryItem(${i})">✕</button>
        </div>
    `).join('');
}
function loadHistoryItem(i) {
    const hist = JSON.parse(localStorage.getItem('felinaHistory') || '[]');
    if (!hist[i]) return;
    document.getElementById('inputText').value = hist[i].input;
    updateCounter();
    const mainTab = document.querySelector('.tab[data-i18n="tab_cipher"], .tab');
    if (mainTab) switchTab(null, 'main');
    handleLivePreview();
}
function deleteHistoryItem(i) {
    let hist = JSON.parse(localStorage.getItem('felinaHistory') || '[]');
    hist.splice(i, 1);
    localStorage.setItem('felinaHistory', JSON.stringify(hist));
    renderHistory();
}
function clearHistory() {
    localStorage.removeItem('felinaHistory');
    renderHistory();
}

// ===== DRAG & DROP =====
function setupDragDrop() {
    const ta = document.getElementById('inputText');
    ta.addEventListener('dragover', e => { e.preventDefault(); ta.classList.add('drag-over'); });
    ta.addEventListener('dragleave', () => ta.classList.remove('drag-over'));
    ta.addEventListener('drop', e => {
        e.preventDefault(); ta.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = ev => {
                ta.value = ev.target.result;
                updateCounter(); handleLivePreview();
            };
            reader.readAsText(file);
            flashMessage('📁 Datei geladen!', 'success');
        } else { flashMessage('⚠️ Nur .txt-Dateien!', 'error'); }
    });
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            e.shiftKey ? decrypt() : encrypt();
        }
    } else {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            e.shiftKey ? decrypt() : encrypt();
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'l') {
            e.preventDefault(); clearAll();
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'q') {
            e.preventDefault(); showQR();
        }
    }
});
