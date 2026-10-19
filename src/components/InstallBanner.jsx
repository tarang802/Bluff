import { useState } from 'react';
import { Smartphone, X } from 'lucide-react';

const KEY = 'bluff-night:install-banner-dismissed';

const wasDismissed = () => {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};

/** A slim invitation near the top of the page; "Not now" hides it on this device. */
export default function InstallBanner({ onInstall }) {
  const [hidden, setHidden] = useState(wasDismissed);
  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(KEY, '1');
    } catch {
      /* the banner simply comes back next time */
    }
  };

  return (
    <div className="card card-active mb-10 flex items-center gap-3 px-4 py-3 sm:mb-12 sm:px-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 text-gold-bright" aria-hidden="true">
        <Smartphone size={18} strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-caps text-[0.66rem] font-semibold tracking-[0.18em] text-ivory uppercase">Install Bluff Night</p>
        <p className="mt-0.5 text-xs leading-snug text-smoke">Opens like an app, works offline, keeps scores safer.</p>
      </div>
      <button type="button" className="btn btn-gold btn-sm shrink-0" onClick={onInstall}>
        Install
      </button>
      <button type="button" className="icon-btn -mr-2 shrink-0" onClick={dismiss} aria-label="Hide install banner">
        <X size={16} strokeWidth={1.7} />
      </button>
    </div>
  );
}
