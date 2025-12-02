import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * API pour récupérer les paramètres publics du site
 * 
 * GET: Récupère les paramètres du site (réduction services, etc.)
 */

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })

    const settings = await payload.findGlobal({
      slug: 'site-settings',
    })

    // Retourner uniquement les paramètres publics nécessaires
    return Response.json({
      additionalServiceDiscount: settings.additionalServiceDiscount ?? 20,
    })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return Response.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}
