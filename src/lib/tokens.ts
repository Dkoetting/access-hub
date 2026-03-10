import { createHmac, createHash, randomBytes } from 'crypto'

export function generatePlainToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

export function signHubSession(payload: Record<string, unknown>, expiresInSeconds = 900): string {
  const secret = process.env.HUB_SIGNING_SECRET
  if (!secret) {
    throw new Error('Missing HUB_SIGNING_SECRET')
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = { ...payload, iat: now, exp: now + expiresInSeconds }

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedBody = base64url(JSON.stringify(body))
  const unsigned = `${encodedHeader}.${encodedBody}`

  const signature = createHmac('sha256', secret).update(unsigned).digest('base64url')
  return `${unsigned}.${signature}`
}
