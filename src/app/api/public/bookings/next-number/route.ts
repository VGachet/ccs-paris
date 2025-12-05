import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { checkBookingRateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimit = checkBookingRateLimit(ip)
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.' },
        { status: 429 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Trouver le dernier numéro de réservation
    const lastBooking = await payload.find({
      collection: 'bookings',
      sort: '-bookingNumber',
      limit: 1,
    })

    // Incrémenter le numéro ou commencer à 1
    const lastNumber = lastBooking.docs[0]?.bookingNumber || 0
    const nextNumber = (lastNumber as number) + 1

    return NextResponse.json({
      success: true,
      nextBookingNumber: nextNumber,
    })
  } catch (error) {
    console.error('Erreur lors de la génération du numéro de réservation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du numéro.' },
      { status: 500 }
    )
  }
}
