import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { checkBookingRateLimit, getClientIp } from '@/lib/rate-limit'

// Import des messages de traduction
import frMessages from '@/messages/fr.json'
import enMessages from '@/messages/en.json'

type Locale = 'fr' | 'en'
type Messages = typeof frMessages

// Fonction pour obtenir les messages selon la locale
function getMessages(locale: Locale): Messages {
  return locale === 'en' ? enMessages : frMessages
}

// Fonction pour échapper le HTML et prévenir les injections XSS
function escapeHtml(text: string | undefined | null): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Regex pour la validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PHONE_REGEX = /^(?:(?:\+|00)33[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}$/

// Fonction de validation de l'email
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

// Fonction de validation du téléphone (format français)
function isValidPhone(phone: string): boolean {
  // Nettoyer le numéro des espaces et caractères spéciaux pour la validation
  const cleanedPhone = phone.replace(/[\s.-]/g, '')
  // Accepter les formats: +33, 0033, ou 0 suivi de 9 chiffres
  return /^(?:(?:\+|00)33|0)[1-9]\d{8}$/.test(cleanedPhone)
}

interface TimeSlotData {
  date: string
  startTime: string
  endTime: string
}

interface SecondaryServiceData {
  serviceId: string
  quantity: number
  price: number
  discountPercent?: number
}

interface BookingData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  message?: string
  locale?: Locale
  website?: string // Honeypot anti-bot
  turnstileToken?: string // Cloudflare Turnstile token
  bookingNumber?: number // Numéro de réservation pré-généré
  // Nouveau format avec service principal et services secondaires multiples
  primaryService?: {
    serviceId: string
    quantity: number
    price: number
  }
  // Ancien format - un seul service secondaire (compatibilité)
  secondaryService?: {
    serviceId: string
    quantity: number
    price: number
  }
  // Nouveau format - plusieurs services secondaires
  secondaryServices?: SecondaryServiceData[]
  discountPercent?: number
  timeSlots?: TimeSlotData[]
  totalAmount?: number
  // Ancien format pour compatibilité
  services?: { [key: string]: number }
  photos?: string[]
}

// Fonction pour générer l'email HTML pour l'admin
function generateAdminEmailHtml(booking: {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  primaryServiceName: string
  primaryServiceQty: number
  primaryServicePrice: number
  secondaryServices?: Array<{
    name: string
    quantity: number
    price: number
    discountPercent: number
  }>
  timeSlots: TimeSlotData[]
  totalAmount: number
  message?: string
  date: string
}, adminUrl: string): string {
  const bookingLink = `${adminUrl}/admin/collections/bookings/${escapeHtml(booking.id)}`
  
  // Échapper toutes les données utilisateur
  const safeFirstName = escapeHtml(booking.firstName)
  const safeLastName = escapeHtml(booking.lastName)
  const safeEmail = escapeHtml(booking.email)
  const safePhone = escapeHtml(booking.phone)
  const safeAddress = escapeHtml(booking.address)
  const safeMessage = escapeHtml(booking.message)
  const safePrimaryServiceName = escapeHtml(booking.primaryServiceName)
  
  const timeSlotsHtml = booking.timeSlots.length > 0 
    ? booking.timeSlots.map(slot => {
        const dateFormatted = new Date(slot.date).toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })
        return `<li>${escapeHtml(dateFormatted)} de ${escapeHtml(slot.startTime)} à ${escapeHtml(slot.endTime)}</li>`
      }).join('')
    : '<li>Non spécifié</li>'

  const secondaryServicesHtml = booking.secondaryServices && booking.secondaryServices.length > 0 
    ? booking.secondaryServices.map(s => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service supplémentaire (-${s.discountPercent}%):</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${escapeHtml(s.name)} (x${s.quantity}) - ${s.price.toFixed(2)}€
      </td>
    </tr>
  `).join('')
    : ''
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle demande de réservation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🧹 Nouvelle Réservation</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">CCS Paris - Service de Nettoyage</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none;">
    <h2 style="color: #667eea; margin-top: 0;">Informations du client</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 140px;">Nom complet:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${safeFirstName} ${safeLastName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <a href="mailto:${safeEmail}" style="color: #667eea;">${safeEmail}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Téléphone:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <a href="tel:${safePhone}" style="color: #667eea;">${safePhone}</a>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Adresse:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${safeAddress}</td>
      </tr>
    </table>
    
    <h2 style="color: #667eea; margin-top: 25px;">Services demandés</h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service principal:</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${safePrimaryServiceName} (x${booking.primaryServiceQty}) - ${booking.primaryServicePrice.toFixed(2)}€
        </td>
      </tr>
      ${secondaryServicesHtml}
      <tr style="background: #e8f5e9;">
        <td style="padding: 10px; font-weight: bold; font-size: 1.1em;">TOTAL ESTIMÉ:</td>
        <td style="padding: 10px; font-weight: bold; font-size: 1.1em; color: #2e7d32;">${booking.totalAmount.toFixed(2)}€</td>
      </tr>
    </table>
    
    <h2 style="color: #667eea; margin-top: 25px;">Créneaux demandés</h2>
    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
      <ul style="margin: 0; padding-left: 20px;">
        ${timeSlotsHtml}
      </ul>
    </div>
    
    ${safeMessage ? `
    <h2 style="color: #667eea; margin-top: 25px;">Message du client</h2>
    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
      <p style="margin: 0;">${safeMessage}</p>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${bookingLink}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        📋 Voir la réservation dans l'admin
      </a>
    </div>
  </div>
  
  <div style="background: #333; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
    <p style="color: #999; margin: 0; font-size: 12px;">
      Cet email a été envoyé automatiquement par le site CCS Paris.<br>
      ID de réservation: ${booking.id}
    </p>
  </div>
</body>
</html>
  `
}

// Fonction pour générer l'email de confirmation au client
function generateClientEmailHtml(booking: {
  firstName: string
  lastName: string
  primaryServiceName: string
  primaryServiceQty: number
  primaryServicePrice: number
  secondaryServices?: Array<{
    name: string
    quantity: number
    price: number
    discountPercent: number
  }>
  timeSlots: TimeSlotData[]
  totalAmount: number
  address: string
}, locale: Locale = 'fr'): string {
  const messages = getMessages(locale)
  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR'
  
  // Échapper toutes les données utilisateur
  const safeFirstName = escapeHtml(booking.firstName)
  const safeAddress = escapeHtml(booking.address)
  const safePrimaryServiceName = escapeHtml(booking.primaryServiceName)
  
  const timeSlotsHtml = booking.timeSlots.length > 0 
    ? booking.timeSlots.map(slot => {
        const dateFormatted = new Date(slot.date).toLocaleDateString(dateLocale, { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })
        return `<li style="margin: 5px 0;">${escapeHtml(dateFormatted)} ${locale === 'en' ? 'from' : 'de'} ${escapeHtml(slot.startTime)} ${locale === 'en' ? 'to' : 'à'} ${escapeHtml(slot.endTime)}</li>`
      }).join('')
    : `<li style="margin: 5px 0;">${messages.email.toDefine}</li>`

  const secondaryServicesHtml = booking.secondaryServices && booking.secondaryServices.length > 0 
    ? booking.secondaryServices.map(s => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        ${escapeHtml(s.name)} (x${s.quantity})
        <span style="color: #4caf50; font-size: 0.9em;"> -${s.discountPercent}%</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
        ${s.price.toFixed(2)}€
      </td>
    </tr>
  `).join('')
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${messages.email.clientSubject}</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">${messages.email.thankYou}</h1>
    <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 16px;">CCS Paris - ${locale === 'en' ? 'Professional Cleaning' : 'Nettoyage Professionnel'}</p>
  </div>
  
  <div style="background: white; padding: 35px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="font-size: 17px; margin-top: 0;">${messages.email.hello} <strong>${safeFirstName}</strong>,</p>
    
    <p style="font-size: 16px; color: #555;">
      ${messages.email.receivedRequest}
    </p>
    
    <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #d4af37;">
      <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 18px;">📋 ${messages.email.summary}</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: 600;">${safePrimaryServiceName} (x${booking.primaryServiceQty})</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right; font-weight: 600;">${booking.primaryServicePrice.toFixed(2)}€</td>
        </tr>
        ${secondaryServicesHtml}
        <tr style="background: #d4af37; color: white;">
          <td style="padding: 15px; font-weight: bold; font-size: 1.1em; border-radius: 0 0 0 8px;">${messages.email.estimatedTotal}</td>
          <td style="padding: 15px; font-weight: bold; font-size: 1.1em; text-align: right; border-radius: 0 0 8px 0;">${booking.totalAmount.toFixed(2)}€</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fff8e1; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #ffe082;">
      <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 16px;">📅 ${messages.email.requestedSlots}</h3>
      <ul style="margin: 0; padding-left: 20px; color: #555;">
        ${timeSlotsHtml}
      </ul>
    </div>
    
    <div style="background: #e3f2fd; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #90caf9;">
      <h3 style="color: #1976d2; margin: 0 0 10px 0; font-size: 16px;">📍 ${messages.email.interventionAddress}</h3>
      <p style="margin: 0; color: #555;">${safeAddress}</p>
    </div>
    
    <div style="background: #e8f5e9; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #a5d6a7;">
      <h3 style="color: #388e3c; margin: 0 0 15px 0; font-size: 16px;">⏳ ${messages.email.nextSteps}</h3>
      <ol style="margin: 0; padding-left: 20px; color: #555;">
        <li style="margin: 8px 0;">${messages.email.step1}</li>
        <li style="margin: 8px 0;">${messages.email.step2}</li>
        <li style="margin: 8px 0;">${messages.email.step3}</li>
        <li style="margin: 8px 0;">${messages.email.step4}</li>
      </ol>
    </div>
    
    <p style="font-size: 16px; color: #555; margin-bottom: 0;">
      ${messages.email.question}
    </p>
    <p style="margin-top: 10px;">
      📞 <a href="tel:+33651135174" style="color: #d4af37; text-decoration: none; font-weight: 600;">+33 6 51 13 51 74</a><br>
      💬 <a href="https://wa.me/33651135174" style="color: #25D366; text-decoration: none; font-weight: 600;">WhatsApp</a>
    </p>
  </div>
  
  <div style="background: #1a1a1a; padding: 25px; text-align: center; border-radius: 0 0 16px 16px;">
    <p style="color: #d4af37; margin: 0 0 10px 0; font-weight: 600; font-size: 15px;">CCS Paris</p>
    <p style="color: #888; margin: 0; font-size: 13px;">
      ${locale === 'en' ? 'Professional cleaning of sofas, carpets and textiles' : 'Nettoyage professionnel de canapés, tapis et textiles'}<br>
      Paris ${locale === 'en' ? 'and' : 'et'} Île-de-France
    </p>
  </div>
</body>
</html>
  `
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimit = checkBookingRateLimit(ip)
    
    if (!rateLimit.success) {
      return Response.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.' },
        { status: 429 }
      )
    }
    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address, 
      message, 
      locale: requestLocale,
      website, // Honeypot
      turnstileToken, // Cloudflare Turnstile
      bookingNumber: providedBookingNumber, // Numéro de réservation pré-généré
      primaryService,
      secondaryService,
      secondaryServices,
      discountPercent: requestDiscountPercent,
      timeSlots,
      totalAmount,
      services, 
      photos 
    } = body as BookingData

    // Vérification du honeypot - si rempli, c'est un bot
    if (website && website.trim() !== '') {
      console.log('🤖 Bot détecté via honeypot, IP:', ip)
      // Retourner un succès factice pour ne pas alerter le bot
      return Response.json({
        success: true,
        bookingId: 'fake-' + Date.now(),
        message: 'Réservation envoyée avec succès',
      })
    }

    // Vérification Cloudflare Turnstile
    const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY
    if (turnstileSecretKey) {
      if (!turnstileToken) {
        return Response.json(
          { error: 'Vérification de sécurité requise' },
          { status: 400 }
        )
      }

      const turnstileResponse = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: turnstileSecretKey,
            response: turnstileToken,
            remoteip: ip,
          }),
        }
      )

      const turnstileResult = await turnstileResponse.json() as { success: boolean; 'error-codes'?: string[] }

      if (!turnstileResult.success) {
        console.log('🤖 Bot détecté via Turnstile, IP:', ip, 'Erreurs:', turnstileResult['error-codes'])
        return Response.json(
          { error: 'Échec de la vérification de sécurité. Veuillez réessayer.' },
          { status: 400 }
        )
      }
    }

    // Déterminer la locale (par défaut 'fr')
    const locale: Locale = requestLocale === 'en' ? 'en' : 'fr'
    const messages = getMessages(locale)

    // Validation des champs obligatoires
    if (!firstName || !lastName || !email || !phone || !address) {
      return Response.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation de l'email
    if (!isValidEmail(email)) {
      return Response.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      )
    }

    // Validation du téléphone
    if (!isValidPhone(phone)) {
      return Response.json(
        { error: 'Numéro de téléphone invalide. Format attendu: 06 12 34 56 78 ou +33 6 12 34 56 78' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Récupérer le pourcentage de réduction depuis les paramètres du site
    let discountPercent = requestDiscountPercent || 20
    try {
      const settings = await payload.findGlobal({
        slug: 'site-settings',
      })
      if (settings.additionalServiceDiscount !== undefined) {
        discountPercent = settings.additionalServiceDiscount as number
      }
    } catch {
      // Utiliser la valeur par défaut
    }
    const discountMultiplier = 1 - discountPercent / 100

    // Récupérer les détails du service principal
    let primaryServiceData = null
    let servicesDisplay = 'Non spécifié'
    let calculatedTotal = 0

    // Tableau pour stocker les infos des services secondaires
    const secondaryServicesInfo: Array<{
      name: string
      quantity: number
      price: number
      discountPercent: number
    }> = []

    if (primaryService?.serviceId) {
      primaryServiceData = await payload.findByID({
        collection: 'services',
        id: primaryService.serviceId,
        locale: 'fr',
      })
      
      const primaryPrice = primaryService.price || primaryServiceData?.price || 0
      const primarySubtotal = primaryPrice * primaryService.quantity
      calculatedTotal += primarySubtotal
      
      servicesDisplay = `${primaryServiceData?.name || 'Service'} (x${primaryService.quantity}) - ${primarySubtotal.toFixed(2)}€`
    }

    // Gérer les services secondaires multiples (nouveau format)
    if (secondaryServices && secondaryServices.length > 0) {
      for (const secService of secondaryServices) {
        const secServiceData = await payload.findByID({
          collection: 'services',
          id: secService.serviceId,
          locale: 'fr',
        })
        
        const secPrice = secService.price || secServiceData?.price || 0
        const discountedPrice = secPrice * discountMultiplier
        const secSubtotal = discountedPrice * secService.quantity
        calculatedTotal += secSubtotal
        
        servicesDisplay += ` | ${secServiceData?.name || 'Service'} (x${secService.quantity}) - ${secSubtotal.toFixed(2)}€ (-${discountPercent}%)`
        
        secondaryServicesInfo.push({
          name: secServiceData?.name || 'Service',
          quantity: secService.quantity,
          price: secSubtotal,
          discountPercent,
        })
      }
    }
    // Fallback pour l'ancien format (un seul service secondaire)
    else if (secondaryService?.serviceId) {
      const secondaryServiceData = await payload.findByID({
        collection: 'services',
        id: secondaryService.serviceId,
        locale: 'fr',
      })
      
      const secondaryPrice = secondaryService.price || secondaryServiceData?.price || 0
      const discountedPrice = secondaryPrice * discountMultiplier
      const secondarySubtotal = discountedPrice * secondaryService.quantity
      calculatedTotal += secondarySubtotal
      
      servicesDisplay += ` | ${secondaryServiceData?.name || 'Service'} (x${secondaryService.quantity}) - ${secondarySubtotal.toFixed(2)}€ (-${discountPercent}%)`
      
      secondaryServicesInfo.push({
        name: secondaryServiceData?.name || 'Service',
        quantity: secondaryService.quantity,
        price: secondarySubtotal,
        discountPercent,
      })
    }

    // Fallback pour l'ancien format
    if (!primaryService && services && Object.keys(services).length > 0) {
      try {
        const serviceIds = Object.keys(services)
        const serviceDetails = await payload.find({
          collection: 'services',
          where: {
            id: { in: serviceIds },
          },
          locale: 'fr',
        })
        
        const serviceNames = serviceDetails.docs.map(s => {
          const qty = services[s.id]
          const name = s.name || 'Service'
          return qty > 1 ? `${name} (x${qty})` : name
        })
        
        servicesDisplay = serviceNames.length > 0 ? serviceNames.join(', ') : JSON.stringify(services)
      } catch {
        servicesDisplay = JSON.stringify(services)
      }
    }

    // Créer la réservation en base
    const bookingData: Record<string, unknown> = {
      firstName,
      lastName,
      email,
      phone,
      address,
      service: servicesDisplay,
      date: new Date().toISOString(),
      message,
      photos: photos || [],
      status: 'pending',
      totalAmount: totalAmount || calculatedTotal,
      timeSlots: timeSlots || [],
      clientEmailSent: false,
    }

    // Ajouter le numéro de réservation si fourni (sinon sera généré par le hook)
    if (providedBookingNumber) {
      bookingData.bookingNumber = providedBookingNumber
    }

    // Ajouter les données du service principal si présent
    if (primaryService?.serviceId) {
      bookingData.primaryService = {
        serviceId: primaryService.serviceId,
        quantity: primaryService.quantity,
        price: primaryService.price,
      }
    }

    // Ajouter les données du service secondaire si présent (ancien format - compatibilité)
    if (secondaryService?.serviceId && (!secondaryServices || secondaryServices.length === 0)) {
      const discountedPrice = (secondaryService.price || 0) * discountMultiplier
      bookingData.secondaryService = {
        hasSecondaryService: true,
        serviceId: secondaryService.serviceId,
        quantity: secondaryService.quantity,
        price: secondaryService.price,
        discountedPrice: discountedPrice,
      }
    }

    // Ajouter les services secondaires multiples (nouveau format)
    if (secondaryServices && secondaryServices.length > 0) {
      bookingData.secondaryServices = secondaryServices.map(s => ({
        serviceId: s.serviceId,
        quantity: s.quantity,
        price: s.price,
        discountPercent,
        discountedPrice: s.price * discountMultiplier * s.quantity,
      }))
      bookingData.discountPercent = discountPercent
    }

    const booking = await payload.create({
      collection: 'bookings',
      data: bookingData as any,
    })

    // Marquer les créneaux comme "en attente" (pending)
    if (timeSlots && timeSlots.length > 0) {
      for (const slot of timeSlots) {
        // Vérifier si le créneau existe déjà
        const existingSlot = await (payload as any).find({
          collection: 'time-slots',
          where: {
            and: [
              { date: { equals: slot.date } },
              { startTime: { equals: slot.startTime } },
            ],
          },
        })

        if (existingSlot.docs.length > 0) {
          // Mettre à jour le créneau existant
          await (payload as any).update({
            collection: 'time-slots',
            id: existingSlot.docs[0].id,
            data: {
              status: 'pending',
              bookingId: booking.id,
            },
          })
        } else {
          // Créer un nouveau créneau
          await (payload as any).create({
            collection: 'time-slots',
            data: {
              date: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: 'pending',
              bookingId: booking.id,
            },
          })
        }
      }
    }

    // Configuration email
    const adminUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
    const contactEmail = process.env.CCS_CONTACT_EMAIL || 'contact@ccs-paris.fr'

    // Préparer les données pour les emails
    const primaryServiceName = primaryServiceData?.name || (services ? 'Services multiples' : 'Service non spécifié')
    const primaryServiceQty = primaryService?.quantity || 1
    const primaryServicePrice = (primaryService?.price || 0) * primaryServiceQty
    const finalTotal = totalAmount || calculatedTotal

    // Envoyer email de notification à l'admin
    try {
      const adminSubject = messages.email.adminSubject.replace('{name}', `${firstName} ${lastName}`)
      await payload.sendEmail({
        to: contactEmail,
        from: contactEmail,
        subject: adminSubject,
        html: generateAdminEmailHtml({
          id: String(booking.id),
          firstName,
          lastName,
          email,
          phone,
          address,
          primaryServiceName,
          primaryServiceQty,
          primaryServicePrice,
          secondaryServices: secondaryServicesInfo.length > 0 ? secondaryServicesInfo : undefined,
          timeSlots: timeSlots || [],
          totalAmount: finalTotal,
          message,
          date: new Date().toISOString(),
        }, adminUrl),
      })
      console.log('✅ Email envoyé avec succès à', contactEmail)
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email admin:', emailError)
    }

    // Envoyer email de confirmation au client
    try {
      await payload.sendEmail({
        to: email,
        from: contactEmail,
        subject: messages.email.clientSubject,
        html: generateClientEmailHtml({
          firstName,
          lastName,
          primaryServiceName,
          primaryServiceQty,
          primaryServicePrice,
          secondaryServices: secondaryServicesInfo.length > 0 ? secondaryServicesInfo : undefined,
          timeSlots: timeSlots || [],
          totalAmount: finalTotal,
          address,
        }, locale),
      })
      console.log('✅ Email client envoyé avec succès à', email)
      
      // Mettre à jour le statut d'envoi de l'email
      await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: {
          clientEmailSent: true,
        } as any,
      })
    } catch (emailError) {
      console.error('❌ Erreur lors de l\'envoi de l\'email client:', emailError)
    }

    return Response.json({
      success: true,
      bookingId: booking.id,
      message: 'Réservation envoyée avec succès',
    })
  } catch (error) {
    console.error('Booking error:', error)
    // Ne pas exposer les détails de l'erreur au client
    return Response.json(
      { error: 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.' },
      { status: 400 }
    )
  }
}
