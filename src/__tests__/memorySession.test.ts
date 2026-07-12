import { describe, expect, it } from 'vitest';
import type { MemoryCard } from '../game/memory';
import {
  createMemoryGameState,
  currentMemoryPairMatches,
  memoryGameReducer,
  type MemoryGameState,
} from '../game/memorySession';
import type { Vehicle } from '../vehicleData';

const vehicles: Vehicle[] = [
  { id: 'red-1', name: 'Red one', image: '/red-1.png', color: 'red', category: 'car' },
  { id: 'red-2', name: 'Red two', image: '/red-2.png', color: 'red', category: 'race' },
  { id: 'blue-1', name: 'Blue one', image: '/blue-1.png', color: 'blue', category: 'car' },
  { id: 'blue-2', name: 'Blue two', image: '/blue-2.png', color: 'blue', category: 'bus' },
];

const cards: MemoryCard[] = vehicles.map((vehicle, index) => ({
  id: `card-${index}`,
  vehicle,
  matchKey: index < 2 ? 'color:red' : 'color:blue',
}));

function startPlaying(deck = cards): MemoryGameState {
  let state = memoryGameReducer(createMemoryGameState(), {
    type: 'START', cards: deck, previewSeconds: 1,
  });
  state = memoryGameReducer(state, { type: 'PREVIEW_TICK', now: 1_000 });
  return state;
}

describe('memoryGameReducer', () => {
  it('moves from setup through preview into a timed game', () => {
    let state = memoryGameReducer(createMemoryGameState(), {
      type: 'START', cards, previewSeconds: 2,
    });
    expect(state.phase).toBe('preview');
    expect(state.previewRemaining).toBe(2);

    state = memoryGameReducer(state, { type: 'PREVIEW_TICK', now: 500 });
    expect(state.previewRemaining).toBe(1);
    state = memoryGameReducer(state, { type: 'PREVIEW_TICK', now: 1_500 });
    state = memoryGameReducer(state, { type: 'ELAPSED_TICK', now: 4_700 });

    expect(state.phase).toBe('playing');
    expect(state.startedAt).toBe(1_500);
    expect(state.elapsed).toBe(3);
  });

  it('counts a move only after the second valid card is flipped', () => {
    let state = startPlaying();
    state = memoryGameReducer(state, { type: 'FLIP_CARD', cardId: 'missing' });
    state = memoryGameReducer(state, { type: 'FLIP_CARD', cardId: cards[0].id });
    expect(state.moves).toBe(0);
    expect(state.flippedIds).toEqual([cards[0].id]);

    state = memoryGameReducer(state, { type: 'FLIP_CARD', cardId: cards[1].id });
    expect(state.phase).toBe('resolving');
    expect(state.moves).toBe(1);
    expect(currentMemoryPairMatches(state)).toBe(true);
  });

  it('closes a mismatched pair and returns to play', () => {
    let state = startPlaying();
    state = memoryGameReducer(state, { type: 'FLIP_CARD', cardId: cards[0].id });
    state = memoryGameReducer(state, { type: 'FLIP_CARD', cardId: cards[2].id });
    expect(currentMemoryPairMatches(state)).toBe(false);

    state = memoryGameReducer(state, { type: 'RESOLVE', now: 2_000 });
    expect(state.phase).toBe('playing');
    expect(state.flippedIds).toEqual([]);
    expect(state.matchedIds).toEqual([]);
  });

  it('records matches and completes the board with final elapsed time', () => {
    let state = startPlaying(cards.slice(0, 2));
    state = memoryGameReducer(state, { type: 'FLIP_CARD', cardId: cards[0].id });
    state = memoryGameReducer(state, { type: 'FLIP_CARD', cardId: cards[1].id });
    state = memoryGameReducer(state, { type: 'RESOLVE', now: 6_400 });

    expect(state.phase).toBe('complete');
    expect(state.matchedIds).toEqual([cards[0].id, cards[1].id]);
    expect(state.moves).toBe(1);
    expect(state.elapsed).toBe(5);
  });

  it('resets the full session back to setup', () => {
    const state = memoryGameReducer(startPlaying(), { type: 'RESET' });
    expect(state).toEqual(createMemoryGameState());
  });
});
