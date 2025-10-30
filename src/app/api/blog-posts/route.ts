import { getBlogPosts } from '@/lib/cms'

export const GET = async () => {
  try {
    const posts = await getBlogPosts()
    return Response.json(posts)
  } catch (error) {
    console.error('Error:', error)
    return Response.json([], { status: 500 })
  }
}
