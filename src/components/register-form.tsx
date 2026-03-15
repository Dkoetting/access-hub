"use client"

import Image from 'next/image'
import { FormEvent, useEffect, useState } from 'react'
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
  | { status: 'ok'; message: string; accessUrl?: string; expiresAt?: string }
  | { status: 'error'; message: string }

function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':')
}

export default function RegisterForm({ apps }: Props) {
  const content = getHubContent()

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [appId, setAppId] = useState(apps[0]?.id ?? '')
  const [acceptPaidOrder, setAcceptPaidOrder] = useState(false)
  const [state, setState] = useState<SubmitState>({ status: 'idle' })
  const [nowMs, setNowMs] = useState(() => Date.now())

  const selectedApp = apps.find((app) => app.id === appId)
  const canSubmit =
    email.trim().length > 3 && appId.length > 0 && acceptPaidOrder && state.status !== 'loading'
  const activeExpiresAt = state.status === 'ok' ? state.expiresAt : undefined

  useEffect(() => {
    if (!activeExpiresAt) return

    const timer = setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => clearInterval(timer)
  }, [activeExpiresAt])

  let remainingSeconds: number | null = null
  if (activeExpiresAt) {
    const expiresAtMs = new Date(activeExpiresAt).getTime()
    if (!Number.isNaN(expiresAtMs)) {
      remainingSeconds = Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000))
    }
  }

  const defaultWindowHours = Number(content.form.defaultLinkValidityHours ?? 8)
  const defaultWindowSeconds = Math.max(0, Math.floor(defaultWindowHours * 60 * 60))
  const displaySeconds = remainingSeconds ?? defaultWindowSeconds

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setState({ status: 'loading' })

    try {
      const response = await fetch('/api/register-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name.trim() || undefined, appId }),
      })

      const payload = await response.json().catch(() => ({}))

      if (response.status === 409) {
        setState({ status: 'error', message: content.messages.alreadyRegistered })
        return
      }

      if (!response.ok) {
        setState({ status: 'error', message: payload.error ?? content.messages.signupFailed })
        return
      }

      if (payload.delivery === 'dev_preview') {
        setState({
          status: 'ok',
          message: content.messages.signupSuccessDev,
          accessUrl: payload.accessUrl,
          expiresAt: payload.expiresAt,
        })
        return
      }

      setState({
        status: 'ok',
        message: content.messages.signupSuccessEmail,
        expiresAt: payload.expiresAt,
      })
    } catch {
      setState({ status: 'error', message: content.messages.networkError })
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
        <a href={selectedApp.redirectUrl} className="orderButton" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
          Zur {selectedApp.name} Seite →
        </a>
      ) : (
        <>
          <div className="windowMeta">
            <p className="metaTitle">{content.form.windowTitle}</p>
            <p className="hint">
              {remainingSeconds !== null ? content.form.windowHint : content.form.windowHintPlanned}
            </p>
            <p className="countdown">
              {content.form.countdownLabel}: {formatCountdown(displaySeconds)}
            </p>
          </div>

          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={acceptPaidOrder}
              onChange={(e) => setAcceptPaidOrder(e.target.checked)}
              required
            />
            <span>{content.form.confirmPaidOrder}</span>
          </label>

          <button type="submit" className="orderButton" disabled={!canSubmit}>
            {state.status === 'loading' ? content.form.submitting : content.form.submit}
          </button>

          {state.status === 'error' && <p className="error">{state.message}</p>}

          {state.status === 'ok' && (
            <div className="success">
              <p>{state.message}</p>
              {state.accessUrl && (
                <p>
                  {content.messages.devLinkLabel}:{' '}
                  <a href={state.accessUrl}>{state.accessUrl}</a>
                </p>
              )}
            </div>
          )}
        </>
      )}
    </form>
  )
}