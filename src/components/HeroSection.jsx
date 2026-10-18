import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { AnimatedNumber, SuitRow } from './Ornaments.jsx';
import { leaderLabel } from '../lib/game.js';

const FAN = [
  { rank: 'Q', suit: '♦', red: true, rotate: -16, x: -118, y: 26, delay: 0.15 },
  { rank: 'K', suit: '♥', red: true, rotate: -4, x: -40, y: 4, delay: 0.25 },
  { rank: 'A', suit: '♠', red: false, rotate: 9, x: 44, y: 14, delay: 0.35 },
];

function PlayingCard({ rank, suit, red }) {
  const tone = red ? 'text-wine-bright' : 'text-gold-bright';
  return (
    <div className="relative h-[232px] w-[164px] rounded-[10px] border border-gold/45 bg-[linear-gradient(160deg,#1c1b1f,#0e0e11)] p-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)]">
      <div className="relative h-full w-full rounded-[6px] border border-gold/15">
        <div className={`absolute top-2 left-2.5 text-center font-display leading-none ${tone}`}>
          <div className="text-2xl font-semibold">{rank}</div>
          <div className="text-lg">{suit}</div>
        </div>
        <div className={`absolute right-2.5 bottom-2 rotate-180 text-center font-display leading-none ${tone}`}>
          <div className="text-2xl font-semibold">{rank}</div>
          <div className="text-lg">{suit}</div>
        </div>
        <div className={`absolute inset-0 grid place-items-center font-display text-7xl ${tone} opacity-90`}>{suit}</div>
      </div>
    </div>
  );
}

function Stat({ label, children, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="eyebrow text-[0.58rem] tracking-[0.24em] whitespace-nowrap text-smoke">{label}</dt>
      <dd className="mt-2 font-display text-3xl leading-none font-semibold text-ivory sm:text-4xl">{children}</dd>
    </div>
  );
}

export default function HeroSection({ playerCount, roundsPlayed, champions }) {
  const leader = leaderLabel(champions);

  return (
    <section id="top" className="relative overflow-hidden" aria-labelledby="hero-title">
      {/* Oversized faint suits as wallpaper */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
        <span className="absolute -top-16 -left-10 font-display text-[16rem] leading-none text-gold/[0.035] sm:text-[22rem]">♠</span>
        <span className="absolute right-[-3rem] bottom-[-6rem] rotate-12 font-display text-[14rem] leading-none text-wine/20 lg:hidden">♥</span>
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-12 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:grid-cols-[1.25fr_1fr] lg:px-8 lg:pt-24">
        <div>
          <motion.p
            className="eyebrow flex items-center gap-3 text-[0.6rem] tracking-[0.22em] whitespace-nowrap min-[360px]:tracking-[0.3em] sm:text-[0.66rem] sm:tracking-[0.34em]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="h-px w-6 shrink-0 bg-gold/60 sm:w-8" aria-hidden="true" />
            Private table · After midnight
          </motion.p>

          <motion.h1
            id="hero-title"
            className="mt-6 font-display text-[2.9rem] leading-[0.92] font-semibold tracking-[0.01em] text-ivory sm:text-7xl lg:text-[5.4rem]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            EVERY HAND
            <br />
            HAS A <em className="gold-text pr-2 font-medium italic">STORY.</em>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-smoke sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Every bluff counts. Every round matters. One player takes the crown.
          </motion.p>

          <motion.dl
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-gold/15 pt-6 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:gap-x-0 sm:divide-x sm:divide-gold/15"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Stat label="Players" className="sm:pr-6 lg:pr-5 xl:pr-8">
              <AnimatedNumber value={playerCount} />
            </Stat>
            <Stat label="Rounds played" className="sm:px-6 lg:px-5 xl:px-8">
              <AnimatedNumber value={roundsPlayed} />
            </Stat>
            <Stat label="Current leader" className="col-span-2 sm:col-span-1 sm:pl-6 lg:pl-5 xl:pl-8">
              {leader ? (
                <span className="flex min-w-0 items-center gap-2.5">
                  <Crown size={22} strokeWidth={1.6} className="shrink-0 text-gold" aria-hidden="true" />
                  <span className="gold-text truncate pb-1" title={leader}>{leader}</span>
                </span>
              ) : (
                <span className="text-ash italic">Unclaimed</span>
              )}
            </Stat>
          </motion.dl>
        </div>

        {/* Fanned hand — desktop flourish */}
        <div aria-hidden="true" className="relative hidden h-[320px] lg:block">
          <div className="absolute inset-0 grid place-items-center">
            {FAN.map((c) => (
              <motion.div
                key={c.rank}
                className="absolute"
                initial={{ opacity: 0, y: 40, rotate: 0, x: 0 }}
                animate={{ opacity: 1, y: c.y, rotate: c.rotate, x: c.x }}
                transition={{ duration: 0.9, delay: c.delay, ease: [0.22, 1, 0.36, 1] }}
              >
                <PlayingCard {...c} />
              </motion.div>
            ))}
          </div>
          <SuitRow className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 text-sm" />
        </div>
      </div>
    </section>
  );
}
