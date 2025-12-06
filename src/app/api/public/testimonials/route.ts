import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getCached, setCache } from '@/lib/api-cache'
import { checkApiRateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimit = checkApiRateLimit(ip)
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'fr'

    // Vérifier le cache
    const cacheKey = `testimonials:${locale}`
    const cached = getCached<unknown[]>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const payload = await getPayload({ config })

    const testimonials = await payload.find({
      collection: 'testimonials',
      locale: locale as 'fr' | 'en',
      where: {
        and: [
          {
            isApproved: {
              equals: true,
            },
          },
          {
            isActive: {
              equals: true,
            },
          },
        ],
      },
      sort: 'order',
      limit: 100,
    })

    const formattedTestimonials = testimonials.docs.map((testimonial) => ({
      id: testimonial.id,
      customerName: testimonial.customerName,
      customerTitle: testimonial.customerTitle,
      customerAvatar: testimonial.customerAvatar,
      content: testimonial.content,
      rating: testimonial.rating,
      date: testimonial.date,
      order: testimonial.order,
    }))

    setCache(cacheKey, formattedTestimonials)
    return NextResponse.json(formattedTestimonials)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json([], { status: 500 })
  }
}
