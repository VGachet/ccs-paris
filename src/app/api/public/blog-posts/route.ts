import { getBlogPosts } from '@/lib/cms'
import { NextRequest } from 'next/server'

type Locale = 'fr' | 'en'

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const localeParam = searchParams.get('locale')
    const locale: Locale = (localeParam === 'en' || localeParam === 'fr') ? localeParam : 'fr'
    const posts = await getBlogPosts(locale)
    return Response.json(posts)
  } catch (error) {
    console.error('Error:', error)
    return Response.json([], { status: 500 })
  }
}
