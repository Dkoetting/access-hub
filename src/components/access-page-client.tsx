"use client"

import { useEffect, useState } from 'react'
import { getHubContent } from '@/lib/hub-content'

type State = 'loading' | 'success' | 'error'

type Props = {
  token: string
}

export default function AccessPageClient({ token }: Props) {
  const content = getHubContent()
  const [state, setState] = useState<State>(token ? 'loading' : 'error')
  const [message, setMessage] = useState(token ? content.access.checking : content.access.missingToken)
  const [redirectUrl, setRedirectUrl] = useState('')

  useEffect(() => {
    if (!token) return

    let cancelled = false

    async function consume() {
      try {
        const response = await fetch('/api/access/consume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const payload = await response.json().catch(() => ({}))

        if (!response.ok) {
          if (cancelled) return
          setState('error')
          setMessage(payload.error ?? content.access.invalidLink)
          return
        }

        if (cancelled) return

        setState('success')
        setMessage(content.access.success)
        setRedirectUrl(payload.redirectUrl)

        setTimeout(() => {
          window.location.href = payload.redirectUrl
        }, 1000)
      } catch {
        if (cancelled) return
        setState('error')
        setMessage(content.access.networkError)
      }
    }

    void consume()

    return () => {
      cancelled = true
    }
  }, [token, content.access.invalidLink, content.access.networkError, content.access.success])

  return (
    <main className="center">
      <div className="card">
        <h1>{content.access.title}</h1>
        {state === 'loading' && <p>{message}</p>}
        {state === 'error' && <p className="error">{message}</p>}
        {state === 'success' && (
          <div className="success">
            <p>{message}</p>
            <p className="muted">{content.access.fallbackHint}</p>
            <a href={redirectUrl}>{redirectUrl}</a>
          </div>
        )}
      </div>
    </main>
  )
}
