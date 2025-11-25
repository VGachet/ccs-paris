import { NextResponse, NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'fr'

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
        return NextResponse.json({ promotion: null })
      }
      
      if (activePromo.endDate && new Date(activePromo.endDate) < now) {
        return NextResponse.json({ promotion: null })
      }
    }

    return NextResponse.json({ 
      promotion: activePromo || null 
    })
  } catch (error) {
    console.error('Error fetching active promotion:', error)
    return NextResponse.json({ promotion: null }, { status: 500 })
  }
}
