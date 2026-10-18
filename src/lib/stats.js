import { computeStandings, getChampions } from './game.js';

/**
 * All-time numbers per player, across Past Games plus the game in progress.
 * Players are matched by id (New Game keeps the same ids), so a rename never
 * splits someone's record. Crowns come from archived games only — tonight's
 * leader hasn't won anything yet.
 */
export function hallOfFame({ archive, players, rounds }) {
  const games = archive.map((g) => ({ players: g.players, rounds: g.rounds, archived: true }));
  if (rounds.length) games.push({ players, rounds, archived: false });

  const stats = new Map();
  const entry = (id, name) => {
    if (!stats.has(id)) {
      stats.set(id, { id, name, games: 0, crowns: 0, wins: 0, seconds: 0, points: 0, roundsPlayed: 0, bestStreak: 0 });
    }
    const s = stats.get(id);
    if (name) s.name = name; // later games carry the newer name
    return s;
  };

  for (const g of games) {
    for (const p of g.players) {
      const s = entry(p.id, p.name);
      s.games += 1;
      s.roundsPlayed += g.rounds.length;
    }
    const streak = new Map();
    for (const r of g.rounds) {
      const winnerId = r.placings.find((p) => p.place === 1)?.playerId;
      for (const pl of r.placings) {
        const s = entry(pl.playerId, stats.get(pl.playerId)?.name ?? pl.name);
        s.points += pl.points;
        if (pl.place === 1) s.wins += 1;
        if (pl.place === 2) s.seconds += 1;
      }
      // Consecutive round wins within one game.
      for (const id of streak.keys()) if (id !== winnerId) streak.set(id, 0);
      if (winnerId) {
        const run = (streak.get(winnerId) ?? 0) + 1;
        streak.set(winnerId, run);
        const s = stats.get(winnerId);
        s.bestStreak = Math.max(s.bestStreak, run);
      }
    }
    if (g.archived) {
      for (const c of getChampions(computeStandings(g.players, g.rounds))) entry(c.id, c.name).crowns += 1;
    }
  }

  // Current names win over archived ones.
  for (const p of players) if (stats.has(p.id)) stats.get(p.id).name = p.name;

  return [...stats.values()]
    .filter((s) => s.games > 0 || s.points > 0)
    .map((s) => ({ ...s, winRate: s.roundsPlayed ? Math.round((s.wins / s.roundsPlayed) * 100) : 0 }))
    .sort((a, b) => b.crowns - a.crowns || b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name));
}
