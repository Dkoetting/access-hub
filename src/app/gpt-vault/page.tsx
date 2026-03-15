'use client'

import { useState } from 'react'
import styles from './page.module.css'
import packagesRaw from '@/config/packages.json'

async function trackInquiry(type: string, data: Record<string, string>) {
  try {
    await fetch('/api/gpt-vault/inquiry', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type, ...data }),
    })
  } catch { /* silent – tracking darf nie den Flow blockieren */ }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Package = {
  id: string
  name: string
  gpts: number | null
  priceCents: number | null
  currency: string
  description: string
  highlight: boolean
  contactOnly?: boolean
}

const packages = packagesRaw as Package[]

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GptVaultPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [email, setEmail]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // Inquiry-Formulare
  const [inquiryName,    setInquiryName]    = useState('')
  const [inquiryEmail,   setInquiryEmail]   = useState('')
  const [inquiryMessage, setInquiryMessage] = useState('')
  const [inquiryType,    setInquiryType]    = useState<string | null>(null)
  const [inquirySent,    setInquirySent]    = useState(false)
  const [inquiryLoading, setInquiryLoading] = useState(false)

  const selectedPkg = packages.find((p) => p.id === selectedId)

  async function handleInquiry() {
    if (!inquiryEmail.trim() || !inquiryType) return
    setInquiryLoading(true)
    await trackInquiry(inquiryType, {
      name:    inquiryName,
      email:   inquiryEmail,
      message: inquiryMessage,
    })
    setInquiryLoading(false)
    setInquirySent(true)
  }

  function openInquiry(type: string) {
    setInquiryType(type)
    setInquirySent(false)
    setInquiryName('')
    setInquiryEmail('')
    setInquiryMessage('')
  }

  async function handleBuy() {
    if (!selectedPkg || !email.trim()) return
    setLoading(true)
    setError('')

    // Checkout-Start tracken
    await trackInquiry('checkout_start', { email, packageId: selectedPkg.id })

    try {
      const res = await fetch('/api/gpt-vault/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ packageId: selectedPkg.id, email: email.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Fehler beim Checkout – bitte erneut versuchen.')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError('Keine Verbindung – bitte erneut versuchen.')
      setLoading(false)
    }
  }

  // Pakete ohne Enterprise für das Haupt-Grid
  const mainPackages       = packages.filter((p) => !p.contactOnly)
  const enterprisePackage  = packages.find((p) => p.contactOnly)

  return (
    <main className={styles.page}>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        {/* Logo-Platzhalter – hier eigenes Logo-Bild einfügen */}
        <div className={styles.logo}>
          <div className={styles.logoBox}>
            <span className={styles.logoIcon}>🔒</span>
            <span className={styles.logoText}>GPT Vault</span>
          </div>
        </div>
        <p className={styles.heroSub}>
          Sichere alle deine Custom GPTs – als JSON &amp; Excel,<br />
          lokal auf deinem PC. Einmal kaufen, für immer nutzen.
        </p>
        <p className={styles.heroHint}>
          Ideal, wenn du mehrere Custom GPTs verwaltest und ein Backup + Inventar (Excel) brauchst.
        </p>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>⚡</span>
          <strong>Vollautomatisch</strong>
          <p>Startet lokal, öffnet den Login im integrierten Browser und erstellt den Export automatisch.</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📁</span>
          <strong>Lokal gespeichert</strong>
          <p>JSON + Excel auf deinem PC. Kein Cloud-Abo, keine Abhängigkeit. Dateien bleiben auf deinem Rechner.</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🔄</span>
          <strong>Beliebig oft nutzbar</strong>
          <p>Einmal kaufen – so oft exportieren wie du willst.</p>
        </div>
      </section>

      {/* ── Pakete ──────────────────────────────────────────────────── */}
      <section className={styles.packages}>
        <h2 className={styles.sectionTitle}>Paket wählen</h2>
        <p className={styles.sectionSub}>Wie viele Custom GPTs hast du?</p>

        {/* 4 Haupt-Pakete */}
        <div className={styles.grid}>
          {mainPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={[
                styles.card,
                pkg.highlight         ? styles.cardHighlight  : '',
                selectedId === pkg.id ? styles.cardSelected   : '',
              ].join(' ')}
              onClick={() => setSelectedId(pkg.id)}
            >
              {pkg.highlight && <div className={styles.badge}>Beliebt</div>}
              <div className={styles.cardName}>{pkg.name}</div>
              <div className={styles.cardGpts}>bis zu {pkg.gpts} GPTs</div>
              <div className={styles.cardPrice}>{formatPrice(pkg.priceCents!)}</div>
              <div className={styles.cardSelect}>
                {selectedId === pkg.id ? '✓ Ausgewählt' : 'Wählen'}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise – volle Breite, zentriert */}
        {enterprisePackage && (
          <div className={styles.enterpriseRow}>
            <div className={styles.enterpriseCard}>
              <div className={styles.enterpriseName}>Enterprise</div>
              <div className={styles.enterpriseDesc}>
                Mehr als 20 GPTs? Wir finden gemeinsam die passende Lösung.
              </div>
              <button
                className={styles.enterpriseLink}
                onClick={() => openInquiry('enterprise')}
              >
                Anfrage senden →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Checkout ────────────────────────────────────────────────── */}
      {selectedPkg && (
        <section className={styles.checkout}>
          <h2 className={styles.checkoutTitle}>
            {selectedPkg.name} – {formatPrice(selectedPkg.priceCents!)}
          </h2>
          <p className={styles.checkoutSub}>
            Nach dem Kauf erhältst du deinen Aktivierungs-Token per E-Mail.
          </p>
          <input
            type="email"
            placeholder="Deine E-Mail-Adresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.emailInput}
            onKeyDown={(e) => e.key === 'Enter' && handleBuy()}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={styles.buyButton}
            onClick={handleBuy}
            disabled={loading || !email.trim()}
          >
            {loading ? 'Weiterleitung...' : `Jetzt kaufen – ${formatPrice(selectedPkg.priceCents!)}`}
          </button>
          <p className={styles.checkoutHint}>
            🔒 Einmalkauf · kein Abo · sofort nutzbar
          </p>
        </section>
      )}

      {/* ── Support & Kontakt ────────────────────────────────────────── */}
      <section className={styles.support}>
        <h2 className={styles.sectionTitle}>Hilfe &amp; Support</h2>
        <p className={styles.sectionSub}>
          Du brauchst Unterstützung bei der Einrichtung? Ich helfe dir persönlich.
        </p>

        <div className={styles.supportGrid}>

          {/* Terminbuchung */}
          <div className={styles.supportCard}>
            <div className={styles.supportIcon}>📅</div>
            <strong>Termin buchen</strong>
            <p>Kostenloses Erstgespräch oder Beratungstermin direkt online buchen.</p>
            <a
              href="https://terminbuchung-ten.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.supportLink}
              onClick={() => trackInquiry('booking_click', {})}
            >
              Termin buchen →
            </a>
          </div>

          {/* Geführte Session */}
          <div className={styles.supportCard}>
            <div className={styles.supportIcon}>🖥️</div>
            <strong>Geführte Session (TeamViewer)</strong>
            <p>
              Ich installiere und richte GPT Vault gemeinsam mit dir per
              TeamViewer ein – schnell, unkompliziert, persönlich.
            </p>
            <button
              className={styles.supportLink}
              onClick={() => openInquiry('teamviewer')}
            >
              Session anfragen →
            </button>
          </div>

          {/* E-Mail / Kontakt */}
          <div className={styles.supportCard}>
            <div className={styles.supportIcon}>✉️</div>
            <strong>Kontakt</strong>
            <p>Fragen, Probleme oder Feedback – ich antworte persönlich.</p>
            <button
              className={styles.supportLink}
              onClick={() => openInquiry('contact')}
            >
              Nachricht senden →
            </button>
          </div>

        </div>

        {/* ── Inquiry-Formular (inline) ─────────────────────────── */}
        {inquiryType && !inquirySent && (
          <div className={styles.inquiryForm}>
            <h3 className={styles.inquiryTitle}>
              {inquiryType === 'teamviewer' && '🖥️ Geführte Session anfragen'}
              {inquiryType === 'contact'    && '✉️ Nachricht senden'}
              {inquiryType === 'enterprise' && '🏢 Enterprise-Anfrage'}
            </h3>
            <input
              type="text"
              placeholder="Dein Name"
              value={inquiryName}
              onChange={(e) => setInquiryName(e.target.value)}
              className={styles.emailInput}
            />
            <input
              type="email"
              placeholder="Deine E-Mail-Adresse *"
              value={inquiryEmail}
              onChange={(e) => setInquiryEmail(e.target.value)}
              className={styles.emailInput}
            />
            <textarea
              placeholder="Deine Nachricht (optional)"
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              className={styles.textarea}
              rows={4}
            />
            <div className={styles.inquiryActions}>
              <button
                className={styles.buyButton}
                onClick={handleInquiry}
                disabled={inquiryLoading || !inquiryEmail.trim()}
              >
                {inquiryLoading ? 'Wird gesendet...' : 'Anfrage senden'}
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setInquiryType(null)}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {inquirySent && (
          <div className={styles.inquirySuccess}>
            ✅ Danke! Ich melde mich so schnell wie möglich bei dir.
          </div>
        )}

      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p>© 2026 Dirk Köttting · <a href="mailto:dirk@koetting.bayern">dirk@koetting.bayern</a></p>
      </footer>

    </main>
  )
}
