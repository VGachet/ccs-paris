import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  pathnames: {
    '/': '/',
    '/a-propos': {
      fr: '/a-propos',
      en: '/about',
    },
    '/blog': '/blog',
    '/mentions-legales': {
      fr: '/mentions-legales',
      en: '/legal-notices',
    },
    '/conditions-generales': {
      fr: '/conditions-generales',
      en: '/general-terms',
    },
    '/tarifs': {
      fr: '/tarifs',
      en: '/pricing',
    },
  },
})

export type Pathnames = keyof typeof routing.pathnames
export type Locale = (typeof routing.locales)[number]

export const { Link, getPathname, redirect, usePathname, useRouter } =
  createNavigation(routing)

