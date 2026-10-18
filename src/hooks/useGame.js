import { useEffect, useReducer, useState } from 'react';
import { MAX_PLAYERS, MIN_PLAYERS, editTimeLeft, nameKey } from '../lib/game.js';
import { STORAGE_KEY, emptyGame, loadGame, sanitize, saveGame } from '../lib/storage.js';

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const { player } = action;
      if (state.endedAt || state.players.length >= MAX_PLAYERS) return state;
      if (state.players.some((p) => nameKey(p.name) === nameKey(player.name))) return state;
      return { ...state, players: [...state.players, player] };
    }
    case 'RENAME_PLAYER': {
      // Scores and history follow the player id, so only the label changes.
      const { id, name } = action;
      if (state.players.some((p) => p.id !== id && nameKey(p.name) === nameKey(name))) return state;
      return { ...state, players: state.players.map((p) => (p.id === id ? { ...p, name } : p)) };
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
    case 'EDIT_ROUND': {
      // Corrections are only allowed inside the edit window after a round is declared.
      const index = state.rounds.findIndex((r) => r.id === action.roundId);
      const round = state.rounds[index];
      if (!round || editTimeLeft(round, action.at) <= 0) return state;
      const ids = action.placings.map((p) => p.playerId);
      const seated = ids.every((id) => state.players.some((p) => p.id === id));
      if (!seated || new Set(ids).size !== ids.length || action.placings[0]?.place !== 1) return state;
      const rounds = [...state.rounds];
      rounds[index] = { ...round, placings: action.placings, editedAt: action.at };
      return { ...state, rounds };
    }
    case 'END_GAME':
      if (!state.rounds.length || state.endedAt) return state;
      return { ...state, endedAt: action.at };
    case 'RESUME_GAME':
      return state.endedAt ? { ...state, endedAt: null } : state;
    case 'NEW_GAME': {
      // Same friends, fresh scores — the finished game moves to the archive.
      if (!state.rounds.length) return { ...state, startedAt: null, endedAt: null };
      const past = {
        id: action.id,
        startedAt: state.startedAt ?? state.rounds[0].at,
        endedAt: state.endedAt ?? action.at,
        crowned: state.endedAt != null,
        players: state.players.map(({ id, name }) => ({ id, name })),
        rounds: state.rounds,
      };
      return { ...state, archive: [...state.archive, past], rounds: [], startedAt: null, endedAt: null };
    }
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
