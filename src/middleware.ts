import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, `/admin/`, and static files
  matcher: ['/', '/(fr|en)/:path*', '/((?!_next|api|admin|.*\\..*).*)']
}
