export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return ''
  }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dance-api-omega.vercel.app'
  return base.replace(/\/$/, '')
}

export function apiUrl(path: string): string {
  const base = getApiBase()
  const clean = path.replace(/^\/?/, '')
  return `${base}/api/${clean}`
}

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(apiUrl(path), init)
}
