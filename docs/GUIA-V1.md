# Guia para finalizar a v1

Passo a passo completo, do código local até o app instalado no celular.
Tempo estimado: **30–45 minutos**. Marque cada item conforme avança.

---

## 0. Pré-requisitos

- [ ] Node.js 20+ instalado (`node -v`)
- [ ] Conta Google (será usada no Firebase e para entrar no app)
- [ ] Conta na [Vercel](https://vercel.com) conectada ao GitHub (`AndrelhVieira`)
- [ ] Repositório atualizado no GitHub:
  ```bash
  git push origin main
  ```

---

## 1. Criar o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) → **Criar um projeto**.
2. Nome: `flashcards` (o ID gerado, ex.: `flashcards-a1b2c`, será o **project-id**; anote).
3. **Google Analytics**: pode desativar (não é usado).
4. Aguarde a criação → **Continuar**.

> O plano gratuito (**Spark**) é suficiente. Não é preciso cadastrar cartão.

---

## 2. Registrar o app Web e obter as credenciais

1. Na página inicial do projeto, clique no ícone **`</>`** (Web).
2. Apelido: `flashcards-web`. **Não** marque "Firebase Hosting" (o deploy será na Vercel).
3. **Registrar app**. Será exibido um objeto `firebaseConfig` parecido com:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "flashcards-a1b2c.firebaseapp.com",
     projectId: "flashcards-a1b2c",
     storageBucket: "flashcards-a1b2c.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123"
   };
   ```
4. Guarde esses valores (dá para revê-los depois em ⚙️ **Configurações do projeto → Geral → Seus apps**).
5. Pule as etapas de instalação do SDK (já está no projeto) → **Continuar no console**.

---

## 3. Ativar o login com Google

1. Menu lateral → **Criação → Authentication** → **Vamos começar**.
2. Aba **Método de login** → **Google** → **Ativar**.
3. **Nome público do projeto**: `Flashcards` (é o nome que aparece na tela de escolha de conta do Google).
4. **E-mail de suporte**: seu e-mail → **Salvar**.

---

## 4. Criar o banco Firestore

1. Menu lateral → **Criação → Firestore Database** → **Criar banco de dados**.
2. **Edição**: Standard. **ID do banco**: `(default)`.
3. **Local**: `southamerica-east1 (São Paulo)` — menor latência no Brasil.
   ⚠️ Não é possível mudar depois.
4. **Modo**: **produção** (bloqueia tudo até publicarmos nossas regras).
5. **Criar**.

---

## 5. Publicar as regras de segurança

As regras do arquivo [`firestore.rules`](../firestore.rules) garantem que cada usuário só lê e grava os próprios cards.

**Opção A — pelo console (mais simples):**

1. Firestore Database → aba **Regras**.
2. Apague o conteúdo e cole o conteúdo inteiro de `firestore.rules`.
3. **Publicar**.

**Opção B — pela CLI:**

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project <project-id>
```

---

## 6. Configurar e testar localmente

1. Crie o arquivo de ambiente:
   ```bash
   cp .env.example .env.local
   ```
2. Preencha com os valores do passo 2:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=flashcards-a1b2c.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=flashcards-a1b2c
   VITE_FIREBASE_STORAGE_BUCKET=flashcards-a1b2c.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
   ```
   `.env.local` está no `.gitignore` e **não** vai para o GitHub.
3. Reinicie o servidor (variáveis só são lidas na inicialização):
   ```bash
   npm run dev
   ```
4. Abra http://localhost:5173 e valide:
   - [ ] **Entrar com Google** na landing abre o popup e leva ao app em `/app/` (e não a "Configuração pendente")
   - [ ] O app mostra seu avatar no canto superior direito
   - [ ] Sem sessão (aba anônima), abrir `/app/` volta para a landing
   - [ ] Criar um card → ele aparece em **Meus cards**
   - [ ] No console Firebase → Firestore → **Dados**, existe `users/<seu-uid>/cards/<id>`
   - [ ] Abrir o app em outra aba: o card criado aparece lá também (sincronização)
   - [ ] Se você tinha cards da versão sem login, aparece o aviso para importá-los

---

## 7. Publicar na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new) → **Import** no repositório `AndrelhVieira/flashcards`.
2. **Framework Preset**: Vite (detectado automaticamente). Build `npm run build`, Output `dist` — não altere.
3. Expanda **Environment Variables** e cadastre as **6 variáveis** `VITE_FIREBASE_*` com os mesmos valores do `.env.local`.
   Dica: dá para colar o conteúdo inteiro do `.env.local` no primeiro campo que a Vercel separa automaticamente.
4. **Deploy**. Ao final, anote o domínio de produção (ex.: `flashcards-andre.vercel.app`).
   - Para escolher um nome melhor: Project → **Settings → Domains** → edite o domínio `*.vercel.app`.

---

## 8. Autorizar o domínio da Vercel no Firebase

Sem este passo o login falha com `auth/unauthorized-domain`.

1. Firebase → Authentication → **Configurações** → **Domínios autorizados** → **Adicionar domínio**.
2. Adicione o domínio de produção, **sem** `https://` (ex.: `flashcards-andre.vercel.app`).
3. Acesse o site publicado e repita os testes do passo 6.

> **Deploys de preview** da Vercel têm URLs diferentes a cada push (`flashcards-git-xyz...vercel.app`) e o Firebase não aceita curingas. Para a v1, teste login apenas no domínio de produção; se precisar em preview, adicione aquela URL específica.

---

## 9. Instalar no celular (PWA)

**Android (Chrome):**
1. Abra o domínio de produção no Chrome.
2. Menu ⋮ → **Instalar app** (ou aceite o banner "Adicionar à tela inicial").

**iPhone (Safari — obrigatório usar o Safari):**
1. Abra o domínio de produção no Safari.
2. Botão **Compartilhar** → **Adicionar à Tela de Início** → **Adicionar**.
3. Abra pelo ícone e faça login (o app instalado tem sessão própria, separada do Safari).

Validação no celular:
- [ ] Ícone correto na tela inicial e o app abre em tela cheia (sem barra do navegador)
- [ ] Login funciona
- [ ] Cards criados no computador aparecem no celular (e vice-versa)
- [ ] Modo avião: o app abre, permite revisar, mostra o selo **Offline**; ao reconectar, as mudanças chegam no outro dispositivo

---

## 10. Checklist de aceite da v1

- [ ] Login/logout com Google na web e no celular
- [ ] Criar, editar, buscar e excluir cards
- [ ] Escolher o intervalo de revisão ao criar (1, 3, 5, 7, 15, 30, 60 dias)
- [ ] Sessão de estudo mostra apenas os cards vencidos, com Errei/Difícil/Acertei
- [ ] Sincronização entre dispositivos
- [ ] Funciona offline
- [ ] Instalado como app no celular, sem problemas de layout
- [ ] Exportar backup gera o arquivo JSON; importar restaura os cards
- [ ] Um segundo usuário (outra conta Google) **não** vê os seus cards

Concluído? Crie a tag da versão:

```bash
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

---

## 11. v1.1 — Categorias

### Ordem do deploy

1. [ ] CI do PR verde, **incluindo o job das regras** (`test:rules`)
2. [ ] Publicar as regras **antes** do merge (o app novo grava `categoryIds` em todo card e falha com as regras antigas; as novas aceitam o app atual):
   ```bash
   npx firebase-tools deploy --only firestore:rules --project flashcards-d4ad8
   ```
3. [ ] Merge na `main` (a Vercel publica sozinha)
4. [ ] Tag da versão:
   ```bash
   git tag -a v1.1.0 -m "v1.1.0"
   git push origin v1.1.0
   ```

### Checklist de aceite

- [ ] Cards criados antes da v1.1 continuam aparecendo, editáveis e revisáveis
- [ ] Criar, renomear e excluir categorias em **Meus cards → Categorias**
- [ ] Nome repetido é recusado (inclusive com maiúsculas/acentos diferentes)
- [ ] Ao criar/editar um card, marcar uma ou mais categorias; elas aparecem no card da lista
- [ ] Filtro por categoria na lista de cards
- [ ] Excluir uma categoria a remove dos cards, sem excluir os cards
- [ ] **Estudar**: filtro mostra os vencidos de cada categoria; selecionar várias revisa os vencidos de qualquer uma delas; o contador da aba continua com o total
- [ ] Quando as categorias escolhidas acabam, o botão **Revisar todas as categorias** volta para a revisão completa
- [ ] A seleção do estudo é lembrada ao recarregar o app
- [ ] Categorias sincronizam entre dispositivos e funcionam offline
- [ ] Exportar backup inclui as categorias; importar restaura cards e categorias com os vínculos
- [ ] Importar um backup antigo (só cards) continua funcionando
- [ ] Layout do painel e dos filtros ok no celular

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| Tela "Configuração pendente" | Variáveis `VITE_FIREBASE_*` ausentes | Local: conferir `.env.local` e reiniciar `npm run dev`. Vercel: conferir as env vars e fazer **Redeploy** |
| Erro `auth/unauthorized-domain` | Domínio não autorizado | Passo 8 |
| "Não foi possível entrar com o Google" | Popup bloqueado ou Google desativado | Liberar popups para o site; conferir o passo 3 |
| "Não foi possível carregar seus cards" | Regras não publicadas ou banco não criado | Passos 4 e 5; ver erro `permission-denied` no console do navegador |
| "Não foi possível salvar uma alteração" ao criar card/categoria (após a v1.1) | Regras antigas ainda publicadas | Publicar as regras (seção 11, passo 2) |
| Versão nova não aparece no app instalado | Service worker ainda com a versão antiga | Fechar e reabrir o app (atualiza automaticamente); em último caso, reinstalar |
| Nome estranho (`project-123...`) na tela do Google | Nome público não definido | Passo 3, item 3 |

---

## Pós-v1 (opcional)

- Domínio próprio na Vercel (Settings → Domains) — lembre de autorizá-lo no Firebase
- Alertas de orçamento no Google Cloud, por precaução (o plano Spark não cobra, mas é bom ter)
- Ideias de evolução: estatísticas de estudo, lembrete diário via notificação, suporte a imagens/Markdown nos cards
