# AGENTS.md — Regras do repositório

> Fonte única das regras para pessoas e agentes de IA. **OBRIGATÓRIO**/**PROIBIDO** não admitem exceção. 🔒 = imposto por ferramenta (`tsc`, ESLint, commitlint ou CI). Quem muda uma regra atualiza este arquivo no mesmo commit. Este arquivo vale para o repositório inteiro e para a `api/`. As regras do frontend ficam em [web/AGENTS.md](web/AGENTS.md).

E-commerce em monorepo pnpm:

- `api/`: Node.js 24, AWS Lambda, HTTP API v2, Serverless v4, Middy, Drizzle e Neon.
- `web/`: Next.js 16, React 19, Tailwind v4 e shadcn/ui, com deploy na Vercel. Regras em [web/AGENTS.md](web/AGENTS.md).

O backend usa um mini-framework próprio: DI, `Controller`, Use Cases e um adapter Middy. Visão geral no [README](README.md).

## Definition of Done

```bash
pnpm --filter trezzy-api typecheck
pnpm --filter trezzy-api lint
pnpm --filter trezzy-api test
pnpm --filter trezzy-api package   # requer login no Serverless e DATABASE_URL no api/.env
```

- Mudou o `web/`: rode também a [Definition of Done do web](web/AGENTS.md#definition-of-done).
- Tudo deve passar com zero erros.
- PROIBIDO enfraquecer `tsconfig`, ESLint, hooks ou CI.
- PROIBIDO `--no-verify`.
- `eslint-disable` só com motivo: `// eslint-disable-next-line <regra> -- <motivo>`.

## Camadas (`api/src/`) 🔒

| Camada | Responsabilidade | PODE importar | PROIBIDO |
| :--- | :--- | :--- | :--- |
| `kernel/` | DI (`Registry`), `@Injectable`, `@Schema` | `@shared/types` | o resto do projeto, Middy, `aws-lambda`, Drizzle/Neon, `@aws-sdk` |
| `shared/` | `env.ts`, `AppConfig`, `saga/`, tipos | `@kernel` | `@application`, `@infra`, `@main`, SDKs |
| `application/contracts`, `errors`, `entities`, `authorization` | `Controller`, `ApplicationError`, `ErrorCode`, entidades de domínio, catálogo de permissões | `@kernel`, `@shared` | `controllers/`, `useCases/`, `@infra`, `@main`, SDKs |
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

- Um controller por rota (`<Ação><Recurso>Controller`). Ele estende `Controller<'public' | 'private', Response>`, declara `protected override readonly routeType` com o mesmo valor do genérico, implementa `protected override async handle()`, valida a entrada, chama **um** use case e devolve `{ statusCode, body }`.
- Body: `@Schema(schema)`, com o schema em `schemas/<acao>Schema.ts`. O `handle` é tipado com `z.infer` desse schema.
- O `Response` do namespace do controller é o contrato público da rota (versionado pelo SemVer) e é declarado ali, campo a campo. PROIBIDO `Response = <UseCase>.Output`: o body é montado a partir do retorno do use case (`const { id, email } = …`), para uma mudança interna no use case nunca vazar para a API.
- OBRIGATÓRIO: desestruturar o body e repassar ao use case **só** os campos que ele usa (`const { email, password } = body`), nunca o body inteiro.
- Params e query: `this.validate(schema, params)`. PROIBIDO `schema.parse()` direto (um `ZodError` solto vira 500).
- Autenticação é do API Gateway (JWT authorizer do Cognito). A identidade vem só de `request.accountId`, nunca de body, headers ou query.
- `accountId` é o nosso `accounts.id`, lido pelo adapter da claim `internalId` do access token (injetada pelo trigger `PreTokenGeneration`). Controller `'private'` sem `accountId` (token sem a claim ou rota sem authorizer) responde 401 antes do `handle`.
- Rota `'private'` no `serverless.yml` OBRIGATORIAMENTE leva `authorizer: { name: cognito }`.
- PROIBIDO chamar o SDK do Cognito em `src/` fora do `infra/gateways/AuthGateway.ts`. O Cognito guarda a identidade e o tipo de conta (grupo `admin` ou nenhum); os dados do usuário e os cargos ficam no nosso banco, ligados por `accounts.externalId` (o `sub`).
- O id da conta nasce na entidade `Account` e vai para o Cognito no `SignUp` (`custom:internalId`, imutável). O client do Cognito é confidencial: toda chamada pública leva `SECRET_HASH`.
- Logout: `POST /auth/signout` (pública, recebe o `refreshToken`) revoga o refresh token no Cognito e é idempotente. O access token já emitido continua passando no API Gateway até expirar, então o front descarta os dois tokens.
- Entrypoint: `main/functions/<modulo>.ts`. A primeira linha é `import 'reflect-metadata';`, e ele exporta `handler = lambdaHttpAdapter([...rotas])` (ou a classe, quando há um único endpoint).
- Toda rota do array existe no `serverless.yml` (`httpApi`, mesmo método e path), e vice-versa.

### Autorização (RBAC)

- Tipo de conta: quem está no grupo `admin` do Cognito recebe o scope `trezzy/admin` no access token (trigger `PreTokenGeneration`). Sem o grupo, é customer.
- A autorização é sempre por **permissão**, nunca por papel. PROIBIDO conferir `admin`/`customer` em controller ou use case: o papel só existe no mapa `application/authorization/rolePermissions.ts`.
- Permissão nova entra no catálogo `application/authorization/Permission.ts` (`<recurso>:<ação>`, ex: `products:write`). Hoje o admin recebe o catálogo inteiro.
- Rota de admin OBRIGATORIAMENTE declara `permission` na lista de rotas do módulo **e** leva `authorizer: { name: cognito, scopes: [trezzy/admin] }` no `serverless.yml`. O API Gateway barra quem não é admin, e o adapter responde 403 sem a permissão mesmo se o `scopes` for esquecido no YAML.
- O `GET /me/permissions` (qualquer usuário logado) devolve as permissões efetivas, e o front monta o menu do painel por elas. O `GET /me` é só perfil. Esconder um item não protege nada: quem protege é a rota.
- Promover ou rebaixar admin: `pnpm --filter trezzy-api account:admin <email> <add|remove> [stage]`. Vale a partir do próximo login.

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
- Repositório em `infra/database/repositories/<Recurso>Repository.ts`. "Não encontrado" retorna `null`, e escritas aceitam `tx?: DrizzleClient.Transaction`. Quando existe entidade, o repositório recebe e devolve a entidade, não a linha do banco.
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

## Versionamento (SemVer)

- Cada app tem a própria versão, porque o deploy é separado (AWS e Vercel): `api/package.json`, com tag `vX.Y.Z`, e `web/package.json`, com tag `web-vX.Y.Z`. Tudo no formato `MAJOR.MINOR.PATCH`.
- A versão de cada app é **derivada dos commits** que mudam aquele app (escopo `api/…` ou `web/…`) desde a última tag dele, nunca escolhida no gosto. Vários commits no mesmo release: vale a maior mudança. Commit só de `root`, de CI ou de lockfile não sobe versão nenhuma.
- **Fase `0.x` (atual, até o primeiro lançamento em produção):** o contrato ainda pode mudar. `feat` ou breaking change sobe o MINOR (`0.2.0` → `0.3.0`); `fix` e `perf` sobem o PATCH (`0.2.0` → `0.2.1`).
- **No web:** `feat` (tela ou fluxo novo) sobe o MINOR, e `fix`/`perf` sobem o PATCH. Ele não tem contrato consumido por outro sistema, então o MAJOR vem de decisão de produto (redesenho, troca de URLs).
- **`1.0.0`:** primeiro lançamento em produção com o frontend consumindo a API. A partir daí o contrato HTTP da api é público:

| Mudança | Exemplos | Sobe |
| :--- | :--- | :--- |
| Quebra quem consome (`feat!:` + rodapé `BREAKING CHANGE:`) | remover ou renomear rota ou campo, campo novo obrigatório no body, mudar o formato do erro, exigir auth numa rota pública | MAJOR |
| Adiciona sem quebrar (`feat`) | rota nova, campo novo na resposta, campo opcional no body | MINOR |
| Corrige sem mudar o contrato (`fix`, `perf`) | bug, performance, correção de segurança | PATCH |
| Não muda o que roda para quem consome (`docs`, `test`, `refactor`, `chore`, `ci`, `build`, `style`) | — | nada |

- Quando: só no release (PR `develop` → `main`). O commit de release vai no `develop` antes de abrir o PR, atualiza o `package.json` de cada app que mudou e cita as versões, ex: `chore(release): v0.3.0, web-v0.2.0`. A primeira versão de um app (`0.1.0`) não tem commit de release.
- Depois do merge, entra uma tag anotada no merge commit do `main` para cada app que mudou (`vX.Y.Z` e/ou `web-vX.Y.Z`), e o corpo do PR vira a release no GitHub.
- PROIBIDO mudar a versão em branch de feature: duas features em paralelo disputariam o mesmo número.

## Criar um endpoint (checklist)

1. Tabela em `schema.ts`, depois `db:generate`.
2. `infra/database/repositories/<Recurso>Repository.ts` (`@Injectable`, injeta `DrizzleClient`).
3. `application/useCases/<modulo>/<Ação><Recurso>UseCase.ts`, com `namespace { Input; Output }`.
4. `application/controllers/<modulo>/schemas/<acao><Recurso>Schema.ts`, exportando o schema e o `type ... = z.infer<...>`.
5. `application/controllers/<modulo>/<Ação><Recurso>Controller.ts`, com `Response` próprio no namespace.
6. Rota no `main/functions/<modulo>.ts` e no `serverless.yml`.
7. Specs do use case e do controller, depois a Definition of Done.

## Pendências conhecidas (remova a linha ao resolver)

| Item | Até resolver |
| :--- | :--- |
| Validade do access token | 60 min só enquanto for dev. Reduzir para 15–30 min antes de produção: tirar alguém do grupo `admin` só vale quando o token expira (o API Gateway não consulta revogação). |
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
