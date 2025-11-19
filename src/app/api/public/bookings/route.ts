import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

interface BookingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  service: string
  date: string
  message: string
  locale: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, service, date, message } = body as BookingData

    const payload = await getPayload({ config: configPromise })

    // Créer la réservation en base
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        firstName,
        lastName,
        email,
        phone,
        service,
        date,
        message,
        status: 'pending',
      },
    })

    // TODO: Envoyer email au client
    // TODO: Envoyer notification à l'admin

    return Response.json({
      success: true,
      bookingId: booking.id,
      message: 'Réservation envoyée avec succès',
    })
  } catch (error) {
    console.error('Booking error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 400 }
    )
  }
}
