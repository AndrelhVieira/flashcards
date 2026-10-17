import type { CSSProperties } from 'react'
import { INTERVALS } from '../lib/dates'
import { DemoDeck } from './DemoDeck'

const APP_URL = '/app/'

const FREE_POINTS = ['Sem anúncios', 'Sem assinatura', 'Sem plano pago', 'Sem rastreamento']

const BENEFITS = [
  {
    title: 'Grátis de verdade',
    text: 'Todos os recursos liberados para todo mundo. Não existe versão “pro” nem limite escondido.',
  },
  {
    title: 'Celular e computador em sincronia',
    text: 'Entre com sua conta Google e os cards aparecem na hora em qualquer aparelho.',
  },
  {
    title: 'Funciona offline',
    text: 'Estude no metrô ou no avião. O que você fizer sem internet é sincronizado sozinho quando ela voltar.',
  },
  {
    title: 'Instala como app',
    text: 'Toque em “Adicionar à tela inicial” e ele abre em tela cheia, como qualquer app, sem passar por loja.',
  },
  {
    title: 'Categorias e estudo focado',
    text: 'Organize os cards em quantas categorias quiser e revise só o que importa para a prova de amanhã.',
  },
  {
    title: 'Seus cards são seus',
    text: 'Faça uma cópia de tudo quando quiser e restaure depois. Nada de ficar preso ao app.',
  },
  {
    title: 'Privacidade por padrão',
    text: 'Ninguém além de você vê seus cards, nada é rastreado e, ao sair da conta, o aparelho não guarda nada.',
  },
  {
    title: 'Simples de usar',
    text: 'Frente, verso e quando revisar. Sem fórmula misteriosa: você sempre sabe quando o card volta.',
  },
  {
    title: 'Leve e rápido',
    text: 'Abre em instantes, até em celular simples, e acompanha o tema claro ou escuro do seu aparelho.',
  },
]

const FEATURES: [string, string][] = [
  ['Estudar', 'Só os cards que venceram hoje, um por vez. Vire, confira e diga como foi.'],
  ['Meus cards', 'Busque qualquer card, filtre por categoria, edite ou exclua em poucos toques.'],
  ['Revisar antes', 'Tem prova chegando? Antecipe a revisão de um card sem esperar o dia dele.'],
  ['Intervalo do seu jeito', 'Use a escada de 1 a 60 dias ou escolha você mesmo quando o card volta.'],
  ['Categorias', 'Crie as suas, coloque um card em várias e estude uma ou mais de uma vez.'],
  ['Cópia de segurança', 'Baixe todos os seus cards e categorias em um arquivo e restaure quando quiser.'],
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
          <a href="#recursos">Recursos</a>
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

        <section id="recursos" className="section inside">
          <div className="inside__intro">
            <h2 className="section__title">Tudo o que vem dentro</h2>
            <p>
              Nada de recurso bloqueado: assim que você entra, já tem tudo isto para organizar e acompanhar seus
              estudos.
            </p>
          </div>
          <dl className="specs">
            {FEATURES.map(([term, desc]) => (
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
      </footer>
    </>
  )
}
