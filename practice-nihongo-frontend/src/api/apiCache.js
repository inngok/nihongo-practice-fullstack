const cache = new Map();

export async function cachedFetch(key, fetcher, ttlMs = 60_000) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now < cached.expiresAt) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, expiresAt: now + ttlMs });
  return data;
}


export function invalidateCache(keyOrPrefix) {
  for (const key of cache.keys()) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
      cache.delete(key);
    }
  }
}

/** Xóa toàn bộ cache */
export function clearAllCache() {
  cache.clear();
}
