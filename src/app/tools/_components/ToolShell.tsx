import Image from 'next/image'
import Link from 'next/link'
import styles from '../tools.module.css'

interface ToolShellProps {
  children: React.ReactNode
}

export default function ToolShell({ children }: ToolShellProps) {
  return (
    <div className={styles.toolPage}>
      <header className={styles.header}>
        <Image
          src="/kn-logo.png"
          alt="K&N EDV-Konzepte"
          width={120}
          height={32}
          className={styles.headerLogo}
          priority
        />
        <div className={styles.headerBrand}>
          <span className={styles.headerBrandName}>Dr. DirkInstitute</span>
          <span className={styles.headerBrandSub}>Board Risk &amp; AI Governance</span>
        </div>
        <Image
          src="/logo-dirk.jpg"
          alt="Dr. DirKInstitute"
          width={90}
          height={32}
          className={styles.headerLogo}
          priority
        />
      </header>

      <div className={styles.backWrap}>
        <Link href="/" className={styles.back}>← Zurück zur Übersicht</Link>
      </div>

      <main className={styles.content}>
        {children}
      </main>

      <footer className={styles.footer}>
        <p>K &amp; N EDV-Konzepte GmbH | Dr. DirKInstitute · Flurweg 14 · 83646 Bad Tölz · dkoetting@edvkonzepte.de</p>
      </footer>
    </div>
  )
}
