import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterSection } from './filter-section';

describe('FilterSection', () => {
  it('offers "Limpar" only when something is chosen, named after the section', () => {
    const onClear = vi.fn();
    const { rerender } = render(<FilterSection titleId="preco" title="Preço">opções</FilterSection>);

    expect(screen.queryByRole('button')).toBeNull();

    rerender(<FilterSection titleId="preco" title="Preço" onClear={onClear}>opções</FilterSection>);
    fireEvent.click(screen.getByRole('button', { name: 'Limpar preço' }));

    expect(onClear).toHaveBeenCalledOnce();
  });
});
