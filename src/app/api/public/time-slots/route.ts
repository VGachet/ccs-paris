import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCached, setCache } from '@/lib/api-cache'
import { checkTimeSlotsRateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * API pour gérer les créneaux horaires
 * 
 * GET: Récupère les créneaux disponibles pour une période donnée
 * Query params:
 *   - startDate: Date de début (format ISO)
 *   - endDate: Date de fin (format ISO)
 *   - includeBlocked: Inclure les créneaux bloqués (pour l'admin)
 */

// Créneaux horaires par défaut (tranches de 2h)
const DEFAULT_TIME_SLOTS = [
  { startTime: '09:00', endTime: '11:00' },
  { startTime: '11:00', endTime: '13:00' },
  { startTime: '13:00', endTime: '15:00' },
  { startTime: '15:00', endTime: '17:00' },
  { startTime: '17:00', endTime: '19:00' },
]

// Limiter la période à 30 jours max pour réduire la charge
const MAX_DAYS = 30

// Interface pour les créneaux
interface TimeSlotDoc {
  id: string
  date: string
  startTime: string
  endTime: string
  status: 'available' | 'blocked' | 'pending' | 'confirmed'
  bookingId?: { id: string } | string | null
  notes?: string
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting spécifique (plus strict car génération CPU intensive)
    const ip = getClientIp(request)
    const rateLimit = checkTimeSlotsRateLimit(ip)
    
    if (!rateLimit.success) {
      return Response.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const includeBlocked = searchParams.get('includeBlocked') === 'true'

    // Par défaut, on récupère les 30 prochains jours
    const startDate = startDateParam 
      ? new Date(startDateParam) 
      : new Date()
    
    let endDate = endDateParam 
      ? new Date(endDateParam) 
      : new Date(Date.now() + MAX_DAYS * 24 * 60 * 60 * 1000)

    // S'assurer que la date de début est au minimum aujourd'hui
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (startDate < today) {
      startDate.setTime(today.getTime())
    }

    // Limiter la période à MAX_DAYS jours pour réduire la charge CPU
    const maxEndDate = new Date(startDate.getTime() + MAX_DAYS * 24 * 60 * 60 * 1000)
    if (endDate > maxEndDate) {
      endDate = maxEndDate
    }

    // Créer une clé de cache basée sur les dates (arrondi au jour)
    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]
    const cacheKey = `time-slots:${startStr}:${endStr}:${includeBlocked}`
    
    const cached = getCached<{ slots: unknown[]; period: unknown }>(cacheKey)
    if (cached) return Response.json(cached)

    const payload = await getPayload({ config: configPromise })

    // Récupérer les créneaux existants dans la base de données
    const existingSlots = await (payload as any).find({
      collection: 'time-slots',
      where: {
        and: [
          {
            date: {
              greater_than_equal: startDate.toISOString().split('T')[0],
            },
          },
          {
            date: {
              less_than_equal: endDate.toISOString().split('T')[0],
            },
          },
        ],
      },
      limit: 500,
      sort: 'date',
    })

    // Créer un map des créneaux existants pour un accès rapide
    const existingSlotsMap = new Map<string, TimeSlotDoc>()
    for (const slot of existingSlots.docs as unknown as TimeSlotDoc[]) {
      const key = `${slot.date}_${slot.startTime}`
      existingSlotsMap.set(key, slot)
    }

    // Générer tous les créneaux possibles pour la période
    const allSlots: Array<{
      id: string | null
      date: string
      startTime: string
      endTime: string
      status: 'available' | 'blocked' | 'pending' | 'confirmed'
      bookingId?: string | null
    }> = []

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      for (const timeSlot of DEFAULT_TIME_SLOTS) {
        const key = `${dateStr}_${timeSlot.startTime}`
        const existingSlot = existingSlotsMap.get(key)

        if (existingSlot) {
          // Si le créneau existe dans la DB, utiliser son statut
          if (includeBlocked || existingSlot.status !== 'blocked') {
            allSlots.push({
              id: String(existingSlot.id),
              date: dateStr,
              startTime: timeSlot.startTime,
              endTime: timeSlot.endTime,
              status: existingSlot.status,
              bookingId: existingSlot.bookingId 
                ? (typeof existingSlot.bookingId === 'object' 
                    ? String(existingSlot.bookingId.id) 
                    : String(existingSlot.bookingId))
                : null,
            })
          }
        } else {
          // Sinon, le créneau est disponible par défaut
          allSlots.push({
            id: null,
            date: dateStr,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
            status: 'available',
            bookingId: null,
          })
        }
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Filtrer les créneaux passés pour aujourd'hui
    const now = new Date()
    const currentHour = now.getHours()
    const todayStr = now.toISOString().split('T')[0]

    const filteredSlots = allSlots.filter(slot => {
      if (slot.date === todayStr) {
        const slotHour = parseInt(slot.startTime.split(':')[0], 10)
        return slotHour > currentHour + 1 // Au moins 1h avant le créneau
      }
      return true
    })

    const result = {
      slots: filteredSlots,
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
    }

    setCache(cacheKey, result)
    return Response.json(result)
  } catch (error) {
    console.error('Error fetching time slots:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/**
 * POST: Bloquer/débloquer un créneau (admin uniquement)
 * 
 * ⚠️ SÉCURITÉ: Cette route est désactivée dans l'API publique.
 * Utilisez l'interface admin Payload pour gérer les créneaux.
 * 
 * Body:
 *   - date: Date du créneau
 *   - startTime: Heure de début
 *   - status: 'available' | 'blocked'
 *   - notes: Notes (optionnel)
 */
export async function POST(_request: NextRequest) {
  // Cette API publique ne doit PAS permettre de modifier les créneaux
  // Les modifications doivent passer par l'admin Payload authentifié
  return Response.json(
    { error: 'Non autorisé. Utilisez l\'interface admin pour gérer les créneaux.' },
    { status: 403 }
  )
}
