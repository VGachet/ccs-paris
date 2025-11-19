import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import styles from './legal.module.css'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  
  // Rediriger si on n'est pas en français
  if (locale !== 'fr') {
    return {
      title: 'Redirect',
    }
  }
  
  const payload = await getPayload({ config: configPromise })

  try {
    const result = await payload.find({
      collection: 'legal-pages',
      where: {
        slug: {
          equals: 'general-terms',
        },
      },
      locale: 'fr',
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
    title: t('generalTerms'),
    description: t('generalTerms'),
  }
}

export default async function GeneralTermsPageFR({ params }: Props) {
  const { locale } = await params
  
  // Rediriger vers la version anglaise si la langue n'est pas française
  if (locale !== 'fr') {
    redirect(`/${locale}/general-terms`)
  }
  
  const t = await getTranslations('legal')
  const payload = await getPayload({ config: configPromise })

  let pageData = null

  try {
    const result = await payload.find({
      collection: 'legal-pages',
      where: {
        slug: {
          equals: 'general-terms',
        },
      },
      locale: 'fr',
      limit: 1,
    })

    pageData = result.docs[0] || null
  } catch (error) {
    console.error('Error fetching legal page:', error)
  }

  if (!pageData) {
    return (
      <main className={styles.container}>
        <h1>{t('generalTerms')}</h1>
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
          {t('lastUpdated')}: {new Date(pageData.lastUpdated).toLocaleDateString('fr')}
        </p>
      )}
      <div className={styles.content}>
        <div dangerouslySetInnerHTML={{ __html: renderLexicalContent(pageData.content) }} />
      </div>
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
    return '<p>Contenu à ajouter via le panel d\'administration Payload CMS</p>'
  }

  const renderNode = (node: LexicalNode): string => {
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
    return '<p>Erreur lors du rendu du contenu</p>'
  }
}
