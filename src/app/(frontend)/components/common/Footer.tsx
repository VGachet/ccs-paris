import { useTranslations } from 'next-intl'
import styles from './Footer.module.css'

export const Footer = () => {
  const t = useTranslations('footer')

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p>&copy; 2024 CCS Paris - {t('rights')}</p>
            <p>{t('contact')}: <a href="mailto:contact@ccsparis.fr">contact@ccsparis.fr</a>  |  +33 (0)6 51 13 51 74  |  6 Rue de Chaillot - 75116 - Paris</p>
            <p>
              <a href="/privacy-policy">{t('privacyPolicy')}</a> | <a href="/terms-of-service">{t('termsOfService')}</a>
            </p>
        </div>
      </div>
    </footer>
  )
}
