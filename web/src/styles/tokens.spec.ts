// @vitest-environment node
// Lê o globals.css do disco: no jsdom, o import.meta.url não é file://.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  animationTokens,
  breakpointTokens,
  colorTokens,
  durationTokens,
  feedbackTones,
  fontTokens,
  heightTokens,
  orderStatusTokens,
  radiusTokens,
  rotateTokens,
  shadowTokens,
  textTokens,
} from '@/styles/tokens';

const NAMESPACES: Record<string, readonly string[]> = {
  breakpoint: breakpointTokens,
  color: colorTokens,
  font: fontTokens,
  text: textTokens,
  radius: radiusTokens,
  shadow: shadowTokens,
  height: heightTokens,
  'transition-duration': durationTokens,
  animate: animationTokens,
  rotate: rotateTokens,
};

const css = readFileSync(new URL('./globals.css', import.meta.url), 'utf8');

// Só o bloco `@theme {`, que guarda os tokens. O `@theme inline` liga os slots do shadcn e fica de fora.
const tokenBlock = /^@theme \{\n([\s\S]*?)^\}/m.exec(css)?.[1] ?? '';

function declarations(): string[] {
  return [...tokenBlock.matchAll(/^\s*--([\w-]+):/gm)]
    .map(([, name]) => name)
    .filter((name): name is string => name !== undefined);
}

// Tokens de um namespace, sem os resets (`--color-*: initial`) e as subpropriedades (`--text-body--line-height`).
function declared(namespace: string): string[] {
  const prefix = `${namespace}-`;

  return declarations()
    .filter((name) => name.startsWith(prefix) && !name.includes('--'))
    .map((name) => name.slice(prefix.length));
}

describe('design tokens', () => {
  it('finds the token block in globals.css', () => {
    expect(declarations().length).toBeGreaterThan(0);
  });

  it.each(Object.entries(NAMESPACES))('%s: tokens.ts and globals.css list the same names', (namespace, names) => {
    expect(declared(namespace).toSorted()).toEqual([...names].toSorted());
  });

  it('has no namespace missing from tokens.ts', () => {
    const unknown = declarations().filter(
      (name) => !Object.keys(NAMESPACES).some((namespace) => name.startsWith(`${namespace}-`)),
    );

    expect(unknown).toEqual([]);
  });

  it('gives every feedback tone and order status its colors', () => {
    const colors = new Set<string>(colorTokens);
    const expected = [
      ...feedbackTones.flatMap((tone) => [`${tone}-50`, `${tone}-500`, `${tone}-700`]),
      ...orderStatusTokens.flatMap((status) => ['bg', 'fg', 'dot'].map((part) => `status-${status}-${part}`)),
    ];

    expect(expected.filter((name) => !colors.has(name))).toEqual([]);
  });
});
