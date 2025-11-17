import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get('slug')
  const locale = searchParams.get('locale') || 'fr'

  const payload = await getPayload({ config })

  try {
    if (slug) {
      // Fetch a single legal page by slug
      const result = await payload.find({
        collection: 'legal-pages',
        where: {
          slug: {
            equals: slug,
          },
        },
        locale: locale as 'fr' | 'en',
        limit: 1,
      })

      if (result.docs.length === 0) {
        return NextResponse.json({ error: 'Legal page not found' }, { status: 404 })
      }

      return NextResponse.json(result.docs[0])
    } else {
      // Fetch all legal pages
      const result = await payload.find({
        collection: 'legal-pages',
        locale: locale as 'fr' | 'en',
      })

      return NextResponse.json(result.docs)
    }
  } catch (error) {
    console.error('Error fetching legal pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
