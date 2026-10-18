import { useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Crown, RotateCcw } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap.js';
import { Avatar, Divider, SuitRow } from './Ornaments.jsx';
import { tierFor } from '../lib/game.js';
import ShareButtons from './ShareButtons.jsx';

const SUITS = ['♠', '♥', '♦', '♣'];

/** One gentle fall of suits and gold flecks — then stillness. */
function Shower() {
  const fall = typeof window !== 'undefined' ? window.innerHeight + 80 : 1000;
  const pieces = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const suit = i % 3 !== 2;
        const s = SUITS[i % 4];
        return {
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 1.6,
          duration: 3.4 + Math.random() * 2.4,
          drift: (Math.random() - 0.5) * 140,
          spin: (Math.random() - 0.5) * 540,
          size: suit ? 14 + Math.random() * 18 : 4 + Math.random() * 5,
          glyph: suit ? s : null,
          red: s === '♥' || s === '♦',
        };
      }),
    [],
  );

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute -top-10 font-display leading-none"
          style={{ left: `${p.left}%`, fontSize: p.size }}
          initial={{ y: -40, x: 0, rotate: 0, opacity: 0 }}
          animate={{ y: fall, x: p.drift, rotate: p.spin, opacity: [0, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn', times: [0, 0.1, 0.8, 1] }}
        >
          {p.glyph ? (
            <span className={p.red ? 'text-wine-bright/80' : 'text-gold-bright/80'}>{p.glyph}</span>
          ) : (
            <span className="block rotate-45 bg-gold-bright/80" style={{ width: p.size, height: p.size }} />
          )}
        </motion.span>
      ))}
    </div>
  );
}

export default function ChampionScreen({ open, champions, standings, roundsPlayed, onBack, onNewGame, shareText }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useFocusTrap(open, ref, { onEscape: onBack });

  const joint = champions.length > 1;
  const top = champions[0];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="champion"
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="champion-title"
          tabIndex={-1}
          className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-ink outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 bg-[radial-gradient(700px_420px_at_50%_18%,rgb(201_162_74/0.16),transparent_70%),radial-gradient(900px_500px_at_50%_110%,rgb(122_26_43/0.3),transparent_70%)]"
          />
          {!reduce && <Shower />}

          <div className="relative z-[2] mx-auto flex min-h-full max-w-3xl flex-col items-center px-5 pt-12 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center sm:pt-16">
            <p className="eyebrow">
              Final hand · {roundsPlayed} {roundsPlayed === 1 ? 'round' : 'rounds'} played
            </p>

            {/* Crown medallion */}
            <motion.div
              className="relative mt-8 grid h-32 w-32 place-items-center sm:h-40 sm:w-40"
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.15 }}
            >
              <span className="absolute inset-0 rounded-full border border-gold/50" />
              <span className="absolute inset-2.5 rounded-full border border-gold/20" />
              <span className="absolute inset-0 rounded-full shadow-[0_0_80px_-10px_rgb(201_162_74/0.55)]" />
              {!reduce && (
                <motion.span
                  className="absolute -inset-3 rounded-full border border-dashed border-gold/25"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                />
              )}
              <Crown className="h-16 w-16 text-gold-bright drop-shadow-[0_4px_20px_rgb(201_162_74/0.6)] sm:h-20 sm:w-20" strokeWidth={1.2} aria-hidden="true" />
            </motion.div>

            <motion.h1
              id="champion-title"
              className="mt-10 font-display text-[2.6rem] leading-[0.95] font-semibold tracking-[0.02em] text-ivory min-[360px]:text-5xl sm:text-7xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {joint ? 'THE KINGS OF BLUFF.' : 'THE KING OF BLUFF.'}
            </motion.h1>
            <motion.p
              className="mt-4 font-display text-lg text-smoke italic sm:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {joint ? 'One table. Countless bluffs. A shared crown.' : 'One table. Countless bluffs. One champion.'}
            </motion.p>

            <Divider className="mt-10 w-full max-w-sm" glyph="♠" />

            {top ? (
              <motion.div
                className="mt-8 w-full"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.6 }}
              >
                {joint && <p className="eyebrow mb-4 text-wine-bright">Joint champions</p>}
                <div className="flex flex-col items-center gap-2">
                  {champions.map((c) => (
                    <p key={c.id} className="foil max-w-full px-2 pb-2 font-display text-[2.6rem] leading-[1.05] font-semibold break-words italic min-[360px]:text-5xl sm:text-7xl">
                      {c.name}
                    </p>
                  ))}
                </div>
                <dl className="mx-auto mt-8 grid max-w-sm grid-cols-2 divide-x divide-gold/20 border-y border-gold/20 py-5">
                  <div>
                    <dt className="eyebrow text-[0.58rem] text-smoke">Final score</dt>
                    <dd className="mt-2 font-display text-4xl font-semibold text-ivory">{top.score}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-[0.58rem] text-smoke">Rounds won</dt>
                    <dd className="mt-2 font-display text-4xl font-semibold text-ivory">
                      {/* Joint champions share a score but not necessarily their wins. */}
                      {champions.map((c) => c.roundsWon).join(' · ')}
                    </dd>
                  </div>
                </dl>
              </motion.div>
            ) : (
              <p className="mt-8 font-display text-2xl text-smoke italic">No rounds were won — the crown waits for another night.</p>
            )}

            {/* Final leaderboard */}
            <motion.section
              aria-labelledby="final-board-title"
              className="panel frame-corners mt-12 w-full max-w-xl px-4 py-5 text-left sm:px-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
            >
              <h2 id="final-board-title" className="eyebrow mb-3 text-center">
                Final Leaderboard
              </h2>
              <ol className="divide-y divide-ivory/6">
                {standings.map((p) => {
                  const tier = tierFor(p);
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-2.5">
                      <span
                        className={`w-7 text-center font-display text-xl font-semibold ${
                          tier === 'gold' ? 'text-gold-bright' : tier === 'silver' ? 'text-silver' : tier === 'bronze' ? 'text-bronze' : 'text-ivory/40'
                        }`}
                      >
                        {p.rank}
                      </span>
                      <Avatar name={p.name} tier={tier} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-ivory/90">
                        {p.name}
                        {tier === 'gold' && <Crown size={13} className="ml-2 inline-block align-[-1px] text-gold" aria-label="Champion" />}
                      </span>
                      <span className="text-xs text-ash">
                        {p.roundsWon} won · {p.seconds} 2nd
                      </span>
                      <span className="w-10 text-right font-display text-xl font-semibold text-ivory">{p.score}</span>
                    </li>
                  );
                })}
              </ol>
            </motion.section>

            <ShareButtons getText={shareText} label="Share the result" className="mt-8 w-full max-w-xl" size="btn-lg" />
            <div className="mt-3 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <button type="button" className="btn btn-outline btn-lg flex-1" onClick={onBack}>
                <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
                Back to Leaderboard
              </button>
              <button type="button" className="btn btn-gold btn-lg flex-1" onClick={onNewGame}>
                <RotateCcw size={15} strokeWidth={1.8} aria-hidden="true" />
                Start New Game
              </button>
            </div>
            <SuitRow className="mt-10 text-xs opacity-60" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
