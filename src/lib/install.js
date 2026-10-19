// Install support. The browser's install prompt (`beforeinstallprompt`) can
// fire before React has rendered anything, so it is captured here, at import
// time, and handed to whoever asks later.

let deferredPrompt = null;
let installedNow = false;
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // we show our own button instead of the mini-infobar
    deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    installedNow = true;
    deferredPrompt = null;
    notify();
  });
}

export function subscribeInstall(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const hasInstallPrompt = () => Boolean(deferredPrompt);

/** Shows the browser's own install dialog. Resolves true if the user accepted. */
export async function promptInstall() {
  if (!deferredPrompt) return false;
  const e = deferredPrompt;
  deferredPrompt = null;
  notify();
  e.prompt();
  const { outcome } = await e.userChoice;
  return outcome === 'accepted';
}

/** True when running as the installed app (home-screen icon), not in a browser tab. */
export function isInstalled() {
  if (installedNow) return true;
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true
  );
}

/**
 * Which install instructions apply. Kept deliberately simple: the point is
 * to tell someone where the "add to home screen" option lives on their phone.
 */
export function detectPlatform(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '', touchMac = false) {
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || touchMac; // iPadOS reports itself as a Mac
  const isAndroid = /Android/i.test(ua);
  const inApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|Snapchat|Twitter|LinkedInApp|; wv\)/i.test(ua);

  if (isIOS) {
    if (inApp) return 'ios-inapp';
    if (/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)) return 'ios-other';
    return 'ios-safari';
  }
  if (isAndroid) {
    if (inApp) return 'android-inapp';
    if (/SamsungBrowser/i.test(ua)) return 'android-samsung';
    if (/Firefox/i.test(ua)) return 'android-firefox';
    return 'android-chrome';
  }
  if (/Edg\//i.test(ua) || /Chrome\//i.test(ua)) return 'desktop-chromium';
  if (/Safari\//i.test(ua) && /Macintosh/i.test(ua)) return 'desktop-safari';
  return 'desktop-other';
}

export function currentPlatform() {
  if (typeof navigator === 'undefined') return 'desktop-other';
  const touchMac = /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
  return detectPlatform(navigator.userAgent, touchMac);
}
