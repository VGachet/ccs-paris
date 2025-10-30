'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import styles from './LanguageSwitcher.module.css'

export const LanguageSwitcher = () => {
  const locale = useLocale()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    return segments.join('/')
  }

  return (
    <div className={styles.languageSwitcher}>
      <Link
        href={switchLocale('fr')}
        className={`${styles.link} ${locale === 'fr' ? styles.active : ''}`}
      >
        Français
      </Link>
      <span className={styles.separator}>|</span>
      <Link
        href={switchLocale('en')}
        className={`${styles.link} ${locale === 'en' ? styles.active : ''}`}
      >
        English
      </Link>
    </div>
  )
}
