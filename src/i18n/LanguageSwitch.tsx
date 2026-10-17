import { HTML_LANG, useI18n } from './context'

interface Props {
  className?: string
  /** Chamado depois da troca (ex.: fechar o menu). */
  onSwitch?: () => void
}

/** Botão que alterna entre português e inglês, rotulado no idioma de destino. */
export function LanguageSwitch({ className, onSwitch }: Props) {
  const { lang, t, setLang } = useI18n()
  const target = lang === 'pt' ? 'en' : 'pt'

  return (
    <button
      type="button"
      className={className}
      lang={HTML_LANG[target]}
      title={t.language.switchLabel}
      onClick={() => {
        setLang(target)
        onSwitch?.()
      }}
    >
      {t.language.switchTo}
    </button>
  )
}
