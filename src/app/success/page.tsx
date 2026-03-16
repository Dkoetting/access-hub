import { Suspense } from 'react'
import SuccessContent from './SuccessContent'

export default function SuccessPage() {
  return (
    <main className="center">
      <Suspense fallback={<div className="card"><p>Lädt…</p></div>}>
        <SuccessContent />
      </Suspense>
    </main>
  )
}
