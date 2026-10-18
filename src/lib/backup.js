import { uid } from './game.js';
import { sanitize } from './storage.js';

const KIND = 'bluff-night-backup';

/** Downloads the whole saved state (current game + Past Games) as a JSON file. */
export function downloadBackup(game) {
  const payload = { kind: KIND, exportedAt: Date.now(), game };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bluff-night-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Parses a backup file (or a raw saved game). Throws with a readable message if it isn't one. */
export function parseBackup(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('That file is not a Bluff Night backup.');
  }
  const candidate = raw && raw.kind === KIND ? raw.game : raw;
  try {
    return sanitize(candidate).game;
  } catch {
    throw new Error('That file is not a Bluff Night backup.');
  }
}

const roundIds = (rounds) => rounds.map((r) => r.id);

function toArchived(game) {
  return {
    id: uid(),
    startedAt: game.startedAt ?? game.rounds[0].at,
    endedAt: game.endedAt ?? game.rounds[game.rounds.length - 1].at,
    crowned: game.endedAt != null,
    players: game.players.map(({ id, name }) => ({ id, name })),
    rounds: game.rounds,
  };
}

/**
 * Combines a backup with what is on this phone without losing anything:
 * - Past games are merged (games already here are not duplicated).
 * - If the backup has a game in progress, it becomes the current game; the
 *   game currently on this phone moves to Past Games first, unless the backup
 *   already contains it.
 * Returns { game, addedGames, replacedCurrent }.
 */
export function mergeBackup(current, incoming) {
  const archive = [...current.archive];
  const seenGames = new Set(archive.map((g) => g.id));
  const seenRounds = new Set(archive.flatMap((g) => roundIds(g.rounds)));
  let addedGames = 0;

  for (const g of incoming.archive) {
    // Skip games already here, by id or because their rounds are already archived.
    if (seenGames.has(g.id) || roundIds(g.rounds).every((id) => seenRounds.has(id))) continue;
    archive.push(g);
    seenGames.add(g.id);
    roundIds(g.rounds).forEach((id) => seenRounds.add(id));
    addedGames += 1;
  }

  let next = { ...current, archive };
  let replacedCurrent = false;

  if (incoming.rounds.length > 0) {
    const incomingRounds = new Set(roundIds(incoming.rounds));
    const sameGame = current.rounds.length > 0 && roundIds(current.rounds).every((id) => incomingRounds.has(id));
    const alreadyArchived = roundIds(incoming.rounds).every((id) => seenRounds.has(id));
    if (!alreadyArchived) {
      if (current.rounds.length > 0 && !sameGame) next.archive = [...next.archive, toArchived(current)];
      next = {
        ...next,
        players: incoming.players,
        rounds: incoming.rounds,
        startedAt: incoming.startedAt,
        endedAt: incoming.endedAt,
      };
      replacedCurrent = !sameGame;
    }
  } else if (current.rounds.length === 0 && current.players.length === 0) {
    // Fresh phone: take the backup's seated players too.
    next = { ...next, players: incoming.players };
  }

  next.archive = [...next.archive].sort((a, b) => a.startedAt - b.startedAt);
  return { game: next, addedGames, replacedCurrent };
}
