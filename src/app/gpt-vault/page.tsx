'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './page.module.css'
import packagesRaw from '@/config/packages.json'

// ── i18n ──────────────────────────────────────────────────────────────────────

type Lang = 'de' | 'en'

const translations = {
  de: {
    heroSub:  'Sichere alle deine Custom GPTs – als JSON & Excel,\nlokal auf deinem PC. Einmal kaufen, für immer nutzen.',
    heroWhy:  'Custom GPTs lassen sich nicht nativ aus ChatGPT exportieren. Kein Backup, kein Überblick, keine Versionierung.\nWer mehrere GPTs verwaltet, verliert ohne Export schnell Prompts, Konfigurationen und Zeit.',
    heroHint: 'GPT Vault erstellt dir lokal ein vollständiges Backup + eine Excel-Inventarliste – vollautomatisch.',
    featTitle1: 'Vollautomatisch',
    featDesc1:  'Startet lokal, öffnet den Login im integrierten Browser und erstellt den Export automatisch.',
    featTitle2: 'Lokal gespeichert',
    featDesc2:  'JSON + Excel auf deinem PC. Kein Cloud-Abo, keine Abhängigkeit. Dateien bleiben auf deinem Rechner.',
    featTitle3: 'Beliebig oft nutzbar',
    featDesc3:  'Einmal kaufen – so oft exportieren wie du willst.',
    proofTitle:    'So sieht dein Export aus',
    proofSub:      'Echter Output – keine Mockups. Zum Vergrößern anklicken.',
    proofLabel1:   '📊 Übersicht & Analyse',
    proofCaption1: 'Zusammenfassung mit Statistiken, Vollständigkeitsprüfung und farbigen Hinweisen.',
    proofLabel2:   '📋 Detailtabelle',
    proofCaption2: 'Alle GPTs mit Name, System-Prompt, Aktionen, GPT-ID und direktem Link.',
    proofZoom:     '🔍 Klicken zum Vergrößern',
    stepsTitle: 'In 3 Schritten zum Backup',
    step1Title: 'Download & starten',
    step1Desc:  'Nach dem Kauf erhältst du einen Aktivierungs-Code per E-Mail. ZIP entpacken, starten, Code eingeben – fertig.',
    step2Title: 'Im integrierten Browser einloggen',
    step2Desc:  'GPT Vault öffnet einen eigenen Browser-Tab. Du loggst dich einmalig wie gewohnt bei ChatGPT ein.',
    step3Title: 'Export startet automatisch',
    step3Desc:  'GPT Vault liest deine GPTs aus und speichert JSON + Excel lokal auf deinem PC.',
    trustNote:  '🔒 Kein ChatGPT-Passwort wird gespeichert oder übertragen. Keine Cloud-Synchronisation. Dateien bleiben auf deinem Rechner.',
    workflowTitle: 'So läuft es ab – Schritt für Schritt',
    workflowSub:   'Echte Screenshots aus dem Pilottest. Zum Vergrößern anklicken.',
    workflowCaptions: [
      'ZIP entpacken', 'Laufwerk wählen', 'GPT Vault kopiert', 'Start.bat auswählen',
      'E-Mail & ChatGPT-Konto eingeben', 'Integrierter Browser startet', 'Bei ChatGPT einloggen',
      'System liest alle GPTs aus', 'Details werden geladen', 'JSON-Dateien gespeichert',
    ],
    packagesTitle:   'Paket wählen',
    packagesSub:     'Wie viele Custom GPTs hast du?',
    packagesHint:    'Unsicher? Nimm Plus – reicht für die meisten.',
    packagesBadge:   'Beliebt',
    packagesUpTo:    'bis zu',
    packagesGpts:    'GPTs',
    packagesSelect:  'Wählen',
    packagesSelected:'✓ Ausgewählt',
    enterpriseDesc:  'Mehr als 20 GPTs? Wir finden gemeinsam die passende Lösung.',
    enterpriseCta:   'Anfrage senden →',
    checkoutSub:    'Du bekommst sofort deinen Aktivierungs-Code per E-Mail.\nDanach in 30 Sekunden freischalten und loslegen.',
    checkoutEmail:  'Deine E-Mail-Adresse',
    checkoutLoading:'Weiterleitung zu Stripe...',
    checkoutCta:    'Jetzt kaufen & Aktivierungs-Code erhalten',
    checkoutHint:   '🔒 Einmalkauf · kein Abo · sofort nutzbar · Zahlung via Stripe',
    checkoutError:  'Fehler beim Checkout – bitte erneut versuchen.',
    checkoutNoConn: 'Keine Verbindung – bitte erneut versuchen.',
    faqTitle: 'Häufige Fragen',
    faqSub:   'Besonders zu Datenschutz & Sicherheit.',
    faqItems: [
      { q: 'Welche Daten werden gespeichert?',           a: 'Nur deine E-Mail-Adresse für die Lizenzverwaltung. Deine ChatGPT-Daten werden ausschließlich lokal auf deinem PC gespeichert.' },
      { q: 'Was wird NICHT gespeichert?',                a: 'Dein ChatGPT-Passwort, deine GPT-Inhalte und deine Exporte. Diese Daten verlassen nie deinen Rechner.' },
      { q: 'Wo liegen die Exportdateien?',               a: 'Direkt auf deinem PC im Ordner, den du beim Start angibst. Keine Cloud, keine Synchronisation.' },
      { q: 'Braucht es API-Keys?',                       a: 'Nein. GPT Vault nutzt einen integrierten Browser – du loggst dich einmalig wie gewohnt in ChatGPT ein.' },
      { q: 'Windows oder Mac?',                          a: 'Windows & Mac werden unterstützt.' },
      { q: 'Kann ich mehrmals exportieren?',             a: 'Ja. Mit deiner Lizenz kannst du so oft exportieren wie du willst – das Paket definiert nur die maximale GPT-Anzahl pro Export.' },
      { q: 'Was passiert wenn mein Paket zu klein ist?', a: 'GPT Vault sichert die ersten N GPTs deines Pakets. Du kannst jederzeit ein größeres Paket kaufen.' },
    ],
    supportTitle:    'Hilfe & Support',
    supportSub:      'Du brauchst Unterstützung bei der Einrichtung? Ich helfe dir persönlich.',
    support1Title:   'Termin buchen',
    support1Desc:    'Kostenloses Erstgespräch oder Beratungstermin direkt online buchen.',
    support1Cta:     'Termin buchen →',
    support2Title:   'Geführte Session (TeamViewer)',
    support2Desc:    'Ich installiere und richte GPT Vault gemeinsam mit dir per TeamViewer ein – schnell, unkompliziert, persönlich.',
    support2Cta:     'Session anfragen →',
    support3Title:   'Kontakt',
    support3Desc:    'Fragen, Probleme oder Feedback – ich antworte persönlich.',
    support3Cta:     'Nachricht senden →',
    inquiryTeamviewer: '🖥️ Geführte Session anfragen',
    inquiryContact:    '✉️ Nachricht senden',
    inquiryEnterprise: '🏢 Enterprise-Anfrage',
    inquiryName:     'Dein Name',
    inquiryEmail:    'Deine E-Mail-Adresse *',
    inquiryMessage:  'Deine Nachricht (optional)',
    inquirySend:     'Anfrage senden',
    inquirySending:  'Wird gesendet...',
    inquiryCancel:   'Abbrechen',
    inquirySuccess:  '✅ Danke! Ich melde mich so schnell wie möglich bei dir.',
    aboutCompany: 'Dr. DirKInstitute',
    aboutDesc:    'KI-Beratung & Automatisierung für Selbstständige und kleine Teams.\nGPT Vault ist ein Produkt von Dr. DirKInstitute –\npraxisnah, lokal, ohne Cloud-Abhängigkeit.',
    aboutCta:     'GPT Vault anfragen →',
    aboutResp:    'Antwort in der Regel innerhalb von 24h',
    lightboxClose: '✕ Schließen',
    lightboxAlt:   'Vergrößerte Ansicht',
    projTitle:    'ChatGPT Projekte sichern',
    projSub:      'Wie viele Projekte hast du? Gib die Anzahl ein – der Preis wird automatisch berechnet.',
    projLabel:    'Anzahl deiner ChatGPT-Projekte',
    projPer:      '1,20 € pro Projekt',
    projTotal:    'Gesamtpreis:',
    projCta:      'Jetzt kaufen & Code erhalten',
    projLoading:  'Weiterleitung zu Stripe...',
    projHint:     '🔒 Einmalkauf · kein Abo · sofort nutzbar · Zahlung via Stripe',
    projError:    'Fehler beim Checkout – bitte erneut versuchen.',
    projNoConn:   'Keine Verbindung – bitte erneut versuchen.',
    projEmail:    'Deine E-Mail-Adresse',
  },
  en: {
    heroSub:  'Back up all your Custom GPTs – as JSON & Excel,\nlocally on your PC. Buy once, use forever.',
    heroWhy:  'Custom GPTs cannot be natively exported from ChatGPT. No backup, no overview, no versioning.\nAnyone managing multiple GPTs risks losing prompts, configurations and time without an export.',
    heroHint: 'GPT Vault creates a complete local backup + an Excel inventory list – fully automated.',
    featTitle1: 'Fully Automated',
    featDesc1:  'Runs locally, opens the login in the integrated browser and creates the export automatically.',
    featTitle2: 'Stored Locally',
    featDesc2:  'JSON + Excel on your PC. No cloud subscription, no dependency. Files stay on your machine.',
    featTitle3: 'Unlimited Use',
    featDesc3:  'Buy once – export as often as you like.',
    proofTitle:    'What your export looks like',
    proofSub:      'Real output – no mockups. Click to zoom.',
    proofLabel1:   '📊 Overview & Analysis',
    proofCaption1: 'Summary with statistics, completeness check and color-coded indicators.',
    proofLabel2:   '📋 Detail Table',
    proofCaption2: 'All GPTs with name, system prompt, actions, GPT ID and direct link.',
    proofZoom:     '🔍 Click to zoom',
    stepsTitle: 'Backed up in 3 steps',
    step1Title: 'Download & launch',
    step1Desc:  'After purchase you receive an activation code by email. Unzip, launch, enter the code – done.',
    step2Title: 'Log in via integrated browser',
    step2Desc:  'GPT Vault opens its own browser tab. Log in to ChatGPT once as usual.',
    step3Title: 'Export starts automatically',
    step3Desc:  'GPT Vault reads your GPTs and saves JSON + Excel locally on your PC.',
    trustNote:  '🔒 No ChatGPT password is stored or transmitted. No cloud sync. Files stay on your machine.',
    workflowTitle: 'How it works – step by step',
    workflowSub:   'Real screenshots from the pilot test. Click to zoom.',
    workflowCaptions: [
      'Unzip archive', 'Choose drive', 'GPT Vault copied', 'Select Start.bat',
      'Enter email & ChatGPT account', 'Integrated browser launches', 'Log in to ChatGPT',
      'System scans all GPTs', 'Loading GPT details', 'JSON files saved',
    ],
    packagesTitle:   'Choose your plan',
    packagesSub:     'How many Custom GPTs do you have?',
    packagesHint:    'Not sure? Go with Plus – works for most.',
    packagesBadge:   'Popular',
    packagesUpTo:    'up to',
    packagesGpts:    'GPTs',
    packagesSelect:  'Select',
    packagesSelected:'✓ Selected',
    enterpriseDesc:  "More than 20 GPTs? Let's find the right solution together.",
    enterpriseCta:   'Send inquiry →',
    checkoutSub:    "You'll receive your activation code by email immediately.\nUnlock in 30 seconds and get started.",
    checkoutEmail:  'Your email address',
    checkoutLoading:'Redirecting to Stripe...',
    checkoutCta:    'Buy now & receive activation code',
    checkoutHint:   '🔒 One-time purchase · no subscription · instant access · payment via Stripe',
    checkoutError:  'Checkout error – please try again.',
    checkoutNoConn: 'No connection – please try again.',
    faqTitle: 'Frequently Asked Questions',
    faqSub:   'Especially regarding privacy & security.',
    faqItems: [
      { q: 'What data is stored?',                   a: 'Only your email address for license management. Your ChatGPT data is stored exclusively locally on your PC.' },
      { q: 'What is NOT stored?',                    a: 'Your ChatGPT password, your GPT contents and your exports. This data never leaves your machine.' },
      { q: 'Where are the export files stored?',     a: 'Directly on your PC in the folder you specify at startup. No cloud, no sync.' },
      { q: 'Are API keys required?',                 a: 'No. GPT Vault uses an integrated browser – you log in to ChatGPT once as usual.' },
      { q: 'Windows or Mac?',                        a: 'Both Windows & Mac are supported.' },
      { q: 'Can I export multiple times?',           a: 'Yes. With your license you can export as often as you like – the plan only defines the maximum number of GPTs per export.' },
      { q: 'What if my plan is too small?',          a: 'GPT Vault backs up the first N GPTs of your plan. You can upgrade to a larger plan at any time.' },
    ],
    supportTitle:    'Help & Support',
    supportSub:      "Need help getting set up? I'll assist you personally.",
    support1Title:   'Book an appointment',
    support1Desc:    'Free initial consultation or advisory session – book directly online.',
    support1Cta:     'Book appointment →',
    support2Title:   'Guided Session (TeamViewer)',
    support2Desc:    'I install and configure GPT Vault together with you via TeamViewer – fast, easy, personal.',
    support2Cta:     'Request session →',
    support3Title:   'Contact',
    support3Desc:    'Questions, issues or feedback – I respond personally.',
    support3Cta:     'Send message →',
    inquiryTeamviewer: '🖥️ Request guided session',
    inquiryContact:    '✉️ Send message',
    inquiryEnterprise: '🏢 Enterprise inquiry',
    inquiryName:     'Your name',
    inquiryEmail:    'Your email address *',
    inquiryMessage:  'Your message (optional)',
    inquirySend:     'Send inquiry',
    inquirySending:  'Sending...',
    inquiryCancel:   'Cancel',
    inquirySuccess:  "✅ Thank you! I'll get back to you as soon as possible.",
    aboutCompany: 'Dr. DirKInstitute',
    aboutDesc:    'AI consulting & automation for freelancers and small teams.\nGPT Vault is a product by Dr. DirKInstitute –\npractical, local, without cloud dependency.',
    aboutCta:     'Contact GPT Vault →',
    aboutResp:    'Response usually within 24 hours',
    lightboxClose: '✕ Close',
    lightboxAlt:   'Enlarged view',
    projTitle:    'Back up ChatGPT Projects',
    projSub:      'How many projects do you have? Enter the number – the price is calculated automatically.',
    projLabel:    'Number of your ChatGPT Projects',
    projPer:      '€1.20 per Project',
    projTotal:    'Total:',
    projCta:      'Buy now & receive code',
    projLoading:  'Redirecting to Stripe...',
    projHint:     '🔒 One-time purchase · no subscription · instant access · payment via Stripe',
    projError:    'Checkout error – please try again.',
    projNoConn:   'No connection – please try again.',
    projEmail:    'Your email address',
  },
}

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

// ── Workflow Steps ────────────────────────────────────────────────────────────

const workflowSteps = [
  { file: 'Bild_1_Zip__alles_extrahieren.png',                              caption: 'ZIP entpacken' },
  { file: 'Bild_2_Laufwerk_wählen.png',                                     caption: 'Laufwerk wählen' },
  { file: 'Bild_3_GPT_VAULT_kopiert.png',                                   caption: 'GPT Vault kopiert' },
  { file: 'Bild_4_Ordner_öffnen_Start_bat auswählen.png',                   caption: 'Start.bat auswählen' },
  { file: 'Bild_5_Startbildchirm_email_chatgpt eingeben_.png',              caption: 'E-Mail & ChatGPT-Konto eingeben' },
  { file: 'Bild_6_int_browser wird geoeffnet.png',                          caption: 'Integrierter Browser startet' },
  { file: 'Bild_7_int_browser öffnent sich_einloggen chatgpt.png',          caption: 'Bei ChatGPT einloggen' },
  { file: 'Bild_8_system scrollt durch due cGPTs.png',                      caption: 'System liest alle GPTs aus' },
  { file: 'Bild_9_Laden der DEtails der cGPTS_.png',                        caption: 'Details werden geladen' },
  { file: 'Bild_10_json files der cGPTs im gewählten InstallationsOrdner.png', caption: 'JSON-Dateien gespeichert' },
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

  // Projects
  const [projectCount,   setProjectCount]   = useState(1)
  const [projectEmail,   setProjectEmail]   = useState('')
  const [projectLoading, setProjectLoading] = useState(false)
  const [projectError,   setProjectError]   = useState('')

  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'de'
    return (localStorage.getItem('gpt-vault-lang') as Lang) ?? 'de'
  })
  const t = translations[lang]

  function toggleLang(l: Lang) {
    setLang(l)
    localStorage.setItem('gpt-vault-lang', l)
  }

  const selectedPkg = packages.find((p) => p.id === selectedId)

  async function handleInquiry() {
    if (!inquiryEmail.trim() || !inquiryType) return
    setInquiryLoading(true)
    await trackInquiry(inquiryType, {
      name:    inquiryName,
      email:   inquiryEmail,
      message: inquiryMessage,
      lang,
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
        setError(data.error ?? t.checkoutError)
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      setError(t.checkoutNoConn)
      setLoading(false)
    }
  }

  async function handleBuyProjects() {
    if (!projectEmail.trim() || projectCount < 1) return
    setProjectLoading(true)
    setProjectError('')
    await trackInquiry('checkout_start', { email: projectEmail, packageId: 'projects', projectCount: String(projectCount) })
    try {
      const res = await fetch('/api/gpt-vault/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ packageId: 'projects', projectCount, email: projectEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setProjectError(data.error ?? t.projError)
        setProjectLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      setProjectError(t.projNoConn)
      setProjectLoading(false)
    }
  }

  const mainPackages      = packages.filter((p) => !p.contactOnly)
  const enterprisePackage = packages.find((p) => p.contactOnly)

  return (
    <main className={styles.page}>

      {/* ── Language Toggle ──────────────────────────────────────────── */}
      <div className={styles.langToggle}>
        <button
          className={lang === 'de' ? styles.langActive : styles.langBtn}
          onClick={() => toggleLang('de')}
        >🇩🇪 DE</button>
        <button
          className={lang === 'en' ? styles.langActive : styles.langBtn}
          onClick={() => toggleLang('en')}
        >🇬🇧 EN</button>
      </div>

      {/* ── Seiten-Wasserzeichen ─────────────────────────────────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-dirk.jpg"
        alt=""
        aria-hidden="true"
        className={styles.pageBgLogo}
      />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.logo}>
          <div className={styles.logoBox}>
            <span className={styles.logoIcon}>🔒</span>
            <span className={styles.logoText}>GPT Vault</span>
          </div>
          <div className={styles.logoBy}>by Dr. DirKInstitute</div>
        </div>
        <p className={styles.heroSub}>{t.heroSub}</p>
        <p className={styles.heroWhy}>{t.heroWhy}</p>
        <p className={styles.heroHint}>{t.heroHint}</p>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>⚡</span>
          <strong>{t.featTitle1}</strong>
          <p>{t.featDesc1}</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📁</span>
          <strong>{t.featTitle2}</strong>
          <p>{t.featDesc2}</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🔄</span>
          <strong>{t.featTitle3}</strong>
          <p>{t.featDesc3}</p>
        </div>
      </section>

      {/* ── Lightbox ────────────────────────────────────────────────── */}
      {lightboxSrc && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxSrc(null)}>
          <div className={styles.lightboxClose}>{t.lightboxClose}</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt={t.lightboxAlt}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Proof: Excel Screenshots ─────────────────────────────────── */}
      <section className={styles.proof}>
        <h2 className={styles.sectionTitle}>{t.proofTitle}</h2>
        <p className={styles.sectionSub}>{t.proofSub}</p>

        <div className={styles.proofGrid}>
          <div className={styles.proofItem}>
            <div className={styles.proofLabel}>{t.proofLabel1}</div>
            <button
              className={styles.proofImgBtn}
              onClick={() => setLightboxSrc('/screenshots/excel-overview.png')}
              title="Zum Vergrößern klicken"
            >
              <Image
                src="/screenshots/excel-overview.png"
                alt={t.proofLabel1}
                width={900}
                height={660}
                className={styles.proofImg}
              />
              <span className={styles.proofZoomHint}>{t.proofZoom}</span>
            </button>
            <p className={styles.proofCaption}>{t.proofCaption1}</p>
          </div>
          <div className={styles.proofItem}>
            <div className={styles.proofLabel}>{t.proofLabel2}</div>
            <button
              className={styles.proofImgBtn}
              onClick={() => setLightboxSrc('/screenshots/excel-detail.png')}
              title="Zum Vergrößern klicken"
            >
              <Image
                src="/screenshots/excel-detail.png"
                alt={t.proofLabel2}
                width={900}
                height={660}
                className={styles.proofImg}
              />
              <span className={styles.proofZoomHint}>{t.proofZoom}</span>
            </button>
            <p className={styles.proofCaption}>{t.proofCaption2}</p>
          </div>
        </div>
      </section>

      {/* ── 3-Schritte-Flow ─────────────────────────────────────────── */}
      <section className={styles.steps}>
        <h2 className={styles.sectionTitle}>{t.stepsTitle}</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <strong>{t.step1Title}</strong>
            <p>{t.step1Desc}</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <strong>{t.step2Title}</strong>
            <p>{t.step2Desc}</p>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <strong>{t.step3Title}</strong>
            <p>{t.step3Desc}</p>
          </div>
        </div>
        <p className={styles.trustNote}>{t.trustNote}</p>
      </section>

      {/* ── Workflow-Galerie ─────────────────────────────────────────── */}
      <section className={styles.workflow}>
        <h2 className={styles.sectionTitle}>{t.workflowTitle}</h2>
        <p className={styles.sectionSub}>{t.workflowSub}</p>
        <div className={styles.workflowGrid}>
          {workflowSteps.map((step, i) => (
            <button
              key={i}
              className={styles.workflowItem}
              onClick={() => setLightboxSrc(`/screenshots/Workflow/${encodeURIComponent(step.file)}`)}
              title="Zum Vergrößern klicken"
            >
              <div className={styles.workflowStepBadge}>{i + 1}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/screenshots/Workflow/${encodeURIComponent(step.file)}`}
                alt={t.workflowCaptions[i]}
                className={styles.workflowImg}
                loading="lazy"
              />
              <div className={styles.workflowCaption}>{t.workflowCaptions[i]}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Pakete ──────────────────────────────────────────────────── */}
      <section className={styles.packages}>
        <h2 className={styles.sectionTitle}>{t.packagesTitle}</h2>
        <p className={styles.sectionSub}>
          {t.packagesSub}&nbsp;
          <span className={styles.sectionHint}>{t.packagesHint}</span>
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
              {pkg.highlight && <div className={styles.badge}>{t.packagesBadge}</div>}
              <div className={styles.cardName}>{pkg.name}</div>
              <div className={styles.cardGpts}>{t.packagesUpTo} {pkg.gpts} {t.packagesGpts}</div>
              <div className={styles.cardPrice}>{formatPrice(pkg.priceCents!)}</div>
              <div className={styles.cardSelect}>
                {selectedId === pkg.id ? t.packagesSelected : t.packagesSelect}
              </div>
            </div>
          ))}
        </div>

        {enterprisePackage && (
          <div className={styles.enterpriseRow}>
            <div className={styles.enterpriseCard}>
              <div className={styles.enterpriseName}>Enterprise</div>
              <div className={styles.enterpriseDesc}>{t.enterpriseDesc}</div>
              <button
                className={styles.enterpriseLink}
                onClick={() => openInquiry('enterprise')}
              >
                {t.enterpriseCta}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── ChatGPT Projekte ─────────────────────────────────────────── */}
      <section className={styles.packages}>
        <h2 className={styles.sectionTitle}>{t.projTitle}</h2>
        <p className={styles.sectionSub}>{t.projSub}</p>

        <div className={styles.projectBox}>
          <label className={styles.projectLabel}>
            {t.projLabel}
            <span className={styles.projectPer}>{t.projPer}</span>
          </label>
          <div className={styles.projectRow}>
            <button
              className={styles.projectStep}
              onClick={() => setProjectCount((n) => Math.max(1, n - 1))}
              aria-label="Weniger"
            >−</button>
            <input
              type="number"
              min={1}
              max={500}
              value={projectCount}
              onChange={(e) => setProjectCount(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
              className={styles.projectInput}
            />
            <button
              className={styles.projectStep}
              onClick={() => setProjectCount((n) => Math.min(500, n + 1))}
              aria-label="Mehr"
            >+</button>
          </div>
          <div className={styles.projectTotal}>
            {t.projTotal}&nbsp;
            <strong>{((projectCount * 120) / 100).toFixed(2).replace('.', ',')} €</strong>
          </div>

          <input
            type="email"
            placeholder={t.projEmail}
            value={projectEmail}
            onChange={(e) => setProjectEmail(e.target.value)}
            className={styles.emailInput}
            style={{ marginTop: '16px' }}
            onKeyDown={(e) => e.key === 'Enter' && handleBuyProjects()}
          />
          {projectError && <p className={styles.error}>{projectError}</p>}
          <button
            className={styles.buyButton}
            onClick={handleBuyProjects}
            disabled={projectLoading || !projectEmail.trim() || projectCount < 1}
          >
            {projectLoading ? t.projLoading : t.projCta}
          </button>
          <p className={styles.checkoutHint}>{t.projHint}</p>
        </div>
      </section>

      {/* ── Checkout ────────────────────────────────────────────────── */}
      {selectedPkg && (
        <section className={styles.checkout}>
          <h2 className={styles.checkoutTitle}>
            {selectedPkg.name} – {formatPrice(selectedPkg.priceCents!)}
          </h2>
          <p className={styles.checkoutSub}>{t.checkoutSub}</p>
          <input
            type="email"
            placeholder={t.checkoutEmail}
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
            {loading ? t.checkoutLoading : t.checkoutCta}
          </button>
          <p className={styles.checkoutHint}>{t.checkoutHint}</p>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className={styles.faq}>
        <h2 className={styles.sectionTitle}>{t.faqTitle}</h2>
        <p className={styles.sectionSub}>{t.faqSub}</p>
        <div className={styles.faqList}>
          {t.faqItems.map((item, i) => (
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
      <section className={styles.support} id="support-section">
        <h2 className={styles.sectionTitle}>{t.supportTitle}</h2>
        <p className={styles.sectionSub}>{t.supportSub}</p>

        <div className={styles.supportGrid}>

          <div className={styles.supportCard}>
            <div className={styles.supportIcon}>📅</div>
            <strong>{t.support1Title}</strong>
            <p>{t.support1Desc}</p>
            <a
              href="https://dkoetting.github.io/terminbuchung/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.supportLink}
              onClick={() => trackInquiry('booking_click', {})}
            >
              {t.support1Cta}
            </a>
          </div>

          <div className={styles.supportCard}>
            <div className={styles.supportIcon}>🖥️</div>
            <strong>{t.support2Title}</strong>
            <p>
              {t.support2Desc}<br />
              <span className={styles.supportPrice}>19,90 €</span>
            </p>
            <button
              className={styles.supportLink}
              onClick={() => openInquiry('teamviewer')}
            >
              {t.support2Cta}
            </button>
          </div>

          <div className={styles.supportCard}>
            <div className={styles.supportIcon}>✉️</div>
            <strong>{t.support3Title}</strong>
            <p>{t.support3Desc}</p>
            <button
              className={styles.supportLink}
              onClick={() => openInquiry('contact')}
            >
              {t.support3Cta}
            </button>
          </div>

        </div>

        {inquiryType && !inquirySent && (
          <div className={styles.inquiryForm}>
            <h3 className={styles.inquiryTitle}>
              {inquiryType === 'teamviewer' && t.inquiryTeamviewer}
              {inquiryType === 'contact'    && t.inquiryContact}
              {inquiryType === 'enterprise' && t.inquiryEnterprise}
            </h3>
            <input
              type="text"
              placeholder={t.inquiryName}
              value={inquiryName}
              onChange={(e) => setInquiryName(e.target.value)}
              className={styles.emailInput}
            />
            <input
              type="email"
              placeholder={t.inquiryEmail}
              value={inquiryEmail}
              onChange={(e) => setInquiryEmail(e.target.value)}
              className={styles.emailInput}
            />
            <textarea
              placeholder={t.inquiryMessage}
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
                {inquiryLoading ? t.inquirySending : t.inquirySend}
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setInquiryType(null)}
              >
                {t.inquiryCancel}
              </button>
            </div>
          </div>
        )}

        {inquirySent && (
          <div className={styles.inquirySuccess}>
            {t.inquirySuccess}
          </div>
        )}

      </section>

      {/* ── Über den Entwickler ──────────────────────────────────────── */}
      <section className={styles.about}>
        <div className={styles.aboutInner}>
          <Image
            src="/logo.svg"
            alt="Dr. DirKInstitute" unoptimized
            width={72}
            height={72}
            className={styles.aboutLogo}
          />
          <div className={styles.aboutText}>
            <strong>{t.aboutCompany}</strong>
            <p>{t.aboutDesc}</p>
          </div>
          <div className={styles.aboutContact}>
            <button
              className={styles.aboutContactBtn}
              onClick={() => {
                openInquiry('contact')
                document.getElementById('support-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {t.aboutCta}
            </button>
            <span className={styles.aboutResponse}>{t.aboutResp}</span>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <p>© 2026 Dr. DirKInstitute · <a href="mailto:dr-dirk@dr-dirkinstitute.org">dr-dirk@dr-dirkinstitute.org</a> · {lang === 'de' ? 'Bayern, Deutschland' : 'Bavaria, Germany'}</p>
      </footer>

    </main>
  )
}
