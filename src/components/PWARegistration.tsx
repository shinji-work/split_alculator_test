'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/pwa'

export function PWARegistration() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return null
} 