'use client'

import { useTranslations } from 'next-intl'
import { BookingForm } from '@/app/(frontend)/components/forms/BookingForm'

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

      <section style={{ padding: '4rem 2rem', background: '#fafafa', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ marginTop: 0 }}>Pourquoi nous choisir ?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0, color: '#d4af37' }}>✓ Rapide</h3>
              <p>Intervention dans les 24 à 48 heures</p>
            </div>
            <div style={{ padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0, color: '#d4af37' }}>✓ Professionnel</h3>
              <p>Équipe qualifiée avec expérience</p>
            </div>
            <div style={{ padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0, color: '#d4af37' }}>✓ Écologique</h3>
              <p>Produits respectueux de l&apos;environnement</p>
            </div>
            <div style={{ padding: '2rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0, color: '#d4af37' }}>✓ Garantie</h3>
              <p>Satisfaction garantie</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
