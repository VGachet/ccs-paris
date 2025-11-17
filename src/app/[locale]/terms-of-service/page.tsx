import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import styles from './legal.module.css'

interface Props {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = (await params)
  const payload = await getPayload({ config: configPromise })

  try {
    const result = await payload.find({
      collection: 'legal-pages',
      where: {
        slug: {
          equals: 'terms-of-service',
        },
      },
      locale: locale as 'fr' | 'en',
      limit: 1,
    })

    const page = result.docs[0]

    if (page) {
      return {
        title: page.metaTitle || page.title,
        description: page.metaDescription || page.title,
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  const t = await getTranslations({ locale, namespace: 'legal' })
  return {
    title: t('termsOfService'),
    description: t('termsOfService'),
  }
}

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = (await params)
  const t = await getTranslations('legal')
  const payload = await getPayload({ config: configPromise })

  let pageData = null

  try {
    const result = await payload.find({
      collection: 'legal-pages',
      where: {
        slug: {
          equals: 'terms-of-service',
        },
      },
      locale: locale as 'fr' | 'en',
      limit: 1,
    })

    pageData = result.docs[0] || null
  } catch (error) {
    console.error('Error fetching legal page:', error)
  }

  if (!pageData) {
    return (
      <main className={styles.container}>
        <h1>{t('termsOfService')}</h1>
        <div className={styles.placeholder}>
          <p>{t('noContentYet')}</p>
          <p>{t('addContentInCMS')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.container}>
      <h1>{pageData.title}</h1>
      {pageData.lastUpdated && (
        <p className={styles.lastUpdated}>
          {t('lastUpdated')}: {new Date(pageData.lastUpdated).toLocaleDateString(locale)}
        </p>
      )}
      <div className={styles.content}>
        <div dangerouslySetInnerHTML={{ __html: renderLexicalContent(pageData.content) }} />
      </div>
    </main>
  )
}

// Fonction pour convertir le contenu Lexical en HTML
function renderLexicalContent(content: any): string {
  if (!content || !content.root || !content.root.children) {
    return '<p>Contenu à ajouter via le panel d\'administration Payload CMS</p>'
  }

  const renderNode = (node: any): string => {
    if (node.type === 'paragraph') {
      const children = node.children?.map(renderNode).join('') || ''
      return `<p>${children}</p>`
    }
    if (node.type === 'heading') {
      const tag = `h${node.tag || '2'}`
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
      if (node.format & 1) text = `<strong>${text}</strong>` // bold
      if (node.format & 2) text = `<em>${text}</em>` // italic
      if (node.format & 8) text = `<u>${text}</u>` // underline
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
    return '<p>Erreur lors du rendu du contenu</p>'
  }
}
