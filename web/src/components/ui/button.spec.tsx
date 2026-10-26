import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders an accessible button', () => {
    render(<Button>Comprar</Button>);

    expect(screen.getByRole('button', { name: 'Comprar' }).dataset.slot).toBe('button');
  });
});
