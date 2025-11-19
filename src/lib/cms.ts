import { getPayload } from 'payload'
import configPromise from '@payload-config'

type Locale = 'fr' | 'en' | 'all'

export async function getPageData(slug: string, locale: Locale = 'fr') {
  try {
    const payload = await getPayload({ config: configPromise })
    const pages = await payload.find({
      collection: 'pages' as any,
      where: {
        slug: {
          equals: slug,
        },
      },
      locale,
    })
    return pages.docs[0] || null
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export async function getBlogPosts(locale: Locale = 'fr') {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'blog' as any,
      sort: '-publishedAt',
      limit: 10,
      locale,
    })
    return posts.docs || []
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

export async function getBlogPostBySlug(slug: string, locale: Locale = 'fr') {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'blog' as any,
      where: {
        slug: {
          equals: slug,
        },
      },
      locale,
    })
    return posts.docs[0] || null
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export async function getServices(locale: Locale = 'fr') {
  try {
    const payload = await getPayload({ config: configPromise })
    const services = await payload.find({
      collection: 'services' as any,
      limit: 50,
      sort: 'order',
      locale,
    })
    return services.docs || []
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export async function getFeatures(locale: Locale = 'fr') {
  try {
    const payload = await getPayload({ config: configPromise })
    const features = await payload.find({
      collection: 'features' as any,
      where: {
        isActive: {
          equals: true,
        },
      },
      sort: 'order',
      limit: 50,
      locale,
    })
    return features.docs || []
  } catch (error) {
    console.error('Error fetching features:', error)
    return []
  }
}

export async function getSiteSettings(locale: Locale = 'fr') {
  try {
    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({
      slug: 'site-settings' as any,
      locale,
    })
    return settings || null
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}
