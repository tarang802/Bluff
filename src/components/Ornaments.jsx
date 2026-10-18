import { AnimatePresence, motion } from 'framer-motion';
import { initials } from '../lib/game.js';

const TIER_RING = {
  gold: 'border-gold text-gold-bright shadow-[0_0_0_3px_rgb(201_162_74/0.12),0_0_24px_-6px_rgb(201_162_74/0.6)]',
  silver: 'border-silver/70 text-silver',
  bronze: 'border-bronze/70 text-bronze',
};

const SIZES = {
  sm: 'h-8 w-8 text-[0.6rem]',
  md: 'h-11 w-11 text-[0.72rem]',
  lg: 'h-14 w-14 text-sm',
};

export function Avatar({ name, tier = null, size = 'md', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-grid shrink-0 place-items-center rounded-full border bg-[radial-gradient(circle_at_30%_25%,#26231d,#0d0d10_70%)] font-caps font-semibold tracking-[0.08em] ${
        TIER_RING[tier] ?? 'border-gold/25 text-ivory/85'
      } ${SIZES[size]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}

/** Rolls the old value out and the new one in whenever it changes. */
export function AnimatedNumber({ value, className = '' }) {
  return (
    <span className={`relative inline-grid overflow-hidden lining-nums tabular-nums ${className}`}>
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          className="col-start-1 row-start-1"
          initial={{ y: '75%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-75%', opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function SuitRow({ className = '' }) {
  return (
    <span aria-hidden="true" className={`font-display tracking-[0.5em] ${className}`}>
      <span className="text-gold/80">♠</span>
      <span className="text-wine-bright/90">♥</span>
      <span className="text-wine-bright/90">♦</span>
      <span className="text-gold/80">♣</span>
    </span>
  );
}

export function Divider({ className = '', glyph = '♦' }) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-4 ${className}`}>
      <span className="h-px flex-1 bg-linear-to-r from-transparent via-gold/30 to-gold/50" />
      <span className="font-display text-sm text-gold/70">{glyph}</span>
      <span className="h-px flex-1 bg-linear-to-l from-transparent via-gold/30 to-gold/50" />
    </div>
  );
}

export function Logo({ className = '' }) {
  return (
    <span aria-hidden="true" className={`relative inline-grid h-10 w-10 place-items-center ${className}`}>
      <span className="absolute inset-[5px] rotate-45 border border-gold/70" />
      <span className="absolute inset-[9px] rotate-45 border border-gold/20" />
      <span className="relative font-display text-xl leading-none text-gold-bright">♠</span>
    </span>
  );
}
