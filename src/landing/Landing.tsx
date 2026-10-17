import { useEffect, type CSSProperties } from 'react'
import { useI18n } from '../i18n/context'
import { LanguageSwitch } from '../i18n/LanguageSwitch'
import { INTERVALS } from '../lib/dates'
import { DemoDeck } from './DemoDeck'
import { useSession } from './useSession'

const PORTFOLIO_URL = 'https://www.andreluizv.dev.br'

export function Landing() {
  const { signedIn, error, enter } = useSession()
  const { t } = useI18n()
  const l = t.landing

  useEffect(() => {
    document.title = l.title
  }, [l.title])

  return (
    <>
      <header className="nav">
        <a href="#topo" className="nav__brand">
          <img src="/icon.svg" alt="" width={28} height={28} />
          Flashcards
        </a>
        <nav className="nav__links" aria-label={l.nav.label}>
          <a href="#como-funciona">{l.nav.how}</a>
          <a href="#vantagens">{l.nav.benefits}</a>
          <a href="#recursos">{l.nav.features}</a>
        </nav>
        <LanguageSwitch className="nav__lang" />
        <button type="button" className="button button--small" onClick={enter}>
          {signedIn ? l.nav.open : l.nav.enter}
        </button>
      </header>

      <main id="topo">
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">{l.hero.eyebrow}</p>
            <h1>
              {l.hero.titleLead} <em>{l.hero.titleEm}</em>
            </h1>
            <p className="hero__lead">{l.hero.lead}</p>
            <div className="hero__ctas">
              <button type="button" className="button" onClick={enter}>
                {signedIn ? l.nav.open : l.hero.start}
              </button>
              <a href="#como-funciona" className="button button--ghost">
                {l.hero.seeHow}
              </a>
            </div>
            {error && (
              <p className="hero__error" role="alert">
                {l.hero.error}
              </p>
            )}
          </div>
          <DemoDeck />
        </section>

        <ul className="free-strip" aria-label={l.free.label}>
          {l.free.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <section id="como-funciona" className="section how">
          <h2 className="section__title">{l.how.title}</h2>
          <ol className="steps">
            <li>
              <h3>{l.how.createTitle}</h3>
              <p>{l.how.createText}</p>
            </li>
            <li>
              <h3>{l.how.studyTitle}</h3>
              <p>{l.how.studyText}</p>
            </li>
            <li>
              <h3>{l.how.answerTitle}</h3>
              <p>
                <strong>{t.study.miss}</strong> {l.how.missText} <strong>{t.study.hard}</strong> {l.how.hardText}{' '}
                <strong>{t.study.hit}</strong> {l.how.hitText}
              </p>
            </li>
          </ol>
          <ol className="ladder" aria-label={l.how.ladderLabel}>
            {INTERVALS.map((days, i) => (
              <li key={days} style={{ '--step': i } as CSSProperties}>
                <span className="ladder__days">{days}</span>
                <span className="ladder__unit">{l.how.dayUnit(days)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="vantagens" className="section">
          <h2 className="section__title">{l.benefits.title}</h2>
          <ul className="benefits">
            {l.benefits.items.map((b, i) => (
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
            <h2 className="section__title">{l.features.title}</h2>
            <p>{l.features.intro}</p>
          </div>
          <dl className="specs">
            {l.features.items.map(([term, desc]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="closing">
          <h2>{l.closing.title}</h2>
          <button type="button" className="button button--light" onClick={enter}>
            {signedIn ? l.nav.open : l.closing.signIn}
          </button>
        </section>
      </main>

      <footer className="footer">
        <span>
          {l.footer}
          <a href={PORTFOLIO_URL} target="_blank" rel="noopener" title={l.portfolio}>
            André Vieira
          </a>
        </span>
      </footer>
    </>
  )
}
