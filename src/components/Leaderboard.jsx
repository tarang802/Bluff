import { AnimatePresence, motion } from 'framer-motion';
import { Crown, UserPlus } from 'lucide-react';
import { AnimatedNumber, Avatar, Divider, SectionTitle, SuitRow } from './Ornaments.jsx';
import { MIN_PLAYERS, tierFor } from '../lib/game.js';

const ROW_TIER = {
  gold: 'border-gold/60 bg-[linear-gradient(90deg,rgb(201_162_74/0.14),rgb(201_162_74/0.03)_45%,transparent)] md:border-gold/40',
  silver: 'border-silver/25 bg-[linear-gradient(90deg,rgb(200_204_212/0.06),transparent_50%)]',
  bronze: 'border-bronze/25 bg-[linear-gradient(90deg,rgb(196_137_90/0.07),transparent_50%)]',
};
const BAR = { gold: 'bg-gold', silver: 'bg-silver/70', bronze: 'bg-bronze/80' };
const RANK_TEXT = { gold: 'gold-text', silver: 'text-silver', bronze: 'text-bronze' };

const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

function EmptyState({ onAddPlayers }) {
  return (
    <div className="panel frame-corners px-6 py-14 text-center sm:py-20">
      <div aria-hidden="true" className="mx-auto mb-6 flex w-fit items-end gap-1.5">
        {['♠', '♥', '♦', '♣'].map((s, i) => (
          <span
            key={s}
            className={`grid h-16 w-11 place-items-center rounded-[5px] border border-gold/25 bg-char font-display text-2xl ${
              i === 1 || i === 2 ? 'text-wine-bright/80' : 'text-gold/80'
            }`}
            style={{ transform: `rotate(${(i - 1.5) * 7}deg) translateY(${Math.abs(i - 1.5) * 4}px)` }}
          >
            {s}
          </span>
        ))}
      </div>
      <h3 className="font-display text-3xl font-semibold text-ivory">The table is empty.</h3>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-smoke">
        Pull up some chairs. Seat at least {MIN_PLAYERS} players and the first hand can be dealt.
      </p>
      <button type="button" className="btn btn-gold mt-8" onClick={onAddPlayers}>
        <UserPlus size={16} strokeWidth={1.8} aria-hidden="true" />
        Add Players
      </button>
    </div>
  );
}

function Row({ player, flash }) {
  const tier = tierFor(player);
  const isFlashing = Boolean(flash?.ids.includes(player.id));

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      // Phones: the shared card. Desktop: a line inside the framed table.
      className={`card grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 overflow-hidden px-3 py-3 sm:gap-4 sm:px-4 md:grid-cols-[5.5rem_1fr_9rem_8rem] md:gap-0 md:border-x-0 md:border-t-0 md:px-0 md:py-4 md:shadow-none ${
        ROW_TIER[tier] ?? 'md:border-ivory/8 md:bg-none'
      } ${player.rank === 1 && tier === 'gold' ? 'sheen' : ''}`}
    >
      {tier && <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-[2px] ${BAR[tier]}`} />}
      {isFlashing && (
        <motion.span
          key={flash.key}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gold/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
        />
      )}

      {/* Rank */}
      <div aria-hidden="true" className="relative flex flex-col items-center justify-center md:pl-2">
        {player.rank === 1 && tier === 'gold' && (
          <Crown size={16} strokeWidth={1.7} className="mb-0.5 text-gold md:hidden" aria-hidden="true" />
        )}
        <span className={`font-display text-2xl leading-none font-semibold md:text-3xl ${RANK_TEXT[tier] ?? 'text-ivory/45'}`}>
          {player.rank}
        </span>
        {player.tied && player.score > 0 && (
          <span className="mt-1 font-caps text-[0.5rem] tracking-[0.2em] text-smoke uppercase">Tied</span>
        )}
      </div>

      {/* Player */}
      <div aria-hidden="true" className="relative flex min-w-0 items-center gap-3 sm:gap-4">
        <Avatar name={player.name} tier={tier} size="md" />
        <div className="min-w-0">
          <p className="flex items-center gap-2">
            <span className={`line-clamp-2 font-display text-xl leading-tight font-semibold break-words sm:text-[1.4rem] md:line-clamp-1 ${tier === 'gold' ? 'text-ivory' : 'text-ivory/90'}`}>
              {player.name}
            </span>
            {player.rank === 1 && tier === 'gold' && (
              <Crown size={18} strokeWidth={1.7} className="hidden shrink-0 text-gold md:block" aria-hidden="true" />
            )}
          </p>
          <p className="mt-0.5 text-xs text-smoke md:hidden">
            {player.roundsWon} {player.roundsWon === 1 ? 'win' : 'wins'} · {player.seconds} runner-up
          </p>
          {(tier === 'gold' || player.seconds > 0) && (
            <p className="mt-0.5 hidden font-caps text-[0.55rem] tracking-[0.24em] uppercase md:block">
              {tier === 'gold' && <span className="text-gold/80">{player.tied ? 'Sharing the lead' : 'Holds the crown'}</span>}
              {tier === 'gold' && player.seconds > 0 && <span className="text-ash"> · </span>}
              {player.seconds > 0 && <span className="text-ash">{player.seconds}× runner-up</span>}
            </p>
          )}
        </div>
      </div>

      {/* Rounds won (desktop) */}
      <div aria-hidden="true" className="relative hidden text-center font-display text-2xl text-ivory/80 md:block">
        <AnimatedNumber value={player.roundsWon} />
      </div>

      {/* Score */}
      <div aria-hidden="true" className="relative pr-1 text-right md:pr-6">
        <AnimatedNumber
          value={player.score}
          className={`font-display text-[2rem] leading-none font-semibold md:text-[2.4rem] ${tier === 'gold' ? 'text-gold-bright' : 'text-ivory'}`}
        />
        <span className="mt-0.5 block font-caps text-[0.5rem] tracking-[0.25em] text-ash uppercase md:hidden">pts</span>
      </div>

      <span className="sr-only">
        {ordinal(player.rank)} place{player.tied && player.score > 0 ? ' (tied)' : ''}: {player.name},{' '}
        {player.roundsWon} {player.roundsWon === 1 ? 'round' : 'rounds'} won, {player.seconds} runner-up{' '}
        {player.seconds === 1 ? 'finish' : 'finishes'}, {player.score} {player.score === 1 ? 'point' : 'points'}.
      </span>
    </motion.li>
  );
}

export default function Leaderboard({ standings, flash, onAddPlayers, toolbar, footnote, closingAction }) {
  return (
    <section aria-labelledby="leaderboard-title" className="relative">
      <SectionTitle
        id="leaderboard-title"
        eyebrow="The Leaderboard"
        title="THE STANDINGS"
        suit="♠"
        meta={standings.length ? `${standings.length} ${standings.length === 1 ? 'player' : 'players'}` : null}
      />
      {toolbar && <div className="mb-6">{toolbar}</div>}

      {standings.length === 0 ? (
        <EmptyState onAddPlayers={onAddPlayers} />
      ) : (
        <div className="board-shell">
          <div
            aria-hidden="true"
            className="hidden grid-cols-[5.5rem_1fr_9rem_8rem] border-b border-gold/20 py-4 font-caps text-[0.6rem] font-semibold tracking-[0.3em] text-gold/80 uppercase md:grid"
          >
            <span className="pl-2 text-center">Rank</span>
            <span>Player</span>
            <span className="text-center">Rounds Won</span>
            <span className="pr-6 text-right">Score</span>
          </div>
          <ol className="flex flex-col gap-2 md:gap-0" aria-label="Leaderboard, ranked by score">
            <AnimatePresence initial={false}>
              {standings.map((p) => (
                <Row key={p.id} player={p} flash={flash} />
              ))}
            </AnimatePresence>
          </ol>
          {(footnote || closingAction) && (
            <div className="mt-6 flex flex-col items-center gap-4 text-center md:mt-5">
              <Divider className="w-full max-w-xs" />
              {footnote && <p className="text-sm text-smoke">{footnote}</p>}
              {closingAction}
            </div>
          )}
          <SuitRow className="mt-5 hidden justify-center text-[0.7rem] opacity-60 md:flex" />
        </div>
      )}
    </section>
  );
}
