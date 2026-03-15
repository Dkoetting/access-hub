import RegisterForm from '@/components/register-form'
import { getAvailableApps } from '@/lib/apps'

export default function Home() {
  const apps = getAvailableApps().map((app) => ({
    id: app.id,
    name: app.name,
    description: app.description,
    oneTimePriceCents: app.oneTimePriceCents,
    redirectUrl: app.redirectUrl,
  }))

  return (
    <main className="center">
      <RegisterForm apps={apps} />
    </main>
  )
}
