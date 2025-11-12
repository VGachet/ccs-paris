'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('notFound')
  const locale = useLocale()

  return (
    <main style={{ 
      minHeight: '60vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ 
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ 
          fontSize: '6rem', 
          margin: '0', 
          color: '#d4af37',
          fontWeight: 'bold'
        }}>
          404
        </h1>
        <h2 style={{ 
          fontSize: '2rem', 
          margin: '1rem 0',
          color: '#333'
        }}>
          {t('title')}
        </h2>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#666',
          margin: '1rem 0 2rem 0'
        }}>
          {t('description')}
        </p>
        <Link 
          href={`/${locale}`}
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: '#d4af37',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: '600',
            transition: 'background 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#c49d2f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#d4af37'
          }}
        >
          {t('backHome')}
        </Link>
      </div>
    </main>
  )
}
