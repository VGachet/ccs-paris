import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  featuredImage?: {
    url: string
  }
}

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

    if (settings.blogMetaTitle || settings.blogMetaDescription) {
      return {
        title: settings.blogMetaTitle || 'Blog',
        description: settings.blogMetaDescription || 'Blog CCS Paris',
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
  }

  const t = await getTranslations({ locale, namespace: 'blog' })
  return {
    title: t('title'),
    description: t('latestArticles'),
  }
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('blog')
  const payload = await getPayload({ config: configPromise })

  let posts: BlogPost[] = []
  try {
    const result = await payload.find({
      collection: 'blog',
      locale: locale as 'fr' | 'en',
      sort: '-publishedAt',
    })
    posts = result.docs as BlogPost[]
  } catch (error) {
    console.error('Error fetching blog posts:', error)
  }

  return (
    <main style={{ padding: '2rem' }}>
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>{t('title')}</h1>
        <p>{t('latestArticles')}</p>
      </section>

      <section style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {posts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>Aucun article pour le moment.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {posts.map((post) => (
              <Link href={`/${locale}/blog/${post.slug}`} key={post.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                  <div style={{ background: '#ddd', height: '200px' }}></div>
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{post.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#999', margin: '0 0 1rem 0' }}>
                      {new Date(post.publishedAt).toLocaleDateString(locale)}
                    </p>
                    <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{post.excerpt}</p>
                    <span style={{ color: '#d4af37', fontWeight: '600' }}>
                      {t('readMore')}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
