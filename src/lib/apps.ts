import appsConfig from '@/config/apps.json'

export type AppDefinition = {
  id: string
  name: string
  description?: string
  oneTimePriceCents: number
  accessUrl: string
}

type AppConfigItem = {
  id: string
  name: string
  description?: string
  oneTimePriceCents: number
  accessUrlEnv?: string
  defaultAccessUrl: string
}

function resolveAccessUrl(item: AppConfigItem): string {
  if (item.accessUrlEnv) {
    const fromEnv = process.env[item.accessUrlEnv]
    if (fromEnv && fromEnv.trim().length > 0) return fromEnv
  }
  return item.defaultAccessUrl
}

export function getAvailableApps(): AppDefinition[] {
  return (appsConfig as AppConfigItem[]).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    oneTimePriceCents: item.oneTimePriceCents,
    accessUrl: resolveAccessUrl(item),
  }))
}

export function findAppById(appId: string): AppDefinition | undefined {
  return getAvailableApps().find((app) => app.id === appId)
}

export function formatPriceEur(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' EUR einmalig'
}
