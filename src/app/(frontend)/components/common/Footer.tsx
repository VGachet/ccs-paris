import { useTranslations } from 'next-intl'
import styles from './Footer.module.css'

export const Footer = () => {
  const t = useTranslations('footer')

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p>&copy; 2024 CCS Paris - {t('rights')}</p>
          <p>{t('contact')}: contact@ccsparis.fr | +33 (0)1 23 45 67 89</p>
        </div>
      </div>
    </footer>
  )
}
