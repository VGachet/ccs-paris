import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getPageData(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const pages = await payload.find({
      collection: 'pages' as any,
      where: {
        slug: {
          equals: slug,
        },
      },
    })
    return pages.docs[0] || null
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export async function getBlogPosts() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'blog' as any,
      sort: '-publishedAt',
      limit: 10,
    })
    return posts.docs || []
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'blog' as any,
      where: {
        slug: {
          equals: slug,
        },
      },
    })
    return posts.docs[0] || null
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export async function getServices() {
  try {
    const payload = await getPayload({ config: configPromise })
    const services = await payload.find({
      collection: 'services' as any,
      limit: 50,
    })
    return services.docs || []
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export async function getFeatures() {
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
    })
    return features.docs || []
  } catch (error) {
    console.error('Error fetching features:', error)
    return []
  }
}
