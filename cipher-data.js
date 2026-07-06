// ====================================================================
//  FELINA-CIPHER v4.1 — cipher-data.js
//  Alle Cipher-Maps, Emoji-Map und Reverse-Map-Verwaltung
// ====================================================================

const felinaLetters = {
    'a':'purr','b':'whisker','c':'cat','d':'paw','e':'ear',
    'f':'fur','g':'growl','h':'hiss','i':'indoor-prowl','j':'jump',
    'k':'kitty','l':'lick','m':'meow','n':'nap','o':'orange-tabby',
    'p':'play','q':'quiet','r':'rub','s':'sleep','t':'toy',
    'u':'under-bed','v':'velvet-paws','w':'wag','x':'xray-box',
    'y':'yowl','z':'zzz'
};
const felinaUmlauts = { 'ä':'autumn-shed','ö':'open-mouth-yawn','ü':'overstretch','ß':'sharp-claw' };
const felinaIntl = {
    'é':'french-purr','è':'low-purr','ê':'roof-cat','à':'paw-down',
    'ç':'curled-tail','ñ':'tilde-nap','ì':'italian-stretch','ò':'surprise-meow',
    'å':'nordic-fluff','æ':'northern-double','ø':'northern-circle',
    'ł':'polish-streak','ś':'polish-slink','ż':'polish-spark',
    'č':'czech-crouch','ř':'czech-roll','ě':'czech-elegant',
    'ő':'hungarian-prowl','ű':'hungarian-leap',
    'ã':'portuguese-doze'
};
const felinaNumbers = {
    '0':'bowl-empty','1':'lone-stalk','2':'paired-whiskers','3':'tripod-tabby',
    '4':'perfect-landfall','5':'keen-senses','6':'poly-toes','7':'sunrise-groom',
    '8':'midnight-zoom','9':'final-life'
};
const felinaSpecial = {
    ' ':'tail-swish','!':'scruff-grab','?':'tilt-head','.':'paw-stamp',
    ',':'slow-blink',';':'half-blink',':':'tail-twitch','-':'arch-back',
    '_':'floor-sleep','+':'extra-treat','=':'balanced-pounce','*':'star-pattern',
    '/':'fence-leap','\\':'slip-under','(':'curl-up',')':'uncurl',
    '[':'hide-box-open',']':'hide-box-close','{':'paw-reach','}':'paw-retract',
    '@':'collar-tag','#':'scratch-post','&':'bonded-pair','%':'partial-purr',
    '"':'double-meow',"'":'claw-scratch','|':'tail-straight-up','~':'belly-up',
    '^':'perched-high','<':'stalk-low','>':'pounce-high','€':'premium-tuna','$':'treat-jar',
    '•':'bullet-mark'
};

// Emoji map for emoji mode
const emojiMap = {
    'a':'😸','b':'😻','c':'🐱','d':'🐾','e':'👂','f':'🧶','g':'😾','h':'😼',
    'i':'🏠','j':'🤸','k':'😺','l':'👅','m':'📣','n':'💤','o':'🟠','p':'🎾',
    'q':'🤫','r':'蹭','s':'😴','t':'🪀','u':'🛏️','v':'🧤','w':'〰️','x':'📦',
    'y':'📢','z':'😴',
    'ä':'🍂','ö':'😮','ü':'🤸','ß':'🐈‍⬛',
    'é':'🇫🇷','è':'🔽','ê':'🏠','à':'⬇️','ç':'🌀','ñ':'🌐',
    'ì':'🇮🇹','ò':'😲','å':'❄️','æ':'👥','ø':'⭕',
    'ł':'🇵🇱','ś':'💫','ż':'✨','č':'🇨🇿','ř':'🔄','ě':'💃',
    'ő':'🇭🇺','ű':'🦘','ã':'🇵🇹',
    '0':'🥣','1':'1️⃣','2':'2️⃣','3':'3️⃣','4':'4️⃣','5':'5️⃣',
    '6':'6️⃣','7':'7️⃣','8':'8️⃣','9':'9️⃣',
    ' ':'💨','!':'😬','?':'🤔','.':'👣',',':'🙈',';':'😑',':':'👀','-':'🌀',
    '_':'🧊','+':'🐟','=':'⚖️','*':'⭐','/':'🚧','\\':'🕳️',
    '(':'🥚',')':'🐣','[':'📦','{':'🤲','@':'🏷️','#':'📌','&':'💞','%':'📊',
    '"':'💬',"'":'💅','|':'📏','~':'🤰','^':'🪜','<':'🏃','>':'🎯',
    '€':'🐟','$':'🍬','•':'⚫'
};

const baseMaps = { ...felinaLetters, ...felinaUmlauts, ...felinaIntl, ...felinaNumbers, ...felinaSpecial };
let workingMaps = { ...baseMaps };
let customOverrides = {};

// ===== REVERSE MAP CACHE =====
let reverseMapCache = null;
let reverseMapDirty = true;

function rebuildReverseMaps() {
    const rev = {};
    Object.entries(workingMaps).forEach(([k, v]) => {
        rev[v] = k;
        if (k.match(/[a-zäöüßéèêàçñìòåæøłśżčřěőűã]/)) {
            rev['big-' + v] = k.toUpperCase();
        }
    });
    return rev;
}

function getReverseMaps() {
    if (reverseMapDirty || !reverseMapCache) {
        reverseMapCache = rebuildReverseMaps();
        reverseMapDirty = false;
    }
    return reverseMapCache;
}

function markReverseMapDirty() {
    reverseMapDirty = true;
}
