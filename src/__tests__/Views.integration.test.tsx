import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CarAdventureHero } from '../CarAdventureHero';
import { GameProvider } from '../context/GameContext';
import { ParentsView } from '../views/ParentsView';

describe('view integration', () => {
  beforeEach(() => localStorage.clear());

  it('navigates through the split app contexts and switches language', () => {
    render(<CarAdventureHero />);

    fireEvent.click(screen.getByRole('button', { name: 'Memory' }));
    expect(screen.getByRole('heading', { name: 'Flip & match' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Switch language' }));
    expect(screen.getByRole('heading', { name: '翻牌找配对' })).toBeInTheDocument();
  });

  it('uses lazy WebP thumbnails and allows an explicitly unlocked tag to be edited', () => {
    const { container } = render(
      <GameProvider>
        <ParentsView />
      </GameProvider>,
    );

    const images = [...container.querySelectorAll<HTMLImageElement>('img')];
    expect(images).toHaveLength(52);
    expect(images.every((image) => image.src.includes('/vehicle-thumbs/'))).toBe(true);
    expect(images.every((image) => image.getAttribute('loading') === 'lazy')).toBe(true);

    const firstColorSelect = screen.getAllByRole('combobox')[0];
    expect(firstColorSelect).toBeDisabled();
    fireEvent.click(screen.getAllByTitle('Unlock color')[0]);
    expect(firstColorSelect).toBeEnabled();
    fireEvent.change(firstColorSelect, { target: { value: 'red' } });
    expect(firstColorSelect).toHaveValue('red');
  });
});
