# AGENTS.md — Regras do `web/`

> Regras do frontend para pessoas e agentes de IA. Complementam o [AGENTS.md da raiz](../AGENTS.md), que continua valendo aqui (Git, commits, PRs, versionamento e regras para agentes de IA). **OBRIGATÓRIO**/**PROIBIDO** não admitem exceção. 🔒 = imposto por ferramenta (`tsc`, ESLint ou CI). Quem muda uma regra atualiza este arquivo no mesmo commit.

## Este não é o Next.js que você conhece

O Next 16 tem breaking changes: APIs, convenções e estrutura de arquivos podem diferir do seu treinamento. OBRIGATÓRIO ler o guia do assunto em `node_modules/next/dist/docs/` (a documentação da versão instalada) antes de escrever código, e respeitar os avisos de depreciação.

- Stack: Next 16 (App Router, Turbopack, Cache Components, React Compiler), React 19, TypeScript strict, Tailwind v4, shadcn/ui sobre Base UI, zod e Vitest. Deploy na Vercel (seção 12).
- Previstos, ainda não instalados (ver [Pendências](#pendências-conhecidas-remova-a-linha-ao-resolver)): react-hook-form e Playwright. A regra que depende de um deles vale a partir da instalação.

## Definition of Done

```bash
pnpm --filter trezzy-web typecheck   # next typegen + tsc
pnpm --filter trezzy-web lint
pnpm --filter trezzy-web test
pnpm --filter trezzy-web build
```

- `pnpm --filter trezzy-web lint:fix` corrige formatação, ordem de imports e ordem das classes. O pre-commit roda o `lint:fix` e o `typecheck`, e a CI roda os quatro comandos em todo PR 🔒.
- OBRIGATÓRIO antes de todo push que muda o `web/`: rodar `pnpm --filter trezzy-web build:vercel` (seção 12) e ler os avisos, não só o status.
- Commits com escopo `web/<feature>`, ex: `feat(web/catalog): add product listing`.

## 1. Idioma, nomes e formatação

- Código, pastas, tipos e funções em inglês. Textos de UI, mensagens de erro e comentários em pt-BR.
- Arquivos em kebab-case (`product-card.tsx`), componentes em PascalCase (`ProductCard`) e hooks em `use-*.ts`.
- Features nomeadas pelo domínio (`catalog`, `cart`, `orders`…), dentro da pasta da área: `store` (loja), `admin` (painel) ou `shared` (usada pelas duas, como o `auth`). O mesmo nome pode existir nas duas áreas: `store/orders` e `admin/orders` são features diferentes.
- Formatação pelo ESLint (`@stylistic`) 🔒, com as mesmas escolhas da `api/`: aspas simples (duplas no JSX), ponto e vírgula, vírgula no fim de lista multilinha e 2 espaços. Imports ordenados pelo `simple-import-sort` 🔒. O VSCode corrige ao salvar.
- Na mesma pasta, import relativo (`./x`); fora dela, pelo alias `@/` 🔒: `../` é proibido. O `components/ui` mantém o alias que o shadcn gera.
- OBRIGATÓRIO `import * as z from 'zod'`, como na `api/`: o `import { z }` impede o tree-shaking.

## 2. Arquitetura por área e feature

O web tem duas áreas, a loja e o painel, no mesmo app. Cada uma tem a sua pasta em `app/`, `features/` e `components/`, e uma área não enxerga a outra 🔒. O que é das duas fica em `features/shared` e nas camadas compartilhadas.

```text
src/
├── app/
│   ├── (store)/                 ← tudo o que o cliente vê
│   │   ├── (auth)/ (account)/   ← sub-grupos por tipo de layout e de cache
│   └── (admin)/                 ← painel (URLs em /admin)
├── features/
│   ├── store/<feature>/         ← catalog, cart, checkout, orders…
│   ├── admin/<feature>/         ← dashboard, products, orders…
│   └── shared/<feature>/        ← auth
├── components/
│   ├── ui/                      ← shadcn, sem subpastas
│   ├── common/<categoria>/      ← das duas áreas
│   └── <área>/<categoria>/      ← de uma área só (store, admin)
├── hooks/ · lib/ · config/      ← lógica sem domínio, das duas áreas
└── styles/                      ← estilo global: globals.css, tokens.ts e fonts.ts
```

- Um app só, e não dois: localizar o código se resolve com pastas, e o Next já divide o bundle por rota, então o JS do painel não vai para quem compra. Dividir em dois apps só faz sentido com um motivo de deploy, segurança ou time, como deixar o painel atrás de SSO ou publicar em ritmos diferentes. Essa estrutura já deixa a separação pronta.
- Quem protege o painel é a API (RBAC por permissão). A separação no front é de organização.

### Direção de dependência

```text
app → features → components · hooks → lib → config
                    ↘ styles
```

- Só desce, nunca sobe: `components/` e `hooks/` não importam de `features/`, `lib/` não importa de ninguém acima e `config/` é a base. O `proxy.ts` fica no nível do `app/`.
- `styles/` é base como o `config/`: o `app/` e os componentes leem dele, e ele não importa nada do projeto. Lógica (`hooks`, `lib`, `data`, `model`) não depende de estilo.
- Imposta pelo `eslint-plugin-boundaries` 🔒 (tabela em [Quem importa o quê](#quem-importa-o-quê)). Arquivo fora das pastas desta seção também é erro.

### `app/`

- Só arquivos de convenção do Next: rotas (`page`, `layout`, `loading`, `error`, `global-error`, `not-found`, `route`, `template`, `default`), e metadados (`favicon.ico`, `icon`, `opengraph-image`, `sitemap`, `robots`, `manifest`). O CSS global fica em `styles/`.
- A raiz do `app/` tem só o layout raiz, o `not-found` e o `global-error`. Cada área é um route group:
  - `(admin)`: painel, com `layout` (que aplica `data-area="admin"` e tira o painel dos buscadores), `loading` e `error`. As rotas ficam em `(admin)/admin/…`, em sub-grupos como na loja:
    - `(auth)`: entrar (`/admin/entrar`), na tela dividida do `AuthShell`, sem a navegação do painel;
    - `(panel)`: o painel logado (`/admin`…), com a sidebar e o cabeçalho no layout. O layout não lê a sessão (seção 6): o menu da sidebar, que depende das permissões, entra num `<Suspense>`.
  - `(store)`: a loja, dividida em sub-grupos por tipo de layout e de cache, cada um com seu `layout`, `loading` e `error`. Sub-grupo não muda a URL.
- Sub-grupos da loja:
  - `(auth)`: entrar e cadastro, com layout enxuto;
  - `(account)`: área do cliente, dinâmica;
  - `(shop)`: a vitrine cacheada (home, catálogo, produto), com o header da loja no layout. O menu e o drop vêm de `'use cache'` e entram no shell estático, sem `<Suspense>`;
  - previsto: `(checkout)`, a sacola e o checkout sem a navegação da loja.
- O `(store)` não tem layout próprio. Layout aninhado não se desliga, então um header no `(store)` apareceria também no `(auth)` e no `(checkout)`. O header da loja entra no layout de cada sub-grupo que o mostra.
- URLs em pt-BR (`/produtos`, `/sacola`): o nome da pasta da rota vira texto que o cliente vê e que o Google indexa. É a única exceção à regra de pastas em inglês.
- Link para página da loja que ainda não existe: `pendingRoute('/caminho')` (`lib/route.ts`), porque o `typedRoutes` só aceita rota com `page.tsx`. Quando a página entrar, a chamada vira o literal.
- PROIBIDO componente solto e pasta `_components`. Página é composição, não implementação.

### Isolamento entre áreas e features

- PROIBIDO 🔒 uma área importar a outra. A rota e o código da loja não importam nada de `features/admin` nem de `components/admin`, e vice-versa.
- PROIBIDO 🔒 feature importar feature, mesmo dentro da área. O que duas features usam sobe de camada:
  - o visual vai para `components/<área>` (só uma área usa) ou `components/common` (as duas usam), recebendo tudo por props;
  - a lógica vai para `lib`;
  - a feature usada pelas duas áreas vai para `features/shared`.
- Exceção única: `features/shared/auth/session/` (ler e validar a sessão no servidor) pode ser importado por qualquer feature.
- Dado de uma feature que outra mostra passa pela rota, por props: o layout da `(shop)` lê `departmentLinks()` do `catalog` e entrega ao menu (`navigation`), que declara o próprio tipo de entrada (`MenuDepartment`).
- Feature da `shared` não usa `components/store` nem `components/admin`: ela serve às duas áreas.

### Anatomia de uma feature

Arquivos agrupados em pastas por assunto, nunca soltos na raiz da feature 🔒. Pastas criadas sob demanda.

```text
features/<área>/<feature>/
├── data/        api.ts · queries.ts · actions.ts                         ← I/O
├── model/       types.ts · schema.ts · compute.ts · search-params.ts     ← regra pura
├── containers/  *.tsx                                                    ← lógica: busca e decide
├── hooks/       use-*.ts                                                 ← lógica de client
├── components/  *.tsx ou <contexto>/*.tsx                               ← UI: só props
└── session/     session.ts · cookies.ts · authorized-http.ts · guard.ts  ← só em shared/auth
```

- `data/`: todo o I/O. `api.ts` é o transporte HTTP (sobre o `lib/http.ts`), `queries.ts` a leitura e `actions.ts` (`'use server'`) a escrita.
- `model/`: tipos e regra pura, sem I/O, com os testes co-localizados.
- `containers/`, `hooks/` e `components/`: o padrão Container & Presentational, descrito abaixo.

### Pastas dentro de `components/`

- `components/common` e `components/<área>`: OBRIGATÓRIO todo arquivo numa pasta de categoria, desde o primeiro 🔒. As categorias seguem os nomes do MUI e do Chakra: `layout/` (composição de página), `navigation/`, `forms/` (campos e cards de formulário), `data-display/`, `feedback/` (erro, vazio e carregamento) e `overlay/`. A `<área>` tem também `shell/`, a casca da área (header, sidebar e logo). Pastas criadas sob demanda; categoria nova entra nesta lista e no `eslint.config.mjs` no mesmo commit.
- `components/` da feature: arquivos soltos enquanto a feature tem um contexto só (`auth`, `navigation`). No segundo contexto, a pasta inteira é dividida: PROIBIDO arquivo solto ao lado de subpasta.
- Contexto é uma tela, no singular (`list/`, `editor/`), ou um subdomínio com o nome do arquivo do `model/` (`media/` ↔ `model/media.ts`).
- PROIBIDO subpasta dentro de subpasta: o contexto que cresce vira um contexto irmão.
- Card de produto da loja: um só, `components/store/data-display/product-card.tsx`, em toda grade (home, catálogo, busca). A feature monta o `ProductCardData` a partir da API e escolhe o `imageSizes` da grade; PROIBIDO card de produto próprio numa feature.
- Departamentos e categorias da loja: `features/store/catalog/model/taxonomy.ts` é a única fonte da árvore e dos nomes. O menu, as páginas do catálogo, a home e a trilha do produto leem dali, e a API é consultada só pelo slug (o nome que ela manda é ignorado). Renomear é trocar o `name`; trocar o `slug` muda a URL. Os textos fixos da listagem (Início, Todos, Tudo, Ordenar e os títulos dos filtros), as ordenações e os limites das faixas de preço (`PRICE_STEPS`, em reais: o rótulo e o valor da URL saem deles) ficam em `catalog/model/listing.ts`.
- Listagem de produtos (`/produtos`, `/[department]`, `/[department]/[category]`): uma página é um `CatalogScope` (`catalog/model/scope.ts`) entregue ao `CatalogContainer`. Página nova de listagem (novidades, outlet, marca, busca) é um scope novo, não uma tela nova. As peças de filtro sem domínio (`FilterSection` com o "Limpar", `FilterChips`, `FilterChecklist`, `FilterRadios`, `FilterSwitch`, `FilterLinks`, `PillNav`, `Pagination`, `FilterSheet`) ficam em `components/store`.
- Peça sem domínio usada por dois contextos sobe para `components/<área>`, em vez de um contexto importar o outro (o `FormCard` do cadastro de produto está em `components/admin/forms/`).
- Spec e skeleton ficam junto do componente.
- Código de prévia fica em `components/<área>/preview/`, fora das categorias, e entra nas Pendências.
- `components/ui` segue o layout do shadcn, sem subpastas.

### Container & Presentational

A lógica fica separada da UI. No App Router, o container costuma ser um Server Component: ele busca no servidor, e o componente de apresentação só recebe o resultado.

| Papel | Onde | Faz | Não faz |
| :--- | :--- | :--- | :--- |
| Container server | `containers/` ou o próprio `page.tsx` | chama `queries.ts`, decide o que mostrar (vazio, `notFound()`) e passa DTO por props | estilo: só compõe componentes |
| Container client | `containers/`, com `'use client'` | liga um hook ou uma Server Action ao componente de apresentação | buscar dado: `queries.ts` é server-only |
| Hook | `hooks/use-*.ts` | estado da feature, `useActionState`, chamada de Server Action | JSX |
| Apresentação | `components/` | recebe props e renderiza; estado de UI local (aberto/fechado) pode | importar `data/`, `hooks/` da feature ou `config/` 🔒 |

- Componente de apresentação não sabe de onde vem o dado. Por isso dá para testá-lo e reaproveitá-lo só com props, e ele sobe para `components/<área>` ou `components/common` quando outra feature precisa dele.
- O `'use client'` continua na folha (seção 3): container client só existe onde há interação.

### Quem importa o quê

Imposto pelo `eslint-plugin-boundaries` 🔒. "Da feature" quer dizer da mesma área e da mesma feature, e "compartilhados" são `ui`, `common`, `hooks`, `lib`, `config` e `styles`.

| De | Pode importar |
| :--- | :--- |
| Raiz do `app/` | compartilhados e `shared/auth/session` |
| `app/(store)` e `app/(admin)` | `containers`, `components`, `data` e `model` das features da própria área e da `shared`; `components/<própria área>`; `shared/auth/session` e compartilhados |
| `proxy.ts` | `shared/auth/session`, `lib` e `config` |
| `containers/` | da feature: `data`, `model`, `components`, `hooks` e `containers`; `components/<própria área>`; `shared/auth/session` e compartilhados |
| `components/` da feature | da feature: `components` e `model`; `components/<própria área>`, `ui`, `common`, `hooks`, `lib` e `styles` |
| `hooks/` da feature | da feature: `hooks`, `model` e `data/actions.ts`; `hooks` e `lib` |
| `data/` | da feature: `data` e `model`; `shared/auth/session`, `lib` e `config` |
| `model/` | da feature: `model`; `lib` |
| `shared/auth/session/` | `data` e `model` do auth; `lib` e `config` |
| `components/ui` | `components/ui`, `hooks`, `lib` e `styles` |
| `components/common` | `ui`, `common`, `hooks`, `lib` e `styles` |
| `components/store` e `admin` | `components/<própria área>`, `ui`, `common`, `hooks`, `lib` e `styles`, e nunca a outra área |
| `hooks/` · `lib/` · `config/` · `styles/` | `hooks` → `lib`; `lib` → `config`; `config` → só `config`; `styles` → só `styles` |

### Camadas compartilhadas

- `components/ui/`: só o que o shadcn gera. O lint de tokens é mais brando aqui (seção 8).
- `components/common/`: nossos componentes de apresentação sem domínio, por categoria (`feedback/` com `RouteError` e `PageSkeleton`, `forms/` com `PasswordInput`, `layout/` com os primitivos de página `Screen` e `Section`), com o lint de tokens inteiro.
- `components/store/` e `components/admin/`: apresentação de uma área só, por categoria: `shell/` (header, footer, sidebar e logo), `data-display/` (cards e tabelas), `forms/` (campos e cards de formulário)…
- `hooks/`: hooks de client sem domínio (é o alias `hooks` do `components.json`).
- `lib/`: utilitários sem domínio (`cn`, `http`, `ActionResult`, formatadores).
- `config/`: variáveis de ambiente validadas com zod no boot. PROIBIDO ler `process.env` fora de `config/`.
  - `config/env.ts` começa com `import 'server-only'`.
  - Variável pública (`NEXT_PUBLIC_*`) fica em `config/public-env.ts`, lida por extenso (`process.env.NEXT_PUBLIC_X`). O Next só embute no bundle o acesso literal: desestruturar ou ler o `process.env` inteiro devolve `undefined` no browser.
  - Variável nova entra no `config/` e no `.env.example`.
- `styles/`: o estilo global do design system (seção 8). O `globals.css` guarda os tokens, o `tokens.ts` repete os nomes para tipar props, e o `fonts.ts` carrega as fontes pelo `next/font`. Só o layout raiz e o `global-error` importam o CSS e as fontes.

### Sem barrel

- PROIBIDO `index.ts` em `features/`, como em todo o repositório. Ele mistura módulos `server-only` com `'use server'` e vaza código de servidor para o bundle do client.

## 3. Server vs Client

- Server Component por padrão. `'use client'` só na folha que precisa de estado, evento ou API do browser.
- `'use client'` é contagioso: tudo o que o arquivo marcado importa vai para o bundle do client. A diretiva nunca vai no componente mais alto.
- Se o pai é server, continua server: o pedaço interativo vira um componente client à parte.
- PROIBIDO marcar `page.tsx`, `layout.tsx` ou container de seção como client porque um filho é interativo.
- Conteúdo estático dentro de um client component entra por `children` ou props, para continuar renderizado no servidor.

```text
❌ ProductCard ('use client')         ✅ ProductCard (server)
     └── Gallery   (vira client)           ├── Gallery   (server)
     └── Price     (vira client)           ├── Price     (server)
     └── AddToCart (estado)                └── AddToCart ('use client') ← só aqui
```

- PROIBIDO `useMemo`, `useCallback` e `memo` sem comentário com o motivo: o React Compiler memoiza sozinho.

## 4. Dados, cache e mutações

### I/O

- I/O só em `data/`. PROIBIDO `fetch` em componente.
- Quem chama `queries.ts` é o `page.tsx`, o `layout.tsx` ou um container server da feature, que fica dentro de um `<Suspense>` quando a leitura é dinâmica. Client component nunca chama: recebe o dado por props.
- `data/api.ts` e `data/queries.ts` começam com `import 'server-only'`, sem exceção. O Next resolve esse pacote sozinho, sem instalar, e nos testes ele vira um módulo vazio (alias no `vitest.config.mts`).
- O `data/api.ts` chama a API pelo `lib/http.ts`, que exige um schema zod da resposta (`http('/products', { schema })`): nada chega ao app sem validação. Status 4xx/5xx vira `HttpError` com `status` e `payload`, e toda chamada tem timeout de 10 s.
- Toda prop de client component é serializada e vai para o browser. PROIBIDO repassar objeto cru: `queries.ts` devolve só o que a UI usa (DTO), tipado.

### Leitura da requisição (cookie, header)

- Com Cache Components, ler `cookies()` ou `headers()` fora de um `<Suspense>` é erro de build.
- Página inteira dinâmica (ex: área logada) usa o `loading.tsx` do grupo como boundary.
- Página cacheada com um pedaço dinâmico isola esse pedaço num `<Suspense>` com skeleton, e o resto entra no shell estático.
- Dois pedaços da página que leem a mesma consulta dinâmica (o total no topo e a lista do catálogo): a promessa nasce uma vez no container, sem `await`, e cada `<Suspense>` a espera. Assim o topo continua estático e a API é chamada uma vez.
- PROIBIDO ler cookie ou sessão no topo de um `layout.tsx`: o `await` segura o segmento inteiro, inclusive o `children`, atrás da requisição.
- Hora atual e valores aleatórios (`Date.now()`, `new Date()`, `Math.random()`, `crypto.randomUUID()`) em componente de servidor: `await io()` (de `next/cache`) antes. Ler `cookies()` antes não basta: com o `partialPrefetching`, a casca da rota renderiza com os cookies da sessão, e o Next recusa a hora nesse prerender. O `connection()` fica para quando a renderização precisa esperar a requisição real, porque ele bloqueia também o prefetch.
- Hora atual em client component (saudação, data de hoje): `useClientValue` de `hooks/`. O servidor e a hidratação renderizam o fallback (um skeleton), e o browser troca pelo valor logo depois. Datas do painel no fuso da loja, pelo `lib/date.ts`.

### Cache

- `'use cache'`, `cacheTag()` e `cacheLife()` vivem **só** em `data/queries.ts`. PROIBIDO em componente.
- Cacheado, com tag: conteúdo público, igual para qualquer visitante.
- Sempre dinâmico: o que depende de quem está acessando (sessão, cookie, header). O `'use cache'` não lê `cookies()`: a chamada lança erro.
- Tags: `<recurso>:<id>` para um item e um nome curto para a lista ou página (ex: `product:{id}`, `catalog`, `home`).
- Toda action que muda dado cacheado invalida as tags afetadas, com `revalidateTag(tag, 'max')` ou com `updateTag(tag)` quando quem mudou precisa ver na hora (o `updateTag` só funciona em Server Action). O perfil do `revalidateTag` é obrigatório: a forma com um argumento está depreciada.
- Dado que pode mudar fora do Next fica dinâmico ou com `cacheLife` curto, porque nenhuma action vai invalidá-lo.
- Na Vercel, cada instância serverless tem a própria memória. O `'use cache'` comum só rende no que entra no shell estático (pré-renderizado no build). Dado cacheado lido em runtime, como uma página com parâmetro dinâmico, usa `'use cache: remote'`, compartilhado entre as instâncias.
- `'use cache: remote'` só onde a chave se repete. Com filtros na chave (tamanho, marca, faixa de preço), quase toda combinação é única: o cache remoto só soma a latência da consulta a ele, e a chamada vai direto à API. No catálogo, `isSharedQuery` separa os dois casos: a página como os links a abrem (qualquer ordem, página ou promoção) é cacheada, e a lista com filtro não.

### Server Actions

Server Action é endpoint público. Toda action:

1. Valida a entrada com o schema zod de `model/schema.ts`.
2. Confere de novo a sessão e se o usuário pode executar a ação, mesmo que o proxy já tenha barrado.
3. Devolve resultado tipado. PROIBIDO `throw` para erro de negócio:

   ```ts
   // src/lib/action-result.ts
   type ActionResult<T = void> =
     | { ok: true; data: T }
     | { ok: false; error: string; fieldErrors?: Partial<Record<string, string[]>>; values?: Record<string, string> };
   ```

   O React limpa o formulário depois da action: o `values` devolve o que foi digitado (nunca a senha), e o campo o usa como `defaultValue`.

4. É consumida no client com `useActionState`.

- `redirect()` e `notFound()` funcionam lançando uma exceção: chame-os fora de `try/catch`.

## 5. Estado na URL

- Filtros, ordenação, busca e paginação de listagem ficam na URL, via `nuqs`.
- Os parsers ficam em `model/search-params.ts` da feature e são reutilizados no servidor (`createSearchParamsCache`) e no client.
- PROIBIDO `useSearchParams` manual para estado de filtro.
- O `NuqsAdapter` fica no layout do `(panel)` e no do `(shop)`. Ele só lê a URL nos hooks (`useQueryStates`), que ficam dentro de `<Suspense>`: a casca estática da loja continua estática. Quando é o servidor que filtra a lista, o filtro atualiza com `shallow: false` e numa transição (`startTransition`), para a lista atual ficar na tela até a nova chegar; a busca espera a digitação parar (`limitUrlUpdates: debounce(300)`).
- Ordenação por coluna é link (`createSerializer` dos mesmos parsers): funciona sem JavaScript no client.
- Catálogo da loja: `tamanho`, `marca`, `preco` (uma faixa), `promocao`, `ordem` e `pagina` (`catalog/model/search-params.ts`). Valor que não existe na URL (faixa ou ordem antiga) é ignorado, não quebra a página. Todo filtro volta para a primeira página, e a paginação é link, para os buscadores chegarem à página 2. Filtro que troca de página (departamento, categoria) é link, não parâmetro.

## 6. Proteção de rota (`proxy.ts`)

- `src/proxy.ts` é convenção do Next (substitui o `middleware.ts`): fica na raiz de `src/`, ao lado de `app/`. Movido dali, ele para de rodar sem aviso. Um só por projeto.
- A lógica não mora nele: ele importa `features/shared/auth/session/guard.ts` e exporta o `matcher`.
- Se o painel ganhar um subdomínio próprio (`admin.…`), quem roteia pelo host é o `proxy.ts`, sem virar outro app.
- O proxy faz só o redirect otimista (sem sessão → login, com o destino em `?next=`). Ele roda em toda navegação, até no prefetch, então só lê o cookie e nunca chama a API. A checagem real fica perto do dado, em cada `queries.ts` e `actions.ts` protegido.
- Quem está logado e abre o login vê o formulário: mandá-lo ao painel com um token revogado criaria um loop de redirects.
- O menu do painel segue as permissões efetivas da conta (`GET /me/permissions`), pelo catálogo em `features/admin/navigation/model/nav.ts`. Item novo entra ali com a permissão que a rota exige, junto com a página dele. Esconder o item não protege nada: quem protege é a rota.

### Sessão (BFF)

A API é quem autentica (Cognito) e autoriza (o API Gateway valida o JWT em toda rota). O Next só guarda a sessão e a repassa.

- O login é uma Server Action que chama `POST /auth/signin` e grava os tokens em cookies `__Host-`, `httpOnly`, `Secure` e `SameSite=Lax`. O browser nunca vê os tokens, então um XSS não consegue roubá-los. Com "Manter conectado", o access token vive o quanto vale e o refresh token, 30 dias; sem ele, os dois somem ao fechar o browser.
- O login do painel recusa conta sem o scope `trezzy/admin` e revoga os tokens que acabaram de sair. O `?next=` só aceita caminhos do painel (`toPanelPath`), para não virar redirecionamento para fora do site.
- Ler a sessão: `getSession()` e `requireAdminSession()` em `features/shared/auth/session/session.ts`. Toda query e action do painel começa por `requireAdminSession()`.
- Chamar a API em nome do usuário: `authorizedHttp()` manda o `Bearer` e, se a API responder 401, volta ao login. A feature usa no `data/api.ts`, nunca o `http()` com o token na mão.
- PROIBIDO passar token para componente ou para o client: o `Session` não leva tokens, e só o `session/` os lê.
- O Next lê o token sem validar a assinatura, só para decidir tela e redirect. Um cookie forjado chega no máximo à casca do painel: a primeira chamada à API responde 401 e volta ao login.
- PROIBIDO ler a sessão no topo de um `layout.tsx` (seção 4). A página da área logada põe o dado num `<Suspense>`, e a casca continua estática.
- Logout: a action `signOut` revoga o refresh token (melhor esforço: com a API fora do ar, o logout local segue), apaga os cookies e volta ao login.

## 7. Formulários

- Formulário simples (login, busca, newsletter): `<form action>` + `useActionState` + schema zod, sem react-hook-form.
- Formulário complexo (muitos campos, listas dinâmicas): react-hook-form.
- `components/ui/form.tsx` é a única fronteira do react-hook-form: PROIBIDO feature importar RHF direto. O arquivo é nosso, montado sobre o `Field` do shadcn, porque o preset `base-nova` não tem o `Form` antigo.

## 8. Design tokens e UI

### Onde vivem

- Os tokens ficam no bloco `@theme` do `src/styles/globals.css`, a única fonte dos valores de estilo. PROIBIDO `tailwind.config.js` e `theme.ts` de runtime (o Tailwind v4 é CSS-first).
- Os nomes também ficam em `src/styles/tokens.ts`, para tipar props. O `tokens.spec.ts` falha se as duas listas divergirem 🔒: token novo entra nos dois arquivos.
- Os grupos de cor, breakpoint, fonte, raio e sombra começam com `--*: initial`, então só existe o utilitário que um token define: `bg-red-500` e `2xl:` não existem.

| Grupo | Exemplos |
| :--- | :--- |
| Cor | `bg-brand`, `text-ink-soft`, `bg-paper-stone`, `bg-status-paid-bg`, `text-danger-700` |
| Tipografia | `type-display text-display-xl`, `text-body`, `text-caption`, `text-micro` |
| Fonte | `font-sans`, `font-display`, `font-mono`, `font-hand` |
| Raio | `rounded-seal`, `rounded-card`, `rounded-block`, `rounded-pill` |
| Sombra | `shadow-pop`, `shadow-modal`, `shadow-hero`, `shadow-focus-brand` |
| Altura de controle | `h-ctl-sm`, `h-ctl`, `h-ctl-lg`, `h-field`, `h-cta` |
| Movimento | `duration-fast`, `animate-pop`, `animate-appear`, `animate-skeleton`, `rotate-sticker` |

- `type-display` aplica o estilo display do design (itálico, peso 900, largura 125% e caixa alta), e o tamanho vem do `text-display-*`.
- O título do hero usa a utility `text-display-hero` (`globals.css`): o tamanho sai da largura do `@container` e da palavra mais longa, passada em `--hero-letters` no `style` do elemento. É utility, e não token: o token mora no `:root`, onde a variável do elemento não existe.
- Espaçamento (`p-4`, `gap-3`) e largura de container (`max-w-md`, `@md:`) seguem a escala padrão do Tailwind, porque o design não define esses tokens.

### Regras impostas pelo lint 🔒

- Classe que não existe no tema é erro (`no-unknown-classes`).
- PROIBIDO valor arbitrário (`w-[13px]`, `bg-[#fff]`, `bg-(--x)`), propriedade arbitrária (`[mask-type:alpha]`) e breakpoint arbitrário (`min-[900px]:`).
- PROIBIDO montar classe por interpolação (`bg-${tone}`), porque o Tailwind não gera a classe. Mapeie o token para a classe inteira:

  ```ts
  const toneClass = {
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    danger: 'bg-danger-50 text-danger-700',
    info: 'bg-info-50 text-info-700',
  } satisfies Record<FeedbackTone, string>;
  ```

- PROIBIDO cor literal (hex, `rgb()`, `oklch()`…) em TS/TSX e valor fixo no `style`, que só recebe valor calculado em runtime.
- PROIBIDO importar CSS além do `globals.css`.
- Fora de `components/ui`, PROIBIDO a escala de texto padrão (`text-sm`…) e os aliases do shadcn (`bg-black`/`bg-white`, `shadow-md`/`shadow-lg`, `rounded-sm`/`rounded-4xl`). Eles existem só para os componentes gerados pelo shadcn e apontam para tokens: `ink`, `gray-0`, `pop`, `modal`, `seal` e `pill`.
- `components/ui` é só o que o shadcn gera: componente nosso vai em `components/common` ou `components/<área>`, onde todas essas restrições valem.
- Ordem das classes padronizada (`enforce-consistent-class-order`), corrigida pelo `lint:fix`.
- Exceção pontual só com `// eslint-disable-next-line <regra> -- <motivo>`.

### shadcn

- PROIBIDO renomear ou remover os slots semânticos do shadcn: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`, `--chart-1..5`, `--sidebar-*` e `--font-heading`. Só trocamos os valores.
- Os slots apontam para tokens no `:root` (superfícies da loja). No painel, o container com `data-area="admin"` troca as superfícies para os cinzas frios e aplica `bg-background`.
- Elemento com papel de interface usa o slot (`bg-primary`, `text-muted-foreground`, `border-border`). O token direto fica para o que não tem slot (`bg-lime`, `bg-status-paid-bg`).
- Manter `cn()`, `data-slot` e os aliases do `components.json`. A composição de primitivo é pela prop `render` do Base UI, que não tem `asChild`/`Slot`.
- O `shadcn add` reescreve os componentes de que o novo depende (a sidebar traz o `button` e o `input`), e os nossos têm ajustes: depois de rodar, restaure-os com `git checkout` e confira o diff.
- Sidebar do painel: os slots `--sidebar-*` e as larguras `--sidebar-width*` ficam no `:root`, e não no `[data-area="admin"]`, porque no celular ela abre num Sheet, que o portal renderiza fora do container do painel. Fora do `components/ui`, o estado recolhido se escreve com a variante `sidebar-collapsed:` do `globals.css`.
- Portais no painel (Dialog, Popover, Sheet…) renderizam no `<body>`, fora do `[data-area="admin"]`, e voltariam às superfícies da loja. O conteúdo do portal leva `data-area="admin"` (ex: `<DialogContent data-area="admin">`).
- Paleta de comandos: `Dialog` + `Combobox` do shadcn (Base UI) com `inline`, e não o `command` do shadcn, que traz o `cmdk` (sobre o Radix). O campo sem moldura é o `ComboboxChipsInput`: o `ComboboxInput` sempre envolve o campo num `InputGroup`.
- Fonte pelo `next/font`, em `src/styles/fonts.ts`, numa variável própria (`--font-archivo`) que o token `--font-sans` lê.
- O `globals.css` desliga as animações com `prefers-reduced-motion`. Movimento infinito (`animate-marquee`) também precisa de um jeito de pausar: a caixa "Pausar animações" da faixa de avisos aparece no foco do teclado e, marcada, para todos os marquees da página, sem JS. Marquee novo usa o `Marquee` de `components/store/data-display`, que já tem a variante `motion-paused:`.
- `navigation-menu` (mega menu da loja): ajustado no arquivo para abrir em largura cheia, ancorado no `<header>`. Os painéis usam `keepMounted`, para os links das categorias irem no HTML do servidor.

### Movimento e fluidez

- Animação e transição só em `transform` e `opacity`, que rodam no compositor. PROIBIDO animar `width`, `height`, `top`, `left`, `margin` ou `padding`: cada quadro recalcula o layout da página.
- Texto que muda a cada segundo (relógio, contador) usa `tabular-nums` e só atualiza enquanto aparece na tela (`useCountdown`, de `hooks/`).
- Medido na home (Chrome, 1440px, 3 s parado): os três marquees rodam sem layout nem recálculo de estilo; o único layout é o do contador do hero, 1 por segundo.

### Imagens

- Sempre `next/image`, com `remotePatterns` restrito aos domínios de onde as imagens vêm.
- Imagem com proporção fixa (`aspect-ratio` ou `width`/`height`), para evitar CLS.
- Imagem que muda de largura com a tela (`fill` ou grid) OBRIGATORIAMENTE leva `sizes`, do maior breakpoint para o menor: `sizes="(min-width: 1100px) 25vw, 50vw"`. Sem ele, o Next assume `100vw` e o celular baixa uma imagem bem maior que a exibida.

## 9. Mobile first

- OBRIGATÓRIO escrever o estilo base para o celular e acrescentar breakpoints para telas maiores. No Tailwind, o utilitário sem prefixo vale para todas as telas, e `sm:`, `md:` e `lg:` valem **a partir** daquela largura: `flex-col md:flex-row`, nunca `flex-row max-md:flex-col`.
- PROIBIDO 🔒 usar `max-*:` para consertar o mobile depois. Ele só entra em exceção pontual, com `eslint-disable` e o motivo.
- Breakpoints da Trezzy: `sm` 640px, `md` 960px, `lg` 1100px e `xl` 1440px. Não existe `2xl`. Breakpoint novo é token novo no `globals.css`, e `min-[…]:` arbitrário é proibido 🔒.
- O layout da página responde à tela (`md:`). Componente que aparece em larguras diferentes (card no grid, na lateral, no carrinho) responde ao próprio container (`@container` e `@md:`).
- Toda tela é construída e conferida primeiro em 360px de largura, sem rolagem horizontal até 320px.
- Alvo de toque principal (CTA, navegação, ícone de ação) com no mínimo 44×44px no celular: `h-ctl-lg`, `h-field` ou `h-cta`. Para qualquer outro alvo, o mínimo é 24×24px (WCAG 2.2 AA). No `Button`, o `size="lg"` tem 44px (`h-ctl-lg`), o padrão tem 40px (`h-ctl`) e o `sm` tem 34px (`h-ctl-sm`).
- Nada essencial depende de hover, porque o celular não tem. No Tailwind v4, o `hover:` só se aplica em dispositivo com hover.
- Altura de tela cheia com `dvh` ou `svh` (`min-h-dvh`), nunca `vh`: no celular, o `vh` ignora a barra do navegador e corta o conteúdo.
- Campo de formulário com fonte de no mínimo 16px no celular: abaixo disso, o iOS dá zoom ao focar o campo. Os campos do shadcn já usam `text-base md:text-sm`, e nenhum papel tipográfico chega a 16px, então essa classe fica como está.
- PROIBIDO bloquear o zoom (`maximumScale` ou `userScalable: false` no `viewport`): quem precisa ampliar a tela perde o acesso.

## 10. Configuração

- `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`, `typedRoutes: true` (links e redirects tipados), `reactCompiler: true` (pelo plugin do Babel; o port em Rust ainda é experimental) e `poweredByHeader: false`.
- Com o `partialPrefetching`, o `<Link>` pré-carrega o App Shell da rota, a parte que não depende da URL, um por rota. O `prefetch={true}` num link só entra quando a rota precisa de mais que o shell, com o motivo em comentário.
- Headers de segurança em todas as rotas: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` com `frame-ancestors 'none'` e `Permissions-Policy`. O HSTS vem da Vercel, e a CSP completa entra junto com o primeiro script de terceiro.
- Node 24: o `.nvmrc` da raiz vale para a CI e o ambiente local, e o `engines` do `package.json` vale para a Vercel.
- TypeScript 🔒: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns` e `noFallthroughCasesInSwitch`. O `typecheck` roda `next typegen` antes do `tsc`, porque tipos como `LayoutProps` são gerados pelo Next. O `lint` e o `lint:fix` também: as regras type-aware leem esses tipos, e sem eles o resultado muda. Num checkout limpo, como o da CI, o `as Route` do `redirect()` vira "desnecessário", e o `lint:fix` o removeria.
- Lint type-aware 🔒, que lê os tipos pelo `projectService`:
  - promise solta ou mal usada (`no-floating-promises`, `no-misused-promises`);
  - `any` e valor inseguro (`no-explicit-any`, `no-unsafe-*`);
  - asserção `!` (`no-non-null-assertion`) e condição que é sempre verdadeira ou sempre falsa (`no-unnecessary-condition`);
  - `switch` não exaustivo, API depreciada (`no-deprecated`) e `import type` obrigatório para tipos.

## 11. Qualidade

- Lint: ESLint flat config com o `eslint-config-next`, a formatação e a ordem de imports (seção 1), o `eslint-plugin-boundaries` (seção 2), o `eslint-plugin-better-tailwindcss` (seção 8) e as regras type-aware (seção 10).
- Unitário: Vitest, com `*.spec.ts(x)` co-localizado com o arquivo testado. Obrigatório em `model/` (`compute.ts`, schemas, parsers) e `lib/`. Teste que lê arquivo ou usa API do Node começa com `// @vitest-environment node`.
- E2E: Playwright nos fluxos críticos, rodando em viewport de celular e de desktop.
- A CI (`validate-web`) roda typecheck, lint, test e build em todo PR para `develop` e `main`, e bloqueia o merge 🔒.

## 12. Deploy (Vercel)

- Projeto na Vercel com Root Directory `web`. A Vercel instala pelo `pnpm-lock.yaml` da raiz e escolhe o Node pelo `engines`.
- As variáveis do `.env.example` ficam em Settings > Environment Variables, separadas por ambiente (Production e Preview). Faltou uma, o build falha: o `config/env.ts` não tem fallback.
- Todo push gera um preview deploy, e o `main` é o ambiente de produção.
- O build da Vercel roda o `next build`, que já checa os tipos, mas não roda o lint nem os testes: quem barra o merge é a CI.

### Build da Vercel antes do push

- O `build:vercel` roda o `vercel build`, o mesmo builder do deploy (`@vercel/next`), e gera o `web/.vercel/output`. Se quebra ali, quebra no deploy.
- Avisos de depreciação ou de configuração no build viram ajuste antes do push. Foi assim que entrou o `partialPrefetching`.
- O CLI vem pelo `pnpm dlx`, com versão fixa e sem entrar como dependência. O `--allow-build=esbuild` libera só o script do `esbuild`, que o pnpm bloqueia por padrão.
- Ele lê as configurações do `web/.vercel/project.json` e as variáveis do `web/.vercel/.env.preview.local`, os dois fora do git:
  - com o projeto criado na Vercel, `vercel link` e `vercel pull --yes` trazem os dois;
  - antes disso, crie-os à mão: o `project.json` com `{ "projectId": "local", "orgId": "local", "settings": { "framework": "nextjs", "nodeVersion": "24.x" } }`, e o `.env.preview.local` com as variáveis do `.env.example`.

## Pendências conhecidas (remova a linha ao resolver)

| Item | Até resolver |
| :--- | :--- |
| Projeto na Vercel | Criar o projeto (Root Directory `web`) e cadastrar o `API_URL`. É um passo manual, feito por quem tem acesso à conta. Depois, trocar o `project.json` local pelo `vercel link`. |
| Pre-push | O build da Vercel antes do push é regra escrita, sem hook: a barreira obrigatória continua sendo a CI e o preview da Vercel. |
| Dependências | react-hook-form e Playwright aguardam aprovação. |
| Monitoramento | Não há captura de erro nem de Web Vitals no browser: o `RouteError` não reporta nada. Os erros de servidor aparecem nos logs da Vercel. |
| CSP | Só o `frame-ancestors` por enquanto. A política completa entra junto com o primeiro script de terceiro (pagamento, analytics). |
| Home | Header, hero do drop, a fita diagonal, os departamentos e "Chegou agora": as outras seções entram uma a uma. Os departamentos de prévia não têm foto (o card mostra um ícone). A descrição da metadata do layout raiz é provisória. A foto do drop de prévia tem 992px: no desktop retina, o hero pede ~1500px. |
| Rotas da vitrine na API | O front já consome os contratos: `GET /store/products?department=&featured=true&limit=` (`features/store/navigation/data/api.ts`); `GET /store/drops/next` (`features/store/drops/data/api.ts`; 404 quando não há drop); `GET /store/departments` (slug, contagem e foto, sem o nome), `GET /store/products?sort=newest&limit=&department=`, `GET /store/products?department=&category=&size=&brand=&priceAboveInCents=&priceUpToInCents=&onSale=&sort=&page=&limit=` (a listagem: preço acima do primeiro limite e até o segundo, promoção é preço "de" maior que o preço, e `facets` de tamanho e marca em que cada contagem ignora o próprio filtro), `GET /store/products/{slug}` (com o resumo das avaliações) e `GET /store/products/{slug}/reviews?limit=` (`features/store/catalog/data/api.ts`; parcelas e preço no Pix vêm prontos; o selo `tag` inclui `sold-out`). Falta a API, e o domínio do CDN das fotos em `images.remotePatterns`. Com a API fora do ar, o menu sai sem os destaques, a home sem o drop, os departamentos e os lançamentos, e a entrada de cache dura minutos, não horas. Quando o painel editar produtos e drops, as actions invalidam as tags `catalog` e `drops`. Quando o drop começa, os contadores param em zero até a entrada do cache vencer (até 1 h). |
| Lembrete do drop e favoritos | O "Ativar lembrete" e o coração do card só guardam a escolha no navegador (`useStoredFlag`): nada avisa o cliente, e os favoritos não seguem para outro aparelho. A lista de desejos entra com rota na API. O aviso de verdade (e-mail ou push) entra com uma rota na API e, se exigir conta, com a área do cliente. |
| SEO da loja | Falta a URL pública do site: sem ela não há `metadataBase`, `canonical`, `sitemap`, `robots`, o `BreadcrumbList` em JSON-LD da página do produto, e o Open Graph e o JSON-LD só levam fotos com URL absoluta. Entram com a variável da URL no `config/`. As URLs do catálogo com filtro (`?marca=`, `?tamanho=`, `?preco=`, `?promocao=`, `?ordem=`) entram com `canonical` para a página sem filtro. |
| 404 do catálogo | O `[department]` fica na raiz: toda URL de um segmento sem página própria passa por ele. A primeira visita a uma URL desconhecida responde 200 com `noindex` (o `params` é lido dentro do `<Suspense>`, como pede o Partial Prefetching), e as seguintes, 404 (medido no `next start`: a renderização em segundo plano do ISR guarda o 404). Departamento com o slug de uma página fixa ficaria escondido atrás dela: o `taxonomy.spec.ts` barra. |
| 404 do produto | Slug inexistente responde 200 com `noindex`: o produto entra em streaming, e o status já saiu (comportamento documentado do Next; o Google não indexa). Um 404 de verdade pediria checar o slug no `proxy.ts` contra uma lista em cache, sem chamar a API. Quando o painel editar um produto, a action invalida a tag `product:{slug}`. |
| Avaliações | A página do produto mostra as 3 mais recentes: falta a página com todas e o formulário para avaliar (pede conta e compra). Quando entrar uma avaliação, a API invalida as tags `reviews:{slug}` e `product:{slug}` (o resumo vem no produto). |
| Sacola e frete | A página do produto já envia para `addToBag` (`features/store/cart`) e `estimateShipping` (`features/store/shipping`), que validam a entrada e respondem que não deu: faltam o carrinho e o cálculo de frete na API, e a sacola no header continua sem contagem. |
| Páginas da loja | Os links do header usam `pendingRoute` até cada página existir: `/novidades`, `/marcas` (e as subpáginas), `/drops`, `/outlet` (o "Outlet" de cada departamento no menu já abre `?promocao=true` no catálogo), `/busca`, `/sacola` e `/conta`. As marcas do menu são fixas em `features/store/navigation/model/nav.ts` até a API listar as ativas. |
| Taxonomia da vitrine | O banco não tem departamento (as categorias são planas, com nome editável no painel), e a árvore da loja mora em `catalog/model/taxonomy.ts`. Enquanto for assim, renomear uma categoria no painel não muda a vitrine. Quando o painel cuidar da árvore, ela vem da API (`GET /store/departments` com as categorias) mantendo os slugs, e a taxonomia vira essa leitura; o `generateStaticParams` passa a precisar de um slug no build (ou de um fallback local), porque a CI não tem API. |
| Sacola e avisos | A sacola não mostra contagem: ela vem do carrinho, num `<Suspense>` (lê cookie). Os avisos da faixa do topo são fixos em `features/store/announcements` até existir onde editá-los. |
| Tema escuro | Os tokens não definem tema escuro. O `.dark` do shadcn foi removido, e o `dark:` só vale com a classe `.dark`, que nada aplica. |
| Rotas do catálogo na API | O front já consome o contrato em `features/admin/products/data/api.ts` (schemas zod): `GET /admin/products`, `GET /admin/products/{id}`, `GET /admin/brands`, `GET /admin/categories`, `POST /admin/media` (URL pré-assinada) e `POST /admin/media/{id}/confirm`. Falta a API: as rotas com essas respostas e permissões (`products:read`, `products:write`), o CORS do bucket aceitando o `PUT` do domínio do painel e o domínio do CDN das fotos em `images.remotePatterns` do `next.config.ts` (sem ele, o `next/image` recusa a foto). O Next filtra e ordena a lista inteira; quando a API paginar, os parâmetros da URL vão para ela. |
| Seções vazias do painel | Pedidos, estoque, cupons e marcas e categorias são páginas vazias da prévia do sidebar (`components/admin/preview/section-preview.tsx`), com a permissão do Dashboard: saem quando cada seção entrar. |
| Animações | O design só deu nome e duração: o movimento de `pop`, `appear`, `marquee`, `shake` e `skeleton` no `globals.css` é provisório. |
| `cn` e tokens | O `cn` só conhece a escala padrão do Tailwind. Ele trata `text-body-sm` como cor e o descarta ao lado de `text-ink` na mesma chamada, e `h-field` não substitui o `h-8`. Até ensinar os tokens ao `cn` em build (`cn/next`; o `cn/config` monta as tabelas no browser e soma ~88 KB), não junte tamanho de texto com token e cor de texto num `cn`, e ajuste o visual dos componentes do `ui` no próprio arquivo, não por `className`. |
| Renovação da sessão | A API não tem `POST /auth/refresh`: a sessão dura o access token (60 min em dev). O refresh token já fica guardado, e a renovação entra no `proxy.ts` quando a rota existir. |
| Recuperação de senha | A API não tem o fluxo: o "Esqueci a senha" abre um e-mail para o suporte. |
| Área logada da loja | Só o painel tem área privada. O `authorizedHttp` volta ao login do painel; com a área do cliente, o login de destino passa a depender da área. |
| Botões de ícone | Os tamanhos `icon*` do `Button` ainda usam a escala padrão (`size-8`): o design não tem token de largura para controles. |
| Nome da conta | A API não guarda nome: a saudação do Dashboard mostra só o período ("Boa tarde"), e o avatar usa as iniciais do e-mail. Entra com o nome na tabela `accounts`, no cadastro e no `GET /me`. |
| Busca do painel | A paleta do ⌘K filtra só o que recebe (ações rápidas e pedidos recentes): a busca por pedido, produto e SKU chega com a API de busca. |
| Sidebar recolhida | O estado aberto/recolhido não sobrevive ao recarregar a página: o cookie do shadcn só seria lido no layout, o que a seção 4 proíbe. |
| ESLint 9 | Sem suporte oficial. Subir para o 10 quando os plugins do `eslint-config-next` aceitarem. |
