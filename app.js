/**
 * App V9 — Entry Point
 */

document.addEventListener('DOMContentLoaded', async () => {
    await UI.boot();
    I18N.init();   // ← ersetzt About.init() — About lädt jetzt über i18n.js mit

    if ('serviceWorker' in navigator &&
        (location.protocol === 'https:' || location.hostname === 'localhost')) {
        try {
            await navigator.serviceWorker.register('./sw.js');
            console.log('%c📱 Service Worker aktiv.', 'color:#00cc66;');
        } catch (err) {
            console.warn('SW-Registrierung fehlgeschlagen:', err);
        }
    }

    console.log('%c🐱 Felianisch V9.3', 'color:#6d4aff;font-size:14px;font-weight:bold;');
});
