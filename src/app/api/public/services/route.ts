import { getServices } from '@/lib/cms'

export const GET = async () => {
  try {
    const services = await getServices()
    return Response.json(services)
  } catch (error) {
    console.error('Error:', error)
    return Response.json([], { status: 500 })
  }
}
