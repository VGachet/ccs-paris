/**
 * Système de cache en mémoire pour les API publiques
 * Avec invalidation automatique via Payload hooks
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

// TTL par défaut : 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000

/**
 * Récupérer une valeur du cache
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null

  // Vérifier si le cache a expiré
  if (Date.now() - entry.timestamp > DEFAULT_TTL) {
    cache.delete(key)
    return null
  }

  return entry.data
}

/**
 * Stocker une valeur dans le cache
 */
export function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })

  // Nettoyer le cache si trop d'entrées (éviter fuite mémoire)
  if (cache.size > 200) {
    cleanupExpiredCache()
  }
}

/**
 * Invalider le cache par pattern
 * @param pattern - Si fourni, supprime les entrées contenant ce pattern. Sinon, vide tout le cache.
 */
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    console.log('🗑️ Cache entièrement vidé')
    return
  }

  let count = 0
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
      count++
    }
  }

  if (count > 0) {
    console.log(`🗑️ Cache invalidé: ${count} entrée(s) pour "${pattern}"`)
  }
}

/**
 * Nettoyer les entrées expirées du cache
 */
function cleanupExpiredCache(): void {
  const now = Date.now()
  let cleaned = 0

  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > DEFAULT_TTL) {
      cache.delete(key)
      cleaned++
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cache nettoyé: ${cleaned} entrée(s) expirée(s)`)
  }
}

/**
 * Obtenir des statistiques sur le cache (pour debug)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  }
}
