'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { BookingForm } from '@/app/(frontend)/components/forms/BookingForm'
import { WhyChooseUs } from '@/app/(frontend)/components/common/WhyChooseUs'
import { ServicesGrid } from '@/app/(frontend)/components/common/ServicesGrid'
import '../(frontend)/styles.css'

interface SiteSettings {
  heroBackgroundImage?: {
    url: string
    alt?: string
  }
  heroOverlayOpacity?: number
}

export default function HomePage() {
  const t = useTranslations()
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/globals/site-settings')
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        console.error('Error fetching site settings:', error)
      }
    }
    fetchSettings()
  }, [])

  return (
    <main>
      <section className="hero" style={{ position: 'relative' }}>
        {settings?.heroBackgroundImage?.url && (
          <>
            <div className="hero-background">
              <Image
                src={settings.heroBackgroundImage.url}
                alt={settings.heroBackgroundImage.alt || 'Hero background'}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div 
              className="hero-overlay"
              style={{ opacity: settings.heroOverlayOpacity || 0.5 }}
            />
          </>
        )}
        <div className="hero-content">
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>
          <button className="cta-button">{t('hero.cta')}</button>
        </div>
      </section>

      <section className="services-intro">
        <div className="container">
          <h2>{t('services.title')}</h2>
          <p>{t('services.description')}</p>
        </div>
      </section>

      <ServicesGrid />

      <section className="booking-section">
        <div className="container">
          <BookingForm
            title={t('booking.title')}
            description={t('booking.description')}
            variant="default"
          />
        </div>
      </section>

      <WhyChooseUs />
    </main>
  )
}
