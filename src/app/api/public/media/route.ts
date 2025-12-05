import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { checkMediaRateLimit, getClientIp } from '@/lib/rate-limit'

// Sanitizer le nom de fichier
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100)
}

// Générer le nom de fichier avec préfixe booking si fourni
function generateFilename(originalName: string, bookingNumber?: number): string {
  const sanitized = sanitizeFilename(originalName) || 'photo_reservation'
  
  if (bookingNumber) {
    return `booking_${bookingNumber}_${sanitized}`
  }
  
  return sanitized
}

// Vérifier les magic bytes pour valider le vrai type de fichier
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const magicBytes: Record<string, number[]> = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
  }
  
  const expectedBytes = magicBytes[mimeType]
  if (!expectedBytes) return false
  
  const fileHeader = Array.from(buffer.slice(0, expectedBytes.length))
  return expectedBytes.every((byte, index) => fileHeader[index] === byte)
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateLimit = checkMediaRateLimit(ip)
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.' },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier (images uniquement)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Seules les images sont acceptées.' },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Maximum 5MB.' },
        { status: 400 }
      )
    }

    // Convertir le File en Buffer pour validation et Payload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Vérifier les magic bytes pour valider le vrai type de fichier
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'Le contenu du fichier ne correspond pas à une image valide.' },
        { status: 400 }
      )
    }

    // Récupérer le numéro de réservation si fourni
    const bookingNumberStr = formData.get('bookingNumber') as string | null
    const bookingNumber = bookingNumberStr ? parseInt(bookingNumberStr, 10) : undefined

    // Générer le nom de fichier (avec préfixe booking si applicable)
    const finalFilename = generateFilename(file.name, bookingNumber)

    const payload = await getPayload({ config: configPromise })

    // Créer le média dans Payload
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: finalFilename,
      },
      file: {
        data: buffer,
        name: finalFilename,
        mimetype: file.type,
        size: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      doc: {
        id: media.id,
        url: media.url,
        filename: media.filename,
      },
    })
  } catch (error) {
    console.error('Erreur lors de l\'upload du média:', error)
    // Ne pas exposer les détails de l'erreur au client
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
