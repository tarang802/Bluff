import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import RoundHistory from './components/RoundHistory.jsx';
import PastGames from './components/PastGames.jsx';
import AddPlayersModal from './components/AddPlayersModal.jsx';
import RecordWinnerModal from './components/RecordWinnerModal.jsx';
import ChampionScreen from './components/ChampionScreen.jsx';
import ConfirmationDialog from './components/ConfirmationDialog.jsx';
import WinnerCelebration from './components/WinnerCelebration.jsx';
import { EndGameAction, MobileDock, TableActions } from './components/TableActions.jsx';
import { ToastProvider, useToast } from './components/ToastNotifications.jsx';
import { Divider, SuitRow } from './components/Ornaments.jsx';
import { useGame } from './hooks/useGame.js';
import {
  MIN_PLAYERS,
  PLACE_POINTS,
  cleanName,
  computeStandings,
  getChampions,
  uid,
  validateNewPlayer,
} from './lib/game.js';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <BluffNight />
      </ToastProvider>
    </MotionConfig>
  );
}

function BluffNight() {
  const toast = useToast();
  const { game, dispatch, bootIssue, saveFailed } = useGame();
  const gameRef = useRef(game);
  gameRef.current = game;

  const [modal, setModal] = useState(null); // 'players' | 'record' | null
  const [confirm, setConfirm] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [flash, setFlash] = useState(null);
  const [championOpen, setChampionOpen] = useState(() => game.endedAt != null);

  const standings = useMemo(() => computeStandings(game.players, game.rounds), [game.players, game.rounds]);
  const champions = useMemo(() => getChampions(standings), [standings]);
  const scoreById = useMemo(() => new Map(standings.map((p) => [p.id, p.score])), [standings]);
  const roundsPlayed = game.rounds.length;
  const ended = game.endedAt != null;
  const phase = ended ? 'concluded' : roundsPlayed > 0 ? 'live' : game.players.length ? 'seating' : 'closed';

  // ── Storage health notices ────────────────────────────────────────────
  const bootNoticeShown = useRef(false);
  useEffect(() => {
    if (bootNoticeShown.current) return;
    bootNoticeShown.current = true;
    if (bootIssue === 'corrupt') {
      toast.error('Saved game was unreadable', {
        message: 'A fresh table has been set. The damaged save was backed up in this browser.',
        duration: 7000,
      });
    } else if (bootIssue === 'repaired') {
      toast.info('Saved game repaired', { message: 'A few damaged entries were skipped while restoring your game.' });
    } else if (bootIssue === 'unavailable') {
      toast.error('Storage is unavailable', { message: 'This browser is blocking storage, so scores will not survive a refresh.' });
    }
  }, [bootIssue, toast]);

  useEffect(() => {
    if (saveFailed) toast.error('Could not save', { message: 'Your browser refused to store the latest change.' });
  }, [saveFailed, toast]);

  // If another tab ends or resets the game, keep the champion view honest.
  useEffect(() => {
    if (!ended) setChampionOpen(false);
  }, [ended]);

  // ── Players ───────────────────────────────────────────────────────────
  const handleAddPlayer = (raw) => {
    const error = validateNewPlayer(raw, game.players);
    if (error) return { ok: false, error };
    const name = cleanName(raw);
    dispatch({ type: 'ADD_PLAYER', player: { id: uid(), name, addedAt: Date.now() } });
    // Confirmation shows inline in the modal; a toast here would cover its buttons.
    return { ok: true, name };
  };

  const handleRemovePlayer = (id) => {
    const player = standings.find((p) => p.id === id);
    if (!player || ended) return { removed: false };
    if (!roundsPlayed) {
      dispatch({ type: 'REMOVE_PLAYER', id });
      return { removed: true, name: player.name };
    }
    // Mid-game: their points leave with them, so make sure it's deliberate.
    setConfirm({
      eyebrow: 'Leaving the table',
      title: `Remove ${player.name}?`,
      message: `${player.name} has ${player.score} ${player.score === 1 ? 'point' : 'points'}. They come off the leaderboard; their rounds stay in the night's history.`,
      confirmLabel: 'Remove Player',
      cancelLabel: 'Keep Them',
      tone: 'danger',
      onConfirm: () => {
        dispatch({ type: 'REMOVE_PLAYER', id });
        toast.info(`${player.name} left the table`, { message: 'The leaderboard has been re-ranked.' });
      },
    });
    return { removed: false };
  };

  // ── Rounds ────────────────────────────────────────────────────────────
  const openRecord = () => {
    if (ended) {
      setChampionOpen(true);
      return;
    }
    if (game.players.length < MIN_PLAYERS) {
      toast.error(`Seat at least ${MIN_PLAYERS} players`, { message: 'A round of Bluff needs at least two people at the table.' });
      setModal('players');
      return;
    }
    setModal('record');
  };

  const handleUndo = useCallback(
    (roundId) => {
      const g = gameRef.current;
      const last = g.rounds[g.rounds.length - 1];
      if (g.endedAt) {
        toast.info('The game has ended', { message: 'Resume the game first if a round needs correcting.' });
        return;
      }
      if (!last) {
        toast.info('Nothing to undo', { message: 'No rounds have been recorded yet.' });
        return;
      }
      if (typeof roundId === 'string' && roundId !== last.id) {
        toast.info('That round is no longer the latest', { message: 'Use the Undo button to remove the most recent round.' });
        return;
      }
      const names = last.placings.map((pl) => g.players.find((p) => p.id === pl.playerId)?.name ?? pl.name);
      dispatch({ type: 'UNDO_ROUND', roundId: last.id });
      setCelebration(null);
      setFlash(null);
      toast.info(`Round ${g.rounds.length} undone`, { message: `Points taken back from ${names.join(' and ')}.` });
    },
    [dispatch, toast],
  );

  const handleDeclare = (firstId, secondId) => {
    const winner = standings.find((p) => p.id === firstId);
    const runnerUp = standings.find((p) => p.id === secondId);
    if (!winner || !runnerUp || firstId === secondId || ended) return;
    const round = roundsPlayed + 1;
    const record = {
      id: uid(),
      at: Date.now(),
      placings: [
        { playerId: winner.id, name: winner.name, place: 1, points: PLACE_POINTS[1] },
        { playerId: runnerUp.id, name: runnerUp.name, place: 2, points: PLACE_POINTS[2] },
      ],
    };
    dispatch({ type: 'RECORD_ROUND', round: record });
    setModal(null);
    setFlash({ ids: [winner.id, runnerUp.id], key: record.id });
    setCelebration({
      key: record.id,
      round,
      name: winner.name,
      points: PLACE_POINTS[1],
      score: winner.score + PLACE_POINTS[1],
      runnerUp: runnerUp.name,
      runnerUpPoints: PLACE_POINTS[2],
    });
    toast.success(`Round ${round}: ${winner.name} +${PLACE_POINTS[1]}, ${runnerUp.name} +${PLACE_POINTS[2]}`, {
      message: 'Wrong players? Undo it right here.',
      action: { label: 'Undo', onClick: () => handleUndo(record.id) },
    });
  };

  const closeCelebration = useCallback(() => setCelebration(null), []);

  // ── Game lifecycle ────────────────────────────────────────────────────
  const handleEndGame = () => {
    if (!roundsPlayed) {
      toast.error('No rounds played yet', { message: 'Record at least one round before crowning a champion.' });
      return;
    }
    const names = champions.map((c) => c.name);
    const leader = names.length > 2 ? `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}` : names.join(' & ');
    setConfirm({
      eyebrow: 'Last call',
      title: 'End the game?',
      message: `After ${roundsPlayed} ${roundsPlayed === 1 ? 'round' : 'rounds'}, ${
        champions.length > 1 ? `the crown is shared by ${leader}` : `the crown goes to ${leader}`
      }. You can resume afterwards if you change your mind.`,
      confirmLabel: 'Crown the Champion',
      cancelLabel: 'Keep Playing',
      onConfirm: () => {
        dispatch({ type: 'END_GAME', at: Date.now() });
        setChampionOpen(true);
      },
    });
  };

  const handleResume = () => {
    dispatch({ type: 'RESUME_GAME' });
    setChampionOpen(false);
    toast.success('Game resumed', { message: 'Cards back on the table — keep recording rounds.' });
  };

  const handleNewGame = () => {
    if (!roundsPlayed && !ended) {
      toast.info('The table is already fresh', {
        message: game.players.length ? 'No rounds recorded yet — declare the first winner when ready.' : 'Add players to begin the night.',
      });
      return;
    }
    setConfirm({
      eyebrow: 'Fresh deck',
      title: 'Start a new game?',
      message: `This game (${roundsPlayed} ${roundsPlayed === 1 ? 'round' : 'rounds'}) is saved to Past Games, then the scores start from zero. Your players stay seated.`,
      confirmLabel: 'Save & Start New',
      onConfirm: () => {
        dispatch({ type: 'NEW_GAME', id: uid(), at: Date.now() });
        setChampionOpen(false);
        setFlash(null);
        toast.success('Game saved to Past Games', { message: 'Same table, fresh scores. Shuffle up.' });
      },
    });
  };

  const runConfirm = () => {
    const action = confirm?.onConfirm;
    setConfirm(null);
    action?.();
  };

  const actionProps = {
    phase,
    playerCount: game.players.length,
    roundsPlayed,
    onAddPlayers: () => setModal('players'),
    onRecord: openRecord,
    onUndo: () => handleUndo(),
    onResume: handleResume,
    onViewChampion: () => setChampionOpen(true),
    onNewGame: handleNewGame,
  };

  let footnote = null;
  if (game.players.length === 1) footnote = 'Seat one more player to deal the first round.';
  else if (phase === 'seating') footnote = 'Everyone is seated. Record the first round winner when the hand is done.';
  else if (phase === 'concluded') footnote = 'This game has concluded. Resume it, or start a new game with the same table.';

  return (
    <div className="relative min-h-dvh">
      <a
        href="#leaderboard"
        className="sr-only z-[70] bg-gold px-4 py-2 font-caps text-xs text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to leaderboard
      </a>

      <Header phase={phase} roundsPlayed={roundsPlayed} onNewGame={handleNewGame} />

      <main className="pb-16 md:pb-20">
        <HeroSection playerCount={game.players.length} roundsPlayed={roundsPlayed} champions={champions} />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Divider className="mb-12 sm:mb-16" glyph="♠" />

          <div id="leaderboard" className="scroll-mt-6">
            <Leaderboard
              standings={standings}
              flash={flash}
              onAddPlayers={() => setModal('players')}
              footnote={footnote}
              closingAction={phase === 'live' ? <EndGameAction onEnd={handleEndGame} /> : null}
              toolbar={game.players.length > 0 ? <TableActions {...actionProps} /> : null}
            />
          </div>

          {game.players.length > 0 && (
            <div className="mt-16 sm:mt-24">
              <RoundHistory rounds={game.rounds} players={game.players} />
            </div>
          )}

          {game.archive.length > 0 && (
            <div className="mt-16 sm:mt-24">
              <PastGames archive={game.archive} />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gold/10 pb-28 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-10 text-center sm:px-6 lg:px-8">
          <SuitRow className="text-xs" />
          <p className="mt-2 text-xs text-ash">Bluff Night · Scores live only in this browser.</p>
        </div>
      </footer>

      <MobileDock {...actionProps} />

      <AddPlayersModal
        open={modal === 'players'}
        onClose={() => setModal(null)}
        players={game.players}
        inProgress={roundsPlayed > 0}
        scores={scoreById}
        onAdd={handleAddPlayer}
        onRemove={handleRemovePlayer}
      />
      <RecordWinnerModal
        open={modal === 'record'}
        onClose={() => setModal(null)}
        players={game.players}
        standings={standings}
        roundNumber={roundsPlayed + 1}
        onDeclare={handleDeclare}
      />
      <ChampionScreen
        open={championOpen && ended}
        champions={champions}
        standings={standings}
        roundsPlayed={roundsPlayed}
        onBack={() => setChampionOpen(false)}
        onNewGame={handleNewGame}
      />
      <WinnerCelebration data={celebration} onDone={closeCelebration} />
      <ConfirmationDialog config={confirm} onCancel={() => setConfirm(null)} onConfirm={runConfirm} />
    </div>
  );
}
