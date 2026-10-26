import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PasswordInput } from '@/components/common/password-input';

describe('PasswordInput', () => {
  it('starts hidden and toggles the password visibility', () => {
    render(<PasswordInput aria-label="Senha" defaultValue="segredo" />);

    const input = screen.getByLabelText<HTMLInputElement>('Senha');
    const toggle = screen.getByRole('button', { name: 'Mostrar senha' });

    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(toggle);

    expect(input.type).toBe('text');
    expect(input.value).toBe('segredo');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('does not submit the form when toggling', () => {
    render(<PasswordInput aria-label="Senha" />);

    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Mostrar senha' }).type).toBe('button');
  });
});
