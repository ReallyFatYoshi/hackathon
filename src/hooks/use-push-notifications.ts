'use client'

import { useState, useEffect, useCallback } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY!

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const arr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) arr[i] = rawData.charCodeAt(i)
  return arr
}

export type PushStatus = 'loading' | 'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('loading')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }

    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }

    // Register the push service worker and check existing subscription
    navigator.serviceWorker
      .register('/push-sw.js')
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) {
          setSubscription(sub)
          setStatus('subscribed')
        } else {
          setStatus('unsubscribed')
        }
      })
      .catch(() => setStatus('unsupported'))
  }, [])

  const subscribe = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return false
      }

      const reg = await navigator.serviceWorker.register('/push-sw.js')
      await navigator.serviceWorker.ready

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      })

      // Send subscription to server
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      if (res.ok) {
        setSubscription(sub)
        setStatus('subscribed')
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    try {
      if (subscription) {
        const endpoint = subscription.endpoint
        await subscription.unsubscribe()

        await fetch('/api/notifications', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        })
      }
      setSubscription(null)
      setStatus('unsubscribed')
      return true
    } catch {
      return false
    }
  }, [subscription])

  return { status, subscription, subscribe, unsubscribe }
}
