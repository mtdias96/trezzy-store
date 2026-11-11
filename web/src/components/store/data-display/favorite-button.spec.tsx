import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { FavoriteButton } from './favorite-button';

describe('FavoriteButton', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('toggles the favorite and remembers it', () => {
    render(<FavoriteButton productId="moletom-patio" productName="Moletom Heavyweight “Pátio”" />);
    const favorite = screen.getByRole('button', { name: 'Favoritar Moletom Heavyweight “Pátio”' });

    fireEvent.click(favorite);

    expect(favorite.getAttribute('aria-pressed')).toBe('true');
    expect(window.localStorage.getItem('favorite:moletom-patio')).toBe('1');
  });
});
