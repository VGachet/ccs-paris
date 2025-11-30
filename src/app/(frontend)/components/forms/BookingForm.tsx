'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import styles from './BookingForm.module.css'

interface BookingFormProps {
  title?: string
  description?: string
  variant?: 'default' | 'compact' | 'modal'
}

interface Service {
  id: string
  name?: string
  title?: string
  slug: string
  pricing?: string
}

export const BookingForm = ({
  title,
  description,
  variant = 'default',
}: BookingFormProps) => {
  const t = useTranslations('booking')
  const locale = useLocale()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<{ [key: string]: number }>({})
  const [photos, setPhotos] = useState<File[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    message: '',
  })

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/public/services?locale=${locale}`)
        const data = await response.json()
        console.log('Services fetched:', data)
        console.log('First service:', data[0])
        setServices(data || [])
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
    fetchServices()
  }, [locale])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleServiceQuantity = (serviceId: string, change: number) => {
    setSelectedServices((prev) => {
      const current = prev[serviceId] || 0
      const newValue = Math.max(0, current + change)
      if (newValue === 0) {
        const { [serviceId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [serviceId]: newValue }
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalPhotos = photos.length + files.length
    
    if (totalPhotos > 5) {
      setError(t('maxPhotos'))
      setTimeout(() => setError(''), 3000)
      return
    }
    
    setPhotos((prev) => [...prev, ...files])
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Upload photos first if any
      const photoIds: string[] = []
      if (photos.length > 0) {
        for (const photo of photos) {
          const photoFormData = new FormData()
          photoFormData.append('file', photo)

          const uploadResponse = await fetch('/api/media', {
            method: 'POST',
            body: photoFormData,
          })

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json()
            photoIds.push(uploadData.doc.id)
          }
        }
      }

      //TODO: SEND AN EMAIL WITH THE BOOKING DETAILS + SAVE BOKKINGS (NEED TO RECREATYE THE BOOKING COLLECTIONS - not avaialble in the admin pannel)
      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          services: selectedServices,
          photos: photoIds,
        }),
      })

      if (!response.ok) throw new Error('Erreur lors de l\'envoi')

      setSuccess(true)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        message: '',
      })
      setSelectedServices({})
      setPhotos([])

      setTimeout(() => setSuccess(false), 5000)
    } catch (_err) {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const phoneNumber = '+33651135174'
  const whatsappMessage = encodeURIComponent('Bonjour, je souhaite obtenir un devis pour vos services de nettoyage.')

  return (
    <div className={`${styles.bookingForm} ${styles[variant]}`}>
      <div className={styles.header}>
        <h3>{title || t('contactByMessage')}</h3>
      </div>

      <div className={styles.contactButtons}>
        <a href={`tel:${phoneNumber}`} className={styles.callButton}>
          📞 {t('callNow')}
        </a>
        <a 
          href={`https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappButton}
        >
          💬 {t('whatsapp')}
        </a>
      </div>

      <div className={styles.divider}>
        <span>{t('or')}</span>
      </div>

      {success && <div className={styles.successMessage}>{t('success')}</div>}

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {description && <p className={styles.formDescription}>{description || t('description')}</p>}

        <div className={styles.servicesSection}>
          <h4>{t('selectServices')}</h4>
          {services.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '1rem' }}>
              Chargement des services...
            </p>
          ) : (
            <div className={styles.servicesList}>
              {services.map((service) => {
                const serviceName = service.name || service.title || 'Service sans nom'
                console.log('Rendering service:', service.id, serviceName)
                return (
                  <div key={service.id} className={styles.serviceItem}>
                    <div className={styles.serviceInfo}>
                      <span className={styles.serviceName}>{serviceName}</span>
                      {service.pricing && (
                        <span className={styles.servicePrice}>{service.pricing}</span>
                      )}
                    </div>
                    <div className={styles.quantityControls}>
                      <button
                        type="button"
                        onClick={() => handleServiceQuantity(service.id, -1)}
                        className={styles.quantityButton}
                        disabled={!selectedServices[service.id]}
                      >
                        −
                      </button>
                      <span className={styles.quantity}>
                        {selectedServices[service.id] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleServiceQuantity(service.id, 1)}
                        className={styles.quantityButton}
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className={styles.row}>
          <input
            type="text"
            name="firstName"
            placeholder={t('firstName')}
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder={t('lastName')}
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.row}>
          <input
            type="email"
            name="email"
            placeholder={t('email')}
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
          <input
            type="tel"
            name="phone"
            placeholder={t('phone')}
            value={formData.phone}
            onChange={handleChange}
            required
            className={styles.formInput}
          />
        </div>

        <input
          type="text"
          name="address"
          placeholder={t('address')}
          value={formData.address}
          onChange={handleChange}
          required
          className={styles.fullWidth}
        />

        <textarea
          name="message"
          placeholder={t('message')}
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className={styles.formTextarea}
        />

        <div className={styles.photosSection}>
          <label className={styles.photosLabel}>
            {t('photos')}
            <span className={styles.photoDescription}>{t('photosDescription')}</span>
          </label>
          
          {photos.length > 0 && (
            <div className={styles.photosPreviews}>
              {photos.map((photo, index) => (
                <div key={index} className={styles.photoPreview}>
                  <img 
                    src={URL.createObjectURL(photo)} 
                    alt={`Preview ${index + 1}`}
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className={styles.removePhotoButton}
                    aria-label="Supprimer la photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {photos.length < 5 && (
            <label className={styles.photoUploadButton}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className={styles.fileInput}
              />
              📷 {t('addPhotos')} ({photos.length}/5)
            </label>
          )}
        </div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? t('sending') : t('submit')}
        </button>
      </form>
    </div>
  )
}
