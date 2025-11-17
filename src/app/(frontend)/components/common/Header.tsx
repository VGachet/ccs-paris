'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import { LanguageSwitcher } from './LanguageSwitcher'
import styles from './Header.module.css'
import Image from 'next/image'

interface LogoImage {
  url: string
  alt?: string
}

interface SiteSettings {
  logo?: string | LogoImage
}

interface HeaderProps {
  siteSettings?: SiteSettings
}

export const Header = ({ siteSettings }: HeaderProps) => {
  const t = useTranslations('common')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const logo = siteSettings?.logo
  const logoUrl = typeof logo === 'object' && logo?.url ? logo.url : null

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.content}>
          <Link href="/" className={styles.logo}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="CCS Paris"
                width={150}
                height={50}
                className={styles.logoImage}
                priority
              />
            ) : (
              <h1>CCS Paris</h1>
            )}
          </Link>
          
          {/* Navigation desktop */}
          <nav className={styles.nav}>
            <Link href="/">{t('home')}</Link>
            <Link href="/about">{t('about')}</Link>
            <Link href="/blog">{t('blog')}</Link>
          </nav>
          
          <div className={styles.desktopActions}>
            <LanguageSwitcher />
          </div>

          {/* Bouton hamburger mobile */}
          <button
            className={styles.hamburger}
            onClick={toggleMobileMenu}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={mobileMenuOpen ? styles.hamburgerOpen : ''}></span>
            <span className={mobileMenuOpen ? styles.hamburgerOpen : ''}></span>
            <span className={mobileMenuOpen ? styles.hamburgerOpen : ''}></span>
          </button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <nav className={styles.mobileNav}>
              <Link href="/" onClick={closeMobileMenu}>
                {t('home')}
              </Link>
              <Link href="/about" onClick={closeMobileMenu}>
                {t('about')}
              </Link>
              <Link href="/blog" onClick={closeMobileMenu}>
                {t('blog')}
              </Link>
            </nav>
            <div className={styles.mobileActions}>
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
