import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FilterRadios } from './filter-radios';

const options = [
  { value: 'ate-300', label: 'Até R$ 300' },
  { value: '300-700', label: 'R$ 300 – 700' },
];

describe('FilterRadios', () => {
  it('starts with none checked and reports the chosen option', () => {
    const onValueChange = vi.fn();

    render(<FilterRadios labelledBy="preco" options={options} value={null} onValueChange={onValueChange} />);

    expect(screen.getAllByRole('radio').map((radio) => radio.getAttribute('aria-checked'))).toEqual(['false', 'false']);

    fireEvent.click(screen.getByRole('radio', { name: 'R$ 300 – 700' }));

    expect(onValueChange).toHaveBeenCalledWith('300-700');
  });

  it('checks the current value', () => {
    render(<FilterRadios labelledBy="preco" options={options} value="ate-300" onValueChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: 'Até R$ 300' }).getAttribute('aria-checked')).toBe('true');
  });
});
