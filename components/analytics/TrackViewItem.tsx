'use client'

import { useEffect } from 'react'
import { trackViewItem } from '@/lib/analytics'

interface Props {
  id: string
  name: string
  price: number
}

export default function TrackViewItem({ id, name, price }: Props) {
  useEffect(() => {
    trackViewItem({ id, name, price })
  }, [id, name, price])
  return null
}
