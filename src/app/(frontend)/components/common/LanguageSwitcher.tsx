'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import styles from './LanguageSwitcher.module.css'

// Mapping des routes entre les deux langues
const routeMappings: Record<string, Record<string, string>> = {
  fr: {
    'mentions-legales': 'mentions-legales',
    'conditions-generales': 'conditions-generales',
    'tarifs': 'tarifs',
  },
  en: {
    'mentions-legales': 'legal-notices',
    'conditions-generales': 'general-terms',
    'tarifs': 'pricing',
  },
}

// Mapping inverse pour la conversion EN -> FR
const reverseRouteMappings: Record<string, string> = {
  'legal-notices': 'mentions-legales',
  'general-terms': 'conditions-generales',
  'pricing': 'tarifs',
}

export const LanguageSwitcher = () => {
  const locale = useLocale()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/')
    // segments[0] is empty, segments[1] is locale, segments[2] is the path
    const currentPath = segments[2]
    
    if (currentPath && newLocale === 'en') {
      // FR -> EN : utiliser le mapping direct
      const enPath = routeMappings.en[currentPath]
      if (enPath) {
        segments[2] = enPath
      }
    } else if (currentPath && newLocale === 'fr') {
      // EN -> FR : utiliser le mapping inverse
      const frPath = reverseRouteMappings[currentPath] || currentPath
      segments[2] = frPath
    }
    
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
