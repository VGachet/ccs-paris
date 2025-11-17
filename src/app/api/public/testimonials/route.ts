import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'fr'

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

    return NextResponse.json(formattedTestimonials)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json([], { status: 500 })
  }
}
