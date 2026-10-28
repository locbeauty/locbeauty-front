# LocBeauty — Front-end

Interface web do **Sistema de Gestão LocBeauty**, que cuida da locação de equipamentos estéticos entre filiais: agenda de locações, clientes, equipamentos, funcionários, treinamentos, metas, rotas dos motoristas e dashboard de métricas

Este projeto consome a API do repositório [`locbeauty-fastify`](https://github.com/locbeauty/locbeauty-fastify). Ela precisa estar rodando para o front funcionar.

## Stack

- **Next.js 16** (App Router, com Turbopack em desenvolvimento) e **React 19**
- **TypeScript**
- **Tailwind CSS 4** e **shadcn/ui** (Radix UI, estilo `new-york`, ícones `lucide-react`)
- **TanStack Query**, para cache de requisições
- **React Hook Form** + **Zod**, para formulários e validação
- **Recharts**, para os gráficos do dashboard
- **date-fns**, **react-day-picker**, **sonner** (toasts), **next-themes** (tema claro/escuro) e **xlsx** (planilhas)
- **Google Maps JavaScript API**: autocomplete de endereços, mapa das rotas e geocodificação

## Pré-requisitos

- **Node.js 20.9 ou superior**, que é o mínimo exigido pelo Next.js 16
- **npm**
- A **API rodando**, por padrão em `http://localhost:3333` (veja o README do `locbeauty-fastify`)
- *(Opcional)* uma chave da **Google Maps Platform**

## Como rodar localmente

### 1. Instalar as dependências

```bash
npm install
```

### 2. Configurar as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3333
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

| Variável                          | Obrigatória | Descrição                                                                                       |
| --------------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SERVER_URL`          | **sim**     | URL base da API, **sem** `/api` e sem barra no final. O front acrescenta `/api/...` sozinho.    |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | não         | Chave do Google Maps. Sem ela, o resto do sistema funciona, mas o autocomplete de endereço na criação de agendamento e o mapa da tela de rotas não carregam. |

Na Google Cloud, a chave precisa ter habilitadas a **Maps JavaScript API**, a **Places API** e a **Geocoding API**.

> Variáveis `NEXT_PUBLIC_*` entram no bundle durante o build. Depois de alterar alguma, reinicie o `npm run dev` ou gere um novo build.

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse **http://localhost:3000**.

> O CORS da API só aceita as origens `http://localhost:3000` e `http://localhost:3001`. Se o front subir em outra porta, as requisições serão bloqueadas.

### 4. Fazer login

Com o banco populado pelo seed da API, entre com:

| Usuário          | Senha    | Cargo                       |
| ---------------- | -------- | --------------------------- |
| `adminloc`       | `123123` | Master (acesso total)       |
| `adminba`        | `123123` | Gerente — filial Bahia      |
| `comerciales`    | `123123` | Comercial — Espirito Santo  |
| `logisticateste` | `123123` | Logística — filial Bahia    |

Os usuários com cargos diferentes ajudam a testar como cada perfil enxerga o sistema.

## Scripts

| Script             | O que faz                                                      |
| ------------------ | -------------------------------------------------------------- |
| `npm run dev`      | Servidor de desenvolvimento com Turbopack (porta 3000).        |
| `npm run build`    | Build de produção.                                             |
| `npm start`        | Serve o build de produção (rode `npm run build` antes).        |
| `npm run lint:fix` | Roda o ESLint com correção automática em todo o projeto.       |

Para checar o lint sem corrigir nada, rode `npx eslint .`. O script `npm run lint` usa `next lint`, um comando que foi removido no Next.js 16.

## Telas

As telas ficam em `src/app/(main)/` e cada uma é protegida pelo módulo de permissão correspondente.

| Rota                               | Tela                                                                                 | Módulo       |
| ---------------------------------- | ------------------------------------------------------------------------------------ | ------------ |
| `/login`                           | Login                                                                                | —            |
| `/dashboard`                       | Dashboard, com as abas Visão geral, Clientes, Equipamentos, Localidades, Treinamentos e Detalhes | `DASHBOARD`  |
| `/customers`, `/customers/create`  | Clientes: listagem, filtros, cadastro, endereços, histórico e importação por planilha | `CUSTOMERS`  |
| `/gears`, `/gears/create`          | Equipamentos                                                                         | `GEARS`      |
| `/filials`, `/filials/create`      | Filiais                                                                              | `FILIALS`    |
| `/employees`, `/employees/create`  | Funcionários e gestão de acessos                                                     | `EMPLOYEES`  |
| `/schedule`                        | Agenda: calendário em visão de dia, semana ou mês, com avisos da filial              | `CALENDAR`   |
| `/bookings`, `/bookings/create`    | Agendamentos: tabela, criação, pagamentos e importação por planilha                  | `BOOKINGS`   |
| `/routes`, `/routes/[routeId]`     | Rotas dos motoristas, com mapa e confirmação de entrega e recolhimento               | `ROUTES`     |
| `/goals`                           | Metas de faturamento e de locações por equipamento                                   | `GOALS`      |
| `/trainings`                       | Treinamentos: turmas, alunos, pacientes modelo e pagamentos                          | `TRAININGS`  |
| `/birthdays`                       | Aniversariantes (clientes e funcionários)                                            | `BIRTHDAYS`  |
| `/notices`                         | Avisos                                                                               | `NOTICES`    |
| `/audit`                           | Auditoria de importações, acessível pelo menu do usuário                             | `AUDITORIA`  |
| `/city-distances`                  | Custos de logística (distâncias por cidade). Não aparece no menu; é aberta pela URL  | —            |
| `/profile`                         | Perfil do usuário logado                                                             | —            |

Na barra lateral, o item **Rotas** só aparece para os cargos Master, Gerente, Motorista, Motorista Chefe e Logística.

## Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx            # Layout raiz (fontes, ThemeProvider)
│   ├── page.tsx              # Redireciona para a primeira tela que o usuário pode ver
│   ├── login/                # Tela de login
│   ├── (main)/               # Área autenticada
│   │   ├── layout.tsx        # AuthProvider + AccessProvider + React Query
│   │   ├── page.tsx          # Casca com Sidebar, Header e Toaster
│   │   └── <módulo>/         # Uma pasta por tela (ver tabela acima)
│   └── api/                  # Route handlers legados (login/logout/me), não usados pelo fluxo atual
├── components/
│   ├── ui/                   # Componentes do shadcn/ui e o header da aplicação
│   ├── shared/               # Componentes reutilizáveis (Sidebar, inputs de CPF/CEP/telefone/preço, selects...)
│   ├── auth/                 # RouteGuard e Can (controle de acesso na interface)
│   └── pages/<módulo>/       # Componentes específicos de cada tela
├── contexts/                 # auth-provider, access-provider, theme-provider
├── services/                 # Chamadas à API, um arquivo por domínio
├── hooks/                    # Hooks reutilizáveis (filtros da agenda, filial do dashboard, etc.)
├── lib/
│   ├── api.ts                # apiRequest: wrapper do fetch com token e query params
│   ├── utils.ts              # cn() e utilitários do shadcn
│   └── zod/                  # Schemas de validação dos formulários
└── utils/                    # Formatação (centavos, telefone, datas), constantes, cargos
    └── @types/               # Tipos das entidades da API
```

## Autenticação e permissões

### Fluxo de login

1. A tela de login chama `POST {NEXT_PUBLIC_SERVER_URL}/api/signin` e guarda o JWT no `localStorage` com a chave `accessToken`.
2. Todas as chamadas à API enviam `Authorization: Bearer <token>`. Isso é feito por `apiRequest` (`src/lib/api.ts`), usado pelos services, ou por `fetchWithToken` (`src/utils/fetchWithToken.ts`).
3. O `AuthProvider` busca o usuário em `/api/me`. Se não houver token, ou se o token for inválido, ele redireciona para `/login`. Uma resposta **403** da API também limpa o token e volta para o login.
4. Depois do login, o usuário vai para a primeira tela que tem permissão para ver. Motorista, Motorista Chefe, Comercial e Logística começam sempre na **Agenda** (`/schedule`).

### Controle de acesso

- O `AccessProvider` carrega os acessos do funcionário em `/api/access/:employeeId`. São permissões por **filial × módulo** (`canView`, `canCreate`, `canEdit`).
- `useAccess().can(módulo, ação, filialId?)` responde se o usuário pode executar a ação. Os cargos **Master** e **ADMIN** sempre podem.
- A **Sidebar** só mostra os módulos em que o usuário tem `canView`.
- O `<RouteGuard module={...}>` protege as páginas e redireciona quem não tem acesso. O `<Can module={...} action={...}>` esconde botões e ações.
- Essas checagens só controlam a interface. A regra que vale é a do back-end, que valida as permissões em cada requisição.

Os cargos existentes são `Master`, `Gerente`, `Comercial`, `Financeiro`, `Logistica`, `Motorista` e `Motorista Chefe`. Os acessos padrão de cada cargo estão descritos no README da API.

## Convenções

- **Chamadas à API:** crie ou estenda um arquivo em `src/services/` usando `apiRequest`, em vez de chamar `fetch` direto no componente.
- **Tipos** das entidades ficam em `src/utils/@types/`, e **schemas Zod** de formulário em `src/lib/zod/`.
- **Valores monetários** chegam da API em **centavos**. Use os utilitários de `src/utils` (`centsToString`, `parseStringToCents`) para converter.
- **Componentes de UI** novos do shadcn são adicionados com `npx shadcn@latest add <componente>`. A configuração fica em `components.json`.
- Alias de import: `@/*` aponta para `src/*`.

## Deploy

A produção roda no **Railway** (`https://locbeauty-front.up.railway.app`).

- Defina `NEXT_PUBLIC_SERVER_URL` (e, se for usar, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) **antes** do build, porque essas variáveis entram no bundle nessa etapa.
- Comandos: `npm run build` e depois `npm start`.
- Se o front mudar de domínio, adicione a nova URL à lista de origens do CORS em `src/app.ts`, na API.
