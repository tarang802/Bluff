import { useMemo } from 'react';
import { Crown, Flame } from 'lucide-react';
import { Avatar, SectionTitle } from './Ornaments.jsx';
import { hallOfFame } from '../lib/stats.js';

const TIERS = ['gold', 'silver', 'bronze'];
const RANK_TEXT = { gold: 'gold-text', silver: 'text-silver', bronze: 'text-bronze' };

export default function HallOfFame({ archive, players, rounds }) {
  const rows = useMemo(() => hallOfFame({ archive, players, rounds }), [archive, players, rounds]);
  if (!rows.length) return null;
  const legend = rows[0];
  const gamesCount = archive.length + (rounds.length ? 1 : 0);

  return (
    <section aria-labelledby="hof-title" className="mx-auto max-w-3xl">
      <SectionTitle
        id="hof-title"
        eyebrow="All-time"
        title="HALL OF FAME"
        suit="♛"
        meta={`${gamesCount} ${gamesCount === 1 ? 'game' : 'games'}`}
      />

      {legend.crowns > 0 && (
        <div className="panel frame-corners relative mb-4 overflow-hidden px-5 py-5 sm:px-6">
          <span aria-hidden="true" className="pointer-events-none absolute -top-6 -right-2 font-display text-[7rem] leading-none text-gold/[0.06]">
            ♛
          </span>
          <p className="eyebrow text-[0.55rem]">The Legend of the House</p>
          <div className="mt-3 flex items-center gap-4">
            <Avatar name={legend.name} tier="gold" size="lg" />
            <div className="min-w-0">
              <p className="gold-text truncate pb-1 font-display text-3xl leading-tight font-semibold italic">{legend.name}</p>
              <p className="flex items-center gap-1.5 text-sm text-smoke">
                <Crown size={14} strokeWidth={1.8} className="text-gold" aria-hidden="true" />
                {legend.crowns} {legend.crowns === 1 ? 'crown' : 'crowns'} · {legend.points} lifetime points
              </p>
            </div>
          </div>
        </div>
      )}

      <ol className="flex flex-col gap-2" aria-label="All-time player records">
        {rows.map((p, i) => {
          const tier = TIERS[i] && (p.crowns > 0 || p.points > 0) ? TIERS[i] : null;
          return (
            <li key={p.id} className={`border px-4 py-3.5 sm:px-5 ${i === 0 ? 'border-gold/40 bg-gold/[0.05]' : 'border-ivory/8 bg-char/50'}`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-display text-xl font-semibold ${RANK_TEXT[tier] ?? 'text-ivory/40'}`}>{i + 1}</span>
                <span className="hidden min-[360px]:block">
                  <Avatar name={p.name} tier={tier} size="sm" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg leading-tight font-semibold text-ivory">{p.name}</p>
                  {/* Two tidy lines on phones, one line from sm up. Separators only sit between items. */}
                  <p className="mt-0.5 flex flex-col text-[0.7rem] leading-snug text-smoke lining-nums sm:flex-row sm:items-center sm:gap-2 sm:text-[0.72rem]">
                    <span className="whitespace-nowrap">
                      {p.games} {p.games === 1 ? 'game' : 'games'} · {p.wins} {p.wins === 1 ? 'win' : 'wins'} · {p.seconds}× 2nd
                    </span>
                    <span aria-hidden="true" className="hidden text-gold/40 sm:inline">◆</span>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      {p.winRate}% win rate · best streak {p.bestStreak}
                      {p.bestStreak >= 3 && <Flame size={12} strokeWidth={2} className="text-wine-bright" aria-label="hot streak" />}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end">
                  <span className="flex items-center gap-1 text-gold-bright" title="Crowns">
                    <Crown size={14} strokeWidth={1.8} aria-hidden="true" />
                    <span className="font-display text-lg leading-none font-semibold lining-nums">{p.crowns}</span>
                    <span className="sr-only">crowns</span>
                  </span>
                  <span className="mt-1 font-caps text-[0.55rem] tracking-[0.16em] whitespace-nowrap text-ash uppercase">
                    <span className="font-display text-sm tracking-normal text-ivory/85 lining-nums">{p.points}</span> pts
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
