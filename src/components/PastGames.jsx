import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Crown } from 'lucide-react';
import { Avatar, SectionTitle } from './Ornaments.jsx';
import ShareButtons from './ShareButtons.jsx';
import { standingsText } from '../lib/share.js';
import { computeStandings, formatTimestamp, getChampions, pad2, placingFor, tierFor } from '../lib/game.js';

const RANK_TEXT = { gold: 'text-gold-bright', silver: 'text-silver', bronze: 'text-bronze' };

function GameRounds({ game }) {
  return (
    <ol className="mt-2 divide-y divide-ivory/6 border-t border-ivory/6">
      {[...game.rounds].reverse().map((r, i) => {
        const first = placingFor(r, 1);
        const second = placingFor(r, 2);
        const { date, time } = formatTimestamp(r.at);
        return (
          <li key={r.id} className="flex items-center gap-3 py-2 text-xs">
            <span className="w-14 shrink-0 font-caps text-[0.55rem] tracking-[0.18em] text-gold/70 uppercase">
              Rd <span className="text-ivory/70">{pad2(game.rounds.length - i)}</span>
            </span>
            <span className="min-w-0 flex-1 truncate text-ivory/80">
              {first.name} <span className="text-gold-bright">+{first.points}</span>
              {second && (
                <span className="text-smoke">
                  {' · '}
                  {second.name} <span className="text-silver">+{second.points}</span>
                </span>
              )}
            </span>
            <span className="flex shrink-0 flex-col items-end text-right leading-tight lining-nums tabular-nums">
              <span className="text-ivory/60">{time}</span>
              <span className="text-[0.62rem] text-ash">{date}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function GameCard({ game }) {
  const [open, setOpen] = useState(false);
  const [showRounds, setShowRounds] = useState(false);
  const start = formatTimestamp(game.startedAt);
  const end = formatTimestamp(game.endedAt);
  const top = game.champions[0];
  const panelId = `past-${game.id}`;

  return (
    <li className={`card ${open ? 'card-active' : 'card-interactive'}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-4 text-left sm:items-center sm:gap-5 sm:px-5"
      >
        <span className="w-12 shrink-0 pt-0.5 font-caps text-[0.55rem] leading-tight tracking-[0.2em] text-gold/70 uppercase sm:pt-0">
          Game
          <span className="block font-display text-2xl leading-none font-semibold tracking-normal text-ivory/80">{pad2(game.number)}</span>
        </span>

        <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-5">
          <span className="block min-w-0 sm:flex-1">
            <span className="block font-display text-lg leading-tight font-semibold text-ivory">{start.date}</span>
            <span className="mt-0.5 block text-xs text-smoke lining-nums">
              {start.time} – {start.date === end.date ? end.time : `${end.date}, ${end.time}`} · {game.rounds.length}{' '}
              {game.rounds.length === 1 ? 'round' : 'rounds'}
            </span>
          </span>

          <span className="mt-2.5 flex min-w-0 items-center gap-2 sm:mt-0 sm:max-w-[45%] sm:justify-end">
            {top ? (
              <>
                <Crown size={15} strokeWidth={1.7} className="shrink-0 text-gold" aria-hidden="true" />
                <span className="gold-text line-clamp-2 pr-1 font-display text-lg leading-tight font-semibold break-words italic sm:line-clamp-1">
                  {game.champions.map((c) => c.name).join(' & ')}
                </span>
                <span className="shrink-0 font-caps text-[0.58rem] tracking-[0.18em] text-ash uppercase">
                  {top.score} pts{game.crowned ? '' : ' · unfinished'}
                </span>
              </>
            ) : (
              <span className="text-xs text-ash italic">No points scored</span>
            )}
          </span>
        </span>

        <ChevronDown
          size={18}
          strokeWidth={1.6}
          aria-hidden="true"
          className={`mt-1 shrink-0 text-smoke transition-transform duration-300 sm:mt-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-gold/15 px-4 pt-2 pb-4 sm:px-5">
              {!game.crowned && (
                <p className="py-2 text-xs text-ash">This game was saved before a champion was crowned; standings are as they stood.</p>
              )}
              <ol aria-label={`Game ${game.number} final standings`} className="divide-y divide-ivory/6">
                {game.standings.map((p) => {
                  const tier = tierFor(p);
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-2.5">
                      <span className={`w-6 text-center font-display text-lg font-semibold ${RANK_TEXT[tier] ?? 'text-ivory/40'}`}>{p.rank}</span>
                      <Avatar name={p.name} tier={tier} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-sm text-ivory/90">{p.name}</span>
                      <span className="hidden text-xs text-ash min-[360px]:inline">
                        {p.roundsWon}W · {p.seconds} 2nd
                      </span>
                      <span className="w-8 text-right font-display text-lg font-semibold text-ivory">{p.score}</span>
                    </li>
                  );
                })}
              </ol>
              <ShareButtons
                className="mt-3"
                size="btn-sm"
                getText={() =>
                  standingsText({
                    standings: game.standings,
                    champions: game.champions,
                    roundsPlayed: game.rounds.length,
                    final: true,
                    at: game.endedAt,
                  })
                }
              />
              <button
                type="button"
                className="btn btn-sm btn-ghost mt-2 w-full sm:w-auto"
                aria-expanded={showRounds}
                onClick={() => setShowRounds((v) => !v)}
              >
                {showRounds ? 'Hide rounds' : `Show all ${game.rounds.length} rounds`}
              </button>
              {showRounds && <GameRounds game={game} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function PastGames({ archive }) {
  const games = useMemo(
    () =>
      archive
        .map((g, i) => {
          const standings = computeStandings(g.players, g.rounds);
          return { ...g, number: i + 1, standings, champions: getChampions(standings) };
        })
        .reverse(),
    [archive],
  );

  return (
    <section aria-labelledby="past-games-title">
      <SectionTitle
        id="past-games-title"
        eyebrow="The Archive"
        title="PAST GAMES"
        suit="♣"
        meta={`${games.length} ${games.length === 1 ? 'game' : 'games'}`}
      />

      <ol className="flex flex-col gap-2.5">
        {games.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </ol>
    </section>
  );
}
