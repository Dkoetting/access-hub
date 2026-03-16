'use client'

import { useSearchParams } from 'next/navigation'

export default function SuccessContent() {
  const params  = useSearchParams()
  const appName = params.get('app') ?? 'die App'

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✅</div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
        Zahlung erfolgreich!
      </h1>
      <p style={{ color: '#4b5563', marginBottom: '16px' }}>
        Danke für deinen Kauf von <strong>{appName}</strong>.<br />
        Du erhältst gleich eine E-Mail mit deinem persönlichen Zugangslink.
      </p>
      <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
        Bitte prüfe auch deinen Spam-Ordner falls die E-Mail nicht ankommt.
      </p>
      <a
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '24px',
          padding: '10px 24px',
          background: 'linear-gradient(135deg, #1e40af, #2563eb)',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.9rem',
        }}
      >
        ← Zurück zum Hub
      </a>
    </div>
  )
}
