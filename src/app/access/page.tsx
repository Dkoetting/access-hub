import AccessPageClient from '@/components/access-page-client'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AccessPage({ searchParams }: Props) {
  const params = await searchParams
  const raw = params.token
  const token = typeof raw === 'string' ? raw : ''

  return <AccessPageClient token={token} />
}
