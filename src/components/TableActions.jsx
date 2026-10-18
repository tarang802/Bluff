import { Crown, Lock, Play, RotateCcw, Trophy, UserPlus } from 'lucide-react';
import { MIN_PLAYERS } from '../lib/game.js';

const Spade = () => <span aria-hidden="true" className="font-display text-base leading-none">♠</span>;

/** Inline toolbar above the leaderboard. The record button lives in the mobile dock on phones. */
export function TableActions({ phase, playerCount, onAddPlayers, onRecord, onResume, onViewChampion, onNewGame, share }) {
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
        {share}
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
      {share}
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

/** Shown under the final standings once a game has ended. */
export function GameOverNotice({ onNewGame, onResume }) {
  return (
    <div className="notice w-full max-w-md px-4 py-4 text-left sm:px-5">
      <p className="flex items-center gap-2 font-caps text-[0.66rem] font-semibold tracking-[0.22em] text-[#f0b7c1] uppercase">
        <Lock size={14} strokeWidth={2} aria-hidden="true" />
        This game is over
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ivory/85">
        The scores are final and no more rounds can be added. To play more rounds, start a new game. This one will be saved
        to Past Games.
      </p>
      <div className="mt-4 flex flex-col items-stretch gap-1.5">
        <button type="button" className="btn btn-gold w-full" onClick={onNewGame}>
          <RotateCcw size={14} strokeWidth={1.8} aria-hidden="true" />
          Start New Game
        </button>
        {/* A quiet text link: it should never compete with the main action or overflow the card. */}
        <button
          type="button"
          className="mx-auto min-h-10 px-2 text-xs text-smoke underline decoration-ivory/20 underline-offset-4 transition-colors hover:text-ivory"
          onClick={onResume}
        >
          Ended by mistake? Resume this game
        </button>
      </div>
    </div>
  );
}

/** Thumb-reach dock for phones — the record button is never more than a tap away. */
export function MobileDock({ phase, playerCount, onAddPlayers, onRecord, onViewChampion, onNewGame }) {
  let main;
  if (phase === 'concluded') {
    // A finished game takes no more rounds, so the next move is a new game.
    main = (
      <>
        <button type="button" className="btn btn-gold btn-lg min-w-0 flex-1 !px-3" onClick={onNewGame}>
          <RotateCcw size={15} strokeWidth={1.8} aria-hidden="true" />
          Start New Game
        </button>
        <button type="button" className="btn btn-ghost btn-lg shrink-0 !px-4" onClick={onViewChampion} aria-label="View champion">
          <Trophy size={17} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </>
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
      <button type="button" className="btn btn-gold btn-lg min-w-0 flex-1 !px-3 tracking-[0.12em] min-[360px]:tracking-[0.16em]" onClick={onRecord}>
        <Spade />
        Record Round Winner
      </button>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/20 bg-ink/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-2">
        {main}
      </div>
    </div>
  );
}
