'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getConsent } from '@/components/cookies/CookieBanner'

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

function PageTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (!GA_ID) return
    window.gtag?.('config', GA_ID, { page_path: pathname })
  }, [pathname])
  return null
}

export default function Analytics() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    if (getConsent() === 'all') {
      // eslint-disable-next-line react-compiler/react-compiler
      setConsented(true)
      return
    }
    const handler = () => setConsented(true)
    window.addEventListener('metalab_consent_granted', handler)
    return () => window.removeEventListener('metalab_consent_granted', handler)
  }, [])

  if (!consented || (!GA_ID && !PIXEL_ID)) return null

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});
          `}</Script>
          <PageTracker />
        </>
      )}
      {PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','${PIXEL_ID}');fbq('track','PageView');
        `}</Script>
      )}
    </>
  )
}
