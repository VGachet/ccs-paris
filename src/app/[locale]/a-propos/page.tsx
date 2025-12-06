import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import { Testimonials } from '@/app/(frontend)/components/common/Testimonials'
import type { Media } from '@/payload-types'
import styles from './about.module.css'

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

    if (settings.aboutMetaTitle || settings.aboutMetaDescription) {
      return {
        title: settings.aboutMetaTitle || 'À Propos',
        description: settings.aboutMetaDescription || 'À propos de nous',
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  const t = await getTranslations({ locale, namespace: 'common' })
  return {
    title: t('about'),
    description: t('about'),
  }
}

export default async function AboutPage({ params }: Props) {
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

  const aboutImage = settings?.aboutImage && typeof settings.aboutImage !== 'string' 
    ? settings.aboutImage as Media 
    : null

  return (
    <main className={styles.container}>
      <section className={styles.header}>
        <div className={styles.contentGrid}>
          {aboutImage?.url && (
            <div className={styles.imageWrapper}>
              <Image
                src={aboutImage.url}
                alt={aboutImage.alt || 'À Propos'}
                width={400}
                height={400}
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                priority
              />
            </div>
          )}
          <div className={styles.textContent}>
            <h1>{settings?.aboutTitle || t('common.about')}</h1>
            {settings?.aboutText && (
              <div className={styles.description} dangerouslySetInnerHTML={{ __html: renderLexicalContent(settings.aboutText) }} />
            )}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <a href={`/${locale}#booking-form`} className={styles.ctaButton}>
          {t('pricing.bookNow')}
        </a>
      </section>

      <section className={styles.testimonialsSection}>
        <h2 className={styles.testimonialsTitle}>{t('about.testimonialsTitle')}</h2>
        <Testimonials />
      </section>
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
