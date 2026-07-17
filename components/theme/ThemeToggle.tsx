'use client'

import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'metalab-theme'

function documentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export default function ThemeToggle() {
  function toggleTheme() {
    const next = documentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    document.documentElement.style.colorScheme = next
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Alternar entre tema claro e tema escuro"
      title="Alternar entre tema claro e tema escuro"
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface-sunken px-3 text-xs font-bold text-ink-secondary shadow-xs transition hover:border-brand hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
    >
      <Moon className="theme-toggle-moon h-4 w-4 text-brand-700" aria-hidden="true" />
      <Sun className="theme-toggle-sun h-4 w-4 text-gold-400" aria-hidden="true" />
      <span className="theme-toggle-dark-label hidden lg:inline">Tema escuro</span>
      <span className="theme-toggle-light-label hidden lg:inline">Tema claro</span>
    </button>
  )
}
