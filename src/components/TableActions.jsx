import { Crown, Play, Trophy, Undo2, UserPlus } from 'lucide-react';
import { MIN_PLAYERS } from '../lib/game.js';

const Spade = () => <span aria-hidden="true" className="font-display text-base leading-none">♠</span>;

/** Inline toolbar above the leaderboard. The record button lives in the mobile dock on phones. */
export function TableActions({ phase, playerCount, roundsPlayed, onAddPlayers, onRecord, onUndo, onResume, onViewChampion, onNewGame }) {
  if (phase === 'concluded') {
    return (
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button type="button" className="btn btn-gold hidden md:inline-flex" onClick={onViewChampion}>
          <Trophy size={16} strokeWidth={1.8} aria-hidden="true" />
          View Champion
        </button>
        <button type="button" className="btn btn-ghost flex-1 sm:flex-none" onClick={onResume}>
          <Play size={14} strokeWidth={1.8} aria-hidden="true" />
          Resume Game
        </button>
        <button type="button" className="btn btn-outline flex-1 sm:flex-none" onClick={onNewGame}>
          Start New Game
        </button>
      </div>
    );
  }

  const canRecord = playerCount >= MIN_PLAYERS;

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      <button
        type="button"
        className="btn btn-gold btn-lg hidden md:inline-flex"
        onClick={onRecord}
        disabled={!canRecord}
        title={canRecord ? undefined : `Seat at least ${MIN_PLAYERS} players first`}
      >
        <Spade />
        Record Round Winner
      </button>
      <button type="button" className="btn btn-outline flex-1 sm:flex-none md:btn-lg" onClick={onAddPlayers}>
        <UserPlus size={15} strokeWidth={1.8} aria-hidden="true" />
        {playerCount > 0 ? 'Add / Remove Players' : 'Add Players'}
      </button>
      {roundsPlayed > 0 && (
        <button type="button" className="btn btn-ghost flex-1 sm:flex-none md:btn-lg" onClick={onUndo}>
          <Undo2 size={15} strokeWidth={1.8} aria-hidden="true" />
          Undo Round {roundsPlayed}
        </button>
      )}
    </div>
  );
}

/** Sits beneath the standings: the natural place to call time on the night. */
export function EndGameAction({ onEnd }) {
  return (
    <button type="button" className="btn btn-wine w-full sm:w-auto" onClick={onEnd}>
      <Crown size={15} strokeWidth={1.8} aria-hidden="true" />
      End Game &amp; Crown Champion
    </button>
  );
}

/** Thumb-reach dock for phones — the record button is never more than a tap away. */
export function MobileDock({ phase, playerCount, roundsPlayed, onAddPlayers, onRecord, onUndo, onViewChampion }) {
  let main;
  if (phase === 'concluded') {
    main = (
      <button type="button" className="btn btn-gold btn-lg min-w-0 flex-1" onClick={onViewChampion}>
        <Trophy size={16} strokeWidth={1.8} aria-hidden="true" />
        View Champion
      </button>
    );
  } else if (playerCount < MIN_PLAYERS) {
    main = (
      <button type="button" className="btn btn-gold btn-lg min-w-0 flex-1 !px-3" onClick={onAddPlayers}>
        <UserPlus size={16} strokeWidth={1.8} aria-hidden="true" />
        {playerCount === 0 ? 'Add Players' : 'Seat One More Player'}
      </button>
    );
  } else {
    main = (
      <button type="button" className="btn btn-gold btn-lg min-w-0 flex-1 !px-3 tracking-[0.1em] min-[360px]:tracking-[0.16em]" onClick={onRecord}>
        <Spade />
        {/* Shorter label on the narrowest phones so the undo button still fits. */}
        <span className="min-[360px]:hidden">Record Winner</span>
        <span className="hidden min-[360px]:inline">Record Round Winner</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/20 bg-ink/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-2">
        {main}
        {phase === 'live' && roundsPlayed > 0 && (
          <button type="button" className="btn btn-ghost btn-lg shrink-0 !px-4" onClick={onUndo} aria-label={`Undo round ${roundsPlayed}`}>
            <Undo2 size={17} strokeWidth={1.8} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
