import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCached, setCache } from '@/lib/api-cache'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'fr'

    // Vérifier le cache
    const cacheKey = `promotions:${locale}`
    const cached = getCached<{ promotion: unknown }>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const payload = await getPayload({ config: configPromise })

    const promotions = await payload.find({
      collection: 'promotions',
      locale: locale as 'fr' | 'en',
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 1,
      sort: '-updatedAt',
    })

    const activePromo = promotions.docs[0]

    // Vérifier les dates si elles existent
    if (activePromo) {
      const now = new Date()
      
      if (activePromo.startDate && new Date(activePromo.startDate) > now) {
        const result = { promotion: null }
        setCache(cacheKey, result)
        return NextResponse.json(result)
      }
      
      if (activePromo.endDate && new Date(activePromo.endDate) < now) {
        const result = { promotion: null }
        setCache(cacheKey, result)
        return NextResponse.json(result)
      }
    }

    const result = { promotion: activePromo || null }
    setCache(cacheKey, result)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching active promotion:', error)
    return NextResponse.json({ promotion: null }, { status: 500 })
  }
}
