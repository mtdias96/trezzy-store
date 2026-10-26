import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';

// Cor literal em TS/TSX (style, SVG, prop). Cor só existe como token no globals.css.
const COLOR_LITERAL
  = /#(?:[\dA-Fa-f]{3,4}|[\dA-Fa-f]{6}|[\dA-Fa-f]{8})\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/.source;

// Classes que furam os tokens. O no-restricted-classes recebe a classe com as variantes (md:, hover:…).
const OFF_TOKEN_CLASSES = [
  {
    pattern: '^(?:.*:)?!?-?[a-z][\\w-]*-[\\[(]',
    message: 'Valor arbitrário fura os tokens: use um token do globals.css.',
  },
  {
    pattern: '(?:^|:)\\[[a-z-]+:',
    message: 'Propriedade arbitrária fura os tokens: use um utilitário com token.',
  },
  {
    pattern: '(?:^|:)(?:min|max)-\\[',
    message: 'Breakpoint arbitrário: use sm, md, lg ou xl.',
  },
  {
    pattern: '(?:^|:)max-(?:sm|md|lg|xl):',
    message: 'Mobile first: estilo base para o celular e sm:/md:/lg:/xl: para telas maiores.',
  },
];

// Aliases do tema que existem só para os componentes do shadcn (components/ui).
const SHADCN_ONLY_CLASSES = [
  {
    pattern: '^(?:.*:)?text-(?:xs|sm|base|lg|xl|\\d+xl)(?:/\\S+)?$',
    message: 'Use um papel tipográfico (text-body, text-display-*…), não a escala padrão do Tailwind.',
  },
  {
    pattern: '^(?:.*:)?[a-z-]+-(?:black|white)(?:/\\S+)?$',
    message: 'Use ink ou gray-0: black e white existem só para o shadcn.',
  },
  {
    pattern: '^(?:.*:)?shadow-(?:md|lg)$',
    message: 'Use shadow-pop ou shadow-modal.',
  },
  {
    pattern: '^(?:.*:)?rounded(?:-[a-z]+)?-(?:sm|4xl)$',
    message: 'Use rounded-seal ou rounded-pill.',
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Estilo só por token (seção 8): classe fora do tema, cor literal e CSS fora do globals.css.
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'better-tailwindcss': betterTailwindcss,
    },
    settings: {
      'better-tailwindcss': {
        cwd: import.meta.dirname,
        entryPoint: 'src/app/globals.css',
      },
    },
    rules: {
      'better-tailwindcss/no-unknown-classes': 'error',
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-concatenated-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/no-deprecated-classes': 'error',
      'better-tailwindcss/enforce-consistent-class-order': 'error',
      'better-tailwindcss/no-restricted-classes': [
        'error',
        { restrict: [...OFF_TOKEN_CLASSES, ...SHADCN_ONLY_CLASSES] },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: `:matches(Literal[value=/${COLOR_LITERAL}/], TemplateElement[value.raw=/${COLOR_LITERAL}/])`,
          message: 'Cor literal fora do globals.css: use um token (bg-brand, text-ink…).',
        },
        {
          selector:
            'JSXAttribute[name.name="style"] Property > :matches(Literal, TemplateLiteral[expressions.length=0])',
          message: 'style só para valor calculado em runtime. Valor fixo vai em classe com token.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?!\\./globals\\.css$).*\\.css$',
              message: 'O único CSS do web é o src/app/globals.css: estilo vai em classe com token.',
            },
          ],
        },
      ],
    },
  },
  {
    // components/ui é código gerado pelo shadcn: usa valor arbitrário e os aliases do tema.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'better-tailwindcss/no-restricted-classes': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
