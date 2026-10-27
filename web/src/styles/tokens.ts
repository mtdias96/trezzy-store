// Nomes dos tokens do src/styles/globals.css (@theme), para tipar props que escolhem um token.
// Os valores vivem só no CSS. O tokens.spec.ts falha se as duas listas divergirem.
//
// O Tailwind não gera classe montada por interpolação (`bg-${tone}`): mapeie o token para a classe
// inteira com `satisfies Record<Token, string>`, que obriga a cobrir todos os valores.

export const breakpointTokens = ['sm', 'md', 'lg', 'xl'] as const;

export const colorTokens = [
  'brand',
  'brand-50',
  'brand-100',
  'brand-200',
  'brand-300',
  'brand-400',
  'brand-500',
  'brand-600',
  'brand-700',
  'brand-800',
  'brand-900',
  'brand-950',
  'lime',
  'lime-100',
  'lime-400',
  'lime-500',
  'lime-700',
  'ink',
  'ink-soft',
  'gray-0',
  'gray-25',
  'gray-50',
  'gray-100',
  'gray-150',
  'gray-200',
  'gray-250',
  'gray-300',
  'gray-400',
  'gray-500',
  'gray-600',
  'gray-700',
  'gray-800',
  'gray-900',
  'paper',
  'paper-sand',
  'paper-stone',
  'paper-line',
  'success-50',
  'success-500',
  'success-700',
  'warning-50',
  'warning-500',
  'warning-700',
  'danger-50',
  'danger-500',
  'danger-600',
  'danger-700',
  'info-50',
  'info-500',
  'info-700',
  'status-pending-bg',
  'status-pending-fg',
  'status-pending-dot',
  'status-paid-bg',
  'status-paid-fg',
  'status-paid-dot',
  'status-shipped-bg',
  'status-shipped-fg',
  'status-shipped-dot',
  'status-delivered-bg',
  'status-delivered-fg',
  'status-delivered-dot',
  'status-cancelled-bg',
  'status-cancelled-fg',
  'status-cancelled-dot',
] as const;

export const fontTokens = ['sans', 'display', 'mono', 'hand'] as const;

export const textTokens = [
  'display-2xl',
  'display-xl',
  'display-lg',
  'display-md',
  'display-sm',
  'display-xs',
  'body-lg',
  'body',
  'body-sm',
  'caption',
  'micro',
  'seal',
  'hand',
] as const;

export const radiusTokens = ['seal', 'md', 'lg', 'xl', '2xl', '3xl', 'card', 'block', 'pill'] as const;

export const shadowTokens = ['pop', 'modal', 'float', 'hero', 'soft', 'knob', 'focus-brand'] as const;

export const heightTokens = ['ctl-sm', 'ctl', 'ctl-lg', 'field', 'cta'] as const;

export const durationTokens = ['fast', 'base', 'slow'] as const;

export const animationTokens = ['pop', 'appear', 'marquee', 'marquee-reverse', 'shake', 'skeleton'] as const;

export const rotateTokens = ['sticker'] as const;

// Grupos semânticos: cada tom tem 50/500/700 e cada status tem bg/fg/dot em colorTokens.
export const feedbackTones = ['success', 'warning', 'danger', 'info'] as const;

export const orderStatusTokens = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

export type BreakpointToken = (typeof breakpointTokens)[number];
export type ColorToken = (typeof colorTokens)[number];
export type FontToken = (typeof fontTokens)[number];
export type TextToken = (typeof textTokens)[number];
export type RadiusToken = (typeof radiusTokens)[number];
export type ShadowToken = (typeof shadowTokens)[number];
export type HeightToken = (typeof heightTokens)[number];
export type DurationToken = (typeof durationTokens)[number];
export type AnimationToken = (typeof animationTokens)[number];
export type RotateToken = (typeof rotateTokens)[number];
export type FeedbackTone = (typeof feedbackTones)[number];
export type OrderStatusToken = (typeof orderStatusTokens)[number];
