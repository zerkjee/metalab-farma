'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Clock3, Store, X } from 'lucide-react'

interface ComingSoonStoreButtonProps {
  productName: string
  size?: 'default' | 'large'
}

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function ComingSoonStoreButton({
  productName,
  size = 'default',
}: ComingSoonStoreButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const titleId = useId()
  const descriptionId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const triggerElement = triggerRef.current
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      )
      const firstElement = focusableElements.at(0)
      const lastElement = focusableElements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        return
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      triggerElement?.focus()
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand font-black text-on-brand shadow-sm transition hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page ${
          size === 'large' ? 'px-6 py-3 text-sm' : 'px-5 py-2.5 text-sm'
        }`}
      >
        <Store className="h-4 w-4" aria-hidden="true" />
        Comprar na loja
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false)
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className="relative w-full max-w-md rounded-2xl border border-line bg-surface-card p-6 text-left shadow-2xl sm:p-8"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-sunken text-ink-secondary transition hover:border-brand/50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Fechar aviso da loja"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-subtle text-brand-700">
              <Clock3 className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-brand-700">Experiência de compra</p>
            <h2 id={titleId} className="mt-2 pr-10 font-display text-3xl font-black text-ink">
              Loja em breve
            </h2>
            <div id={descriptionId} className="mt-4 space-y-3 text-sm leading-relaxed text-ink-secondary">
              <p>
                Estamos preparando a experiência de compra de <strong className="text-ink">{productName}</strong>.
                Por enquanto, este botão não direciona para nenhuma página de compra.
              </p>
              <p>Você já pode consultar o folheto técnico e as informações disponíveis nesta página.</p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-7 inline-flex w-full items-center justify-center rounded-full border border-line bg-surface-sunken px-5 py-3 text-sm font-black text-ink transition hover:border-brand/50 hover:bg-brand-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  )
}
