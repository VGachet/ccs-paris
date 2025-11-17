'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Testimonials } from './Testimonials'

interface Feature {
  id: string
  icon: string
  title: string
  description: string
  order?: number
}

interface WhyChooseUsProps {
  title?: string
}

export function WhyChooseUs({ title = 'Pourquoi nous choisir ?' }: WhyChooseUsProps) {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [testimonialsCount, setTestimonialsCount] = useState(0)
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await fetch(`/api/public/features?locale=${locale}`)
        const data = await response.json()
        setFeatures(data || [])
      } catch (error) {
        console.error('Error fetching features:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatures()
  }, [locale])

  if (loading) {
    return (
      <section style={{ padding: '4rem 2rem', background: '#fafafa', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: '#999' }}>Chargement...</p>
        </div>
      </section>
    )
  }

  if (features.length === 0) {
    return null
  }

  return (
    <section style={{ padding: '4rem 2rem', background: '#fafafa', textAlign: 'center' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2rem', 
          marginTop: '2rem' 
        }}>
          {features.map((feature) => (
            <div 
              key={feature.id}
              style={{ 
                padding: '2rem', 
                background: '#fff', 
                borderRadius: '8px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
              }}
            >
              <h3 style={{ marginTop: 0, color: '#d4af37' }}>
                {feature.icon} {feature.title}
              </h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Section des avis clients */}
        {testimonialsCount > 0 && (
          <div style={{ marginTop: '4rem' }}>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              {locale === 'fr' ? 'Ce que nos clients disent' : 'What our clients say'}
            </h3>
            <Testimonials maxDisplay={6} onCountChange={setTestimonialsCount} />
          </div>
        )}
        {testimonialsCount === 0 && (
          <Testimonials maxDisplay={6} onCountChange={setTestimonialsCount} />
        )}
      </div>
    </section>
  )
}
