import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const POST = async (request: Request) => {
  try {
    const data = await request.json()
    const payload = await getPayload({ config: configPromise })

    // Créer la réservation en base
    const booking = await payload.create({
      collection: 'bookings' as any,
      data: {
        ...data,
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
