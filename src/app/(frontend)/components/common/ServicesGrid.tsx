'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import styles from './ServicesGrid.module.css'

interface MediaItem {
  url: string
  alt?: string
}

interface Service {
  id: string
  name: string
  slug: string
  description: string
  image?: MediaItem
  video?: MediaItem
  beforeImage?: MediaItem
  afterImage?: MediaItem
  pricing?: string
  price?: number
  pricePrefix?: boolean
  columnSpan?: '1' | '2' | '3' | '4'
}

interface Promotion {
  id: string
  discountPercentage?: number
}

export function ServicesGrid() {
  const [services, setServices] = useState<Service[]>([])
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [sliderPositions, setSliderPositions] = useState<Record<string, number>>({})
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [playingVideos, setPlayingVideos] = useState<Record<string, boolean>>({})
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'
  const t = useTranslations('services')

  const handleMouseDown = (serviceId: string) => {
    setIsDragging(serviceId)
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, serviceId: string) => {
    if (isDragging !== serviceId) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
    
    setSliderPositions(prev => ({ ...prev, [serviceId]: clampedPercentage }))
  }

  const handleTouchStart = (serviceId: string) => {
    setIsDragging(serviceId)
  }

  const handleTouchEnd = () => {
    setIsDragging(null)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>, serviceId: string) => {
    if (isDragging !== serviceId) return
    
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100)
    
    setSliderPositions(prev => ({ ...prev, [serviceId]: clampedPercentage }))
  }

  const toggleVideo = (serviceId: string, videoRef: HTMLVideoElement | null) => {
    if (!videoRef) return
    
    const isPlaying = playingVideos[serviceId]
    
    if (isPlaying) {
      videoRef.pause()
      setPlayingVideos(prev => ({ ...prev, [serviceId]: false }))
    } else {
      videoRef.play()
      setPlayingVideos(prev => ({ ...prev, [serviceId]: true }))
    }
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(null)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchend', handleGlobalMouseUp)
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('touchend', handleGlobalMouseUp)
    }
  }, [])

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch(`/api/public/services?locale=${locale}`)
        const data = await response.json()
        setServices(data)
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }
    
    async function fetchPromotion() {
      try {
        const response = await fetch('/api/public/promotions')
        const data = await response.json()
        setPromotion(data.promotion)
      } catch (error) {
        console.error('Error fetching promotion:', error)
      }
    }
    
    fetchServices()
    fetchPromotion()
  }, [locale])

  const calculateDiscountedPrice = (price: number): number => {
    if (!promotion || !promotion.discountPercentage) return price
    return price * (1 - promotion.discountPercentage / 100)
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Chargement des services...</p>
      </div>
    )
  }

  if (services.length === 0) {
    return null
  }

  return (
    <section className={styles.servicesSection}>
      <div className="container">
        <div className={styles.servicesGrid}>
          {services.map((service) => {
            const sliderPosition = sliderPositions[service.id] ?? 50
            const hasComparison = service.beforeImage?.url && service.afterImage?.url
            const columnSpan = service.columnSpan || '1'
            const hasVideo = service.video?.url
            const isPlaying = playingVideos[service.id] || false
            
            return (
            <div 
              key={service.id} 
              className={styles.serviceCard}
              data-column-span={columnSpan}
              style={{
                gridColumn: `span ${columnSpan}`
              }}
            >
              {hasVideo && service.video ? (
                <div className={styles.videoContainer}>
                  <video
                    id={`video-${service.id}`}
                    className={styles.serviceVideo}
                    src={service.video.url}
                    loop
                    playsInline
                    muted
                  />
                  <button
                    className={styles.videoPlayButton}
                    onClick={() => {
                      const video = document.getElementById(`video-${service.id}`) as HTMLVideoElement
                      toggleVideo(service.id, video)
                    }}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="5" width="4" height="14" fill="currentColor" rx="1"/>
                        <rect x="14" y="5" width="4" height="14" fill="currentColor" rx="1"/>
                      </svg>
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5.14v13.72L19 12L8 5.14z" fill="currentColor"/>
                      </svg>
                    )}
                  </button>
                </div>
              ) : hasComparison && service.beforeImage && service.afterImage ? (
                <div className={styles.comparisonSlider}>
                  <div 
                    className={styles.imageContainer}
                    onMouseDown={() => handleMouseDown(service.id)}
                    onMouseUp={handleMouseUp}
                    onMouseMove={(e) => handleMouseMove(e, service.id)}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={() => handleTouchStart(service.id)}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={(e) => handleTouchMove(e, service.id)}
                  >
                    <Image
                      src={service.beforeImage.url}
                      alt={service.beforeImage.alt || `${service.name} - Avant`}
                      width={400}
                      height={300}
                      className={styles.beforeImage}
                      style={{ objectFit: 'cover' }}
                    />
                    <div 
                      className={styles.afterImageContainer}
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <Image
                        src={service.afterImage.url}
                        alt={service.afterImage.alt || `${service.name} - Après`}
                        width={400}
                        height={300}
                        className={styles.afterImage}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div 
                      className={styles.sliderLine}
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className={styles.sliderHandle}>
                        <div className={styles.sliderArrows}>
                          <span>◀</span>
                          <span>▶</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.labels}>
                    <span className={styles.beforeLabel}>Avant</span>
                    <span className={styles.afterLabel}>Après</span>
                  </div>
                </div>
              ) : service.image?.url ? (
                <div className={styles.serviceImage}>
                  <Image
                    src={service.image.url}
                    alt={service.image.alt || service.name}
                    width={400}
                    height={300}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : null}
              <div className={styles.serviceContent}>
                <h3 className={styles.serviceName}>{service.name}</h3>
                {service.description && (
                  <div className={styles.serviceDescription}>
                    {service.description}
                  </div>
                )}
                {service.price && (
                  <div className={styles.priceContainer}>
                    {service.pricePrefix && (
                      <span className={styles.pricePrefix}>{t('from')}</span>
                    )}
                    {promotion && promotion.discountPercentage ? (
                      <>
                        <span className={styles.originalPrice}>{service.price.toFixed(2)}€</span>
                        <span className={styles.discountedPrice}>
                          {calculateDiscountedPrice(service.price).toFixed(2)}€
                        </span>
                        <span className={styles.discountBadge}>-{promotion.discountPercentage}%</span>
                      </>
                    ) : (
                      <span className={styles.servicePricing}>{service.price.toFixed(2)}€</span>
                    )}
                  </div>
                )}
                {!service.price && service.pricing && (
                  <p className={styles.servicePricing}>{service.pricing}</p>
                )}
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
