import { getFeatures } from '@/lib/cms'
import { NextRequest } from 'next/server'
import { checkApiRateLimit, getClientIp } from '@/lib/rate-limit'

type Locale = 'fr' | 'en'

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
    const features = await getFeatures(locale)
    return Response.json(features)
  } catch (error) {
    console.error('Error:', error)
    return Response.json([], { status: 500 })
  }
}
