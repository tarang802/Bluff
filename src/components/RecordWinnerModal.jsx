import { useEffect, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import { Avatar } from './Ornaments.jsx';
import { PLACE_POINTS, formatCountdown, tierFor } from '../lib/game.js';

const PLACE_LABEL = { 1: '1st', 2: '2nd' };

/**
 * Two taps: the winner (+2), then the runner-up (+1). Tapping a picked card
 * clears it. With only two players the runner-up is filled in automatically.
 * Players are listed in seat order so their positions never shuffle.
 *
 * With `editing` ({ first, second, timeLeft }) it corrects an existing round
 * instead, starting from that round's picks; saving is blocked once time runs out.
 */
export default function RecordWinnerModal({ open, onClose, players, standings, roundNumber, onDeclare, editing }) {
  const [first, setFirst] = useState(null);
  const [second, setSecond] = useState(null);
  const declareRef = useRef(null);
  const byId = new Map(standings.map((s) => [s.id, s]));
  const ready = Boolean(first && second);
  const nameOf = (id) => players.find((p) => p.id === id)?.name;

  const locked = Boolean(editing && editing.timeLeft <= 0);
  const seatedId = (id) => (players.some((p) => p.id === id) ? id : null);

  useEffect(() => {
    if (open) {
      setFirst(editing ? seatedId(editing.first) : null);
      setSecond(editing ? seatedId(editing.second) : null);
    }
    // Only reset when the sheet opens, not on every countdown tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (id) => {
    if (id === first) {
      setFirst(null);
      return;
    }
    if (id === second) {
      setSecond(null);
      return;
    }
    if (!first) {
      setFirst(id);
      if (!second && players.length === 2) setSecond(players.find((p) => p.id !== id).id);
      return;
    }
    setSecond(id);
  };

  // Move focus to Declare once both places are filled.
  useEffect(() => {
    if (ready) declareRef.current?.focus();
  }, [ready]);

  const prompt = locked
    ? 'The 5-minute edit window has closed — this round is now locked.'
    : !first
    ? `Tap the winner — first out of cards takes +${PLACE_POINTS[1]}.`
    : !second
      ? `Now tap the runner-up — second out takes +${PLACE_POINTS[2]}.`
      : `${nameOf(first)} +${PLACE_POINTS[1]} · ${nameOf(second)} +${PLACE_POINTS[2]}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      eyebrow={editing ? `Round ${roundNumber} · Locks in ${formatCountdown(editing.timeLeft)}` : `Round ${roundNumber}`}
      title={editing ? 'CHANGE THE WINNERS' : 'WHO WON THIS ROUND?'}
      footer={
        <>
          <button type="button" className="btn btn-ghost hidden sm:inline-flex" onClick={onClose}>
            Cancel
          </button>
          <button
            ref={declareRef}
            type="button"
            className="btn btn-gold btn-lg flex-1 sm:flex-none"
            disabled={!ready || locked}
            onClick={() => ready && !locked && onDeclare(first, second)}
          >
            <span aria-hidden="true" className="font-display text-base leading-none">♠</span>
            {editing ? 'Save Changes' : 'Declare Winner'}
          </button>
        </>
      }
    >
      <p aria-live="polite" className={`mb-3 text-sm sm:mb-4 ${locked ? 'text-[#f0a3b1]' : ready ? 'text-gold-bright' : 'text-smoke'}`}>
        {prompt}
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 short:sm:grid-cols-4" role="group" aria-label={`Round ${roundNumber} placings`}>
        {players.map((p) => {
          const s = byId.get(p.id);
          const place = p.id === first ? 1 : p.id === second ? 2 : null;
          const score = s?.score ?? 0;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={Boolean(place)}
              aria-label={`${p.name}, ${score} ${score === 1 ? 'point' : 'points'}${place ? `, marked ${PLACE_LABEL[place]} place` : ''}`}
              onClick={() => pick(p.id)}
              className={`card group flex h-full flex-col items-center gap-1.5 px-2 pt-3 pb-2.5 text-center transition-all duration-200 sm:gap-2.5 sm:px-3 sm:pt-4 sm:pb-3.5 ${
                place === 1
                  ? 'border-gold bg-[linear-gradient(180deg,rgb(201_162_74/0.22),rgb(201_162_74/0.05))] shadow-[0_0_0_1px_rgb(201_162_74/0.6),0_16px_30px_-16px_rgb(201_162_74/0.7)]'
                  : place === 2
                    ? 'border-silver/70 bg-[linear-gradient(180deg,rgb(200_204_212/0.12),rgb(200_204_212/0.03))] shadow-[0_0_0_1px_rgb(200_204_212/0.35)]'
                    : 'card-interactive'
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute top-2 right-2 rounded-full border px-1.5 py-0.5 font-caps text-[0.52rem] leading-none font-semibold tracking-[0.1em] transition-all ${
                  place === 1
                    ? 'border-gold bg-gold text-ink'
                    : place === 2
                      ? 'border-silver bg-silver text-ink'
                      : 'border-transparent text-transparent'
                }`}
              >
                {place ? `${PLACE_LABEL[place]} +${PLACE_POINTS[place]}` : '·'}
              </span>
              <Avatar name={p.name} tier={place === 1 ? 'gold' : place === 2 ? 'silver' : tierFor(s)} size="md" className="sm:h-14 sm:w-14 sm:text-sm" />
              <span className="w-full line-clamp-2 break-words font-display text-base leading-tight font-semibold text-ivory sm:text-lg">{p.name}</span>
              <span className="font-caps text-[0.58rem] tracking-[0.2em] text-smoke uppercase">
                <span className={place ? 'text-gold-bright' : 'text-ivory/70'}>{score}</span> {score === 1 ? 'point' : 'points'}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
