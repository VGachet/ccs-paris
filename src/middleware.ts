import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Headers de sécurité HTTP
const securityHeaders = {
  // Protection contre le clickjacking
  'X-Frame-Options': 'DENY',
  // Protection XSS (navigateurs modernes)
  'X-Content-Type-Options': 'nosniff',
  // Politique de référent stricte
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Désactiver les fonctionnalités potentiellement dangereuses
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request)
  
  // Ajouter les headers de sécurité
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, `/admin/`, and static files
  matcher: ['/', '/(fr|en)/:path*', '/((?!_next|api|admin|.*\\..*).*)']
}
