import { getFeatures } from '@/lib/cms'

export const GET = async () => {
  try {
    const features = await getFeatures()
    return Response.json(features)
  } catch (error) {
    console.error('Error:', error)
    return Response.json([], { status: 500 })
  }
}
