'use client'

import { useTranslations } from 'next-intl'
import { BookingForm } from '@/app/(frontend)/components/forms/BookingForm'
import { WhyChooseUs } from '@/app/(frontend)/components/common/WhyChooseUs'

export default function ReservationsPage() {
  const t = useTranslations()

  return (
    <main>
      <section className="hero" style={{ padding: '4rem 2rem' }}>
        <div className="hero-content">
          <h1>{t('booking.title')}</h1>
          <p>{t('booking.description')}</p>
        </div>
      </section>

      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <BookingForm variant="default" />
      </section>

      <WhyChooseUs />
    </main>
  )
}
