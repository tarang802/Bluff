import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';

const WIDTHS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
};

/**
 * Bottom sheet on phones, centred dialog from `sm` up.
 * Traps focus, closes on Escape / backdrop, and returns focus on close.
 */
export default function Modal({
  open,
  onClose,
  eyebrow,
  title,
  description,
  children,
  footer,
  size = 'md',
  role = 'dialog',
  initialFocusRef,
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useFocusTrap(open, panelRef, { onEscape: onClose, initialFocusRef });

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6 short:p-2!"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div aria-hidden="true" className="absolute inset-0 bg-black/75 backdrop-blur-[3px]" onClick={onClose} />
          <motion.div
            ref={panelRef}
            role={role}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descId : undefined}
            tabIndex={-1}
            className={`panel frame-corners relative flex max-h-[92dvh] w-full flex-col short:max-h-[96dvh]! shadow-[0_40px_80px_-20px_rgb(0_0_0/0.9)] outline-none sm:rounded-[3px] ${WIDTHS[size]}`}
            initial={{ y: 48, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 28, opacity: 0, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-ivory/15 sm:hidden" aria-hidden="true" />
            <header className="flex items-start gap-3 px-4 pt-3 pb-3 min-[360px]:px-5 sm:gap-4 sm:px-7 sm:pt-7 sm:pb-4 short:pt-3! short:pb-2!">
              <div className="min-w-0 flex-1">
                {eyebrow && <p className="eyebrow mb-2 short:mb-1!">{eyebrow}</p>}
                <h2 id={titleId} className="font-display text-[1.5rem] leading-tight font-semibold tracking-wide text-ivory min-[360px]:text-[1.7rem] sm:text-3xl short:text-2xl!">
                  {title}
                </h2>
                {description && (
                  <p id={descId} className="mt-2 text-sm leading-relaxed text-smoke short:mt-1!">
                    {description}
                  </p>
                )}
              </div>
              <button type="button" className="icon-btn -mt-1 -mr-2" onClick={onClose} aria-label="Close">
                <X size={18} strokeWidth={1.6} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 min-[360px]:px-5 sm:px-7 sm:pb-5">{children}</div>
            {footer && (
              <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-gold/15 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] min-[360px]:px-5 sm:px-7 sm:pt-4 sm:pb-6 short:py-2!">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
