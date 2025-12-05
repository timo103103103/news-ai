const store: Map<string, { value: any; expires: number }> = new Map()
const defaultTtlMs = Number(process.env.CACHE_TTL_MS || 5 * 60 * 1000)

export async function cacheGet(key: string): Promise<any | null> {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    store.delete(key)
    return null
  }
  return entry.value
}

export async function cacheSet(key: string, value: any, ttlMs = defaultTtlMs) {
  store.set(key, { value, expires: Date.now() + ttlMs })
}