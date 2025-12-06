import { getServices } from '@/lib/cms'
import { NextRequest } from 'next/server'
import { checkApiRateLimit, getClientIp } from '@/lib/rate-limit'

type Locale = 'fr' | 'en'

// Désactiver le cache Next.js pour cette route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const GET = async (request: NextRequest) => {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimit = checkApiRateLimit(ip)
    
    if (!rateLimit.success) {
      return Response.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const localeParam = searchParams.get('locale')
    const locale: Locale = (localeParam === 'en' || localeParam === 'fr') ? localeParam : 'fr'
    const services = await getServices(locale)
    
    // Headers pour empêcher le cache navigateur
    return Response.json(services, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return Response.json([], { status: 500 })
  }
}
