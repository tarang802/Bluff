import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import RoundHistory from './components/RoundHistory.jsx';
import PastGames from './components/PastGames.jsx';
import HallOfFame from './components/HallOfFame.jsx';
import AddPlayersModal from './components/AddPlayersModal.jsx';
import RecordWinnerModal from './components/RecordWinnerModal.jsx';
import ChampionScreen from './components/ChampionScreen.jsx';
import ConfirmationDialog from './components/ConfirmationDialog.jsx';
import WinnerCelebration from './components/WinnerCelebration.jsx';
import { EndGameAction, GameOverNotice, MobileDock, TableActions } from './components/TableActions.jsx';
import { ToastProvider, useToast } from './components/ToastNotifications.jsx';
import ShareButtons from './components/ShareButtons.jsx';
import BackupPanel from './components/BackupPanel.jsx';
import { downloadBackup, mergeBackup, parseBackup } from './lib/backup.js';
import InstallBanner from './components/InstallBanner.jsx';
import InstallGuide from './components/InstallGuide.jsx';
import { useInstallPrompt } from './hooks/useInstallPrompt.js';
import { standingsText } from './lib/share.js';
import { Divider, SuitRow } from './components/Ornaments.jsx';
import { useGame } from './hooks/useGame.js';
import { useNow } from './hooks/useNow.js';
import {
  MIN_PLAYERS,
  EDIT_WINDOW_MS,
  PLACE_POINTS,
  editTimeLeft,
  cleanName,
  computeStandings,
  getChampions,
  uid,
  validateNewPlayer,
  validatePlayerName,
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

  const [modal, setModal] = useState(null); // 'players' | 'record' | 'edit' | null
  const [editingId, setEditingId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [flash, setFlash] = useState(null);
  // Latest state for confirmations that run after other changes (e.g. a restore).
  const gameRef = useRef(game);
  gameRef.current = game;
  const installApp = useInstallPrompt();
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [championOpen, setChampionOpen] = useState(() => game.endedAt != null);

  const standings = useMemo(() => computeStandings(game.players, game.rounds), [game.players, game.rounds]);
  const champions = useMemo(() => getChampions(standings), [standings]);
  const scoreById = useMemo(() => new Map(standings.map((p) => [p.id, p.score])), [standings]);
  const roundsPlayed = game.rounds.length;

  // Rounds are chronological, so something is editable only while the latest
  // round is inside the edit window. Tick every second just for that stretch.
  const latestAt = game.rounds[roundsPlayed - 1]?.at ?? 0;
  const now = useNow(Date.now() - latestAt < EDIT_WINDOW_MS || modal === 'edit');
  const editingIndex = game.rounds.findIndex((r) => r.id === editingId);
  const editingRound = game.rounds[editingIndex];
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

  const handleRenamePlayer = (id, raw) => {
    const error = validatePlayerName(raw, game.players, id);
    if (error) return { ok: false, error };
    const name = cleanName(raw);
    dispatch({ type: 'RENAME_PLAYER', id, name });
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
      toast.error('This game has ended', { message: 'No more rounds can be added. Start a new game to keep playing.' });
      return;
    }
    if (game.players.length < MIN_PLAYERS) {
      toast.error(`Seat at least ${MIN_PLAYERS} players`, { message: 'A round of Bluff needs at least two people at the table.' });
      setModal('players');
      return;
    }
    setModal('record');
  };

  const openEdit = (roundId) => {
    setEditingId(roundId);
    setModal('edit');
  };

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
      message: 'Wrong players? You can fix it for 5 minutes.',
      action: { label: 'Edit', onClick: () => openEdit(record.id) },
    });
  };

  const handleEditSave = (firstId, secondId) => {
    const round = game.rounds.find((r) => r.id === editingId);
    const winner = standings.find((p) => p.id === firstId);
    const runnerUp = standings.find((p) => p.id === secondId);
    if (!round || !winner || !runnerUp || firstId === secondId) return;
    const at = Date.now();
    setModal(null);
    if (editTimeLeft(round, at) <= 0) {
      toast.error('Too late to edit', { message: 'Rounds lock 5 minutes after they are declared.' });
      return;
    }
    dispatch({
      type: 'EDIT_ROUND',
      roundId: round.id,
      at,
      placings: [
        { playerId: winner.id, name: winner.name, place: 1, points: PLACE_POINTS[1] },
        { playerId: runnerUp.id, name: runnerUp.name, place: 2, points: PLACE_POINTS[2] },
      ],
    });
    setFlash({ ids: [winner.id, runnerUp.id], key: `${round.id}-${at}` });
    toast.success(`Round ${editingIndex + 1} updated`, {
      message: `${winner.name} +${PLACE_POINTS[1]}, ${runnerUp.name} +${PLACE_POINTS[2]}. Scores recalculated.`,
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
      }.`,
      warningTitle: 'Once the game ends',
      warnings: [
        'The scores become final and the champion is crowned.',
        'No more rounds can be added to this game.',
        'To keep playing, start a new game. This one is saved to Past Games.',
      ],
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

  // ── Backup ────────────────────────────────────────────────────────────
  const handleBackup = () => {
    if (!game.players.length && !roundsPlayed && !game.archive.length) {
      toast.info('Nothing to back up yet', { message: 'Play a game first, then save a backup.' });
      return;
    }
    downloadBackup(game);
    toast.success('Backup saved', { message: 'Keep the file somewhere safe, like your Google Drive or Files app.' });
  };

  const handleRestoreFile = async (file) => {
    let incoming;
    try {
      incoming = parseBackup(await file.text());
    } catch (err) {
      toast.error('Could not restore', { message: err.message });
      return;
    }
    const pastCount = incoming.archive.length;
    setConfirm({
      eyebrow: 'The vault',
      title: 'Restore this backup?',
      message: `The file has ${pastCount} past ${pastCount === 1 ? 'game' : 'games'}${
        incoming.rounds.length ? ` and a game in progress (${incoming.rounds.length} rounds)` : ''
      }.`,
      warningTitle: 'Nothing is deleted',
      warnings: [
        'Past games are merged with the ones on this phone, without duplicates.',
        "If the backup has a game in progress, it becomes the current game and this phone's current game moves to Past Games.",
      ],
      confirmLabel: 'Restore & Merge',
      onConfirm: () => {
        const { game: merged, addedGames, replacedCurrent } = mergeBackup(gameRef.current, incoming);
        dispatch({ type: 'HYDRATE', game: merged });
        setChampionOpen(false);
        setFlash(null);
        toast.success('Backup restored', {
          message: `${addedGames} past ${addedGames === 1 ? 'game' : 'games'} added${replacedCurrent ? ', game in progress restored' : ''}.`,
        });
      },
    });
  };

  // One tap opens the browser's own install dialog (Chrome, Edge, Samsung).
  // Browsers without one (iPhone, Firefox, in-app browsers) get short steps.
  const handleInstall = async () => {
    if (installApp.canPrompt) {
      if (await installApp.install()) toast.success('Bluff Night installed', { message: 'Open it from your home screen, even offline.' });
      return;
    }
    setInstallGuideOpen(true);
  };

  const runConfirm = () => {
    const action = confirm?.onConfirm;
    setConfirm(null);
    action?.();
  };

  const shareText = () =>
    standingsText({ standings, champions, roundsPlayed, final: ended, at: game.endedAt ?? game.rounds[roundsPlayed - 1]?.at });

  const actionProps = {
    phase,
    playerCount: game.players.length,
    roundsPlayed,
    onAddPlayers: () => setModal('players'),
    onRecord: openRecord,
    onResume: handleResume,
    onViewChampion: () => setChampionOpen(true),
    onNewGame: handleNewGame,
    share: roundsPlayed > 0 ? <ShareButtons getText={shareText} label="Share" className="w-full sm:w-auto" size="md:px-4 lg:btn-lg" /> : null,
  };

  let footnote = null;
  if (game.players.length === 1) footnote = 'Seat one more player to deal the first round.';
  else if (phase === 'seating') footnote = 'Everyone is seated. Record the first round winner when the hand is done.';

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

        {/* One content width for every section below the hero, so all edges line up. */}
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Divider className="mb-12 sm:mb-16" glyph="♠" />

          {installApp.showInstall && /^(ios|android)/.test(installApp.platform) && <InstallBanner onInstall={handleInstall} />}

          <div id="leaderboard" className="scroll-mt-6">
            <Leaderboard
              standings={standings}
              flash={flash}
              onAddPlayers={() => setModal('players')}
              footnote={footnote}
              closingAction={
                phase === 'live' ? (
                  <EndGameAction onEnd={handleEndGame} />
                ) : phase === 'concluded' ? (
                  <GameOverNotice onNewGame={handleNewGame} onResume={handleResume} />
                ) : null
              }
              toolbar={game.players.length > 0 ? <TableActions {...actionProps} /> : null}
            />
          </div>

          {game.players.length > 0 && (
            <div className="mt-16 sm:mt-24">
              <RoundHistory rounds={game.rounds} players={game.players} now={now} onEdit={openEdit} />
            </div>
          )}

          {(game.archive.length > 0 || roundsPlayed > 0) && (
            <div className="mt-16 sm:mt-24">
              <HallOfFame archive={game.archive} players={game.players} rounds={game.rounds} />
            </div>
          )}

          {game.archive.length > 0 && (
            <div className="mt-16 sm:mt-24">
              <PastGames archive={game.archive} />
            </div>
          )}

          <div className="mt-16 sm:mt-24">
            <BackupPanel
              onBackup={handleBackup}
              onRestoreFile={handleRestoreFile}
              onInstall={handleInstall}
              showInstall={installApp.showInstall}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-gold/10 pb-28 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-12 text-center sm:px-6 lg:px-8">
          <Divider className="w-full max-w-xs" glyph="♠" />
          <p className="mt-6 font-caps text-[0.62rem] font-semibold tracking-[0.24em] whitespace-nowrap text-gold/80 min-[360px]:tracking-[0.3em] sm:text-[0.7rem] sm:tracking-[0.42em]">
            THE HOUSE ALWAYS REMEMBERS
          </p>
          <p className="mt-2 font-display text-base text-smoke italic">Bluff Night · The House of Bluff</p>
          <SuitRow className="mt-5 text-xs" />
          <p className="mt-4 text-[0.7rem] text-ash">Scores are kept on this device. Save a backup from the Vault to keep them safe.</p>
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
        onRename={handleRenamePlayer}
      />
      <RecordWinnerModal
        open={modal === 'record'}
        onClose={() => setModal(null)}
        players={game.players}
        standings={standings}
        roundNumber={roundsPlayed + 1}
        onDeclare={handleDeclare}
      />
      <RecordWinnerModal
        open={modal === 'edit' && Boolean(editingRound)}
        onClose={() => setModal(null)}
        players={game.players}
        standings={standings}
        roundNumber={editingIndex + 1}
        onDeclare={handleEditSave}
        editing={
          editingRound && {
            first: editingRound.placings.find((p) => p.place === 1)?.playerId,
            second: editingRound.placings.find((p) => p.place === 2)?.playerId,
            timeLeft: editTimeLeft(editingRound, now),
          }
        }
      />
      <ChampionScreen
        open={championOpen && ended}
        champions={champions}
        standings={standings}
        roundsPlayed={roundsPlayed}
        shareText={shareText}
        onBack={() => setChampionOpen(false)}
        onNewGame={handleNewGame}
      />
      <WinnerCelebration data={celebration} onDone={closeCelebration} />
      <ConfirmationDialog config={confirm} onCancel={() => setConfirm(null)} onConfirm={runConfirm} />
      <InstallGuide open={installGuideOpen} onClose={() => setInstallGuideOpen(false)} platform={installApp.platform} />
    </div>
  );
}
