import { createContext, useContext } from 'react'
import { en } from './en'
import { pt, type Messages } from './pt'

export type Lang = 'pt' | 'en'

export const MESSAGES: Record<Lang, Messages> = { pt, en }

/** Valor do atributo `lang` do documento para cada idioma. */
export const HTML_LANG: Record<Lang, string> = { pt: 'pt-BR', en: 'en' }

/** Compartilhada entre a landing page e o app (mesma origem). */
export const LANG_STORAGE_KEY = 'flashcards:lang'

/** Português é o padrão: só muda quando a pessoa escolhe outro idioma. */
export function loadLang(): Lang {
  try {
    return localStorage.getItem(LANG_STORAGE_KEY) === 'en' ? 'en' : 'pt'
  } catch {
    return 'pt'
  }
}

export function saveLang(lang: Lang): void {
  try {
    if (lang === 'pt') localStorage.removeItem(LANG_STORAGE_KEY)
    else localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    // Ignora: armazenamento indisponível, o idioma vale só para esta visita.
  }
}

export interface I18n {
  lang: Lang
  t: Messages
  setLang: (lang: Lang) => void
}

// Sem provider (ex.: testes de componentes) os textos saem em português.
export const I18nContext = createContext<I18n>({ lang: 'pt', t: pt, setLang: () => {} })

export function useI18n(): I18n {
  return useContext(I18nContext)
}
