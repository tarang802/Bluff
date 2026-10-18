import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { Avatar, SectionTitle } from './Ornaments.jsx';
import { editTimeLeft, formatCountdown, formatTimestamp, pad2, placingFor } from '../lib/game.js';

const PREVIEW = 6;

/** `now` ticks while any round is still editable; `onEdit` is omitted when editing isn't allowed. */
export default function RoundHistory({ rounds, players, now, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const seated = new Map(players.map((p) => [p.id, p.name]));
  const describe = (placing) =>
    placing && { ...placing, name: seated.get(placing.playerId) ?? placing.name, left: !seated.has(placing.playerId) };
  const entries = rounds
    .map((r, i) => ({ ...r, number: i + 1, first: describe(placingFor(r, 1)), second: describe(placingFor(r, 2)) }))
    .reverse();
  const visible = expanded ? entries : entries.slice(0, PREVIEW);

  return (
    <section aria-labelledby="history-title">
      <SectionTitle
        id="history-title"
        eyebrow="The Ledger"
        title="THE NIGHT'S HISTORY"
        suit="♦"
        meta={`${rounds.length} ${rounds.length === 1 ? 'round' : 'rounds'}`}
      />

      {entries.length === 0 ? (
        <p className="py-6 text-center font-display text-lg text-smoke italic">
          No hands played yet. The first round is waiting to be won.
        </p>
      ) : (
        <>
          <ol className="divide-y divide-ivory/6">
            <AnimatePresence initial={false}>
              {visible.map((r) => (
                <motion.li
                  key={r.id}
                  layout="position"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 py-3 sm:gap-4">
                    <span className="w-16 shrink-0 font-caps text-[0.62rem] tracking-[0.2em] text-gold/80 uppercase sm:w-20">
                      Round <span className="text-ivory/80">{pad2(r.number)}</span>
                    </span>
                    <Avatar name={r.first.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-baseline gap-2">
                        <span className={`truncate text-[0.95rem] ${r.first.left ? 'text-ash line-through' : 'text-ivory/90'}`}>{r.first.name}</span>
                        <span className="shrink-0 font-display text-base font-semibold text-gold-bright">+{r.first.points}</span>
                      </p>
                      {r.second && (
                        <p className="mt-0.5 flex items-baseline gap-1.5 text-xs text-smoke">
                          <span className="font-caps text-[0.55rem] tracking-[0.15em] text-silver/70 uppercase">2nd</span>
                          <span className={`truncate ${r.second.left ? 'text-ash line-through' : ''}`}>{r.second.name}</span>
                          <span className="shrink-0 font-display text-sm font-semibold text-silver">+{r.second.points}</span>
                        </p>
                      )}
                      {(() => {
                        const left = onEdit ? editTimeLeft(r, now) : 0;
                        if (left > 0) {
                          return (
                            <button
                              type="button"
                              onClick={() => onEdit(r.id)}
                              aria-label={`Edit round ${r.number}, ${formatCountdown(left)} left`}
                              className="mt-1.5 inline-flex min-h-10 items-center gap-1.5 border border-gold/40 px-3 font-caps text-[0.58rem] font-semibold tracking-[0.16em] text-gold-bright uppercase transition-colors hover:bg-gold/10"
                            >
                              <Pencil size={11} strokeWidth={2} aria-hidden="true" />
                              Edit
                              <span className="font-sans tracking-normal text-ivory/60 lining-nums tabular-nums">{formatCountdown(left)}</span>
                            </button>
                          );
                        }
                        return r.editedAt ? (
                          <p className="mt-1 font-caps text-[0.52rem] tracking-[0.18em] text-ash uppercase">Edited</p>
                        ) : null;
                      })()}
                    </div>
                    <time
                      dateTime={new Date(r.at).toISOString()}
                      className="flex shrink-0 flex-col items-end text-right leading-tight lining-nums tabular-nums sm:w-32"
                    >
                      <span className="text-xs text-ivory/70">{formatTimestamp(r.at).time}</span>
                      <span className="mt-0.5 text-[0.68rem] text-ash">{formatTimestamp(r.at).date}</span>
                    </time>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {entries.length > PREVIEW && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
              >
                {expanded ? 'Show fewer rounds' : `Show all ${entries.length} rounds`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
