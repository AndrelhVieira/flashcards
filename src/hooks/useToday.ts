import { useEffect, useState } from 'react'
import { today } from '../lib/dates'

/** Data local atual (YYYY-MM-DD), atualizada na virada do dia. */
export function useToday() {
  const [value, setValue] = useState(today)

  useEffect(() => {
    const refresh = () => setValue(today())
    // Celulares suspendem timers em segundo plano; ao voltar ao app, recalcula.
    const timer = window.setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return value
}
