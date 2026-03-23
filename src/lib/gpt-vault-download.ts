const DEFAULT_GPT_VAULT_DOWNLOAD_URL =
  'https://drive.google.com/file/d/18PZglAS1aIKkPkeFQBTocBeXY0zhuu5B/view?usp=sharing'

export function getGptVaultDownloadUrl(): string {
  const envUrl =
    process.env.GPT_VAULT_DOWNLOAD_URL?.trim() ||
    process.env.NEXT_PUBLIC_GPT_VAULT_DOWNLOAD_URL?.trim()

  return envUrl || DEFAULT_GPT_VAULT_DOWNLOAD_URL
}
