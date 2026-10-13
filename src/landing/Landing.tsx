import type { CSSProperties } from 'react'
import { INTERVALS } from '../lib/dates'
import { DemoDeck } from './DemoDeck'

const APP_URL = '/'
const REPO_URL = 'https://github.com/AndrelhVieira/flashcards'

const FREE_POINTS = ['Sem anúncios', 'Sem assinatura', 'Sem paywall', 'Sem rastreadores']

const BENEFITS = [
  {
    title: 'Grátis de verdade',
    text: 'Todos os recursos liberados para todo mundo. Não existe versão “pro” nem limite escondido.',
  },
  {
    title: 'Celular e computador em sincronia',
    text: 'Entre com sua conta Google e os cards aparecem em tempo real em qualquer aparelho.',
  },
  {
    title: 'Funciona offline',
    text: 'Estude no metrô ou no avião. As alterações sincronizam sozinhas quando a internet voltar.',
  },
  {
    title: 'Instala como app',
    text: 'É um PWA: “Adicionar à tela inicial” e ele abre em tela cheia, como um app nativo, sem loja.',
  },
  {
    title: 'Categorias e estudo focado',
    text: 'Organize os cards em quantas categorias quiser e revise só o que importa para a prova de amanhã.',
  },
  {
    title: 'Seus dados são seus',
    text: 'Exporte e importe tudo em JSON a qualquer momento. Nada de ficar preso à ferramenta.',
  },
  {
    title: 'Privacidade por padrão',
    text: 'Cada conta só enxerga os próprios cards, não há analytics e sair da conta apaga o cache do aparelho.',
  },
  {
    title: 'Simples de usar',
    text: 'Frente, verso e quando revisar. Sem algoritmo misterioso: você sempre sabe quando o card volta.',
  },
  {
    title: 'Leve e rápido',
    text: 'Só duas dependências em produção (React e Firebase) e tema claro ou escuro seguindo o sistema.',
  },
]

const SPECS: [string, string][] = [
  ['Interface', 'React 19 + TypeScript (strict) + Vite'],
  ['Backend', 'Firebase Auth (Google) + Firestore com cache offline persistente'],
  ['Segurança dos dados', 'Regras do Firestore por usuário, com validação de esquema e testes no emulador'],
  ['Segurança HTTP', 'CSP restrita, nosniff, Referrer-Policy, Permissions-Policy e COOP'],
  ['Qualidade', 'Testes de componentes, hooks e regras com Vitest e Testing Library'],
  ['Entrega', 'CI no GitHub Actions (lint, tipos, testes, build) e deploy contínuo na Vercel'],
  ['Custo de infraestrutura', 'R$ 0 — Firebase Spark e Vercel Hobby'],
]

export function Landing() {
  return (
    <>
      <header className="nav">
        <a href="#topo" className="nav__brand">
          <img src="/icon.svg" alt="" width={28} height={28} />
          Flashcards
        </a>
        <nav className="nav__links" aria-label="Seções">
          <a href="#como-funciona">Como funciona</a>
          <a href="#vantagens">Vantagens</a>
          <a href="#por-dentro">Por dentro</a>
        </nav>
        <a href={APP_URL} className="button button--small">
          Abrir o app
        </a>
      </header>

      <main id="topo">
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">Revisão espaçada · 100% gratuito</p>
            <h1>
              Lembre do que estudou. <em>Sem pagar nada por isso.</em>
            </h1>
            <p className="hero__lead">
              Um app de flashcards direto ao ponto: você escreve o card, ele avisa quando revisar. Sem anúncios,
              sem assinatura e sem pegadinhas.
            </p>
            <div className="hero__ctas">
              <a href={APP_URL} className="button">
                Começar agora
              </a>
              <a href="#como-funciona" className="button button--ghost">
                Ver como funciona
              </a>
            </div>
          </div>
          <DemoDeck />
        </section>

        <ul className="free-strip" aria-label="O que você não vai encontrar aqui">
          {FREE_POINTS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <section id="como-funciona" className="section how">
          <h2 className="section__title">Como funciona</h2>
          <ol className="steps">
            <li>
              <h3>Crie o card</h3>
              <p>Escreva a pergunta na frente, a resposta no verso e escolha em quantos dias quer revisar.</p>
            </li>
            <li>
              <h3>Estude o que venceu</h3>
              <p>A aba Estudar mostra só os cards do dia. Toque para virar e confira se lembrou.</p>
            </li>
            <li>
              <h3>Responda com sinceridade</h3>
              <p>
                <strong>Errei</strong> volta amanhã, <strong>Difícil</strong> mantém o intervalo e{' '}
                <strong>Acertei</strong> sobe um degrau na escada:
              </p>
            </li>
          </ol>
          <ol className="ladder" aria-label="Intervalos de revisão em dias">
            {INTERVALS.map((days, i) => (
              <li key={days} style={{ '--step': i } as CSSProperties}>
                <span className="ladder__days">{days}</span>
                <span className="ladder__unit">{days === 1 ? 'dia' : 'dias'}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="vantagens" className="section">
          <h2 className="section__title">Por que usar</h2>
          <ul className="benefits">
            {BENEFITS.map((b, i) => (
              <li key={b.title}>
                <span className="benefits__num" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="por-dentro" className="section inside">
          <div className="inside__intro">
            <h2 className="section__title">Por dentro</h2>
            <p>
              Projeto pessoal construído com o mesmo cuidado de um produto: testes, revisão de segurança,
              integração contínua e custo zero para manter no ar.
            </p>
            <a href={REPO_URL} className="link" target="_blank" rel="noreferrer">
              Código no GitHub →
            </a>
          </div>
          <dl className="specs">
            {SPECS.map(([term, desc]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="closing">
          <h2>Seu próximo card leva dez segundos.</h2>
          <a href={APP_URL} className="button button--light">
            Entrar com Google
          </a>
        </section>
      </main>

      <footer className="footer">
        <span>Flashcards · projeto pessoal de André Vieira</span>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </footer>
    </>
  )
}
