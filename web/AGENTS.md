# AGENTS.md — Regras do `web/`

> Regras do frontend para pessoas e agentes de IA. Complementam o [AGENTS.md da raiz](../AGENTS.md), que continua valendo aqui (Git, commits, PRs, versionamento e regras para agentes de IA). **OBRIGATÓRIO**/**PROIBIDO** não admitem exceção. 🔒 = imposto por ferramenta (`tsc`, ESLint ou CI). Quem muda uma regra atualiza este arquivo no mesmo commit.

## Este não é o Next.js que você conhece

O Next 16 tem breaking changes: APIs, convenções e estrutura de arquivos podem diferir do seu treinamento. OBRIGATÓRIO ler o guia do assunto em `node_modules/next/dist/docs/` (a documentação da versão instalada) antes de escrever código, e respeitar os avisos de depreciação.

- Stack: Next 16 (App Router, Turbopack, Cache Components, React Compiler), React 19, TypeScript strict, Tailwind v4, shadcn/ui sobre Base UI, zod e Vitest. Deploy na Vercel (seção 12).
- Previstos, ainda não instalados (ver [Pendências](#pendências-conhecidas-remova-a-linha-ao-resolver)): nuqs, react-hook-form e Playwright. A regra que depende de um deles vale a partir da instalação.

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
- Fora da pasta atual, importe pelo alias `@/` 🔒: `../` é proibido.
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
│   ├── ui/ · common/ · layout/  ← das duas áreas
│   └── store/ · admin/          ← de uma área só
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
    - previsto: o painel logado, com a sidebar no layout do sub-grupo.
  - `(store)`: a loja, dividida em sub-grupos por tipo de layout e de cache, cada um com seu `layout`, `loading` e `error`. Sub-grupo não muda a URL.
- Sub-grupos da loja:
  - `(auth)`: entrar e cadastro, com layout enxuto;
  - `(account)`: área do cliente, dinâmica;
  - previstos: `(shop)`, a vitrine cacheada, e `(checkout)`, a sacola e o checkout sem a navegação da loja.
- O `(store)` não tem layout próprio. Layout aninhado não se desliga, então um header no `(store)` apareceria também no `(auth)` e no `(checkout)`. O header da loja entra no layout de cada sub-grupo que o mostra.
- URLs em pt-BR (`/produtos`, `/sacola`): o nome da pasta da rota vira texto que o cliente vê e que o Google indexa. É a única exceção à regra de pastas em inglês.
- PROIBIDO componente solto e pasta `_components`. Página é composição, não implementação.

### Isolamento entre áreas e features

- PROIBIDO 🔒 uma área importar a outra. A rota e o código da loja não importam nada de `features/admin` nem de `components/admin`, e vice-versa.
- PROIBIDO 🔒 feature importar feature, mesmo dentro da área. O que duas features usam sobe de camada:
  - o visual vai para `components/<área>` (só uma área usa) ou `components/common` (as duas usam), recebendo tudo por props;
  - a lógica vai para `lib`;
  - a feature usada pelas duas áreas vai para `features/shared`.
- Exceção única: `features/shared/auth/session/` (ler e validar a sessão no servidor) pode ser importado por qualquer feature.
- Feature da `shared` não usa `components/store` nem `components/admin`: ela serve às duas áreas.

### Anatomia de uma feature

Arquivos agrupados em pastas por assunto, nunca soltos na raiz da feature 🔒. Pastas criadas sob demanda.

```text
features/<área>/<feature>/
├── data/        api.ts · queries.ts · actions.ts                         ← I/O
├── model/       types.ts · schema.ts · compute.ts · search-params.ts     ← regra pura
├── containers/  *.tsx                                                    ← lógica: busca e decide
├── hooks/       use-*.ts                                                 ← lógica de client
├── components/  *.tsx                                                    ← UI: só props
└── session/     session.ts · guard.ts                                    ← só em shared/auth
```

- `data/`: todo o I/O. `api.ts` é o transporte HTTP (sobre o `lib/http.ts`), `queries.ts` a leitura e `actions.ts` (`'use server'`) a escrita.
- `model/`: tipos e regra pura, sem I/O, com os testes co-localizados.
- `containers/`, `hooks/` e `components/`: o padrão Container & Presentational, descrito abaixo.

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

Imposto pelo `eslint-plugin-boundaries` 🔒. "Da feature" quer dizer da mesma área e da mesma feature, e "compartilhados" são `ui`, `common`, `layout`, `hooks`, `lib`, `config` e `styles`.

| De | Pode importar |
| :--- | :--- |
| Raiz do `app/` | compartilhados e `shared/auth/session` |
| `app/(store)` e `app/(admin)` | `containers`, `components`, `data` e `model` das features da própria área e da `shared`; `components/<própria área>`; `shared/auth/session` e compartilhados |
| `proxy.ts` | `shared/auth/session`, `lib` e `config` |
| `containers/` | da feature: `data`, `model`, `components`, `hooks` e `containers`; `components/<própria área>`; `shared/auth/session` e compartilhados |
| `components/` da feature | da feature: `components` e `model`; `components/<própria área>`, `ui`, `common`, `layout`, `hooks`, `lib` e `styles` |
| `hooks/` da feature | da feature: `hooks`, `model` e `data/actions.ts`; `hooks` e `lib` |
| `data/` | da feature: `data` e `model`; `shared/auth/session`, `lib` e `config` |
| `model/` | da feature: `model`; `lib` |
| `shared/auth/session/` | `data` e `model` do auth; `lib` e `config` |
| `components/ui` | `components/ui`, `hooks`, `lib` e `styles` |
| `components/common`, `layout`, `store` e `admin` | `ui`, `common`, `layout`, `hooks`, `lib` e `styles`, e nunca a outra área |
| `hooks/` · `lib/` · `config/` · `styles/` | `hooks` → `lib`; `lib` → `config`; `config` → só `config`; `styles` → só `styles` |

### Camadas compartilhadas

- `components/ui/`: só o que o shadcn gera. O lint de tokens é mais brando aqui (seção 8).
- `components/common/`: nossos componentes de apresentação sem domínio (`MessageScreen`, `RouteError`, `PageSkeleton`), com o lint de tokens inteiro.
- `components/layout/`: primitivos de composição de página (`Screen`, `Section`).
- `components/store/` e `components/admin/`: apresentação de uma área só, como o header e o footer da loja ou a sidebar e a tabela de dados do painel.
- `hooks/`: hooks de client sem domínio (é o alias `hooks` do `components.json`).
- `lib/`: utilitários sem domínio (`cn`, `http`, formatadores).
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
- PROIBIDO ler cookie ou sessão no topo de um `layout.tsx`: o `await` segura o segmento inteiro, inclusive o `children`, atrás da requisição.

### Cache

- `'use cache'`, `cacheTag()` e `cacheLife()` vivem **só** em `data/queries.ts`. PROIBIDO em componente.
- Cacheado, com tag: conteúdo público, igual para qualquer visitante.
- Sempre dinâmico: o que depende de quem está acessando (sessão, cookie, header). O `'use cache'` não lê `cookies()`: a chamada lança erro.
- Tags: `<recurso>:<id>` para um item e um nome curto para a lista ou página (ex: `product:{id}`, `catalog`, `home`).
- Toda action que muda dado cacheado invalida as tags afetadas, com `revalidateTag(tag, 'max')` ou com `updateTag(tag)` quando quem mudou precisa ver na hora (o `updateTag` só funciona em Server Action). O perfil do `revalidateTag` é obrigatório: a forma com um argumento está depreciada.
- Dado que pode mudar fora do Next fica dinâmico ou com `cacheLife` curto, porque nenhuma action vai invalidá-lo.
- Na Vercel, cada instância serverless tem a própria memória. O `'use cache'` comum só rende no que entra no shell estático (pré-renderizado no build). Dado cacheado lido em runtime, como uma página com parâmetro dinâmico, usa `'use cache: remote'`, compartilhado entre as instâncias.

### Server Actions

Server Action é endpoint público. Toda action:

1. Valida a entrada com o schema zod de `model/schema.ts`.
2. Confere de novo a sessão e se o usuário pode executar a ação, mesmo que o proxy já tenha barrado.
3. Devolve resultado tipado. PROIBIDO `throw` para erro de negócio:

   ```ts
   type ActionResult<T> =
     | { ok: true; data: T }
     | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
   ```

4. É consumida no client com `useActionState`.

- `redirect()` e `notFound()` funcionam lançando uma exceção: chame-os fora de `try/catch`.

## 5. Estado na URL

- Filtros, ordenação, busca e paginação de listagem ficam na URL, via `nuqs`.
- Os parsers ficam em `model/search-params.ts` da feature e são reutilizados no servidor (`createSearchParamsCache`) e no client.
- PROIBIDO `useSearchParams` manual para estado de filtro.

## 6. Proteção de rota (`proxy.ts`)

- `src/proxy.ts` é convenção do Next (substitui o `middleware.ts`): fica na raiz de `src/`, ao lado de `app/`. Movido dali, ele para de rodar sem aviso. Um só por projeto.
- A lógica não mora nele: ele importa `features/shared/auth/session/guard.ts` e exporta o `matcher`.
- Se o painel ganhar um subdomínio próprio (`admin.…`), quem roteia pelo host é o `proxy.ts`, sem virar outro app.
- O proxy faz só o redirect otimista (sem sessão → login). A checagem real fica perto do dado, em cada `queries.ts` e `actions.ts` protegido.

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
- Fonte pelo `next/font`, em `src/styles/fonts.ts`, numa variável própria (`--font-archivo`) que o token `--font-sans` lê.
- O `globals.css` desliga as animações com `prefers-reduced-motion`. Movimento infinito (`animate-marquee`) também precisa de um jeito de pausar.

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
- TypeScript 🔒: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns` e `noFallthroughCasesInSwitch`. O `typecheck` roda `next typegen` antes do `tsc`, porque tipos como `LayoutProps` são gerados pelo Next.
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
| Dependências | nuqs, react-hook-form e Playwright aguardam aprovação. |
| Monitoramento | Não há captura de erro nem de Web Vitals no browser: o `RouteError` não reporta nada. Os erros de servidor aparecem nos logs da Vercel. |
| CSP | Só o `frame-ancestors` por enquanto. A política completa entra junto com o primeiro script de terceiro (pagamento, analytics). |
| Home | Não há página em `/`, que responde 404 até a loja entrar. A descrição da metadata é provisória. Os links para `/` usam `'/' as Route`, porque o `typedRoutes` só aceita rota com página: tirar o cast quando a home entrar. |
| Tema escuro | Os tokens não definem tema escuro. O `.dark` do shadcn foi removido, e o `dark:` só vale com a classe `.dark`, que nada aplica. |
| Animações | O design só deu nome e duração: o movimento de `pop`, `appear`, `marquee`, `shake` e `skeleton` no `globals.css` é provisório. |
| `cn` e tokens | O `cn` só conhece a escala padrão do Tailwind. Ele trata `text-body-sm` como cor e o descarta ao lado de `text-ink` na mesma chamada, e `h-field` não substitui o `h-8`. Até ensinar os tokens ao `cn` em build (`cn/next`; o `cn/config` monta as tabelas no browser e soma ~88 KB), não junte tamanho de texto com token e cor de texto num `cn`, e ajuste o visual dos componentes do `ui` no próprio arquivo, não por `className`. |
| Login do painel | A tela está pronta, mas o formulário ainda não tem a Server Action (o `method="post"` só evita a senha na URL). O "Esqueci a senha" abre um e-mail para o suporte até a API ter a recuperação de senha. |
| Botões de ícone | Os tamanhos `icon*` do `Button` ainda usam a escala padrão (`size-8`): o design não tem token de largura para controles. |
| ESLint 9 | Sem suporte oficial. Subir para o 10 quando os plugins do `eslint-config-next` aceitarem. |
