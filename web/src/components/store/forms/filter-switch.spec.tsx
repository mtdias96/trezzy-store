import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterSwitch } from './filter-switch';

describe('FilterSwitch', () => {
  it('is named by its row and reports the new state', () => {
    const onCheckedChange = vi.fn();

    render(<FilterSwitch label="Só promoções" checked={false} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Só promoções' }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
