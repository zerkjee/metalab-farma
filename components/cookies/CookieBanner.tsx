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
    if (!getConsent()) setVisible(true)
  }, [])

  function accept(value: 'all' | 'essential') {
    localStorage.setItem(CONSENT_KEY, value)
    setVisible(false)
    if (value === 'all') window.dispatchEvent(new Event('metalab_consent_granted'))
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-950 border-t border-gray-800 px-4 py-4 sm:py-5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-300 flex-1 leading-relaxed">
          Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar anúncios.
          Ao clicar em <strong className="text-white">Aceitar todos</strong>, você concorda com nossa{' '}
          <Link href="/politica-de-privacidade" className="underline text-[#c084fc] hover:text-purple-300">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => accept('essential')}
            className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
          >
            Apenas essenciais
          </button>
          <button
            onClick={() => accept('all')}
            className="px-4 py-2 text-sm font-semibold bg-[#c084fc] text-gray-950 rounded-lg hover:bg-purple-300 transition-colors"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  )
}
