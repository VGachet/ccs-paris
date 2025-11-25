import { notFound } from 'next/navigation'
import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { Header } from '@/app/(frontend)/components/common/Header'
import { Footer } from '@/app/(frontend)/components/common/Footer'
import { PromoBanner } from '@/app/(frontend)/components/common/PromoBanner'
import { getSiteSettings } from '@/lib/cms'
import { Lato, Playfair_Display } from 'next/font/google'
import '../(frontend)/styles.css'

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-lato',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  weight: ['400', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

interface Props {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'fr' | 'en')) {
    notFound()
  }

  const messages = await getMessages()
  const siteSettings = await getSiteSettings(locale as 'fr' | 'en')

  return (
    <html lang={locale} className={`${lato.variable} ${playfairDisplay.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <PromoBanner locale={locale} />
          <Header siteSettings={siteSettings} />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
