const DEFAULT_GPT_VAULT_PROJECT_DOWNLOAD_URL =
  'https://drive.google.com/file/d/1z1vikYmojHD3n29YXJgkW9bwpDG4KH1K/view?usp=sharing'

export function getGptVaultProjectDownloadUrl(): string {
  const envUrl =
    process.env.GPT_VAULT_PROJECT_DOWNLOAD_URL?.trim() ||
    process.env.NEXT_PUBLIC_GPT_VAULT_PROJECT_DOWNLOAD_URL?.trim()

  return envUrl || DEFAULT_GPT_VAULT_PROJECT_DOWNLOAD_URL
}
