"use client"

import Image from 'next/image'
import { FormEvent, useState } from 'react'
import { formatPriceEur } from '@/lib/apps'
import { getHubContent } from '@/lib/hub-content'

type AppOption = {
  id: string
  name: string
  description?: string
  oneTimePriceCents: number
  redirectUrl?: string
}

type Props = {
  apps: AppOption[]
}

type SubmitState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }

export default function RegisterForm({ apps }: Props) {
  const content = getHubContent()

  const [email, setEmail] = useState('')
  const [name, setName]   = useState('')
  const [appId, setAppId] = useState(apps[0]?.id ?? '')
  const [state, setState] = useState<SubmitState>({ status: 'idle' })

  const selectedApp = apps.find((app) => app.id === appId)
  const canSubmit   = email.trim().length > 3 && appId.length > 0 && state.status !== 'loading'

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setState({ status: 'loading' })

    try {
      const res  = await fetch('/api/access-hub/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ appId, email: email.trim(), name: name.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.url) {
        setState({ status: 'error', message: data.error ?? 'Fehler – bitte erneut versuchen.' })
        return
      }

      window.location.href = data.url
    } catch {
      setState({ status: 'error', message: 'Keine Verbindung – bitte erneut versuchen.' })
    }
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <div className="brand">
        <Image src="/logo.svg" alt={content.branding.logoAlt} className="brandLogo" width={48} height={48} priority />
        <div>
          <h1>{content.branding.title}</h1>
          <p className="muted">{content.branding.subtitle}</p>
        </div>
      </div>

      <label>
        {content.form.emailLabel}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={content.form.emailPlaceholder}
          required
        />
      </label>

      <label>
        {content.form.nameLabel}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={content.form.namePlaceholder}
        />
      </label>

      <label>
        {content.form.appLabel}
        <select value={appId} onChange={(e) => setAppId(e.target.value)} required>
          {apps.map((app) => (
            <option key={app.id} value={app.id}>
              {app.name}
            </option>
          ))}
        </select>
      </label>

      {selectedApp && (
        <div className="appMeta">
          <p className="metaTitle">{content.form.appInfoTitle}</p>
          <p className="hint">{selectedApp.description ?? content.form.appInfoFallback}</p>
          {!selectedApp.redirectUrl && (
            <p className="price">
              {content.form.priceLabel}: {formatPriceEur(selectedApp.oneTimePriceCents)}
            </p>
          )}
        </div>
      )}

      {selectedApp?.redirectUrl ? (
        <a
          href={selectedApp.redirectUrl}
          className="orderButton"
          style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}
        >
          Weiterleitung zur {selectedApp.name} →
        </a>
      ) : (
        <>
          <button type="submit" className="orderButton" disabled={!canSubmit}>
            {state.status === 'loading' ? 'Weiterleitung zu Stripe…' : 'Jetzt kaufen & Zugang erhalten'}
          </button>

          {state.status === 'error' && <p className="error">{state.message}</p>}
        </>
      )}
    </form>
  )
}