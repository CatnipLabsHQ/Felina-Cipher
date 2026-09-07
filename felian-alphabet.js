/**
 * Felianisch Alphabet V7
 * Identisch zu V6 — hier nichts ändern, sonst brechen alte Nachrichten.
 */

const FELIAN_ALPHABET = {
    a: 'ᚠ', b: 'ᚢ', c: 'ᚦ', d: 'ᚨ', e: 'ᚱ',
    f: 'ᚲ', g: 'ᚷ', h: 'ᚹ', i: 'ᚺ', j: 'ᚾ',
    k: 'ᛁ', l: 'ᛇ', m: 'ᛈ', n: 'ᛉ', o: 'ᛊ',
    p: 'ᛏ', q: 'ᛒ', r: 'ᛖ', s: 'ᛗ', t: 'ᛚ',
    u: 'ᛜ', v: 'ᛞ', w: 'ᛟ', x: 'ᛪ', y: 'ᛩ', z: 'ᛤ'
};

const FELIAN_UMLAUT = {
    ä: 'ᚫ', ö: 'ᛮ', ü: 'ᛯ', ß: 'ᛋ'
};

const FELIAN_DIGITS = {
    '0': '⸰', '1': '⸱', '2': '⸲', '3': '⸳', '4': '⸴',
    '5': '⸵', '6': '⸶', '7': '⸷', '8': '⸸', '9': '⸹'
};

const FELIAN_SPECIAL = {
    '!': '⚐', '@': '⚑', '#': '⛭', '$': '⚜',
    '%': '❍', '^': '◈', '&': '⌘', '*': '✱',
    '(': '⟮', ')': '⟯', '_': '‿', '+': '➕',
    '=': '≡', '[': '⟦', ']': '⟧', '{': '⟨',
    '}': '⟩', '|': '¦', '\\': '╱', ':': '∶',
    ';': '⁏', '"': '˝', "'": '˵', '<': '‹',
    '>': '›', ',': '․', '.': '∙', '?': '⸻',
    '/': '⁄', '~': '～', '`': 'ˋ', '-': '‐'
};

const FELIAN_SPACE = '·';

// Reverse Maps
const FELIAN_REVERSE = {};
for (const [k, v] of Object.entries(FELIAN_ALPHABET)) FELIAN_REVERSE[v] = k;

const FELIAN_REVERSE_UMLAUT = {};
for (const [k, v] of Object.entries(FELIAN_UMLAUT)) FELIAN_REVERSE_UMLAUT[v] = k;

const FELIAN_REVERSE_DIGITS = {};
for (const [k, v] of Object.entries(FELIAN_DIGITS)) FELIAN_REVERSE_DIGITS[v] = k;

const FELIAN_REVERSE_SPECIAL = {};
for (const [k, v] of Object.entries(FELIAN_SPECIAL)) FELIAN_REVERSE_SPECIAL[v] = k;

// Kombinierter Zeichensatz — Reihenfolge ist Teil des Formats, NICHT ändern!
const FELIAN_CHARSET = [
    ...Object.keys(FELIAN_ALPHABET),
    ...Object.keys(FELIAN_UMLAUT),
    ...Object.keys(FELIAN_DIGITS),
    ...Object.keys(FELIAN_SPECIAL)
];

const FELIAN_SYMBOLS = [
    ...Object.values(FELIAN_ALPHABET),
    ...Object.values(FELIAN_UMLAUT),
    ...Object.values(FELIAN_DIGITS),
    ...Object.values(FELIAN_SPECIAL)
];

const FELIAN_SYMBOL_TO_CHAR = {};
for (let i = 0; i < FELIAN_CHARSET.length; i++) {
    FELIAN_SYMBOL_TO_CHAR[FELIAN_SYMBOLS[i]] = FELIAN_CHARSET[i];
}

const FELIAN_CHARS = new Set([...FELIAN_SYMBOLS, FELIAN_SPACE]);

// === V7: Marker ===
const FELIAN_SECURE_PREFIX = '⟐'; // Secure-Nachrichten (AES-GCM)
const FELIAN_TAG_MARK = '⟑';      // Prüfsummen-Marker für klassische Nachrichten

const FELIAN_BASE = FELIAN_SYMBOLS.length; // 66
