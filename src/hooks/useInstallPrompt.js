import { useEffect, useReducer } from 'react';
import { currentPlatform, hasInstallPrompt, isInstalled, promptInstall, subscribeInstall, supportsInstallPrompt } from '../lib/install.js';

/**
 * `canPrompt`: the browser has handed us its one-tap install dialog.
 * `showInstall`: whether to show the Install banner/button at all.
 * `installed`: already running as the home-screen app.
 */
export function useInstallPrompt() {
  const [, rerender] = useReducer((n) => n + 1, 0);
  useEffect(() => subscribeInstall(rerender), []);
  const canPrompt = hasInstallPrompt();
  const installed = isInstalled();
  const platform = currentPlatform();
  // In-app browsers (WhatsApp, Instagram) can look Chrome-like but never offer
  // the dialog, so they always get the "open in Chrome/Safari" steps.
  const inApp = platform.endsWith('-inapp');
  return {
    canPrompt,
    installed,
    // Where a one-tap install exists, only offer Install once it is ready, so
    // tapping it always installs directly. Elsewhere it opens short steps.
    showInstall: !installed && (canPrompt || inApp || !supportsInstallPrompt()),
    platform,
    install: promptInstall,
  };
}
