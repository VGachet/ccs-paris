import { getFeatures } from '@/lib/cms'
import { NextRequest } from 'next/server'

type Locale = 'fr' | 'en'

export const GET = async (request: NextRequest) => {
  try {
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
