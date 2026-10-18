import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const BURST = [
  { s: '♠', x: -150, y: -90, r: -25, red: false },
  { s: '♥', x: 150, y: -80, r: 20, red: true },
  { s: '♦', x: -130, y: 100, r: 15, red: true },
  { s: '♣', x: 140, y: 110, r: -18, red: false },
  { s: '♦', x: 0, y: -150, r: 0, red: true },
  { s: '♠', x: 0, y: 150, r: 10, red: false },
];

/** A two-second flourish after a winner is declared. Click or Esc skips it. */
export default function WinnerCelebration({ data, onDone }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!data) return undefined;
    const t = setTimeout(onDone, 2300);
    const onKey = (e) => e.key === 'Escape' && onDone();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [data, onDone]);

  return createPortal(
    <AnimatePresence>
      {data && (
        <motion.div
          key={data.key}
          className="fixed inset-0 z-[55] grid cursor-pointer place-items-center bg-[#0d0a12]/75 px-6 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          onClick={onDone}
          role="status"
          aria-live="assertive"
        >
          <div className="relative text-center">
            {!reduce && (
              <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2">
                <motion.span
                  className="absolute -top-28 -left-28 h-56 w-56 rounded-full border border-gold/50"
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 1.3, ease: 'easeOut' }}
                />
                {BURST.map((b, i) => (
                  <motion.span
                    key={i}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 font-display text-4xl ${b.red ? 'text-wine-bright' : 'text-gold-bright'}`}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
                    animate={{ x: b.x, y: b.y, opacity: [0, 1, 0], scale: 1, rotate: b.r }}
                    transition={{ duration: 1.5, delay: 0.1 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {b.s}
                  </motion.span>
                ))}
              </div>
            )}

            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Round {data.round} · Declared
            </motion.p>
            <motion.h2
              className="mt-4 font-caps text-base font-semibold tracking-[0.22em] text-ivory min-[360px]:text-xl sm:text-2xl"
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, letterSpacing: '0.22em' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              THE TABLE HAS SPOKEN.
            </motion.h2>
            <motion.p
              className="foil mt-5 max-w-[90vw] font-display text-[2.6rem] leading-[1.05] font-semibold break-words italic min-[360px]:text-5xl sm:text-7xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
            >
              {data.name}
            </motion.p>
            <motion.p
              className="mt-5 font-caps text-[0.7rem] tracking-[0.28em] text-smoke uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              +{data.points} points · <span className="text-ivory">{data.score}</span> total
            </motion.p>
            {data.runnerUp && (
              <motion.p
                className="mt-3 text-sm text-smoke"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Runner-up <span className="font-display text-lg font-semibold text-silver">{data.runnerUp}</span>{' '}
                <span className="text-silver">+{data.runnerUpPoints}</span>
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
