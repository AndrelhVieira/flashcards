import { useEffect, useRef, type ChangeEvent } from 'react'
import type { User } from 'firebase/auth'

interface Props {
  user: User
  canExport: boolean
  onExport: () => void
  onImportFile: (file: File) => void
  onLogout: () => void
}

export function UserMenu({ user, canExport, onExport, onImportFile, onLogout }: Props) {
  const menuRef = useRef<HTMLDetailsElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  function close() {
    menuRef.current?.removeAttribute('open')
  }

  // Fecha ao tocar fora do menu.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onImportFile(file)
  }

  const initial = (user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()

  return (
    <details className="menu" ref={menuRef}>
      <summary className="menu__trigger" aria-label="Menu da conta">
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="avatar" referrerPolicy="no-referrer" />
        ) : (
          <span className="avatar avatar--fallback">{initial}</span>
        )}
      </summary>
      <div className="menu__panel">
        <div className="menu__user">
          <strong>{user.displayName}</strong>
          <span className="muted">{user.email}</span>
        </div>
        <button
          className="menu__item"
          disabled={!canExport}
          onClick={() => {
            onExport()
            close()
          }}
        >
          Exportar backup
        </button>
        <button
          className="menu__item"
          onClick={() => {
            fileInput.current?.click()
            close()
          }}
        >
          Importar backup
        </button>
        <button className="menu__item menu__item--danger" onClick={onLogout}>
          Sair
        </button>
        <input ref={fileInput} type="file" accept="application/json" hidden onChange={handleFile} />
      </div>
    </details>
  )
}
