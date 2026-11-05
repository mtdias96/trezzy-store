import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MoneyInput } from './money-input';

function renderMoneyInput() {
  const { container } = render(<MoneyInput aria-label="Preço" name="price" />);

  return {
    input: screen.getByLabelText<HTMLInputElement>('Preço'),
    hidden: () => container.querySelector<HTMLInputElement>('input[name="price"]')?.value,
  };
}

describe('MoneyInput', () => {
  it('starts empty, showing the 0,00 placeholder', () => {
    const { input, hidden } = renderMoneyInput();

    expect(input.value).toBe('');
    expect(input.placeholder).toBe('0,00');
    expect(hidden()).toBe('');
  });

  it('pushes the comma as the user types and sends cents to the form', () => {
    const { input, hidden } = renderMoneyInput();

    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.change(input, { target: { value: '0,012' } });
    fireEvent.change(input, { target: { value: '0,123' } });

    expect(input.value).toBe('1,23');
    expect(hidden()).toBe('123');
  });

  it('ignores letters and the minus sign', () => {
    const { input } = renderMoneyInput();

    fireEvent.change(input, { target: { value: '-5a' } });

    expect(input.value).toBe('0,05');
  });

  it('keeps the last value when the user types past the limit', () => {
    const { input } = renderMoneyInput();

    fireEvent.change(input, { target: { value: '9.999.999,99' } });
    fireEvent.change(input, { target: { value: '9.999.999,990' } });

    expect(input.value).toBe('9.999.999,99');
  });

  it('sends nothing to the form when the price is erased', () => {
    const { input, hidden } = renderMoneyInput();

    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.change(input, { target: { value: '0,0' } });

    expect(input.value).toBe('');
    expect(hidden()).toBe('');
  });

  it('shows the value it receives and reports changes in cents when controlled', () => {
    const onValueChange = vi.fn();

    render(<MoneyInput aria-label="Preço" value={150} onValueChange={onValueChange} />);

    const input = screen.getByLabelText<HTMLInputElement>('Preço');

    fireEvent.change(input, { target: { value: '1,503' } });

    expect(onValueChange).toHaveBeenCalledWith(1503);
    expect(input.value).toBe('1,50');
  });
});
