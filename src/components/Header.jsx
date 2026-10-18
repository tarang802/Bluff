import { RotateCcw } from 'lucide-react';
import { BluffTicker, Logo } from './Ornaments.jsx';

const PHASES = {
  closed: { short: 'Closed', long: 'Table closed', dot: 'bg-ash', ring: 'border-ivory/10 text-smoke' },
  seating: { short: 'Seating', long: 'Seating players', dot: 'bg-gold', ring: 'border-gold/25 text-gold-bright' },
  live: { short: 'Live', long: 'Game in progress', dot: 'bg-[#6fcf8f]', ring: 'border-[#6fcf8f]/30 text-[#bfe8cb]', pulse: true },
  concluded: { short: 'Ended', long: 'Game concluded', dot: 'bg-wine-bright', ring: 'border-wine-bright/40 text-[#f0b7c1]' },
};

export function SessionIndicator({ phase, roundsPlayed }) {
  const p = PHASES[phase];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border bg-ink/60 px-3 py-1.5 font-caps text-[0.6rem] font-semibold tracking-[0.18em] uppercase ${p.ring}`}
      role="status"
    >
      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
        {p.pulse && <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${p.dot}`} />}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${p.dot}`} />
      </span>
      <span className="sm:hidden">{p.short}</span>
      <span className="hidden sm:inline">{p.long}</span>
      {phase === 'live' && (
        <span className="hidden text-ivory/50 sm:inline">· Round {roundsPlayed + 1}</span>
      )}
    </span>
  );
}

export default function Header({ phase, roundsPlayed, onNewGame }) {
  return (
    <header className="relative z-10">
      <div className="border-b border-gold/12 bg-ink/40 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3.5 sm:gap-3 sm:px-6 sm:py-5 lg:px-8">
        <a href="#top" className="group flex min-w-0 items-center gap-3 rounded-sm" aria-label="Bluff Night, The House of Bluff">
          <Logo className="shrink-0 transition-transform duration-500 group-hover:rotate-90" />
          <span className="min-w-0">
            <span className="block font-caps text-[0.82rem] leading-none font-semibold tracking-[0.16em] whitespace-nowrap text-ivory min-[360px]:text-[0.9rem] min-[360px]:tracking-[0.22em] sm:text-lg sm:tracking-[0.26em]">
              BLUFF NIGHT
            </span>
            <span className="mt-1.5 block font-caps text-[0.5rem] leading-none tracking-[0.24em] whitespace-nowrap text-gold/80 min-[360px]:tracking-[0.34em] sm:text-[0.58rem] sm:tracking-[0.42em]">
              THE HOUSE OF BLUFF
            </span>
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <SessionIndicator phase={phase} roundsPlayed={roundsPlayed} />
          <button type="button" onClick={onNewGame} className="btn btn-sm btn-ghost min-w-10 !px-2.5 sm:!px-4" aria-label="Start a new game">
            <RotateCcw size={14} strokeWidth={1.8} aria-hidden="true" />
            <span className="hidden sm:inline">New Game</span>
          </button>
        </div>
      </div>
      </div>
      <BluffTicker />
    </header>
  );
}
