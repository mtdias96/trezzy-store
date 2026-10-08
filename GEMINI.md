# Diretrizes Arquiteturais e Regras de Desenvolvimento (Trezzy Store)

Este documento estabelece os padrões de engenharia, restrições arquiteturais e boas práticas obrigatórias para o desenvolvimento neste repositório. **Todos os agentes e desenvolvedores devem seguir estritamente estas regras.**

---

## 1. Stack Tecnológica & Padrões Estabelecidos

- **Arquitetura do Repositório:** Monorepo orquestrado com `pnpm workspaces` (`pnpm-workspace.yaml`), integrando backend (`api/`) e frontend (`web/`).
- **Runtime:** AWS Lambda com **Node.js 24** (`nodejs24.x`) executando sob o modelo HTTP API v2 (`APIGatewayProxyEventV2`).
- **Serverless Framework & Bundling:**
  - Serverless Framework v4 com empacotamento individual de funções (`package.individually: true`).
  - Bundler: `esbuild` integrado via `esbuild-plugin-tsc({ forceEsm: true })` e `keepNames: true`.
  - Saída: **100% ESM nativo** (`"type": "module"`).
- **TypeScript:**
  - Compilador configurado em `"module": "NodeNext"` e `"moduleResolution": "NodeNext"`.
  - Decorators legados ativados: `"experimentalDecorators": true` e `"emitDecoratorMetadata": true`.
- **Injeção de Dependências (DI / IoC):**
  - Kernel proprietário baseado em `reflect-metadata` (`Registry.ts` e decorator `@Injectable()`).
  - *Autowiring* automático via tipos dos construtores (`design:paramtypes`).
- **Pipeline HTTP:**
  - `@middy/core` (v7) com deserialização de body (`@middy/http-json-body-parser`), serialização de resposta JSON (`@middy/http-response-serializer`) e middleware centralizado de erro (`errorHandler.ts`).
- **Banco de Dados & ORM:**
  - `drizzle-orm` (PostgreSQL) com conexão ao **Neon Serverless** via driver WebSocket (`drizzle-orm/neon-serverless` com `@neondatabase/serverless`).
  - Conexão obrigatória ao endpoint **PgBouncer do Neon (`-pooler`)** com **`max: 1`** por container Lambda.
  - Suporte completo a transações interativas ACID (`db.transaction(...)`).
  - Mapeamento automático de nomes ativado: `casing: 'snake_case'` (TypeScript `camelCase` ➔ PostgreSQL `snake_case`).
- **Validação:**
  - `zod` em runtime integrado aos Controllers através do decorator `@Schema(zodSchema)`.
- **Qualidade, Testes & Git Hooks:**
  - `vitest` para testes unitários com isolamento de credenciais.
  - `eslint` com flat config (`eslint.config.mjs`).
  - `husky` v9 + `lint-staged` v15 (auto-lint e typecheck pré-commit).
  - `@commitlint/cli` com Conventional Commits e **escopo obrigatório em minúsculas**.

---

## 2. Arquitetura de Pastas e Separação de Responsabilidades

```text
trezzy-store/
├── .husky/              # Git hooks (pre-commit, commit-msg)
├── .github/             # Pipelines de CI/CD (GitHub Actions)
├── api/                 # Backend Serverless
│   ├── sls/             # Configurações do Serverless Framework
│   │   └── config/env.yml
│   └── src/
│       ├── kernel/      # Motor de Injeção de Dependências e Decorators
│       ├── shared/      # Configurações de ambiente tipadas e tipos primitivos globais
│       ├── application/ # Regras de negócio, contratos e controllers
│       ├── infra/       # Banco de dados, serviços externos (S3, etc.)
│       └── main/        # Adapters Serverless, middlewares e funções Lambda
└── web/                 # Frontend (Next.js)
```

### Regras por Diretório em `api/src/`

| Camada / Diretório | O que é PERMITIDO | O que é EXPRESSAMENTE PROIBIDO |
| :--- | :--- | :--- |
| **`kernel/`** | Container IoC (`Registry.ts`), decorators fundamentais (`@Injectable`, `@Schema`). | Importar qualquer arquivo de `application`, `infra` ou `main`. Depender de regras de negócio. |
| **`shared/`** | `AppConfig.ts`, `env.ts`, tipos globais (`Constructor.ts`). | Lógica de negócio, queries de banco de dados ou acoplamento a requisições HTTP. |
| **`application/contracts/`** | Classes abstratas base (`Controller.ts`), contratos globais. | Implementações concretas de controllers ou acesso a bancos de dados. |
| **`application/errors/`** | Erros de domínio e operacionais (`HttpError.ts`). | Classes de infraestrutura ou dependências de frameworks externos. |
| **`application/controllers/`** | Receber requisições tratadas, validar payload via `@Schema()`, delegar para UseCases e formatar o envelope HTTP. | Executar queries SQL diretamente, importar SDKs de infraestrutura ou acessar a AWS. |
| **`application/useCases/`** | Regras de negócio puras, orquestração de repositórios e serviços de domínio. Método único `execute()`. | Acessar objetos HTTP (`event`, `headers`, `res`), definir status code HTTP ou depender de Middy/AWS Lambda. |
| **`infra/database/drizzle/`** | `DrizzleClient.ts`, `schema.ts`, repositórios concretos, queries Drizzle, migrations. | Conter lógica de apresentação HTTP ou regras de negócio pertencentes aos UseCases. |
| **`infra/storage/`** | Clientes e serviços de armazenamento (ex: AWS S3, Pre-signed URLs). | Depender de Controllers ou executar regras de negócio que não sejam de I/O. |
| **`main/adapters/`** | `lambdaHttpAdapter.ts`, middlewares do Middy (`errorHandler.ts`). | Regras de negócio, cálculos de domínio ou queries de banco. |
| **`main/functions/`** | Entrypoints das Lambdas (`health.ts`, `products.ts`). Importar `reflect-metadata` e exportar `handler = lambdaHttpAdapter(...)`. | Conter lógica de controle, validação de dados ou implementações diretas. |

---

## 3. Regras Estritas de Comportamento do Agente (Hard Constraints)

1. **Zero `any` Policy:**
   - É **proibido** utilizar `any` no código-fonte.
   - Use `unknown`, generics tipados ou type-guards.
   - A única exceção admitida no repositório inteiro é o construtor genérico `new (...args: any[]) => T` em `src/shared/types/Constructor.ts`.
2. **Extensão `.js` Obrigatória em Todas as Importações:**
   - Como o projeto adota `"module": "NodeNext"`, **todas as importações relativas e com path alias** (`@application/*`, `@kernel/*`, `@shared/*`, `@infra/*`, `@main/*`) devem terminar obrigatoriamente com `.js`:
     ```typescript
     // ✅ CORRETO:
     import { Registry } from '@kernel/di/Registry.js';
     import { env } from './env.js';

     // ❌ PROIBIDO:
     import { Registry } from '@kernel/di/Registry';
     import { env } from './env';
     ```
3. **Namespaces Co-localizados ao invés de Interfaces para DTOs:**
   - DTOs de entrada, saída, contratos de requisição e resposta **devem ser agrupados em namespaces co-localizados com a classe correspondente**:
     ```typescript
     export class MinhaClasse { ... }

     export namespace MinhaClasse {
       export type Input = { ... };
       export type Output = { ... };
     }
     ```
   - Não crie arquivos separados de `interface` para transferir dados internos de UseCases ou Controllers.
4. **Sem Barrel Files Inúteis (No Re-export Files):**
   - Não crie arquivos cujo único propósito seja reexportar símbolos de outros arquivos (ex: `index.ts` desnecessários ou aliases como `export const Foo = Bar;`).
   - Importe diretamente do arquivo que contém a implementação do recurso.
5. **Proibição de Instalar Novas Dependências sem Autorização Expressa:**
   - Nunca execute `pnpm add` ou altere `package.json` adicionando pacotes externos sem apresentar a justificativa e receber aprovação explícita do usuário.
6. **Preservação de Contratos Consolidados:**
   - Não altere contratos consolidados (`Controller.ts`, `Registry.ts`, schemas de banco já migrados ou rotas em produção) sem solicitação direta.
7. **Proibição de Mocks em Código de Produção:**
   - Todo o código de produção deve usar implementações reais via DI.
   - Mocks e stubs são restritos exclusivamente aos arquivos de teste (`*.spec.ts`).

---

## 4. Padrão de Implementação de Novos Endpoints e Módulos de Rotas

### 4.1. Arquitetura Modular de Rotas (Módulos em Serverless)
O projeto agrupa endpoints por **Módulos Funcionais** (ex: `products`, `orders`, `auth`, `users`). Cada módulo gerencia suas sub-rotas correspondentes:

```yaml
# serverless.yml
functions:
  products:
    handler: src/main/functions/products.handler
    events:
      - httpApi:
          path: /products
          method: GET
      - httpApi:
          path: /products
          method: POST
      - httpApi:
          path: /products/{id}
          method: GET
      - httpApi:
          path: /products/{id}
          method: PUT
```

### 4.2. Fluxo Passo a Passo para Criar uma Nova Feature (Respeitando o S do SOLID)

Cada classe e arquivo deve possuir uma única responsabilidade clara:

1. **Modelagem de Dados (se houver persistência):**
   - Declarar tabelas e relações no [`src/infra/database/drizzle/schema.ts`](file:///home/matheus/projetos/trezzy-store/api/src/infra/database/drizzle/schema.ts) usando `casing: 'snake_case'`.
   - Gerar e rodar migrações com `pnpm db:generate` e `pnpm db:migrate`.
2. **Repositório Concreto:**
   - Criar em `src/infra/database/repositories/<Modulo>Repository.ts`.
   - Decorar com `@Injectable()`.
   - Injetar `DrizzleClient` no construtor.
   - Suportar transações opcionais nos métodos de escrita: `tx?: DrizzleClient.Transaction`.
3. **Caso de Uso (Use Case):**
   - Criar em `src/application/useCases/<modulo>/<Nome>UseCase.ts`.
   - Decorar com `@Injectable()`.
   - Definir `namespace <Nome>UseCase { export type Input = ...; export type Output = ...; }`.
   - Implementar método único `execute(input: Input): Promise<Output>`.
   - Lançar `HttpError(statusCode, message)` em caso de falhas de negócio esperadas.
4. **Validação de Schema (Pasta `schemas/` - SRP):**
   - Criar em `src/application/controllers/<modulo>/schemas/<acao>Schema.ts`.
   - Isolar a validação Zod e exportar o schema e o tipo inferido:
     ```typescript
     import { z } from 'zod';

     export const signUpSchema = z.object({
       account: z.object({
         email: z.string().email(),
         password: z.string().min(8),
       }),
     });

     export type SignUpBody = z.infer<typeof signUpSchema>;
     ```
5. **Controller (`'public'` vs `'private'`):**
   - Criar em `src/application/controllers/<modulo>/<Nome>Controller.ts`.
   - Decorar com `@Injectable()` e `@Schema(schemaZod)`.
   - Estender `Controller<'public' | 'private', <Nome>Controller.Response>`.
   - Em rotas `'private'`, `request.accountId` está disponível e tipado obrigatoriamente.
   - Em rotas `'public'`, `request.accountId` não existe.
   - Implementar método `protected override async handle({ body, ... }: Controller.Request<'public' | 'private', ActionBody>)`.
   - Definir `namespace <Nome>Controller { export type Response = ...; }`.
6. **Entrypoint da Lambda:**
   - Criar em `src/main/functions/<modulo>.ts`.
   - **Primeira linha obrigatória:** `import 'reflect-metadata';`.
   - Exportar o handler usando `lambdaHttpAdapter(Controller)`.
7. **Declaração no Serverless:**
   - Registrar a função em `serverless.yml` usando eventos `httpApi` (v2).
8. **Testes Unitários:**
   - Criar `*.spec.ts` co-localizado cobrindo Use Case e Controller.

### 4.3. Envelopes Padrão de Resposta HTTP

- **Sucesso (200 / 201):**
  ```json
  {
    "statusCode": 200,
    "headers": { "Content-Type": "application/json" },
    "body": {
      "id": "uuid-do-registro",
      "name": "Nome do Produto"
    }
  }
  ```
- **Erro de Validação (400 Bad Request):**
  ```json
  {
    "statusCode": 400,
    "headers": { "Content-Type": "application/json" },
    "body": {
      "message": "Validation failed",
      "issues": [
        { "field": "priceInCents", "message": "Expected number, received string" }
      ]
    }
  }
  ```
- **Erro Operacional / Regra de Negócio (ex: 404 / 409):**
  ```json
  {
    "statusCode": 404,
    "headers": { "Content-Type": "application/json" },
    "body": {
      "message": "Product not found"
    }
  }
  ```
- **Erro Inesperado (500 Internal Server Error):**
  ```json
  {
    "statusCode": 500,
    "headers": { "Content-Type": "application/json" },
    "body": {
      "message": "Internal server error"
    }
  }
  ```

---

## 5. Padrão para Novas Variáveis de Ambiente

Ao introduzir qualquer nova variável de ambiente no sistema:
1. Validar no Zod em [`src/shared/config/env.ts`](file:///home/matheus/projetos/trezzy-store/api/src/shared/config/env.ts).
2. Mapear e tipar no [`src/shared/config/AppConfig.ts`](file:///home/matheus/projetos/trezzy-store/api/src/shared/config/AppConfig.ts).
3. Adicionar em [`api/sls/config/env.yml`](file:///home/matheus/projetos/trezzy-store/api/sls/config/env.yml) com fallback.
4. Adicionar valor fictício em `test.env` no [`api/vitest.config.mts`](file:///home/matheus/projetos/trezzy-store/api/vitest.config.mts).
5. Documentar no [`api/.env.example`](file:///home/matheus/projetos/trezzy-store/api/.env.example).

---

## 6. Definition of Done & Comandos de Validação

Nenhuma tarefa pode ser considerada concluída sem que **todos** os seguintes passos rodem com **zero erros**:

1. **Checagem de Tipos:**
   ```bash
   pnpm --filter trezzy-api typecheck
   ```
2. **Checagem de Lint:**
   ```bash
   pnpm --filter trezzy-api lint
   ```
3. **Bateria de Testes Unitários:**
   ```bash
   pnpm --filter trezzy-api test
   ```
4. **Validação de Build do Serverless:**
   ```bash
   pnpm --filter trezzy-api package
   ```
5. **Formatação do Commit:**
   - Seguir rigorosamente o padrão Conventional Commits com escopo em minúsculas:
     `git commit -m "<type>(<modulo>/<feature>): <descricao>"`
   - Exemplo: `git commit -m "feat(api/products): add create product endpoint with drizzle"`

