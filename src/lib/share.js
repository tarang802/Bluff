import { PLACE_POINTS, formatTimestamp } from './game.js';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

/**
 * Plain-text standings for a group chat.
 * `final` marks a finished game (champions get a crown instead of a medal).
 */
export function standingsText({ standings, champions, roundsPlayed, final, at = Date.now() }) {
  const { date } = formatTimestamp(at);
  const championIds = new Set(champions.map((c) => c.id));
  const lines = [
    `♠ BLUFF NIGHT · ${date}`,
    final ? `Final result after ${roundsPlayed} ${roundsPlayed === 1 ? 'round' : 'rounds'}` : `Standings after ${roundsPlayed} ${roundsPlayed === 1 ? 'round' : 'rounds'}`,
    '',
  ];

  if (final && champions.length) {
    lines.push(`👑 ${champions.length > 1 ? 'Joint champions' : 'Champion'}: ${champions.map((c) => c.name).join(' & ')}`, '');
  }

  for (const p of standings) {
    const mark = final && championIds.has(p.id) ? '👑' : p.score > 0 ? MEDALS[p.rank] ?? `${p.rank}.` : `${p.rank}.`;
    lines.push(`${mark} ${p.name} — ${p.score} ${p.score === 1 ? 'pt' : 'pts'} (${p.roundsWon} ${p.roundsWon === 1 ? 'win' : 'wins'}, ${p.seconds}× 2nd)`);
  }

  lines.push('', `Winner +${PLACE_POINTS[1]} · Runner-up +${PLACE_POINTS[2]}`);
  if (typeof window !== 'undefined') lines.push(window.location.origin);
  return lines.join('\n');
}

/** Opens WhatsApp (app on phones, web on desktop) with the text ready to send. */
export function shareOnWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}

/** Copies text; resolves true on success. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / insecure contexts: fall back to a hidden textarea.
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
