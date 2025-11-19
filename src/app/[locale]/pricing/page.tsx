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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description?: any
  pricing?: string
  price?: number
  pricePrefix?: boolean
}

interface Promotion {
  id: string
  discountPercentage?: number
}

interface SiteSettings {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderDescription = (description: any): string => {
    const lexicalContent = description as LexicalContent
    if (!lexicalContent?.root?.children) {
      return ''
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          {services.map((service) => (
            <div key={service.id} className={styles.serviceItem}>
              <div className={styles.serviceInfo}>
                <h3 className={styles.serviceName}>{service.name}</h3>
                {service.description && (
                  <div className={styles.serviceDescription}>
                    <p>{renderDescription(service.description)}</p>
                  </div>
                )}
              </div>
              
              <div className={styles.servicePricing}>
                {service.price ? (
                  <div className={styles.priceContainer}>
                    {service.pricePrefix && (
                      <span className={styles.pricePrefix}>{t('from')}</span>
                    )}
                    {promotion && promotion.discountPercentage ? (
                      <>
                        <span className={styles.originalPrice}>{service.price.toFixed(2)}€</span>
                        <span className={styles.discountedPrice}>
                          {calculateDiscountedPrice(service.price).toFixed(2)}€
                        </span>
                        <span className={styles.discountBadge}>-{promotion.discountPercentage}%</span>
                      </>
                    ) : (
                      <span className={styles.price}>{service.price.toFixed(2)}€</span>
                    )}
                  </div>
                ) : service.pricing ? (
                  <span className={styles.pricingText}>{service.pricing}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
