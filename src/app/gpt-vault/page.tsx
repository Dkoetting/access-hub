'use client'

import { useState } from 'react'
import Image from 'next/image'
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

// ── FAQ Data ──────────────────────────────────────────────────────────────────

const faqItems = [
  {
    q: 'Welche Daten werden gespeichert?',
    a: 'Nur deine E-Mail-Adresse für die Lizenzverwaltung. Deine ChatGPT-Daten werden ausschließlich lokal auf deinem PC gespeichert.',
  },
  {
    q: 'Was wird NICHT gespeichert?',
    a: 'Dein ChatGPT-Passwort, deine GPT-Inhalte und deine Exporte. Diese Daten verlassen nie deinen Rechner.',
  },
  {
    q: 'Wo liegen die Exportdateien?',
    a: 'Direkt auf deinem PC im Ordner, den du beim Start angibst. Keine Cloud, keine Synchronisation.',
  },
  {
    q: 'Braucht es API-Keys?',
    a: 'Nein. GPT Vault nutzt einen integrierten Browser – du loggst dich einmalig wie gewohnt in ChatGPT ein.',
  },
  {
    q: 'Windows oder Mac?',
    a: 'Windows & Mac werden unterstützt.',
  },
  {
    q: 'Kann ich mehrmals exportieren?',
    a: 'Ja. Mit deiner Lizenz kannst du so oft exportieren wie du willst – das Paket definiert nur die maximale GPT-Anzahl pro Export.',
  },
  {
    q: 'Was passiert wenn mein Paket zu klein ist?',
    a: 'GPT Vault sichert die ersten N GPTs deines Pakets. Du kannst jederzeit ein größeres Paket kaufen.',
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function GptVaultPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [email, setEmail]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [openFaq,      setOpenFaq]      = useState<number | null>(null)
  const [lightboxSrc,  setLightboxSrc]  = useState<string | null>(null)

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

  const mainPackages      = packages.filter((p) => !p.contactOnly)
  const enterprisePackage = packages.find((p) => p.contactOnly)

  return (
    <main className={styles.page}>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.logo}>
          <Image
            src="/Dr.DirKInstitute.png"
            alt="Dr. DirKInstitute Logo"
            width={100}
            height={100}
            className={styles.logoImg}
            priority
          />
          <div className={styles.logoBox}>
            <span className={styles.logoIcon}>🔒</span>
            <span className={styles.logoText}>GPT Vault</span>
          </div>
          <div className={styles.logoBy}>by Dr. DirKInstitute</div>
        </div>
        <p className={styles.heroSub}>
          Sichere alle deine Custom GPTs – als JSON &amp; Excel,<br />
          lokal auf deinem PC. Einmal kaufen, für immer nutzen.
        </p>
        <p className={styles.heroWhy}>
          Custom GPTs lassen sich nicht nativ aus ChatGPT exportieren. Kein Backup, kein Überblick, keine Versionierung.
          Wer mehrere GPTs verwaltet, verliert ohne Export schnell Prompts, Konfigurationen und Zeit.
        </p>
        <p className={styles.heroHint}>
          GPT Vault erstellt dir lokal ein vollständiges Backup + eine Excel-Inventarliste – vollautomatisch.
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

      {/* ── Lightbox ────────────────────────────────────────────────── */}
      {lightboxSrc && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxSrc(null)}>
          <div className={styles.lightboxClose}>✕ Schließen</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="Vergrößerte Ansicht"
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Proof: Excel Screenshots ─────────────────────────────────── */}
      <section className={styles.proof}>
        <h2 className={styles.sectionTitle}>So sieht dein Export aus</h2>
        <p className={styles.sectionSub}>Echter Output – keine Mockups. Zum Vergrößern anklicken.</p>

        <div className={styles.proofGrid}>
          <div className={styles.proofItem}>
            <div className={styles.proofLabel}>📊 Übersicht &amp; Analyse</div>
            <button
              className={styles.proofImgBtn}
              onClick={() => setLightboxSrc('/screenshots/excel-overview.png')}
              title="Zum Vergrößern klicken"
            >
              <Image
                src="/screenshots/excel-overview.png"
                alt="Excel Übersichtsblatt mit GPT-Statistiken und farbigen Warnungen"
                width={900}
                height={660}
                className={styles.proofImg}
              />
              <span className={styles.proofZoomHint}>🔍 Klicken zum Vergrößern</span>
            </button>
            <p className={styles.proofCaption}>
              Zusammenfassung mit Statistiken, Vollständigkeitsprüfung und farbigen Hinweisen.
            </p>
          </div>
          <div className={styles.proofItem}>
            <div className={styles.proofLabel}>📋 Detailtabelle</div>
            <button
              className={styles.proofImgBtn}
              onClick={() => setLightboxSrc('/screenshots/excel-detail.png')}
              title="Zum Vergrößern klicken"
            >
              <Image
                src="/screenshots/excel-detail.png"
                alt="Excel Detailblatt mit allen GPT-Spalten"
                width={900}
                height={660}
                className={styles.proofImg}
              />
              <span className={styles.proofZoomHint}>🔍 Klicken zum Vergrößern</span>
            </button>
            <p className={styles.proofCaption}>
              Alle GPTs mit Name, System-Prompt, Aktionen, GPT-ID und direktem Link.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3-Schritte-Flow ─────────────────────────────────────────── */}
      <section className={styles.steps}>
        <h2 className={styles.sectionTitle}>In 3 Schritten zum Backup</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <strong>Download &amp; starten</strong>
            <p>Nach dem Kauf erhältst du einen Aktivierungs-Code per E-Mail. ZIP entpacken, starten, Code eingeben – fertig.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <strong>Im integrierten Browser einloggen</strong>
            <p>GPT Vault öffnet einen eigenen Browser-Tab. Du loggst dich einmalig wie gewohnt bei ChatGPT ein.</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <strong>Export startet automatisch</strong>
            <p>GPT Vault liest deine GPTs aus und speichert JSON + Excel lokal auf deinem PC.</p>
          </div>
        </div>
        <p className={styles.trustNote}>
          🔒 Kein ChatGPT-Passwort wird gespeichert oder übertragen. Keine Cloud-Synchronisation. Dateien bleiben auf deinem Rechner.
        </p>
        <div className={styles.supportOffer}>
          <span className={styles.supportOfferIcon}>🖥️</span>
          <div>
            <strong>Persönliche Unterstützung bei der Installation</strong>
            <p>
              Nicht sicher bei der Einrichtung? Ich helfe dir per TeamViewer oder Termin –
              kostenlos beim Erstkauf.{' '}
              <button className={styles.supportOfferLink} onClick={() => openInquiry('teamviewer')}>
                Jetzt anfragen →
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* ── Pakete ──────────────────────────────────────────────────── */}
      <section className={styles.packages}>
        <h2 className={styles.sectionTitle}>Paket wählen</h2>
        <p className={styles.sectionSub}>
          Wie viele Custom GPTs hast du?&nbsp;
          <span className={styles.sectionHint}>Unsicher? Nimm <strong>Plus</strong> – reicht für die meisten.</span>
        </p>

        <div className={styles.grid}>
          {mainPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={[
                styles.card,
                pkg.highlight         ? styles.cardHighlight : '',
                selectedId === pkg.id ? styles.cardSelected  : '',
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
            Du bekommst sofort deinen <strong>Aktivierungs-Code</strong> per E-Mail.<br />
            Danach in 30 Sekunden freischalten und loslegen.
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
            {loading ? 'Weiterleitung zu Stripe...' : `Jetzt kaufen & Aktivierungs-Code erhalten`}
          </button>
          <p className={styles.checkoutHint}>
            🔒 Einmalkauf · kein Abo · sofort nutzbar · Zahlung via Stripe
          </p>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className={styles.faq}>
        <h2 className={styles.sectionTitle}>Häufige Fragen</h2>
        <p className={styles.sectionSub}>Besonders zu Datenschutz &amp; Sicherheit.</p>
        <div className={styles.faqList}>
          {faqItems.map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{item.q}</span>
                <span className={styles.faqArrow}>{openFaq === i ? '▲' : '▼'}</span>
              </button>
              {openFaq === i && (
                <div className={styles.faqAnswer}>{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Support & Kontakt ────────────────────────────────────────── */}
      <section className={styles.support}>
        <h2 className={styles.sectionTitle}>Hilfe &amp; Support</h2>
        <p className={styles.sectionSub}>
          Du brauchst Unterstützung bei der Einrichtung? Ich helfe dir persönlich.
        </p>

        <div className={styles.supportGrid}>

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

      {/* ── Über den Entwickler ──────────────────────────────────────── */}
      <section className={styles.about}>
        <div className={styles.aboutInner}>
          <Image
            src="/Dr.DirKInstitute.png"
            alt="Dr. DirKInstitute"
            width={72}
            height={72}
            className={styles.aboutLogo}
          />
          <div className={styles.aboutText}>
            <strong>Dr. DirKInstitute</strong>
            <p>
              KI-Beratung &amp; Automatisierung für Selbstständige und kleine Teams.
              GPT Vault ist ein Produkt von Dr. DirKInstitute –
              praxisnah, lokal, ohne Cloud-Abhängigkeit.
            </p>
          </div>
          <div className={styles.aboutContact}>
            <a href="mailto:dirk@koetting.bayern">dirk@koetting.bayern</a>
            <span className={styles.aboutResponse}>Antwort in der Regel innerhalb von 24h</span>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p>© 2026 Dirk Köttinger · <a href="mailto:dirk@koetting.bayern">dirk@koetting.bayern</a> · Bayern, Deutschland</p>
      </footer>

    </main>
  )
}
