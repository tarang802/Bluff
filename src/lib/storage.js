import { MAX_NAME_LENGTH, MAX_PLAYERS, PLACE_POINTS, cleanName, nameKey, uid } from './game.js';

// Never rename this key: saved games on players' phones live under it.
export const STORAGE_KEY = 'bluff-night:v1';
const BACKUP_KEY = 'bluff-night:corrupt-backup';
const VERSION = 3;

export function emptyGame() {
  return { version: VERSION, players: [], rounds: [], startedAt: null, endedAt: null, archive: [] };
}

const finite = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Unique, named players. `report` is called whenever an entry is dropped. */
function sanitizePlayers(list, report) {
  const ids = new Set();
  const names = new Set();
  const players = [];
  for (const p of list) {
    const id = p && typeof p.id === 'string' && p.id ? p.id : null;
    const name = p ? cleanName(p.name).slice(0, MAX_NAME_LENGTH) : '';
    if (!id || !name || ids.has(id) || names.has(nameKey(name)) || players.length >= MAX_PLAYERS) {
      report();
      continue;
    }
    ids.add(id);
    names.add(nameKey(name));
    players.push({ id, name, addedAt: finite(p.addedAt) ?? Date.now() });
  }
  return players;
}

/**
 * A placing may name a player who has since left the table — keep it for
 * the history (standings simply ignore it). Each player places once per round.
 */
function sanitizeRounds(list, players, report) {
  const byId = new Map(players.map((p) => [p.id, p]));
  const cleanPlacing = (raw, place, fallbackPoints) => {
    if (!raw || typeof raw.playerId !== 'string' || !raw.playerId) return null;
    const name = byId.get(raw.playerId)?.name ?? cleanName(raw.name).slice(0, MAX_NAME_LENGTH);
    if (!name) return null;
    const points = Number.isInteger(raw.points) && raw.points >= 0 ? raw.points : fallbackPoints;
    return { playerId: raw.playerId, name, place, points };
  };

  const rounds = [];
  for (const r of list) {
    if (!r || typeof r !== 'object') {
      report();
      continue;
    }
    let placings;
    if (Array.isArray(r.placings)) {
      placings = [1, 2]
        .map((place) => cleanPlacing(r.placings.find((x) => x && x.place === place), place, PLACE_POINTS[place]))
        .filter(Boolean);
    } else {
      // v1 saves: a single winner worth the points recorded at the time.
      placings = [cleanPlacing({ playerId: r.winnerId, name: r.winnerName, points: r.points }, 1, 1)].filter(Boolean);
    }
    if (placings.length === 2 && placings[0].playerId === placings[1].playerId) placings = [placings[0]];
    if (!placings.length || placings[0].place !== 1) {
      report();
      continue;
    }
    rounds.push({ id: typeof r.id === 'string' && r.id ? r.id : uid(), placings, at: finite(r.at) ?? Date.now() });
  }
  return rounds;
}

/** Past games kept by New Game. A damaged entry is skipped, never the whole save. */
function sanitizeArchive(list, report) {
  if (list === undefined) return []; // saves from before the archive existed
  if (!Array.isArray(list)) {
    report();
    return [];
  }
  const archive = [];
  for (const g of list) {
    if (!g || typeof g !== 'object' || !Array.isArray(g.players) || !Array.isArray(g.rounds)) {
      report();
      continue;
    }
    const players = sanitizePlayers(g.players, report);
    const rounds = sanitizeRounds(g.rounds, players, report);
    if (!rounds.length) {
      report();
      continue;
    }
    archive.push({
      id: typeof g.id === 'string' && g.id ? g.id : uid(),
      startedAt: finite(g.startedAt) ?? rounds[0].at,
      endedAt: finite(g.endedAt) ?? rounds[rounds.length - 1].at,
      crowned: g.crowned === true,
      players: players.map(({ id, name }) => ({ id, name })),
      rounds,
    });
  }
  return archive;
}

/**
 * Validates and repairs a parsed save. Throws if the shape is unusable.
 * Returns { game, repaired } — repaired is true when entries had to be dropped.
 */
export function sanitize(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.players) || !Array.isArray(raw.rounds)) {
    throw new Error('Unrecognised save format');
  }

  let repaired = false;
  const report = () => {
    repaired = true;
  };

  const players = sanitizePlayers(raw.players, report);
  const rounds = sanitizeRounds(raw.rounds, players, report);
  const archive = sanitizeArchive(raw.archive, report);
  const startedAt = rounds.length ? finite(raw.startedAt) ?? rounds[0].at : null;
  const endedAt = rounds.length ? finite(raw.endedAt) : null;

  return {
    game: { version: VERSION, players, rounds, startedAt, endedAt, archive },
    repaired,
  };
}

/** issue: null | 'repaired' | 'corrupt' | 'unavailable' */
export function loadGame() {
  let text;
  try {
    text = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { game: emptyGame(), issue: 'unavailable' };
  }
  if (!text) return { game: emptyGame(), issue: null };

  try {
    const { game, repaired } = sanitize(JSON.parse(text));
    return { game, issue: repaired ? 'repaired' : null };
  } catch {
    try {
      window.localStorage.setItem(BACKUP_KEY, text);
    } catch {
      /* best effort */
    }
    return { game: emptyGame(), issue: 'corrupt' };
  }
}

export function saveGame(game) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
    return true;
  } catch {
    return false;
  }
}
