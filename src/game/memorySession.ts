import { cardsMatch, type MemoryCard } from './memory';

export type MemoryPhase = 'setup' | 'preview' | 'playing' | 'resolving' | 'complete';

export interface MemoryGameState {
  cards: MemoryCard[];
  phase: MemoryPhase;
  previewRemaining: number;
  flippedIds: string[];
  matchedIds: string[];
  moves: number;
  elapsed: number;
  startedAt: number | null;
}

export type MemoryGameAction =
  | { type: 'START'; cards: MemoryCard[]; previewSeconds: number }
  | { type: 'PREVIEW_TICK'; now: number }
  | { type: 'ELAPSED_TICK'; now: number }
  | { type: 'FLIP_CARD'; cardId: string }
  | { type: 'RESOLVE'; now: number }
  | { type: 'RESET' };

export function createMemoryGameState(): MemoryGameState {
  return {
    cards: [],
    phase: 'setup',
    previewRemaining: 0,
    flippedIds: [],
    matchedIds: [],
    moves: 0,
    elapsed: 0,
    startedAt: null,
  };
}

export function memoryGameReducer(
  state: MemoryGameState,
  action: MemoryGameAction,
): MemoryGameState {
  switch (action.type) {
    case 'START':
      return {
        ...createMemoryGameState(),
        cards: action.cards,
        phase: 'preview',
        previewRemaining: action.previewSeconds,
      };

    case 'PREVIEW_TICK':
      if (state.phase !== 'preview') return state;
      if (state.previewRemaining > 1) {
        return { ...state, previewRemaining: state.previewRemaining - 1 };
      }
      return {
        ...state,
        phase: 'playing',
        previewRemaining: 0,
        startedAt: action.now,
      };

    case 'ELAPSED_TICK':
      if ((state.phase !== 'playing' && state.phase !== 'resolving') || state.startedAt === null) {
        return state;
      }
      return {
        ...state,
        elapsed: Math.max(0, Math.floor((action.now - state.startedAt) / 1000)),
      };

    case 'FLIP_CARD': {
      if (
        state.phase !== 'playing'
        || state.matchedIds.includes(action.cardId)
        || state.flippedIds.includes(action.cardId)
        || !state.cards.some((card) => card.id === action.cardId)
      ) {
        return state;
      }
      if (state.flippedIds.length === 0) {
        return { ...state, flippedIds: [action.cardId] };
      }
      return {
        ...state,
        phase: 'resolving',
        flippedIds: [state.flippedIds[0], action.cardId],
        moves: state.moves + 1,
      };
    }

    case 'RESOLVE': {
      if (state.phase !== 'resolving') return state;
      const pair = currentMemoryPair(state);
      if (!pair || !cardsMatch(pair[0], pair[1])) {
        return { ...state, phase: 'playing', flippedIds: [] };
      }

      const matchedIds = [...state.matchedIds, ...state.flippedIds];
      const complete = matchedIds.length === state.cards.length;
      const finalSeconds = complete && state.startedAt !== null
        ? Math.max(1, Math.floor((action.now - state.startedAt) / 1000))
        : state.elapsed;
      return {
        ...state,
        phase: complete ? 'complete' : 'playing',
        flippedIds: [],
        matchedIds,
        elapsed: finalSeconds,
      };
    }

    case 'RESET':
      return createMemoryGameState();
  }
}

export function currentMemoryPairMatches(state: MemoryGameState): boolean {
  const pair = currentMemoryPair(state);
  return Boolean(pair && cardsMatch(pair[0], pair[1]));
}

function currentMemoryPair(state: MemoryGameState): [MemoryCard, MemoryCard] | null {
  if (state.flippedIds.length !== 2) return null;
  const first = state.cards.find((card) => card.id === state.flippedIds[0]);
  const second = state.cards.find((card) => card.id === state.flippedIds[1]);
  return first && second ? [first, second] : null;
}
