'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

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

export default function BlogPage() {
  const t = useTranslations('blog')
  const locale = useLocale()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/public/blog-posts?locale=${locale}`)
        const data = await response.json()
        setPosts(data || [])
      } catch (error) {
        console.error('Error fetching blog posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [locale])

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
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
