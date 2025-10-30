'use client'

import { useTranslations } from 'next-intl'
import { BookingForm } from '@/app/(frontend)/components/forms/BookingForm'
import '../(frontend)/styles.css'

export default function HomePage() {
  const t = useTranslations()

  return (
    <main>
      <section className="hero">
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

      <section className="booking-section">
        <div className="container">
          <BookingForm
            title={t('booking.title')}
            description={t('booking.description')}
            variant="default"
          />
        </div>
      </section>
    </main>
  )
}
