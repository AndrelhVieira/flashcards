import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { HTML_LANG, I18nContext, LANG_STORAGE_KEY, MESSAGES, loadLang, saveLang, type Lang } from './context'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState(loadLang)

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang]
  }, [lang])

  // Trocar o idioma em outra aba (ou na landing page) vale aqui também.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === LANG_STORAGE_KEY || e.key === null) setLangState(loadLang())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    saveLang(next)
  }, [])

  const value = useMemo(() => ({ lang, t: MESSAGES[lang], setLang }), [lang, setLang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
