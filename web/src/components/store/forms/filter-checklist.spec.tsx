import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterChecklist } from './filter-checklist';
import { FilterChips } from './filter-chips';

const brands = [
  { value: 'mormaco', label: 'Mormaço', count: 3 },
  { value: 'kairo', label: 'KAIRO', count: 0 },
  { value: 'casa-ocio', label: 'Casa Ócio', count: 0 },
];

describe('FilterChecklist', () => {
  it('toggles an option by its label', () => {
    const onToggle = vi.fn();

    render(<FilterChecklist labelledBy="marca" options={brands} selected={[]} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Mormaço/ }));

    expect(onToggle).toHaveBeenCalledWith('mormaco');
  });

  it('disables an option with no products, unless it is already checked', () => {
    render(<FilterChecklist labelledBy="marca" options={brands} selected={['casa-ocio']} onToggle={vi.fn()} />);

    expect(screen.getByRole('checkbox', { name: /KAIRO/ }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByRole('checkbox', { name: /Casa Ócio/ }).getAttribute('aria-disabled')).toBeNull();
    expect(screen.getByRole('checkbox', { name: /Casa Ócio/ }).getAttribute('aria-checked')).toBe('true');
  });
});

describe('FilterChips', () => {
  it('marks the chosen sizes as pressed and toggles on click', () => {
    const onToggle = vi.fn();

    render(<FilterChips labelledBy="tamanho" options={['P', 'M', 'G']} selected={['M']} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button', { name: 'G' }));

    expect(screen.getByRole('button', { name: 'M' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'P' }).getAttribute('aria-pressed')).toBe('false');
    expect(onToggle).toHaveBeenCalledWith('G');
  });
});
