# AGENTS.md — Regras do repositório

> Fonte única das regras para pessoas e agentes de IA. **OBRIGATÓRIO**/**PROIBIDO** não admitem exceção. 🔒 = imposto por ferramenta (`tsc`, ESLint, commitlint ou CI). Quem muda uma regra atualiza este arquivo no mesmo commit.

E-commerce em monorepo pnpm:

- `api/`: Node.js 24, AWS Lambda, HTTP API v2, Serverless v4, Middy, Drizzle e Neon.
- `web/`: Next.js (planejado).

O backend usa um mini-framework próprio: DI, `Controller`, Use Cases e um adapter Middy. Visão geral no [README](README.md).

## Definition of Done

```bash
pnpm --filter trezzy-api typecheck
pnpm --filter trezzy-api lint
pnpm --filter trezzy-api test
pnpm --filter trezzy-api package   # requer login no Serverless e DATABASE_URL no api/.env
```

- Tudo deve passar com zero erros.
- PROIBIDO enfraquecer `tsconfig`, ESLint, hooks ou CI.
- PROIBIDO `--no-verify`.
- `eslint-disable` só com motivo: `// eslint-disable-next-line <regra> -- <motivo>`.

## Camadas (`api/src/`) 🔒

| Camada | Responsabilidade | PODE importar | PROIBIDO |
| :--- | :--- | :--- | :--- |
| `kernel/` | DI (`Registry`), `@Injectable`, `@Schema` | `@shared/types` | o resto do projeto, Middy, `aws-lambda`, Drizzle/Neon, `@aws-sdk` |
| `shared/` | `env.ts`, `AppConfig`, `saga/`, tipos | `@kernel` | `@application`, `@infra`, `@main`, SDKs |
| `application/contracts`, `errors`, `entities` | `Controller`, `ApplicationError`, `ErrorCode`, entidades de domínio | `@kernel`, `@shared` | `controllers/`, `useCases/`, `@infra`, `@main`, SDKs |
| `application/useCases/<modulo>` | Regras de negócio | `@kernel`, `@shared`, `@application` (exceto controllers), `@infra` (repositórios, gateways e `DrizzleClient` para transação) | `@main`, `drizzle-orm` direto, Middy, `aws-lambda`, `@aws-sdk` |
| `application/controllers/<modulo>` | HTTP → use case (`schemas/` com Zod) | `@kernel`, `@shared`, `@application` | `@infra`, `@main`, SDKs |
| `infra/` | `DrizzleClient`, schema, `repositories/`, `clients/` (SDKs), `gateways/` (integrações) | `@kernel`, `@shared`, `@application/errors`, `@application/entities` | demais `@application`, `@main`, Middy |
| `main/` | Adapter Middy, middlewares, `functions/` (1 Lambda por módulo) | tudo | — |

- OBRIGATÓRIO 🔒: fora da pasta atual, importar via alias (`@kernel/*`, `@shared/*`, `@application/*`, `@infra/*`, `@main/*`). `../` é proibido.
- PROIBIDO 🔒: extensão em imports internos (`moduleResolution: Bundler`).
- PROIBIDO: barrel files (`index.ts` que só reexporta).
- OBRIGATÓRIO 🔒: `import * as z from 'zod'`. O `import { z }` impede o tree-shaking e arrasta ~260 KB de locales para cada Lambda (medido: bundle 731 → 361 KB, carga a frio −15%).

## TypeScript

- PROIBIDO `any` 🔒. A única exceção está em `shared/types/Constructor.ts`. `as unknown as` só em testes e no `kernel/`.
- OBRIGATÓRIO 🔒: tratar o `T | undefined` de acesso indexado e usar `override` ao sobrescrever.
- DTOs (`Input`, `Output`, `Response`) são `type` dentro de um `namespace` co-localizado com a classe. Interfaces de comportamento levam o prefixo `I` 🔒.
- Arquivo de classe em `PascalCase.ts`, com o mesmo nome da classe. Funções e schemas em `camelCase.ts`.

## Injeção de dependências

- OBRIGATÓRIO: `@Injectable()` em toda classe resolvida pelo container, com injeção **por construtor** tipada por **classes**.
- PROIBIDO `import type` de uma classe injetada e PROIBIDO interface ou primitivo no construtor. O `Registry` recusa ambos no cold start.
- PROIBIDO dependência circular.
- PROIBIDO 🔒 `Registry.getInstance()` fora de `kernel/`, `main/` e testes.
- Tudo é singleton por container Lambda. OBRIGATÓRIO: injetáveis são **stateless**.

## HTTP

- Um controller por rota (`<Ação><Recurso>Controller`). Ele estende `Controller<'public' | 'private', Response>`, implementa `protected override async handle()`, valida a entrada, chama **um** use case e devolve `{ statusCode, body }`.
- Body: `@Schema(schema)`, com o schema em `schemas/<acao>Schema.ts`. O `handle` é tipado com `z.infer` desse schema.
- Params e query: `this.validate(schema, params)`. PROIBIDO `schema.parse()` direto (um `ZodError` solto vira 500).
- Autenticação é do API Gateway (JWT authorizer do Cognito). A identidade vem só de `request.accountId`, nunca de body, headers ou query.
- PROIBIDO chamar o SDK do Cognito fora do `infra/gateways/AuthGateway.ts`. Os dados do usuário ficam no nosso banco; o Cognito só autentica, ligado por `accounts.externalId` (o `sub`).
- Entrypoint: `main/functions/<modulo>.ts`. A primeira linha é `import 'reflect-metadata';`, e ele exporta `handler = lambdaHttpAdapter([...rotas])` (ou a classe, quando há um único endpoint).
- Toda rota do array existe no `serverless.yml` (`httpApi`, mesmo método e path), e vice-versa.

## Use cases e erros

- Uma classe por caso de uso, com um único método público `execute(input): Promise<Output>`. O `Output` é explícito: nunca a linha crua do banco.
- PROIBIDO conhecer HTTP: nada de `event`, headers, status, Middy ou `aws-lambda`.
- Erro de negócio: `throw new ApplicationError(ErrorCode.X, 'mensagem')`, **sem** status. O status vem de `main/utils/httpStatusByErrorCode.ts`, um mapa exaustivo: um código novo sem status não compila.
- PROIBIDO `HttpError` fora de `main/`.
- PROIBIDO `catch` vazio. Erro inesperado propaga, e o `errorHandler` responde 500 e loga.
- PROIBIDO 🔒 `console.*` fora do `errorHandler`, do listener de erro do pool no `DrizzleClient` e da compensação que falha na `Saga`. Os logs da Lambda saem em JSON.
- Fluxo que escreve em mais de um sistema (ex: Cognito + banco) roda em `saga.run(async ({ addCompensation }) => …)`: cada passo concluído registra como desfazê-lo, e um erro dispara as compensações na ordem inversa. As compensações vivem só dentro do `run`, nunca na instância (ela é singleton).

## Banco (Drizzle + Neon)

- `DATABASE_URL` aponta para o endpoint **`-pooler`** do Neon. O pool tem `max: 1` por container, e o PgBouncer absorve a escala.
- Tabelas em `infra/database/drizzle/schema.ts`, com colunas em camelCase (o snake_case no banco é automático).
- Mudança de schema: `db:generate`, revisar o SQL, commitar e rodar `db:migrate`. PROIBIDO `db:push` fora do banco local e PROIBIDO editar migration já aplicada.
- Repositório em `infra/database/repositories/<Recurso>Repository.ts`. "Não encontrado" retorna `null`, e escritas aceitam `tx?: DrizzleClient.Transaction`.
- OBRIGATÓRIO: dentro de `transaction()`, **toda** query usa o `tx`. Com `max: 1`, usar o `db` ali causa deadlock.
- Dinheiro em centavos inteiros (`priceInCents`). Datas em `timestamp with time zone`. PROIBIDO SQL montado por interpolação.

## Configuração

- PROIBIDO 🔒 ler `process.env` fora de `shared/config/env.ts`. Consuma via `AppConfig` injetado.
- Variável nova entra em 5 lugares: `env.ts` (Zod), `AppConfig`, `sls/config/env.yml`, `test.env` no `vitest.config.mts` e `.env.example`.
- PROIBIDO fallback para variável obrigatória ou segredo: o deploy deve falhar.
- PROIBIDO commitar ou logar segredo.

## Testes e Git

- `*.spec.ts` co-localizado com o arquivo testado. Teste unitário usa `new Classe(fakes)`, sem Registry, rede ou banco.
- PROIBIDO `expect` dentro de `if`.
- Conventional Commits com escopo minúsculo 🔒, ex: `feat(api/products): add create product endpoint`.
- Fluxo: feature → `develop` → `main` 🔒.
- Identificadores e commits em inglês; comentários, docs e PRs em pt-BR.

## Commits e PRs

- Um commit por contexto (tooling, lint, erros, banco, infra, docs…), e cada um passa typecheck, lint e testes sozinho. PROIBIDO juntar assuntos num commit só.
- Assunto curto (≤ 60 caracteres), no imperativo. Corpo com três blocos, sem repetir o assunto (pode omitir em mudança trivial):

  ```text
  fix(api/errors): return 4xx for client errors, 500 for bugs

  Why: malformed JSON returned 500 and internal ZodErrors returned 400.

  What:
  - ValidationError for request validation (body, params, query)
  - stray ZodError becomes 500 and is logged

  Impact: clients get correct statuses; server bugs are logged.
  ```

- PR: título no padrão do commit e corpo seguindo `.github/pull_request_template.md` (o GitHub preenche sozinho). Seja direto: contexto, o que foi feito, ganhos, arquivos principais, validação e atenção no deploy.

## Criar um endpoint (checklist)

1. Tabela em `schema.ts`, depois `db:generate`.
2. `infra/database/repositories/<Recurso>Repository.ts` (`@Injectable`, injeta `DrizzleClient`).
3. `application/useCases/<modulo>/<Ação><Recurso>UseCase.ts`, com `namespace { Input; Output }`.
4. `application/controllers/<modulo>/schemas/<acao><Recurso>Schema.ts`, exportando o schema e o `type ... = z.infer<...>`.
5. `application/controllers/<modulo>/<Ação><Recurso>Controller.ts`, com `Response = <UseCase>.Output`.
6. Rota no `main/functions/<modulo>.ts` e no `serverless.yml`.
7. Specs do use case e do controller, depois a Definition of Done.

## Pendências conhecidas (remova a linha ao resolver)

| Item | Até resolver |
| :--- | :--- |
| Identidade do Cognito | O adapter envia `accountId: null`. Ao plugar o Cognito, mapear `requestContext.authorizer.jwt.claims.sub` e responder 401 em rota privada sem claims. Rota `'private'` só no `serverless.yml` com o authorizer configurado. |
| Auto-confirmação no signup | O trigger `PreSignUp` confirma o usuário sem verificar o e-mail. Só para testes: trocar por confirmação real antes de produção. |
| `Content-Type` | PROIBIDO definir `Content-Type` no retorno do controller: o serializer pula a serialização do body. |
| Config do health | O `HealthUseCase` lê `process.env` (exceção temporária no lint). Não copie. |
| Segredos | O `DATABASE_URL` e o `COGNITO_CLIENT_SECRET` ainda são variáveis de ambiente. Alvo: SSM lido em runtime. |

## Regras para agentes de IA

- PROIBIDO adicionar, remover ou atualizar dependência sem aprovação explícita.
- PROIBIDO alterar `Controller.ts`, `Registry.ts`, `lambdaHttpAdapter.ts`, migrations aplicadas ou rotas publicadas sem pedido direto.
- PROIBIDO commit, push ou deploy sem pedido.
- PROIBIDO criar camadas fora da tabela acima.
- OBRIGATÓRIO rodar a Definition of Done antes de declarar a tarefa concluída e reportar falhas com a saída real.
- Na dúvida, siga o código existente e pergunte.
