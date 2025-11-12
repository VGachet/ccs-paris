import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { LanguageSwitcher } from './LanguageSwitcher'
import styles from './Header.module.css'

export const Header = () => {
  const t = useTranslations('common')

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.content}>
          <Link href="/" className={styles.logo}>
            <h1>CCS Paris</h1>
          </Link>
          <nav className={styles.nav}>
            <Link href="/">{t('home')}</Link>
            <Link href="/blog">{t('blog')}</Link>
            <Link href="/reservations">{t('reservations')}</Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
