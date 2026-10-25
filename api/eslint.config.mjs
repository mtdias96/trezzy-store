import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Valem para todo src/. Regex porque glob não expressa "começa com ../" nem ".js só em import interno".
const BASE_IMPORT_RULES = [
  {
    regex: '^\\.\\./',
    message: 'Fora da pasta atual, importe via alias (@kernel, @shared, @application, @infra, @main).',
  },
  {
    regex: '^(\\.{1,2}/|@(kernel|shared|application|infra|main)/).*\\.js$',
    message: 'Imports internos não levam extensão (moduleResolution: Bundler).',
  },
];

const MIDDY = { group: ['@middy/*', 'aws-lambda'], message: 'Middy e tipos do AWS Lambda pertencem a main/.' };
const DATABASE = { group: ['drizzle-orm', 'drizzle-orm/*', '@neondatabase/*'], message: 'Acesso a banco pertence a infra/ (repositórios).' };
const AWS_SDK = { group: ['@aws-sdk/*'], message: 'SDKs da AWS pertencem a infra/.' };

// Matriz de camadas do AGENTS.md: o que cada pasta NÃO pode importar ("!" abre exceção).
const LAYERS = [
  {
    files: ['src/kernel/**/*.ts'],
    deny: [
      { group: ['@application/*', '@infra/*', '@main/*'], message: 'kernel/ não depende de outras camadas.' },
      { group: ['@shared/*', '!@shared/types'], message: 'kernel/ só pode importar @shared/types.' },
      MIDDY, DATABASE, AWS_SDK,
    ],
  },
  {
    files: ['src/shared/**/*.ts'],
    deny: [
      { group: ['@application/*', '@infra/*', '@main/*'], message: 'shared/ só pode depender de kernel/.' },
      MIDDY, DATABASE, AWS_SDK,
    ],
  },
  {
    files: ['src/application/contracts/**/*.ts', 'src/application/errors/**/*.ts', 'src/application/entities/**/*.ts'],
    deny: [
      {
        group: ['@infra/*', '@main/*', '@application/controllers/*', '@application/useCases/*'],
        message: 'contracts/, errors/ e entities/ não dependem de infra/, main/, controllers/ ou useCases/.',
      },
      MIDDY, DATABASE, AWS_SDK,
    ],
  },
  {
    files: ['src/application/useCases/**/*.ts'],
    deny: [
      { group: ['@main/*', '@application/controllers/*'], message: 'useCases/ não dependem de main/ nem de controllers/.' },
      MIDDY, DATABASE, AWS_SDK,
    ],
  },
  {
    files: ['src/application/controllers/**/*.ts'],
    deny: [
      { group: ['@infra/*', '@main/*'], message: 'controllers/ só conversam com useCases/: nada de infra/ ou main/.' },
      MIDDY, DATABASE, AWS_SDK,
    ],
  },
  {
    files: ['src/infra/**/*.ts'],
    deny: [
      {
        group: ['@main/*', '@application/*', '!@application/errors', '!@application/entities'],
        message: 'infra/ só pode importar @application/errors e @application/entities.',
      },
      MIDDY,
    ],
  },
];

// O flat config não mescla opções de uma regra (a última vence): por isso BASE_IMPORT_RULES entra em toda camada.
const restrictImports = (deny = []) => ['error', { patterns: [...BASE_IMPORT_RULES, ...deny] }];

// Medido: `import { z } from 'zod'` arrasta ~260 KB de locales para o bundle; o namespace permite tree-shaking.
const ZOD_NAMESPACE = {
  selector: "ImportDeclaration[source.value=/^zod/][importKind!='type'] > ImportSpecifier[imported.name='z'][importKind!='type']",
  message: "Use `import * as z from 'zod'`: o import nomeado impede o tree-shaking dos locales (~260 KB).",
};

const REGISTRY_SERVICE_LOCATOR = {
  selector: "CallExpression[callee.object.name='Registry'][callee.property.name='getInstance']",
  message: 'Service locator proibido fora de main/ e testes: receba dependências pelo construtor (@Injectable).',
};

export default defineConfig([
  {
    ignores: ['**/dist/**', '**/.serverless/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: {
      js,
      'simple-import-sort': simpleImportSort,
    },
    extends: ['js/recommended'],
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'eol-last': ['error', 'always'],
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-duplicate-imports': 'error',
      'no-console': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // 1. Side effects (ex: reflect-metadata)
            ['^\\u0000'],
            // 2. Node.js built-ins e bibliotecas externas (npm packages)
            ['^node:', '^@?\\w'],
            // 3. Aliases internos do projeto
            ['^@kernel', '^@shared', '^@application', '^@infra', '^@main'],
            // 4. Importações relativas superiores (../)
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // 5. Importações relativas locais (./)
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: true,
          },
        },
      ],
    },
  },
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  { files: ['src/**/*.ts'], rules: { 'no-restricted-imports': restrictImports(), 'no-restricted-syntax': ['error', ZOD_NAMESPACE] } },
  ...LAYERS.map(({ files, deny }) => ({ files, rules: { 'no-restricted-imports': restrictImports(deny) } })),

  {
    files: ['src/**/*.ts'],
    ignores: [
      'src/shared/config/env.ts',
      // TODO: remover quando STAGE/REGION/SERVICE_NAME passarem por env.ts/AppConfig.
      'src/application/useCases/health/HealthUseCase.ts',
    ],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Leia variáveis de ambiente só em src/shared/config/env.ts e injete AppConfig.',
        },
      ],
    },
  },
  {
    files: ['src/application/**/*.ts', 'src/infra/**/*.ts', 'src/shared/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      // O flat config não mescla opções: o seletor do zod precisa vir junto aqui também.
      'no-restricted-syntax': ['error', ZOD_NAMESPACE, REGISTRY_SERVICE_LOCATOR],
    },
  },
]);
