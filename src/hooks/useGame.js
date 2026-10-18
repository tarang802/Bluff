import { useEffect, useReducer, useState } from 'react';
import { MAX_PLAYERS, MIN_PLAYERS, nameKey } from '../lib/game.js';
import { STORAGE_KEY, emptyGame, loadGame, sanitize, saveGame } from '../lib/storage.js';

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const { player } = action;
      if (state.endedAt || state.players.length >= MAX_PLAYERS) return state;
      if (state.players.some((p) => nameKey(p.name) === nameKey(player.name))) return state;
      return { ...state, players: [...state.players, player] };
    }
    case 'REMOVE_PLAYER': {
      // Their past rounds stay in the history; standings drop their points.
      if (state.endedAt) return state;
      return { ...state, players: state.players.filter((p) => p.id !== action.id) };
    }
    case 'RECORD_ROUND': {
      const { round } = action;
      if (state.endedAt || state.players.length < MIN_PLAYERS) return state;
      const ids = round.placings.map((p) => p.playerId);
      const seated = ids.every((id) => state.players.some((p) => p.id === id));
      if (!seated || new Set(ids).size !== ids.length || round.placings[0]?.place !== 1) return state;
      return { ...state, rounds: [...state.rounds, round], startedAt: state.startedAt ?? round.at };
    }
    case 'UNDO_ROUND': {
      const last = state.rounds[state.rounds.length - 1];
      if (state.endedAt || !last || (action.roundId && action.roundId !== last.id)) return state;
      const rounds = state.rounds.slice(0, -1);
      return { ...state, rounds, startedAt: rounds.length ? state.startedAt : null };
    }
    case 'END_GAME':
      if (!state.rounds.length || state.endedAt) return state;
      return { ...state, endedAt: action.at };
    case 'RESUME_GAME':
      return state.endedAt ? { ...state, endedAt: null } : state;
    case 'NEW_GAME':
      // Same friends, fresh scores.
      return { ...state, rounds: [], startedAt: null, endedAt: null };
    case 'HYDRATE':
      return action.game;
    default:
      return state;
  }
}

export function useGame() {
  const [boot] = useState(loadGame);
  const [game, dispatch] = useReducer(reducer, boot.game);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setSaveFailed(!saveGame(game));
  }, [game]);

  // Keep multiple tabs on the same device in step.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        const next = e.newValue ? sanitize(JSON.parse(e.newValue)).game : emptyGame();
        dispatch({ type: 'HYDRATE', game: next });
      } catch {
        /* ignore unreadable writes from elsewhere */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { game, dispatch, bootIssue: boot.issue, saveFailed };
}
