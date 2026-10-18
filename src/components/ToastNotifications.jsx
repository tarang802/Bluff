import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Info, TriangleAlert, X } from 'lucide-react';
import { uid } from '../lib/game.js';

const ToastContext = createContext(null);

const STYLES = {
  success: { Icon: Check, accent: 'bg-gold', icon: 'text-gold-bright border-gold/40' },
  error: { Icon: TriangleAlert, accent: 'bg-wine-bright', icon: 'text-[#f0a3b1] border-wine-bright/50' },
  info: { Icon: Info, accent: 'bg-ivory/50', icon: 'text-ivory/80 border-ivory/20' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    ({ type = 'success', title, message, action, duration }) => {
      const id = uid();
      setToasts((list) => [...list.slice(-2), { id, type, title, message, action }]);
      const ms = duration ?? (action ? 6000 : type === 'error' ? 4500 : 3200);
      timers.current.set(id, setTimeout(() => dismiss(id), ms));
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  const api = useMemo(
    () => ({
      push,
      dismiss,
      success: (title, opts) => push({ ...opts, type: 'success', title }),
      error: (title, opts) => push({ ...opts, type: 'error', title }),
      info: (title, opts) => push({ ...opts, type: 'info', title }),
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 top-3 z-[60] flex flex-col gap-2 md:inset-x-auto md:top-auto md:right-6 md:bottom-6 md:w-[380px]"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const { Icon, accent, icon } = STYLES[t.type] ?? STYLES.info;
            return (
              <motion.div
                key={t.id}
                layout
                role={t.type === 'error' ? 'alert' : undefined}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.18 } }}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                className="panel pointer-events-auto relative flex items-start gap-3 overflow-hidden py-3 pr-2 pl-4 shadow-[0_20px_40px_-16px_rgb(0_0_0/0.9)]"
              >
                <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[2px] ${accent}`} />
                <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border ${icon}`}>
                  <Icon size={14} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="font-caps text-[0.72rem] font-semibold tracking-[0.12em] text-ivory uppercase">{t.title}</p>
                  {t.message && <p className="mt-1 text-[0.8rem] leading-snug text-smoke">{t.message}</p>}
                </div>
                {t.action && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline shrink-0 self-center"
                    onClick={() => {
                      t.action.onClick();
                      dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                )}
                <button type="button" className="icon-btn h-8 w-8 shrink-0" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
