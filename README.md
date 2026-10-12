# Flashcards

PWA de flashcards com **revisão espaçada**, login com Google e sincronização entre dispositivos.
React + TypeScript + Vite, com Firebase (Auth + Firestore) como backend.

## Funcionalidades

- **Login com Google**: os cards ficam vinculados à conta e sincronizam em tempo real entre celular e web.
- **Offline**: funciona sem internet (cache do Firestore + service worker) e sincroniza ao reconectar.
- **Instalável (PWA)**: no celular, use "Adicionar à tela inicial".
- **Novo card**: título (frente), descrição (verso) e em quantos dias revisar (1, 3, 5, 7, 15, 30 ou 60).
- **Estudar**: mostra os cards vencidos. Toque para virar e escolha:
  - **Errei** → revisa amanhã · **Difícil** → mantém o intervalo · **Acertei** → próximo intervalo
  - ou qualquer intervalo manualmente
- **Meus cards**: buscar, editar, excluir ou antecipar a revisão.
- **Backup**: exportar/importar JSON pelo menu do avatar. Cards da versão antiga (localStorage) são oferecidos para importação no primeiro login.

## Configuração do Firebase (uma vez)

> Passo a passo detalhado, com deploy e checklist de aceite: [docs/GUIA-V1.md](docs/GUIA-V1.md).

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com) (plano Spark, gratuito).
2. **Authentication** → Sign-in method → ative **Google**.
3. **Authentication** → Settings → **Authorized domains** → adicione o domínio da Vercel (ex.: `meu-app.vercel.app`). `localhost` já vem liberado.
4. **Firestore Database** → criar banco (modo produção).
5. Publique as regras de segurança deste repo (`firestore.rules`): cole no console em Firestore → Rules, ou via CLI:
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project <project-id>
   ```
6. **Configurações do projeto** → Seus apps → **Web** → copie a config para `.env.local`:
   ```bash
   cp .env.example .env.local   # e preencha os valores
   ```

> As chaves `VITE_FIREBASE_*` são públicas por design (vão para o bundle). Quem protege os dados são as regras do Firestore: cada usuário só acessa `users/{seu uid}/cards`.

## Desenvolvimento

```bash
npm install
npm run dev          # http://localhost:5173
npm run build && npm run preview   # testar PWA/service worker
```

## Qualidade

| Comando | O que faz |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos do TypeScript |
| `npm test` | Testes unitários e de componentes (Vitest + Testing Library) |
| `npm run coverage` | Testes com relatório de cobertura |
| `npm run test:rules` | Testes das regras do Firestore no emulador (requer **Java 21**) |

O GitHub Actions (`.github/workflows/ci.yml`) roda tudo isso a cada push e pull request.

## Segurança

- **Dados por usuário**: `firestore.rules` só permite que cada conta acesse `users/{uid}/cards` e valida o esquema de cada card. Coberto por `tests/firestore.rules.test.ts`.
- **Headers HTTP** (`vercel.json`): CSP restrita aos domínios do Firebase/Google, `nosniff`, `Referrer-Policy`, `Permissions-Policy` e COOP compatível com o popup de login.
- **Logout** apaga o cache offline do aparelho.
- O `npm audit` aponta o `@grpc/grpc-js`, usado só pelo Firestore em Node (testes). Ele não entra no bundle do navegador.

## Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new) — o preset **Vite** é detectado automaticamente.
2. Em **Settings → Environment Variables**, cadastre as mesmas variáveis `VITE_FIREBASE_*` do `.env.local`.
3. Faça o deploy e adicione o domínio gerado nos **Authorized domains** do Firebase (passo 3 acima).

## Estrutura

```
src/
  lib/firebase.ts      inicialização do Firebase (Auth + Firestore com cache offline)
  lib/dates.ts         intervalos e cálculo de datas
  lib/storage.ts       import/export JSON e migração do localStorage
  hooks/useAuth.ts     login/logout com Google
  hooks/useCards.ts    CRUD + sincronização em tempo real dos cards
  components/          LoginScreen, Dashboard, StudySession, CardForm, CardList, UserMenu
tests/                 testes das regras do Firestore (emulador)
firestore.rules        regras de segurança (por usuário)
vercel.json            headers de segurança e cache
```
