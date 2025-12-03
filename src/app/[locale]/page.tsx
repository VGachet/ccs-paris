import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import { BookingFormV2 } from '@/app/(frontend)/components/forms/BookingFormV2'
import { WhyChooseUs } from '@/app/(frontend)/components/common/WhyChooseUs'
import { ServicesGrid } from '@/app/(frontend)/components/common/ServicesGrid'
import type { Media } from '@/payload-types'
import '../(frontend)/styles.css'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const payload = await getPayload({ config: configPromise })

  try {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      locale: locale as 'fr' | 'en',
    })

    if (settings.homeMetaTitle || settings.homeMetaDescription) {
      return {
        title: settings.homeMetaTitle || 'CCS Paris',
        description: settings.homeMetaDescription || 'Nettoyage Textile Professionnel à Paris',
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  const t = await getTranslations({ locale, namespace: 'hero' })
  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations()
  const payload = await getPayload({ config: configPromise })

  let settings = null
  try {
    settings = await payload.findGlobal({
      slug: 'site-settings',
      locale: locale as 'fr' | 'en',
    })
  } catch (error) {
    console.error('Error fetching site settings:', error)
  }

  const heroImage = settings?.heroBackgroundImage && typeof settings.heroBackgroundImage !== 'string' 
    ? settings.heroBackgroundImage as Media 
    : null

  return (
    <main>
      <section className="hero" style={{ position: 'relative' }}>
        {heroImage?.url && (
          <>
            <div className="hero-background">
              <Image
                src={heroImage.url}
                alt={heroImage.alt || 'Hero background'}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div 
              className="hero-overlay"
              style={{ opacity: settings?.heroOverlayOpacity || 0.5 }}
            />
          </>
        )}
        <div className="hero-content">
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>
          <a href="#booking-form" className="cta-button">{t('hero.cta')}</a>
        </div>
      </section>

      {settings?.servicesIntroText && (
        <section className="services-intro-content">
          <div className="container">
            <div 
              className="wysiwyg-content"
              dangerouslySetInnerHTML={{ 
                __html: renderLexicalContent(settings.servicesIntroText) 
              }} 
            />
          </div>
        </section>
      )}

      <section className="services-intro">
        <div className="container">
          <h2>{t('services.title')}</h2>
          <p>{t('services.description')}</p>
        </div>
      </section>

      <ServicesGrid />

      <section id="booking-form" className="booking-section">
        <BookingFormV2
          title={t('booking.title')}
          description={t('booking.description')}
        />
      </section>

      <WhyChooseUs />
    </main>
  )
}

// Fonction pour convertir le contenu Lexical en HTML
interface LexicalNode {
  type: string
  children?: LexicalNode[]
  tag?: string
  listType?: string
  text?: string
  format?: number
  url?: string
  newTab?: boolean
}

interface LexicalContent {
  root?: {
    children?: LexicalNode[]
  }
}

function renderLexicalContent(content: LexicalContent): string {
  if (!content || !content.root || !content.root.children) {
    return ''
  }

  const renderNode = (node: LexicalNode): string => {
    if (node.type === 'paragraph') {
      const children = node.children?.map(renderNode).join('') || ''
      return `<p>${children}</p>`
    }
    if (node.type === 'heading') {
      // node.tag contient déjà "h1", "h2", etc. dans Lexical
      const tag = node.tag || 'h2'
      const children = node.children?.map(renderNode).join('') || ''
      return `<${tag}>${children}</${tag}>`
    }
    if (node.type === 'list') {
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      const children = node.children?.map(renderNode).join('') || ''
      return `<${tag}>${children}</${tag}>`
    }
    if (node.type === 'listitem') {
      const children = node.children?.map(renderNode).join('') || ''
      return `<li>${children}</li>`
    }
    if (node.type === 'text') {
      let text = node.text || ''
      if (node.format && node.format & 1) text = `<strong>${text}</strong>` // bold
      if (node.format && node.format & 2) text = `<em>${text}</em>` // italic
      if (node.format && node.format & 8) text = `<u>${text}</u>` // underline
      return text
    }
    if (node.type === 'link') {
      const children = node.children?.map(renderNode).join('') || ''
      return `<a href="${node.url}" ${node.newTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>${children}</a>`
    }
    return node.children?.map(renderNode).join('') || ''
  }

  try {
    return content.root.children.map(renderNode).join('')
  } catch (e) {
    console.error('Error rendering Lexical content:', e)
    return ''
  }
}
