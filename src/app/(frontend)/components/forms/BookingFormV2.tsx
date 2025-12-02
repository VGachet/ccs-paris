'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import styles from './BookingFormV2.module.css'

// =====================================================
// Types et Interfaces
// =====================================================

interface Service {
  id: string
  name?: string
  title?: string
  slug: string
  pricing?: string
  price?: number
}

interface SecondaryServiceItem {
  serviceId: string
  quantity: number
  price: number
}

interface TimeSlot {
  id: string | null
  date: string
  startTime: string
  endTime: string
  status: 'available' | 'blocked' | 'pending' | 'confirmed'
}

interface SelectedTimeSlot {
  date: string
  startTime: string
  endTime: string
}

interface BookingFormV2Props {
  title?: string
  description?: string
}

// =====================================================
// Composant Principal
// =====================================================

export const BookingFormV2 = ({ title, description }: BookingFormV2Props) => {
  const t = useTranslations('bookingV2')
  const tCommon = useTranslations('booking')
  const locale = useLocale()

  // États généraux
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [services, setServices] = useState<Service[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  // États des étapes de l'accordéon (1-7)
  const [activeStep, setActiveStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // État étape 1 - Service principal
  const [primaryService, setPrimaryService] = useState<{
    serviceId: string
    quantity: number
    price: number
  } | null>(null)

  // État étape 2 - Services secondaires (multiples)
  const [wantsSecondService, setWantsSecondService] = useState<boolean | null>(null)
  const [secondaryServices, setSecondaryServices] = useState<SecondaryServiceItem[]>([])
  const [discountPercent, setDiscountPercent] = useState(20) // Valeur par défaut

  // État étape 3 - Créneaux
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<SelectedTimeSlot[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // État étape 4 - Coordonnées
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })

  // État étape 5 - Adresse
  const [address, setAddress] = useState('')

  // État étape 6 - Photos
  const [photos, setPhotos] = useState<File[]>([])

  // État étape 7 - Message optionnel
  const [message, setMessage] = useState('')

  // =====================================================
  // Chargement des données
  // =====================================================

  // Charger les services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`/api/public/services?locale=${locale}`)
        const data = await response.json()
        setServices(data || [])
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
    fetchServices()
  }, [locale])

  // Charger le pourcentage de réduction depuis les paramètres du site
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/public/site-settings')
        const data = await response.json()
        if (data.additionalServiceDiscount !== undefined) {
          setDiscountPercent(data.additionalServiceDiscount)
        }
      } catch (error) {
        console.error('Error fetching site settings:', error)
      }
    }
    fetchSettings()
  }, [])

  // Charger les créneaux
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + 60) // 60 jours

        const response = await fetch(
          `/api/public/time-slots?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        )
        const data = await response.json()
        setTimeSlots(data.slots || [])
      } catch (error) {
        console.error('Error fetching time slots:', error)
      }
    }
    fetchTimeSlots()
  }, [])

  // =====================================================
  // Calculs et utilitaires
  // =====================================================

  // Calculer le multiplicateur de réduction
  const discountMultiplier = useMemo(() => {
    return 1 - discountPercent / 100
  }, [discountPercent])

  // Calculer le total
  const totalAmount = useMemo(() => {
    let total = 0
    if (primaryService) {
      total += primaryService.price * primaryService.quantity
    }
    // Appliquer la réduction sur tous les services secondaires
    for (const service of secondaryServices) {
      total += service.price * service.quantity * discountMultiplier
    }
    return total
  }, [primaryService, secondaryServices, discountMultiplier])

  // Obtenir le nom d'un service par ID
  const getServiceName = useCallback(
    (serviceId: string) => {
      const service = services.find((s) => s.id === serviceId)
      return service?.name || service?.title || 'Service'
    },
    [services]
  )

  // Vérifier si une étape est complète
  const isStepComplete = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 1:
          return primaryService !== null
        case 2:
          return wantsSecondService !== null && (wantsSecondService === false || secondaryServices.length > 0)
        case 3:
          return selectedTimeSlots.length > 0
        case 4:
          return (
            contactInfo.firstName.trim() !== '' &&
            contactInfo.lastName.trim() !== '' &&
            contactInfo.email.trim() !== '' &&
            contactInfo.phone.trim() !== ''
          )
        case 5:
          return address.trim() !== ''
        case 6:
          return true // Photos optionnelles
        case 7:
          return true // Récapitulatif toujours valide
        default:
          return false
      }
    },
    [primaryService, wantsSecondService, secondaryServices, selectedTimeSlots, contactInfo, address]
  )

  // Passer à l'étape suivante
  const goToNextStep = useCallback(() => {
    if (isStepComplete(activeStep)) {
      setCompletedSteps((prev) => [...new Set([...prev, activeStep])])
      setActiveStep((prev) => Math.min(prev + 1, 7))
    }
  }, [activeStep, isStepComplete])

  // =====================================================
  // Gestion des services
  // =====================================================

  const handleSelectPrimaryService = (service: Service) => {
    const price = service.price || 0
    if (primaryService?.serviceId === service.id) {
      // Augmenter la quantité
      setPrimaryService({
        ...primaryService,
        quantity: primaryService.quantity + 1,
      })
    } else {
      // Nouveau service principal sélectionné
      // Réinitialiser les services secondaires car la liste disponible change
      if (primaryService?.serviceId !== service.id) {
        setSecondaryServices([])
        setWantsSecondService(null)
      }
      setPrimaryService({
        serviceId: service.id,
        quantity: 1,
        price,
      })
    }
  }

  const handlePrimaryQuantity = (change: number) => {
    if (!primaryService) return
    const newQty = primaryService.quantity + change
    if (newQty <= 0) {
      setPrimaryService(null)
      // Réinitialiser les services secondaires quand on supprime le service principal
      setSecondaryServices([])
      setWantsSecondService(null)
    } else {
      setPrimaryService({
        ...primaryService,
        quantity: newQty,
      })
    }
  }

  const handleSelectSecondaryService = (service: Service) => {
    const price = service.price || 0
    const existingIndex = secondaryServices.findIndex(s => s.serviceId === service.id)
    
    if (existingIndex >= 0) {
      // Si le service existe déjà, augmenter la quantité
      setSecondaryServices(prev => prev.map((s, i) => 
        i === existingIndex 
          ? { ...s, quantity: s.quantity + 1 }
          : s
      ))
    } else {
      // Ajouter un nouveau service secondaire
      setSecondaryServices(prev => [...prev, {
        serviceId: service.id,
        quantity: 1,
        price,
      }])
    }
  }

  const handleSecondaryQuantity = (serviceId: string, change: number) => {
    setSecondaryServices(prev => {
      const updated = prev.map(s => {
        if (s.serviceId === serviceId) {
          const newQty = s.quantity + change
          return newQty <= 0 ? null : { ...s, quantity: newQty }
        }
        return s
      }).filter((s): s is SecondaryServiceItem => s !== null)
      return updated
    })
  }

  const removeSecondaryService = (serviceId: string) => {
    setSecondaryServices(prev => prev.filter(s => s.serviceId !== serviceId))
  }

  // =====================================================
  // Gestion du calendrier
  // =====================================================

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // Jours vides avant le premier jour
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Jours du mois
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }

    return days
  }, [currentMonth])

  const getSlotsForDate = useCallback(
    (date: Date) => {
      const dateStr = date.toISOString().split('T')[0]
      return timeSlots.filter((slot) => slot.date === dateStr)
    },
    [timeSlots]
  )

  const isDateSelectable = useCallback(
    (date: Date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (date < today) return false

      const slots = getSlotsForDate(date)
      return slots.some((slot) => slot.status === 'available')
    },
    [getSlotsForDate]
  )

  const handleSelectTimeSlot = (date: Date, slot: TimeSlot) => {
    if (slot.status !== 'available') return

    const dateStr = date.toISOString().split('T')[0]
    const newSlot: SelectedTimeSlot = {
      date: dateStr,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }

    // Vérifier si le créneau est déjà sélectionné
    const exists = selectedTimeSlots.some(
      (s) => s.date === newSlot.date && s.startTime === newSlot.startTime
    )

    if (exists) {
      setSelectedTimeSlots((prev) =>
        prev.filter((s) => !(s.date === newSlot.date && s.startTime === newSlot.startTime))
      )
    } else {
      setSelectedTimeSlots((prev) => [...prev, newSlot])
    }
  }

  const removeTimeSlot = (slot: SelectedTimeSlot) => {
    setSelectedTimeSlots((prev) =>
      prev.filter((s) => !(s.date === slot.date && s.startTime === slot.startTime))
    )
  }

  // =====================================================
  // Gestion des photos
  // =====================================================

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalPhotos = photos.length + files.length

    if (totalPhotos > 5) {
      setError(tCommon('maxPhotos'))
      setTimeout(() => setError(''), 3000)
      return
    }

    setPhotos((prev) => [...prev, ...files])
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  // =====================================================
  // Soumission du formulaire
  // =====================================================

  const handleSubmit = async () => {
    if (!primaryService || selectedTimeSlots.length === 0) {
      setError(t('fillRequired'))
      return
    }

    setLoading(true)
    setError('')

    try {
      // Upload des photos
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

      // Envoi de la réservation
      const response = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactInfo,
          address,
          message,
          primaryService,
          secondaryServices: wantsSecondService && secondaryServices.length > 0 
            ? secondaryServices.map(s => ({
                ...s,
                discountPercent,
              }))
            : undefined,
          discountPercent,
          timeSlots: selectedTimeSlots,
          totalAmount,
          photos: photoIds,
        }),
      })

      if (!response.ok) throw new Error('Erreur lors de l\'envoi')

      setSuccess(true)
      // Réinitialiser le formulaire
      setPrimaryService(null)
      setWantsSecondService(null)
      setSecondaryServices([])
      setSelectedTimeSlots([])
      setContactInfo({ firstName: '', lastName: '', email: '', phone: '' })
      setAddress('')
      setMessage('')
      setPhotos([])
      setActiveStep(1)
      setCompletedSteps([])
    } catch (_err) {
      setError(tCommon('error'))
    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // Rendu des étapes
  // =====================================================

  const renderStep1 = () => (
    <div className={styles.servicesList}>
      {services.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '1rem' }}>
          {t('loadingServices')}
        </p>
      ) : (
        services.map((service) => {
          const isSelected = primaryService?.serviceId === service.id
          return (
            <div
              key={service.id}
              className={`${styles.serviceItem} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleSelectPrimaryService(service)}
            >
              <div className={styles.serviceInfo}>
                <span className={styles.serviceName}>
                  {service.name || service.title || 'Service'}
                </span>
                {service.price !== undefined && (
                  <span className={styles.servicePrice}>{service.price.toFixed(2)}€</span>
                )}
              </div>
              {isSelected && primaryService && (
                <div className={styles.quantityControls}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrimaryQuantity(-1)
                    }}
                    className={styles.quantityButton}
                  >
                    −
                  </button>
                  <span className={styles.quantity}>{primaryService.quantity}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrimaryQuantity(1)
                    }}
                    className={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )
        })
      )}
      {primaryService && (
        <button
          type="button"
          className={styles.continueButton}
          onClick={goToNextStep}
        >
          {t('continue')}
        </button>
      )}
    </div>
  )

  const renderStep2 = () => {
    // Fonction pour passer à l'étape suivante en marquant l'étape 2 comme complète
    const skipToNextStep = () => {
      setWantsSecondService(false)
      setSecondaryServices([])
      setCompletedSteps((prev) => [...new Set([...prev, 2])])
      setActiveStep(3)
    }

    // Toujours afficher les boutons de choix pour permettre de changer d'avis
    const choiceButtons = (
      <div className={styles.secondServicePrompt}>
        <h4>🎁 {t('secondServiceOffer')}</h4>
        <p>{t('secondServiceDescription', { discount: discountPercent })}</p>
        <div className={styles.promptButtons}>
          <button
            type="button"
            className={`${styles.promptButton} ${styles.yes} ${wantsSecondService === true ? styles.selected : ''}`}
            onClick={() => setWantsSecondService(true)}
          >
            {t('yes')}
          </button>
          <button
            type="button"
            className={`${styles.promptButton} ${styles.no} ${wantsSecondService === false ? styles.selected : ''}`}
            onClick={skipToNextStep}
          >
            {t('no')}
          </button>
        </div>
      </div>
    )

    // Si l'utilisateur a dit non, afficher juste les boutons de choix
    if (wantsSecondService === false) {
      return choiceButtons
    }

    // Si l'utilisateur n'a pas encore choisi, afficher les boutons
    if (wantsSecondService === null) {
      return choiceButtons
    }

    // Services disponibles (exclure le service principal et ceux déjà sélectionnés)
    const selectedSecondaryIds = secondaryServices.map(s => s.serviceId)
    const availableServices = services.filter(
      (s) => s.id !== primaryService?.serviceId && !selectedSecondaryIds.includes(s.id)
    )

    return (
      <div className={styles.secondaryServicesContainer}>
        {/* Services secondaires déjà sélectionnés */}
        {secondaryServices.length > 0 && (
          <div className={styles.selectedSecondaryServices}>
            <div className={styles.selectedServicesHeader}>
              <span>✅ {t('selectedAdditionalServices')} ({secondaryServices.length})</span>
            </div>
            {secondaryServices.map((service) => {
              const serviceData = services.find(s => s.id === service.serviceId)
              const discountedPrice = service.price * discountMultiplier
              return (
                <div key={service.serviceId} className={`${styles.serviceItem} ${styles.selected}`}>
                  <div className={styles.serviceInfo}>
                    <span className={styles.serviceName}>
                      {serviceData?.name || serviceData?.title || 'Service'}
                      <span className={styles.discountBadge}>-{discountPercent}%</span>
                    </span>
                    <span className={styles.servicePrice}>
                      <s style={{ color: '#999', marginRight: '0.5rem' }}>
                        {service.price.toFixed(2)}€
                      </s>
                      {discountedPrice.toFixed(2)}€
                    </span>
                  </div>
                  <div className={styles.quantityControls}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSecondaryQuantity(service.serviceId, -1)
                      }}
                      className={styles.quantityButton}
                    >
                      −
                    </button>
                    <span className={styles.quantity}>{service.quantity}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSecondaryQuantity(service.serviceId, 1)
                      }}
                      className={styles.quantityButton}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSecondaryService(service.serviceId)
                      }}
                      className={styles.removeServiceButton}
                      title={t('removeService')}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Liste des services disponibles à ajouter */}
        {availableServices.length > 0 && (
          <div className={styles.addMoreServices}>
            <div className={styles.addServicesHeader}>
              <span>➕ {t('addAnotherService')}</span>
            </div>
            <div className={styles.servicesList}>
              {availableServices.map((service) => {
                const discountedPrice = (service.price || 0) * discountMultiplier
                return (
                  <div
                    key={service.id}
                    className={styles.serviceItem}
                    onClick={() => handleSelectSecondaryService(service)}
                  >
                    <div className={styles.serviceInfo}>
                      <span className={styles.serviceName}>
                        {service.name || service.title || 'Service'}
                        <span className={styles.discountBadge}>-{discountPercent}%</span>
                      </span>
                      {service.price !== undefined && (
                        <span className={styles.servicePrice}>
                          <s style={{ color: '#999', marginRight: '0.5rem' }}>
                            {service.price.toFixed(2)}€
                          </s>
                          {discountedPrice.toFixed(2)}€
                        </span>
                      )}
                    </div>
                    <div className={styles.addServiceIcon}>+</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Message si tous les services sont sélectionnés */}
        {availableServices.length === 0 && secondaryServices.length > 0 && (
          <p style={{ textAlign: 'center', color: '#666', margin: '1rem 0' }}>
            {t('allServicesSelected')}
          </p>
        )}

        {/* Boutons d'action */}
        <div className={styles.step2Actions}>
          <button
            type="button"
            className={styles.continueButton}
            onClick={goToNextStep}
            disabled={secondaryServices.length === 0}
          >
            {t('continue')} ({secondaryServices.length} {secondaryServices.length > 1 ? t('servicesAdded') : t('serviceAdded')})
          </button>
          <button
            type="button"
            className={styles.skipButton}
            onClick={() => {
              setWantsSecondService(false)
              setSecondaryServices([])
              goToNextStep()
            }}
          >
            {t('skipStep')}
          </button>
        </div>
      </div>
    )
  }

  const renderStep3 = () => {
    const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ]

    return (
      <div className={styles.calendarSection}>
        {/* Calendrier */}
        <div className={styles.calendar}>
          <div className={styles.calendarHeader}>
            <div className={styles.calendarNav}>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
              >
                ◀
              </button>
              <span className={styles.currentMonth}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                type="button"
                className={styles.navButton}
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                ▶
              </button>
            </div>
          </div>

          <div className={styles.calendarGrid}>
            {weekDays.map((day) => (
              <div key={day} className={styles.dayHeader}>
                {day}
              </div>
            ))}
            {daysInMonth.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className={`${styles.dayCell} ${styles.empty}`} />
              }

              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const isPast = day < today
              const isToday = day.toDateString() === today.toDateString()
              const isSelected = selectedDate?.toDateString() === day.toDateString()
              const hasAvailableSlots = isDateSelectable(day)

              return (
                <div
                  key={day.toISOString()}
                  className={`${styles.dayCell} 
                    ${isPast ? styles.past : ''} 
                    ${isToday ? styles.today : ''} 
                    ${isSelected ? styles.selected : ''} 
                    ${hasAvailableSlots ? styles.hasSlots : ''}
                    ${!hasAvailableSlots && !isPast ? styles.disabled : ''}`}
                  onClick={() => {
                    if (!isPast && hasAvailableSlots) {
                      setSelectedDate(day)
                    }
                  }}
                >
                  {day.getDate()}
                </div>
              )
            })}
          </div>
        </div>

        {/* Créneaux horaires pour la date sélectionnée */}
        {selectedDate && (
          <div className={styles.timeSlotsSection}>
            <div className={styles.timeSlotsHeader}>
              📅 {t('slotsFor')}{' '}
              {selectedDate.toLocaleDateString(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </div>
            <div className={styles.timeSlotsList}>
              {getSlotsForDate(selectedDate).map((slot) => {
                const isSlotSelected = selectedTimeSlots.some(
                  (s) =>
                    s.date === selectedDate.toISOString().split('T')[0] &&
                    s.startTime === slot.startTime
                )
                return (
                  <div
                    key={`${slot.date}-${slot.startTime}`}
                    className={`${styles.timeSlot} 
                      ${isSlotSelected ? styles.selected : ''} 
                      ${slot.status !== 'available' ? styles.unavailable : ''}
                      ${slot.status === 'pending' ? styles.pending : ''}`}
                    onClick={() => handleSelectTimeSlot(selectedDate, slot)}
                  >
                    {slot.startTime} - {slot.endTime}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Créneaux sélectionnés */}
        {selectedTimeSlots.length > 0 && (
          <div className={styles.selectedSlots}>
            <div className={styles.selectedSlotsTitle}>
              ✅ {t('selectedSlots')} ({selectedTimeSlots.length})
            </div>
            <div className={styles.selectedSlotsList}>
              {selectedTimeSlots.map((slot, idx) => (
                <div key={idx} className={styles.selectedSlotChip}>
                  {new Date(slot.date).toLocaleDateString(locale, {
                    day: 'numeric',
                    month: 'short',
                  })}{' '}
                  {slot.startTime}-{slot.endTime}
                  <button
                    type="button"
                    className={styles.removeSlot}
                    onClick={() => removeTimeSlot(slot)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTimeSlots.length > 0 && (
          <button
            type="button"
            className={styles.continueButton}
            onClick={goToNextStep}
          >
            {t('continue')}
          </button>
        )}
      </div>
    )
  }

  const renderStep4 = () => (
    <div className={styles.formFields}>
      <div className={styles.formRow}>
        <input
          type="text"
          className={styles.formInput}
          placeholder={tCommon('firstName')}
          value={contactInfo.firstName}
          onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
          required
        />
        <input
          type="text"
          className={styles.formInput}
          placeholder={tCommon('lastName')}
          value={contactInfo.lastName}
          onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
          required
        />
      </div>
      <div className={styles.formRow}>
        <input
          type="email"
          className={styles.formInput}
          placeholder={tCommon('email')}
          value={contactInfo.email}
          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
          required
        />
        <input
          type="tel"
          className={styles.formInput}
          placeholder={tCommon('phone')}
          value={contactInfo.phone}
          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
          required
        />
      </div>
      <button
        type="button"
        className={styles.continueButton}
        onClick={goToNextStep}
        disabled={!isStepComplete(4)}
      >
        {t('continue')}
      </button>
    </div>
  )

  const renderStep5 = () => (
    <div className={styles.formFields}>
      <input
        type="text"
        className={styles.formInput}
        placeholder={tCommon('address')}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
      />
      <p style={{ fontSize: '0.85rem', color: '#666', margin: '0.5rem 0 0 0' }}>
        {t('addressHint')}
      </p>
      <button
        type="button"
        className={styles.continueButton}
        onClick={goToNextStep}
        disabled={!isStepComplete(5)}
      >
        {t('continue')}
      </button>
    </div>
  )

  const renderStep6 = () => (
    <div className={styles.photosSection}>
      <p className={styles.photosDescription}>{tCommon('photosDescription')}</p>

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
          📷 {tCommon('addPhotos')} ({photos.length}/5)
        </label>
      )}

      <button
        type="button"
        className={styles.continueButton}
        onClick={goToNextStep}
      >
        {t('continue')}
      </button>
      <button
        type="button"
        className={styles.skipButton}
        onClick={goToNextStep}
      >
        {t('skipStep')}
      </button>
    </div>
  )

  const renderStep7 = () => (
    <div className={styles.summary}>
      {/* Services */}
      <div className={styles.summaryCard}>
        <h4>🧹 {t('servicesOrdered')}</h4>
        {primaryService && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>
              {getServiceName(primaryService.serviceId)} (x{primaryService.quantity})
            </span>
            <span className={styles.summaryValue}>
              {(primaryService.price * primaryService.quantity).toFixed(2)}€
            </span>
          </div>
        )}
        {secondaryServices.length > 0 && (
          <>
            <div className={styles.summaryDivider}>
              <small style={{ color: '#666' }}>{t('additionalServicesLabel')}</small>
            </div>
            {secondaryServices.map((service) => (
              <div key={service.serviceId} className={styles.summaryRow}>
                <span className={styles.summaryLabel}>
                  {getServiceName(service.serviceId)} (x{service.quantity})
                  <span className={styles.discountBadge}>-{discountPercent}%</span>
                </span>
                <span className={styles.summaryValue}>
                  {(service.price * service.quantity * discountMultiplier).toFixed(2)}€
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Créneaux */}
      <div className={styles.summaryCard}>
        <h4>📅 {t('selectedSlots')}</h4>
        {selectedTimeSlots.map((slot, idx) => (
          <div key={idx} className={styles.summaryRow}>
            <span className={styles.summaryLabel}>
              {new Date(slot.date).toLocaleDateString(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
            <span className={styles.summaryValue}>
              {slot.startTime} - {slot.endTime}
            </span>
          </div>
        ))}
      </div>

      {/* Coordonnées */}
      <div className={styles.summaryCard}>
        <h4>👤 {t('contactInfo')}</h4>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t('name')}</span>
          <span className={styles.summaryValue}>
            {contactInfo.firstName} {contactInfo.lastName}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t('emailLabel')}</span>
          <span className={styles.summaryValue}>{contactInfo.email}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t('phoneLabel')}</span>
          <span className={styles.summaryValue}>{contactInfo.phone}</span>
        </div>
      </div>

      {/* Adresse */}
      <div className={styles.summaryCard}>
        <h4>📍 {t('addressLabel')}</h4>
        <p style={{ margin: 0, color: '#333' }}>{address}</p>
      </div>

      {/* Message optionnel */}
      <div className={styles.formFields}>
        <textarea
          className={styles.formTextarea}
          placeholder={tCommon('message')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>

      {/* Total */}
      <div className={styles.summaryTotal}>
        <span className={styles.label}>{t('estimatedTotal')}</span>
        <span className={styles.amount}>{totalAmount.toFixed(2)}€</span>
      </div>

      <button
        type="button"
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className={styles.loadingSpinner} />
            {tCommon('sending')}
          </>
        ) : (
          <>✨ {t('confirmBooking')}</>
        )}
      </button>
    </div>
  )

  // =====================================================
  // Rendu principal
  // =====================================================

  const phoneNumber = '+33651135174'
  const whatsappMessage = encodeURIComponent(
    'Bonjour, je souhaite obtenir un devis pour vos services de nettoyage.'
  )

  const steps = [
    { id: 1, title: t('step1Title'), subtitle: t('step1Subtitle') },
    { id: 2, title: t('step2Title'), subtitle: t('step2Subtitle') },
    { id: 3, title: t('step3Title'), subtitle: t('step3Subtitle') },
    { id: 4, title: t('step4Title'), subtitle: t('step4Subtitle') },
    { id: 5, title: t('step5Title'), subtitle: t('step5Subtitle') },
    { id: 6, title: t('step6Title'), subtitle: t('step6Subtitle') },
    { id: 7, title: t('step7Title'), subtitle: t('step7Subtitle') },
  ]

  const renderStepContent = (stepId: number) => {
    switch (stepId) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return renderStep5()
      case 6:
        return renderStep6()
      case 7:
        return renderStep7()
      default:
        return null
    }
  }

  if (success) {
    return (
      <div className={styles.bookingForm}>
        <div className={styles.successMessage}>
          <span>🎉</span>
          <div>
            <strong>{t('successTitle')}</strong>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              {t('successMessage')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.bookingForm}>
      {/* Header */}
      <div className={styles.header}>
        <h3>{title || t('formTitle')}</h3>
        {description && <p>{description}</p>}
      </div>

      {/* Boutons de contact rapide */}
      <div className={styles.contactButtons}>
        <a href={`tel:${phoneNumber}`} className={styles.callButton}>
          📞 {tCommon('callNow')}
        </a>
        <a
          href={`https://wa.me/${phoneNumber.replace(/\+/g, '')}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappButton}
        >
          💬 {tCommon('whatsapp')}
        </a>
      </div>

      <div className={styles.divider}>
        <span>{tCommon('or')}</span>
      </div>

      {/* Message d'erreur */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Accordéon des étapes */}
      <div className={styles.accordionContainer}>
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id)
          const isActive = activeStep === step.id
          const isDisabled = step.id > 1 && !completedSteps.includes(step.id - 1) && !isActive

          return (
            <div key={step.id} className={styles.accordionStep}>
              <div
                className={`${styles.accordionHeader} 
                  ${isCompleted ? styles.completed : ''} 
                  ${isActive ? styles.active : ''} 
                  ${isDisabled ? styles.disabled : ''}`}
                onClick={() => {
                  if (!isDisabled) {
                    setActiveStep(step.id)
                  }
                }}
              >
                <div className={styles.stepNumber}>
                  {isCompleted ? '✓' : step.id}
                </div>
                <div>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <div className={styles.stepSubtitle}>{step.subtitle}</div>
                </div>
                <span className={styles.chevron}>▼</span>
              </div>
              <div
                className={`${styles.accordionContent} ${isActive ? styles.open : ''}`}
              >
                {renderStepContent(step.id)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
