import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function fetchBlogPosts() {
  const payload = await getPayload({ config: configPromise })
  
  try {
    const { docs } = await payload.find({
      collection: 'blog' as any,
      limit: 100,
      sort: '-publishedAt',
    })
    return docs
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

export async function fetchBlogPostBySlug(slug: string) {
  const payload = await getPayload({ config: configPromise })
  
  try {
    const { docs } = await payload.find({
      collection: 'blog' as any,
      where: {
        slug: {
          equals: slug,
        },
      },
    })
    return docs[0] || null
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export async function fetchServices() {
  const payload = await getPayload({ config: configPromise })
  
  try {
    const { docs } = await payload.find({
      collection: 'services' as any,
      limit: 100,
    })
    return docs
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export async function fetchPages() {
  const payload = await getPayload({ config: configPromise })
  
  try {
    const { docs } = await payload.find({
      collection: 'pages' as any,
      limit: 100,
    })
    return docs
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}
