import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import styles from './pricing.module.css'
import { RichText } from '@payloadcms/richtext-lexical/react'

interface Props {
  params: Promise<{ locale: string }>
}

interface LexicalNode {
  type?: string
  text?: string
  children?: LexicalNode[]
}

interface LexicalContent {
  root?: {
    children?: LexicalNode[]
  }
}

interface Service {
  id: string
  name: string
  description?: any
  // Nouveaux champs de pricing
  pricingType?: 'fixed' | 'per_m2' | 'min_price' | 'quote'
  fixedPrice?: number
  pricePerM2?: number
  minimumOrder?: number
  startingPrice?: number
  quoteInfo?: string
  // Champs legacy
  pricing?: string
  price?: number
  pricePrefix?: boolean
}

interface Promotion {
  id: string
  discountPercentage?: number
}

interface SiteSettings {
  pricingIntroText?: any
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  
  const t = await getTranslations({ locale, namespace: 'pricing' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params
  
  const t = await getTranslations('pricing')
  const payload = await getPayload({ config: configPromise })

  let services: Service[] = []
  let promotion: Promotion | null = null
  let siteSettings: any = null

  try {
    // Récupérer les paramètres du site
    siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      locale: locale as 'fr' | 'en',
    })

    const servicesResult = await payload.find({
      collection: 'services',
      limit: 50,
      sort: 'order',
      locale: locale as 'fr' | 'en',
    })
    services = servicesResult.docs as Service[]

    const promotionsResult = await payload.find({
      collection: 'promotions',
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 1,
    })

    const activePromo = promotionsResult.docs[0]
    if (activePromo) {
      const now = new Date()
      if (
        (!activePromo.startDate || new Date(activePromo.startDate) <= now) &&
        (!activePromo.endDate || new Date(activePromo.endDate) >= now)
      ) {
        promotion = activePromo as Promotion
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  const calculateDiscountedPrice = (price: number): number => {
    if (!promotion || !promotion.discountPercentage) return price
    return price * (1 - promotion.discountPercentage / 100)
  }

  const renderDescription = (description: any): string => {
    const lexicalContent = description as LexicalContent
    if (!lexicalContent?.root?.children) {
      return ''
    }

    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || ''
      }
      if (node.children) {
        return node.children.map(extractText).join('')
      }
      return ''
    }

    return lexicalContent.root.children.map(extractText).join(' ')
  }

  // Fonction pour obtenir l'affichage du prix d'un service
  const getServicePriceDisplay = (service: Service): { price: number | null; text: string; hasDiscount: boolean } => {
    const pricingType = service.pricingType || 'fixed'
    
    switch (pricingType) {
      case 'fixed':
        if (service.fixedPrice) {
          return { price: service.fixedPrice, text: '', hasDiscount: true }
        }
        break
      case 'per_m2':
        if (service.pricePerM2) {
          const minText = service.minimumOrder ? ` (min. ${service.minimumOrder}m²)` : ''
          return { price: null, text: `${service.pricePerM2.toFixed(2)}€/m²${minText}`, hasDiscount: false }
        }
        break
      case 'min_price':
        if (service.startingPrice) {
          return { price: service.startingPrice, text: t('from'), hasDiscount: true }
        }
        break
      case 'quote':
        return { price: null, text: service.quoteInfo || t('quotePrice'), hasDiscount: false }
    }
    
    // Fallback sur les champs legacy
    if (service.price) {
      return { 
        price: service.price, 
        text: service.pricePrefix ? t('from') : '', 
        hasDiscount: true 
      }
    }
    if (service.pricing) {
      return { price: null, text: service.pricing, hasDiscount: false }
    }
    
    return { price: null, text: '', hasDiscount: false }
  }

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1>{t('title')}</h1>
        {siteSettings?.pricingIntroText ? (
          <div className={styles.introText}>
            <RichText data={siteSettings.pricingIntroText} />
          </div>
        ) : (
          <p>{t('description')}</p>
        )}
      </div>

      <div className={styles.ctaSection}>
        <a href={`/${locale}#booking-form`} className={styles.ctaButton}>
          {t('bookNow')}
        </a>
      </div>

      {services.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{t('noServices')}</p>
        </div>
      ) : (
        <div className={styles.servicesList}>
          {services.map((service) => {
            const priceInfo = getServicePriceDisplay(service)
            const descriptionText = renderDescription(service.description)
            
            return (
              <div key={service.id} className={styles.serviceItem}>
                <div className={styles.serviceInfo}>
                  <h3 className={styles.serviceName}>{service.name}</h3>
                  {descriptionText && (
                    <p className={styles.serviceDescription}>{descriptionText}</p>
                  )}
                </div>
                
                <div className={styles.servicePricing}>
                  {priceInfo.price !== null ? (
                    <div className={styles.priceContainer}>
                      {priceInfo.text && (
                        <span className={styles.pricePrefix}>{priceInfo.text}</span>
                      )}
                      {promotion && promotion.discountPercentage && priceInfo.hasDiscount ? (
                        <>
                          <span className={styles.originalPrice}>{priceInfo.price.toFixed(2)}€</span>
                          <span className={styles.discountedPrice}>
                            {calculateDiscountedPrice(priceInfo.price).toFixed(2)}€
                          </span>
                          <span className={styles.discountBadge}>-{promotion.discountPercentage}%</span>
                        </>
                      ) : (
                        <span className={styles.price}>{priceInfo.price.toFixed(2)}€</span>
                      )}
                    </div>
                  ) : priceInfo.text ? (
                    <span className={styles.pricingText}>{priceInfo.text}</span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
