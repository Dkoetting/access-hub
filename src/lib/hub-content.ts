import content from '@/config/hub-content.json'

type HubContent = typeof content

export function getHubContent(): HubContent {
  return content
}

export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((acc, [key, value]) => {
    return acc.replaceAll(`{${key}}`, String(value))
  }, template)
}
