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

/** Art-deco section heading: a suit set in a gold diamond, title, meta, and a fading gold rule. */
export function SectionTitle({ id, eyebrow, title, meta, suit = '♠' }) {
  const red = suit === '♥' || suit === '♦';
  return (
    <div className="mb-6">
      <div className="flex items-end gap-3.5">
        <span aria-hidden="true" className="relative mb-0.5 grid h-9 w-9 shrink-0 place-items-center">
          <span className="absolute inset-[5px] rotate-45 border border-gold/60 bg-ink" />
          <span className={`relative font-display text-base leading-none ${red ? 'text-wine-bright' : 'text-gold-bright'}`}>{suit}</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-[0.56rem] text-smoke">{eyebrow}</p>
          <h2
            id={id}
            className="mt-1 font-caps text-[0.98rem] leading-tight font-semibold tracking-[0.14em] whitespace-nowrap text-ivory sm:text-xl sm:tracking-[0.2em]"
          >
            {title}
          </h2>
        </div>
        {meta && <p className="mb-0.5 font-caps text-[0.58rem] tracking-[0.2em] whitespace-nowrap text-ash uppercase">{meta}</p>}
      </div>
      <div aria-hidden="true" className="mt-4 flex items-center gap-2">
        <span className="h-px w-10 bg-gold/70" />
        <span className="h-1.5 w-1.5 rotate-45 bg-gold/80" />
        <span className="h-px flex-1 bg-linear-to-r from-gold/40 via-gold/15 to-transparent" />
      </div>
    </div>
  );
}

const TALK = ['Three Kings', 'Bluff!', 'Two Aces', 'I call it', 'Four Sevens', 'Liar', 'One Queen', 'Show me', 'Two Jacks', 'Pick them up'];

/** Table talk drifting past under the header. Decorative only. */
export function BluffTicker() {
  const items = [...TALK, ...TALK];
  return (
    <div aria-hidden="true" className="relative overflow-hidden border-b border-gold/10 bg-[linear-gradient(90deg,rgb(58_10_20/0.55),rgb(9_9_11/0.2)_50%,rgb(58_10_20/0.55))] py-2">
      <div className="ticker">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((t, i) => (
              <span key={`${copy}-${i}`} className="flex items-center">
                <span
                  className={`px-4 font-caps text-[0.6rem] font-semibold tracking-[0.3em] uppercase ${
                    /bluff|liar/i.test(t) ? 'text-[#f0a3b1]' : 'text-gold/75'
                  }`}
                >
                  {/bluff|liar|call|show|pick/i.test(t) ? t : `“${t}”`}
                </span>
                <span className={`text-[0.6rem] ${i % 2 ? 'text-wine-bright/80' : 'text-gold/50'}`}>{['♠', '♥', '♦', '♣'][i % 4]}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <span className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-ink to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-ink to-transparent" />
    </div>
  );
}
