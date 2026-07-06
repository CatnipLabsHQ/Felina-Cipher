// ====================================================================
//  FELINA-CIPHER v4.1 — init.js
//  Tabellenbau, URL-Hash-Load, window.onload-Startup
// ====================================================================

// ===== BUILD TABLES =====
function buildTables() {
    const lt = document.getElementById('letterTable');
    lt.innerHTML = '<tr><th>Zeichen</th><th>Katzen-Code</th></tr>';

    lt.innerHTML += '<tr class="section-divider"><td colspan="2">🇩🇪 Umlaute (Ä Ö Ü ß)</td></tr>';
    Object.entries(felinaUmlauts).forEach(([k, v]) => {
        lt.innerHTML += `<tr><td><strong>${k.toUpperCase()}</strong> / ${k}</td><td><code>${v}</code></td></tr>`;
    });

    lt.innerHTML += '<tr class="section-divider"><td colspan="2">🌍 International (FR ES IT NO PL CZ HU PT)</td></tr>';
    Object.entries(felinaIntl).forEach(([k, v]) => {
        lt.innerHTML += `<tr><td><strong>${k}</strong></td><td><code>${v}</code></td></tr>`;
    });

    lt.innerHTML += '<tr class="section-divider"><td colspan="2">📖 A–Z Standard</td></tr>';
    Object.entries(felinaLetters).sort().forEach(([k, v]) => {
        lt.innerHTML += `<tr><td><strong>${k.toUpperCase()}</strong> / ${k}</td><td><code>${v}</code></td></tr>`;
    });

    const nt = document.getElementById('numberTable');
    nt.innerHTML = '<tr><th>Zeichen</th><th>Katzen-Code</th></tr>';

    nt.innerHTML += '<tr class="section-divider"><td colspan="2">🔢 Zahlen (0–9)</td></tr>';
    Object.entries(felinaNumbers).forEach(([k, v]) => {
        nt.innerHTML += `<tr><td><strong>${k}</strong></td><td><code>${v}</code></td></tr>`;
    });

    nt.innerHTML += '<tr class="section-divider"><td colspan="2">✨ Sonderzeichen</td></tr>';
    Object.entries(felinaSpecial).forEach(([k, v]) => {
        const disp = k === ' ' ? '␣ (Leerz.)' : escapeHtml(k);
        nt.innerHTML += `<tr><td><strong>${disp}</strong></td><td><code>${v}</code></td></tr>`;
    });
}

// ===== URL HASH LOAD =====
function loadFromHash() {
    const hash = location.hash;
    if (hash.startsWith('#f=')) {
        try {
            const b64 = hash.substring(3);
            const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            const decoded = new TextDecoder().decode(bytes);
            document.getElementById('inputText').value = decoded;
            updateCounter();
            handleLivePreview();
        } catch (e) {
            console.warn('Failed to load from hash:', e);
        }
    }
}

// ===== INIT =====
window.onload = () => {
    loadSettings();
    buildTables();
    renderHistory();
    renderCustomList();
    setupDragDrop();
    restoreTheme();
    updateCounter();
    loadFromHash();
};
