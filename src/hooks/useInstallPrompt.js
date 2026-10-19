import { useEffect, useReducer } from 'react';
import { currentPlatform, hasInstallPrompt, isInstalled, promptInstall, subscribeInstall } from '../lib/install.js';

/**
 * `canPrompt`: the browser offered its own install dialog (Android Chrome,
 * Samsung Internet, desktop Chrome/Edge). Everywhere else we show steps.
 * `installed`: already running as the home-screen app, so hide install UI.
 */
export function useInstallPrompt() {
  const [, rerender] = useReducer((n) => n + 1, 0);
  useEffect(() => subscribeInstall(rerender), []);
  return {
    canPrompt: hasInstallPrompt(),
    installed: isInstalled(),
    platform: currentPlatform(),
    install: promptInstall,
  };
}
