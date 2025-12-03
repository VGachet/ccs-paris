'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useEffect, useState } from 'react'
import styles from './Footer.module.css'

export const Footer = () => {
  const t = useTranslations('footer')
  const [phoneNumber, setPhoneNumber] = useState('+33651135174')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/public/site-settings')
        const data = await response.json()
        if (data.phoneNumber) {
          setPhoneNumber(data.phoneNumber)
        }
      } catch (error) {
        console.error('Error fetching phone number:', error)
      }
    }
    fetchSettings()
  }, [])

  // Formater le numéro pour l'affichage
  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/[^\d+]/g, '')
    if (cleaned.startsWith('+33')) {
      const numbers = cleaned.slice(3)
      return `+33 (0)${numbers.slice(0, 1)} ${numbers.slice(1, 3)} ${numbers.slice(3, 5)} ${numbers.slice(5, 7)} ${numbers.slice(7, 9)}`
    }
    return phone
  }

  // URL pour les liens tel et WhatsApp
  const phoneForLink = phoneNumber.replace(/[^\d+]/g, '')
  const whatsappNumber = phoneForLink.replace('+', '')

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p>&copy; 2025 CCS Paris - {t('rights')}</p>
            <p>
              {t('contact')}: <a href="mailto:contact@ccsparis.fr">contact@ccsparis.fr</a>  |  
              <a href={`tel:${phoneForLink}`}> {formatPhoneDisplay(phoneNumber)}</a>  |  
              6 Rue de Chaillot - 75116 - Paris
            </p>
            <p>
              <Link href="/mentions-legales">{t('legalNotices')}</Link> | <Link href="/conditions-generales">{t('generalTerms')}</Link>
            </p>
        </div>
      </div>
    </footer>
  )
}
