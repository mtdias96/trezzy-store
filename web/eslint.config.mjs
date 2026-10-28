import stylistic from '@stylistic/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import boundaries from 'eslint-plugin-boundaries';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

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

// Camadas da seção 2 do web/AGENTS.md. `area` (store, admin, shared) e `feature` são capturadas para isolar
// uma área da outra e uma feature da outra. Os parênteses dos route groups são escapados no padrão.
const FEATURE_LAYERS = ['data', 'model', 'containers', 'components', 'hooks'];

// Categorias de components/common e components/<área> (web/AGENTS.md, seção 2). Arquivo solto ou numa pasta fora da
// lista não vira elemento, e o no-unknown-files acusa.
const COMMON_CATEGORIES = '{layout,navigation,forms,data-display,feedback,overlay}';
const AREA_CATEGORIES = '{shell,layout,navigation,forms,data-display,feedback,overlay,preview}';

const ELEMENTS = [
  { type: 'app-store', pattern: 'src/app/\\(store\\)' },
  { type: 'app-admin', pattern: 'src/app/\\(admin\\)' },
  { type: 'app', pattern: 'src/app' },
  ...FEATURE_LAYERS.map((layer) => ({
    type: `feature-${layer}`,
    pattern: `src/features/{store,admin,shared}/*/${layer}`,
    capture: ['area', 'feature'],
  })),
  { type: 'feature-session', pattern: 'src/features/shared/auth/session' },
  { type: 'ui', pattern: 'src/components/ui' },
  { type: 'common', pattern: `src/components/common/${COMMON_CATEGORIES}` },
  { type: 'area-components', pattern: `src/components/{store,admin}/${AREA_CATEGORIES}`, capture: ['area'] },
  { type: 'hooks', pattern: 'src/hooks' },
  { type: 'lib', pattern: 'src/lib' },
  { type: 'config', pattern: 'src/config' },
  { type: 'styles', pattern: 'src/styles' },
];

// Elemento do boundaries é sempre uma pasta: arquivo solto de convenção do Next entra como descritor de arquivo.
const FILES = [{ category: 'proxy', pattern: 'src/proxy.ts' }];

const SAME_AREA = { area: '{{ from.element.captured.area }}' };
const SAME_FEATURE = { ...SAME_AREA, feature: '{{ from.element.captured.feature }}' };
const same = (type, extra = {}) => ({ type, captured: SAME_FEATURE, ...extra });
const anyOf = (...types) => ({ types: { anyOf: types } });
const SHARED = ['ui', 'common', 'hooks', 'lib', 'config', 'styles'];

// Rota de uma área compõe features da própria área e da shared, e os componentes da própria área.
const areaRoute = (area) => [
  {
    types: { anyOf: ['feature-data', 'feature-model', 'feature-containers', 'feature-components'] },
    captured: { area: `{${area},shared}` },
  },
  { type: 'area-components', captured: { area } },
  anyOf('feature-session', ...SHARED),
];

// O que cada camada pode importar. O resto é bloqueado (default: disallow).
const IMPORTS = {
  // Raiz do app/ (layout, not-found, global-error): sem feature de área.
  app: [anyOf('app', 'feature-session', ...SHARED)],
  'app-store': areaRoute('store'),
  'app-admin': areaRoute('admin'),
  // Container: busca (server) ou liga hook e action (client) e passa props para a apresentação.
  'feature-containers': [
    same('feature-data'),
    same('feature-model'),
    same('feature-containers'),
    same('feature-components'),
    same('feature-hooks'),
    { type: 'area-components', captured: SAME_AREA },
    anyOf('feature-session', ...SHARED),
  ],
  // Apresentação: só props. Não busca dado, não lê ambiente e não conhece a lógica da feature.
  'feature-components': [
    same('feature-components'),
    same('feature-model'),
    { type: 'area-components', captured: SAME_AREA },
    anyOf('ui', 'common', 'hooks', 'lib', 'styles'),
  ],
  // Lógica de client: estado da feature e chamada das Server Actions, nunca das queries.
  'feature-hooks': [
    same('feature-hooks'),
    same('feature-model'),
    same('feature-data', { internalPath: 'actions.ts' }),
    anyOf('hooks', 'lib'),
  ],
  'feature-data': [same('feature-data'), same('feature-model'), anyOf('feature-session', 'lib', 'config')],
  'feature-model': [same('feature-model'), anyOf('lib')],
  'feature-session': [
    { types: { anyOf: ['feature-data', 'feature-model'] }, captured: { area: 'shared', feature: 'auth' } },
    anyOf('lib', 'config'),
  ],
  ui: [anyOf('ui', 'hooks', 'lib', 'styles')],
  common: [anyOf('ui', 'common', 'hooks', 'lib', 'styles')],
  // Componentes de uma área (header da loja, sidebar do painel): usam as outras categorias da própria área (o header
  // usa o container de layout/) e não enxergam a outra área.
  'area-components': [
    { type: 'area-components', captured: SAME_AREA },
    anyOf('ui', 'common', 'hooks', 'lib', 'styles'),
  ],
  hooks: [anyOf('hooks', 'lib')],
  lib: [anyOf('lib', 'config')],
  config: [anyOf('config')],
  // Estilo global (CSS, nomes dos tokens e fontes): todos leem, e ele não importa nada do projeto.
  styles: [anyOf('styles')],
};

const POLICIES = [
  ...Object.entries(IMPORTS).flatMap(([from, targets]) =>
    targets.map((target) => ({ from: { element: { type: from } }, allow: { to: { element: target } } })),
  ),
  { from: { file: { categories: 'proxy' } }, allow: { to: { element: anyOf('feature-session', 'lib', 'config') } } },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Formatação e ordem de imports: mesmas escolhas da api/, via ESLint (o editor corrige ao salvar).
    files: ['**/*.{js,mjs,ts,tsx,mts}'],
    extends: [
      stylistic.configs.customize({
        indent: 2,
        quotes: 'single',
        semi: true,
        jsx: true,
        arrowParens: true,
        braceStyle: '1tbs',
        commaDangle: 'always-multiline',
        quoteProps: 'as-needed',
      }),
    ],
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-console': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Efeitos colaterais ('server-only', CSS)
            ['^\\u0000'],
            // 2. Node.js e pacotes, com React e Next primeiro
            ['^node:', '^react', '^next', '^@?\\w'],
            // 3. Alias interno
            ['^@/'],
            // 4. Importações relativas da mesma pasta
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    // TypeScript estrito: regras que leem os tipos (promise solta, any, switch não exaustivo…).
    files: ['**/*.{ts,tsx,mts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
    },
  },
  {
    // Arquitetura (seção 2) e estilo só por token (seção 8).
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      boundaries,
      'better-tailwindcss': betterTailwindcss,
    },
    settings: {
      'boundaries/elements': ELEMENTS,
      'boundaries/files': FILES,
      'boundaries/include': ['src/**/*'],
      'better-tailwindcss': {
        cwd: import.meta.dirname,
        entryPoint: 'src/styles/globals.css',
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            '{{#if from.element.type}}{{ from.element.type }}{{else}}proxy.ts{{/if}} não pode importar {{ to.element.type }} (web/AGENTS.md, seção 2).',
          policies: POLICIES,
        },
      ],
      'boundaries/no-unknown-files': 'error',
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
              regex: '^\\.\\./',
              message: 'Fora da pasta atual, importe pelo alias @/.',
            },
            {
              regex: '^(?!@/styles/globals\\.css$).*\\.css$',
              message: 'O único CSS do web é o src/styles/globals.css: estilo vai em classe com token.',
            },
          ],
        },
      ],
    },
  },
  {
    // Ambiente só em src/config/, validado com zod.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/config/**'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'process', property: 'env', message: 'Leia variáveis de ambiente só em src/config/.' },
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
    // Saída do build:vercel (o ESLint em flat config não lê o .gitignore).
    '.vercel/**',
  ]),
]);

export default eslintConfig;
