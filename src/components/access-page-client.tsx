"use client"

import { useEffect, useState } from 'react'
import { getHubContent } from '@/lib/hub-content'

type State = 'loading' | 'success' | 'cli' | 'error'

type Props = {
  token: string
}

export default function AccessPageClient({ token }: Props) {
  const content = getHubContent()
  const [state, setState]       = useState<State>(token ? 'loading' : 'error')
  const [message, setMessage]   = useState(token ? content.access.checking : content.access.missingToken)
  const [redirectUrl, setRedirectUrl] = useState('')
  const [appName, setAppName]   = useState('')
  const [copied, setCopied]     = useState(false)

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

        // ── CLI-Tool: Token anzeigen zum Kopieren ──────────────────────────
        if (payload.cliTool) {
          setState('cli')
          setAppName(payload.appName ?? 'Tool')
          return
        }

        // ── Web-App: Weiterleiten ──────────────────────────────────────────
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
    return () => { cancelled = true }
  }, [token, content.access.invalidLink, content.access.networkError, content.access.success])

  function copyToken() {
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

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

        {state === 'cli' && (
          <div className="success">
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              ✓ Aktivierungstoken für <strong>{appName}</strong>
            </p>
            <p className="muted" style={{ marginBottom: '1rem' }}>
              Kopiere diesen Token und füge ihn beim Start des Tools ein:
            </p>

            {/* Token-Box */}
            <div style={{
              background: '#f0f4ff',
              border: '1px solid #c7d2fe',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              wordBreak: 'break-all',
              marginBottom: '0.75rem',
              userSelect: 'all',
            }}>
              {token}
            </div>

            <button
              onClick={copyToken}
              style={{
                background: copied ? '#22c55e' : '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.6rem 1.4rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'background 0.2s',
              }}
            >
              {copied ? '✓ Kopiert!' : 'Token kopieren'}
            </button>

            <p className="muted" style={{ marginTop: '1.25rem', fontSize: '0.82rem' }}>
              Starte <strong>{appName}</strong> und gib den Token ein wenn danach gefragt wird.<br />
              Der Link ist <strong>8 Stunden gültig</strong> und kann nur einmal aktiviert werden.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
