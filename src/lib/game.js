export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 15;
export const MAX_NAME_LENGTH = 20;
/** Points per finishing place: the first player out of cards takes 2, the next takes 1. */
export const PLACE_POINTS = { 1: 2, 2: 1 };

export function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Collapse internal whitespace and trim. */
export function cleanName(raw) {
  return String(raw ?? '').replace(/\s+/g, ' ').trim();
}

/** Case-insensitive key used for duplicate detection. */
export function nameKey(name) {
  return cleanName(name).toLocaleLowerCase();
}

export function initials(name) {
  const parts = cleanName(name).split(' ').filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return Array.from(parts[0]).slice(0, 2).join('').toUpperCase();
  const first = Array.from(parts[0])[0];
  const last = Array.from(parts[parts.length - 1])[0];
  return `${first}${last}`.toUpperCase();
}

/** Returns an error message, or null when the name can be seated. */
export function validateNewPlayer(raw, players) {
  const name = cleanName(raw);
  if (!name) return 'Give the player a name first.';
  if (name.length > MAX_NAME_LENGTH) return `Keep names under ${MAX_NAME_LENGTH + 1} characters.`;
  if (players.length >= MAX_PLAYERS) return `The table seats ${MAX_PLAYERS} players at most.`;
  const existing = players.find((p) => nameKey(p.name) === nameKey(name));
  if (existing) return `${existing.name} is already seated at the table.`;
  return null;
}

/**
 * Scores are derived from the round log so they can never drift out of sync
 * with history (undo simply removes the last round). Each round holds
 * `placings` — the winner (place 1) and runner-up (place 2). Placings for
 * players who have since left the table are ignored.
 *
 * Ordering: score desc → more rounds won → whoever reached that score first → seat.
 * Ranks use competition ranking on score, so tied scores share a rank (1, 1, 3).
 */
export function computeStandings(players, rounds) {
  const stats = new Map(
    players.map((p, seat) => [p.id, { ...p, seat, score: 0, roundsWon: 0, seconds: 0, reachedAt: -1 }]),
  );
  rounds.forEach((round, index) => {
    for (const placing of round.placings) {
      const s = stats.get(placing.playerId);
      if (!s) continue;
      s.score += placing.points;
      if (placing.place === 1) s.roundsWon += 1;
      if (placing.place === 2) s.seconds += 1;
      s.reachedAt = index;
    }
  });

  const sorted = [...stats.values()].sort(
    (a, b) => b.score - a.score || b.roundsWon - a.roundsWon || a.reachedAt - b.reachedAt || a.seat - b.seat,
  );

  let rank = 0;
  return sorted.map((p, i) => {
    if (i === 0 || p.score !== sorted[i - 1].score) rank = i + 1;
    const tied =
      (i > 0 && sorted[i - 1].score === p.score) ||
      (i < sorted.length - 1 && sorted[i + 1].score === p.score);
    return { ...p, rank, tied };
  });
}

export function placingFor(round, place) {
  return round.placings.find((p) => p.place === place) ?? null;
}

/** Everyone sharing the top score, provided anyone has scored at all. */
export function getChampions(standings) {
  if (!standings.length || standings[0].score <= 0) return [];
  const top = standings[0].score;
  return standings.filter((p) => p.score === top);
}

export function leaderLabel(champions) {
  if (!champions.length) return null;
  if (champions.length === 1) return champions[0].name;
  if (champions.length === 2) return `${champions[0].name} & ${champions[1].name}`;
  return `${champions.length}-way tie`;
}

/** Medal tier for top three — only once a player has actually scored. */
export function tierFor(player) {
  if (!player || player.score <= 0) return null;
  if (player.rank === 1) return 'gold';
  if (player.rank === 2) return 'silver';
  if (player.rank === 3) return 'bronze';
  return null;
}

const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

export function formatTimestamp(ms) {
  const date = new Date(ms);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay ? timeFmt.format(date) : `${dayFmt.format(date)} · ${timeFmt.format(date)}`;
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}
