// Configuration du rate limiting
const BOOKING_RATE_LIMIT = 5 // requêtes max
const BOOKING_RATE_WINDOW = 60 * 1000 // 1 minute en ms

const MEDIA_RATE_LIMIT = 10 // requêtes max
const MEDIA_RATE_WINDOW = 60 * 1000 // 1 minute en ms

// Rate limit pour les API GET publiques (plus permissif)
const API_RATE_LIMIT = 60 // requêtes max
const API_RATE_WINDOW = 60 * 1000 // 1 minute en ms

// Rate limit pour les time-slots (protection CPU)
const TIME_SLOTS_RATE_LIMIT = 30 // requêtes max
const TIME_SLOTS_RATE_WINDOW = 60 * 1000 // 1 minute en ms

// Store en mémoire pour le rate limiting
interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Nettoyer les anciennes entrées périodiquement
function cleanupStore(): void {
  const now = Date.now()
  if (rateLimitStore.size > 10000) {
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

// Fonction générique de rate limiting
function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  cleanupStore()

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 }
  }

  record.count++
  return { success: true, remaining: maxRequests - record.count }
}

/**
 * Vérifie le rate limit pour les réservations
 */
export function checkBookingRateLimit(
  ip: string
): { success: boolean; remaining: number } {
  return checkRateLimit(`booking:${ip}`, BOOKING_RATE_LIMIT, BOOKING_RATE_WINDOW)
}

/**
 * Vérifie le rate limit pour les uploads média
 */
export function checkMediaRateLimit(
  ip: string
): { success: boolean; remaining: number } {
  return checkRateLimit(`media:${ip}`, MEDIA_RATE_LIMIT, MEDIA_RATE_WINDOW)
}

/**
 * Vérifie le rate limit pour les API GET publiques (services, features, etc.)
 */
export function checkApiRateLimit(
  ip: string
): { success: boolean; remaining: number } {
  return checkRateLimit(`api:${ip}`, API_RATE_LIMIT, API_RATE_WINDOW)
}

/**
 * Vérifie le rate limit pour les time-slots (protection CPU - génération intensive)
 */
export function checkTimeSlotsRateLimit(
  ip: string
): { success: boolean; remaining: number } {
  return checkRateLimit(`time-slots:${ip}`, TIME_SLOTS_RATE_LIMIT, TIME_SLOTS_RATE_WINDOW)
}

/**
 * Extrait l'IP du client depuis les headers de la requête
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }
  return request.headers.get('x-real-ip') || 'unknown'
}
