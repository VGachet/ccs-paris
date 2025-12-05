import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getCached, setCache } from '@/lib/api-cache'

/**
 * API pour récupérer les paramètres publics du site
 * 
 * GET: Récupère les paramètres du site (réduction services, téléphone, minimum commande, etc.)
 * Paramètre optionnel: ?locale=fr|en pour les champs localisés
 */

const DEFAULT_MESSAGE_HINT_FR = '💡 Recommandé si : tissu fragile (soie, velours...), taches spéciales/hors normes, dimensions particulières, ou accès difficile à l\'adresse'
const DEFAULT_MESSAGE_HINT_EN = '💡 Recommended if: delicate fabric (silk, velvet...), special/unusual stains, particular dimensions, or difficult access to address'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'fr'

    // Vérifier le cache
    const cacheKey = `site-settings-public:${locale}`
    const cached = getCached<Record<string, unknown>>(cacheKey)
    if (cached) return Response.json(cached)
    
    const payload = await getPayload({ config: configPromise })

    const settings = await payload.findGlobal({
      slug: 'site-settings',
      locale: locale as 'fr' | 'en',
    })

    // Valeur par défaut selon la locale
    const defaultMessageHint = locale === 'en' ? DEFAULT_MESSAGE_HINT_EN : DEFAULT_MESSAGE_HINT_FR

    // Retourner uniquement les paramètres publics nécessaires
    const result = {
      additionalServiceDiscount: settings.additionalServiceDiscount ?? 20,
      phoneNumber: settings.phoneNumber ?? '+33651135174',
      minimumOrderAmount: settings.minimumOrderAmount ?? 50,
      messageHint: settings.messageHint ?? defaultMessageHint,
    }

    setCache(cacheKey, result)
    return Response.json(result)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return Response.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}
