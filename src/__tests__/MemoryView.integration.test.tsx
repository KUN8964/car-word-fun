import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GameProvider } from '../context/GameContext';
import { MemoryView } from '../views/MemoryView';

describe('MemoryView integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('plays a complete 4x4 vehicle game and stores the best result', async () => {
    const { container } = render(
      <GameProvider>
        <MemoryView />
      </GameProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /start memory game/i }));
    expect(container.querySelectorAll('[data-memory-card]')).toHaveLength(16);

    for (let second = 0; second < 5; second++) {
      await act(async () => {
        vi.advanceTimersByTime(1_000);
      });
    }

    const groups = new Map<string, HTMLButtonElement[]>();
    container.querySelectorAll<HTMLButtonElement>('[data-memory-card]').forEach((button) => {
      const key = button.dataset.matchKey!;
      groups.set(key, [...(groups.get(key) || []), button]);
    });

    for (const pair of groups.values()) {
      fireEvent.click(pair[0]);
      fireEvent.click(pair[1]);
      await act(async () => {
        vi.advanceTimersByTime(450);
      });
    }

    expect(screen.getByRole('heading', { name: /garage complete/i })).toBeInTheDocument();
    expect(screen.getByText(/8 moves/)).toBeInTheDocument();

    const stored = JSON.parse(localStorage.getItem('car-car-adventure-tags-v2') || '{}');
    expect(stored.memoryBest['vehicle-4'].moves).toBe(8);
  });
});
