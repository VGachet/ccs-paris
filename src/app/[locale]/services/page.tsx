'use client'

import { useTranslations } from 'next-intl'
import { BookingForm } from '@/app/(frontend)/components/forms/BookingForm'

export default function ServicesPage() {
  const t = useTranslations()

  return (
    <main>
      <section className="hero" style={{ padding: '4rem 2rem' }}>
        <div className="hero-content">
          <h1>{t('services.title')}</h1>
          <p>{t('services.description')}</p>
        </div>
      </section>

      <section style={{ padding: '4rem 2rem', background: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ textAlign: 'center', color: '#999' }}>Les services seront chargés depuis le panel d&apos;administration Payload CMS</p>
        </div>
      </section>

      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <BookingForm
            title={t('booking.title')}
            description={t('booking.description')}
            variant="compact"
          />
        </div>
      </section>
    </main>
  )
}
