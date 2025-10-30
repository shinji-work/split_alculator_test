'use client'

import { useEffect } from 'react'
import { registerServiceWorker, unregisterServiceWorkers } from '@/lib/pwa'

export function PWARegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker()
    } else {
      unregisterServiceWorkers()
    }
  }, [])

  return null
}