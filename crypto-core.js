// ====================================================================
//  FELINA-CIPHER v4.1 — crypto-core.js
//  Secret-Key, Encrypt/Decrypt, Live-Vorschau, Output-Rendering
// ====================================================================

// ===== SECRET KEY =====
function getKeyShift(key) {
    if (!key || key.length === 0) return 0;
    let s = 0; for (let c of key) s += c.charCodeAt(0);
    return s;
}
function applyShift(code, shift) {
    if (!shift) return code;
    const codes = Object.values(workingMaps).sort();
    let idx = codes.indexOf(code);
    if (idx === -1) return code;
    idx = ((idx + shift) % codes.length + codes.length) % codes.length;
    return codes[idx];
}
function reverseShift(code, shift) {
    if (!shift) return code;
    const codes = Object.values(workingMaps).sort();
    let idx = codes.indexOf(code);
    if (idx === -1) return code;
    idx = ((idx - shift) % codes.length + codes.length) % codes.length;
    return codes[idx];
}

// ===== PASSWORD STRENGTH =====
function updateStrength() {
    const key = document.getElementById('secretKey').value;
    const fill = document.getElementById('strengthFill');
    if (!key) { fill.style.width = '0%'; fill.style.background = 'var(--border)'; return; }
    let score = 0;
    if (key.length >= 4) score++;
    if (key.length >= 8) score++;
    if (key.length >= 12) score++;
    if (/[A-Z]/.test(key) && /[a-z]/.test(key)) score++;
    if (/[0-9]/.test(key)) score++;
    if (/[^A-Za-z0-9]/.test(key)) score++;
    const pct = Math.min(100, score * 17);
    const colors = ['#ff6b6b','#ff9800','#f9a825','#cddc39','#43e97b','#43e97b'];
    fill.style.width = pct + '%';
    fill.style.background = colors[Math.min(score, 5)];
}

// ===== DEBOUNCED LIVE PREVIEW =====
let inputDebounceTimer = null;
function onInputChange() {
    updateCounter();
    if (inputDebounceTimer) clearTimeout(inputDebounceTimer);
    inputDebounceTimer = setTimeout(() => handleLivePreview(), 200);
}

// ===== ENCRYPT (with multi-layer) =====
function encrypt() {
    const input = document.getElementById('inputText').value;
    const preserveCase = document.getElementById('preserveCase').checked;
    const emojiMode = document.getElementById('emojiMode').checked;
    const sep = document.getElementById('separatorSelect').value;
    const keyShift = getKeyShift(document.getElementById('secretKey').value);
    const layers = parseInt(document.getElementById('layerCount').value) || 1;
    let current = input;
    let freq = {};
    showLayerAnimation(layers);

    for (let layer = 0; layer < layers; layer++) {
        let parts = [];
        for (let char of current) {
            const lower = char.toLowerCase();
            if (workingMaps[lower]) {
                let code = workingMaps[lower];
                if (emojiMode && emojiMap[lower]) {
                    code = emojiMap[lower];
                } else {
                    if (preserveCase && char !== lower && lower.match(/[a-zäöüßéèêàçñìòåæøłśżčřěőűã]/)) {
                        code = 'big-' + code;
                    }
                    if (keyShift > 0) {
                        const base = code.replace(/^big-/, '');
                        const shifted = applyShift(base, keyShift);
                        code = code.startsWith('big-') ? 'big-' + shifted : shifted;
                    }
                }
                parts.push(code);
                freq[code] = (freq[code] || 0) + 1;
            } else {
                parts.push(`{${char}}`);
            }
        }
        current = parts.join(emojiMode ? '' : sep);
    }

    let html = `<strong>🔒 Verschlüsselt${layers>1?` (${layers} Layer)`:''}${keyShift?' (🔑)':''}${emojiMode?' (🐱)':''}:</strong><br>${escapeHtml(current)}`;
    setOutput(html, current, current.split(sep).length, freq);
    saveHistory(input, current, 'encrypt');
    saveSettings();
    if (document.getElementById('soundEnabled').checked) playMeow();
}

// ===== DECRYPT (with multi-layer) =====
function decrypt() {
    const input = document.getElementById('inputText').value.trim();
    const sep = document.getElementById('separatorSelect').value;
    const keyShift = getKeyShift(document.getElementById('secretKey').value);
    const layers = parseInt(document.getElementById('layerCount').value) || 1;
    let current = input;
    showLayerAnimation(layers);

    const allReverse = getReverseMaps();

    for (let layer = layers - 1; layer >= 0; layer--) {
        let parts = splitBySeparator(current, sep);
        let decrypted = '';

        for (let part of parts) {
            if (!part) continue;
            const braceMatch = part.match(/^\{(.+)\}$/);
            if (braceMatch) { decrypted += braceMatch[1]; continue; }
            let lookup = part.replace(/[{}]/g, '');
            if (keyShift > 0) {
                const base = lookup.replace(/^big-/, '');
                const unshifted = reverseShift(base, keyShift);
                lookup = lookup.startsWith('big-') ? 'big-' + unshifted : unshifted;
            }
            if (allReverse[lookup]) {
                decrypted += allReverse[lookup];
            } else {
                if (keyShift > 0 && allReverse[part.replace(/[{}]/g, '')]) {
                    decrypted += allReverse[part.replace(/[{}]/g, '')];
                }
            }
        }
        current = decrypted;
    }

    let html = `<strong>🔓 Entschlüsselt${layers>1?` (${layers} Layer)`:''}${keyShift?' (🔑)':''}:</strong><br>${escapeHtml(current)}`;
    setOutput(html, current, 0, {});
    saveHistory(input, current, 'decrypt');
    if (document.getElementById('soundEnabled').checked) playMeow();
}

// ===== EXACT SEPARATOR SPLITTING =====
function splitBySeparator(text, sep) {
    if (!sep || sep.trim() === '') {
        return text.split(/\s+/).filter(p => p.length > 0);
    }
    const parts = [];
    let remaining = text;
    while (remaining.length > 0) {
        let idx = remaining.indexOf(sep);
        if (idx === -1) {
            parts.push(remaining.trim());
            break;
        }
        parts.push(remaining.substring(0, idx).trim());
        remaining = remaining.substring(idx + sep.length);
    }
    return parts.filter(p => p.length > 0);
}

// ===== LAYER ANIMATION =====
function showLayerAnimation(layers) {
    const ind = document.getElementById('layerIndicator');
    ind.innerHTML = '';
    for (let i = 0; i < layers; i++) {
        const dot = document.createElement('div');
        dot.className = 'layer-dot';
        dot.textContent = i + 1;
        ind.appendChild(dot);
    }
    const dots = ind.querySelectorAll('.layer-dot');
    dots.forEach((dot, i) => {
        setTimeout(() => {
            dots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            if (i === layers - 1) setTimeout(() => dots.forEach(d => d.classList.add('active')), 300);
        }, i * 200);
    });
}

// ===== OUTPUT =====
let lastOutputHTML = '';
let lastOutputPlain = '';
function setOutput(html, plainText, count, freq) {
    lastOutputHTML = html;
    lastOutputPlain = plainText;
    const box = document.getElementById('outputBox');
    box.innerHTML = html;
    box.style.animation = 'none'; box.offsetHeight;
    box.style.animation = 'fadeIn 0.3s ease';
    document.getElementById('statsBar').innerHTML = `
        <span class="stat-item">📦 ${count} Tokens</span>
        <span class="stat-item">📏 ${plainText.length} Zeichen</span>
        <span class="stat-item">🕐 ${new Date().toLocaleTimeString('de-DE')}</span>
        <span class="stat-item">📊 ${Object.keys(freq).length} unique</span>
    `;
    renderFreqChart(freq);
}

function renderFreqChart(freq) {
    const chart = document.getElementById('freqChart');
    const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 15);
    if (!sorted.length) { chart.innerHTML = ''; return; }
    const max = sorted[0][1];
    chart.innerHTML = sorted.map(([code, count]) => {
        const h = Math.max(8, (count / max) * 60);
        return `<div class="freq-bar-wrapper">
            <span style="font-size:10px;font-weight:bold;color:var(--accent);">${count}×</span>
            <div class="freq-bar" style="height:${h}px;"></div>
            <span class="freq-label" title="${escapeHtml(code)}">${escapeHtml(code).replace(/^big-/,'B:')}</span>
        </div>`;
    }).join('');
}

// ===== LIVE PREVIEW =====
function handleLivePreview() {
    if (!document.getElementById('livePreview').checked) return;
    const input = document.getElementById('inputText').value.trim();
    if (!input) {
        document.getElementById('outputBox').innerHTML = i18n[currentLang].result_placeholder;
        document.getElementById('statsBar').innerHTML = '';
        document.getElementById('freqChart').innerHTML = '';
        document.getElementById('layerIndicator').innerHTML = '';
        lastOutputHTML = ''; lastOutputPlain = ''; return;
    }
    const looksLikeCode = /^(purr|whisker|cat|paw|ear|fur|growl|hiss|indoor|jump|kitty|lick|meow|nap|orange|play|quiet|rub|sleep|toy|under|velvet|wag|xray|yowl|zzz|big-|tail-swish|bowl-empty|lone-stalk|paired|tripod|perfect|keen|poly|sunrise|midnight|final|autumn|open-mouth|overstretch|sharp|french|low-purr|roof|paw-down|curled|tilde|italian|surprise|nordic|northern|polish|czech|hungarian|portuguese|scruff|tilt-head|paw-stamp|slow-blink|tail|arch|floor|extra|balanced|star|fence|slip|curl|uncurl|hide|paw-reach|paw-retract|collar|scratch|bonded|partial|double|claw|belly|perched|stalk-low|pounce-high|premium|treat|bullet)/i.test(input);
    if (looksLikeCode) decrypt(); else encrypt();
}

// ===== HELPERS =====
function escapeHtml(s) {
    const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
}
function updateCounter() {
    document.getElementById('charCounter').textContent =
        `${document.getElementById('inputText').value.length} Zeichen`;
}
