'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'metalab_cookie_consent'

export type ConsentValue = 'all' | 'essential' | null

export function getConsent(): ConsentValue {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem(CONSENT_KEY) as ConsentValue) ?? null
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!getConsent()) setVisible(true)
  }, [])

  function accept(value: 'all' | 'essential') {
    localStorage.setItem(CONSENT_KEY, value)
    setVisible(false)
    if (value === 'all') window.dispatchEvent(new Event('metalab_consent_granted'))
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-navy border-t border-navy-400 px-4 py-4 sm:py-5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-on-navy/80 flex-1 leading-relaxed">
          Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar anúncios.
          Ao clicar em <strong className="text-on-navy">Aceitar todos</strong>, você concorda com nossa{' '}
          <Link href="/politica-de-privacidade" className="underline text-brand hover:text-brand-hover">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => accept('essential')}
            className="px-4 py-2 text-sm text-on-navy/70 border border-navy-400 rounded-full hover:border-navy-300 hover:text-on-navy transition-colors"
          >
            Apenas essenciais
          </button>
          <button
            onClick={() => accept('all')}
            className="px-4 py-2 text-sm font-semibold bg-brand text-on-brand rounded-full hover:bg-brand-hover transition-colors"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  )
}
