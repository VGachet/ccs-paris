'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import styles from './Testimonials.module.css'

interface Testimonial {
  id: string
  customerName: string
  customerTitle?: string
  customerAvatar?: string
  content: string
  rating: number
  date?: string
  order?: number
}

interface TestimonialsProps {
  maxDisplay?: number
  onCountChange?: (count: number) => void
}

export function Testimonials({ maxDisplay, onCountChange }: TestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const params = useParams()
  const locale = (params?.locale as string) || 'fr'
  const itemsPerPage = 3

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`/api/public/testimonials?locale=${locale}`)
        const data = await response.json()
        const displayedData = maxDisplay ? data.slice(0, maxDisplay) : data
        setTestimonials(displayedData || [])
        if (onCountChange) {
          onCountChange((displayedData || []).length)
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error)
        if (onCountChange) {
          onCountChange(0)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [locale, maxDisplay, onCountChange])

  // Auto-slide toutes les 7 secondes
  useEffect(() => {
    if (testimonials.length === 0) return

    const totalPages = Math.ceil(testimonials.length / itemsPerPage)
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages)
    }, 7000)

    return () => clearInterval(interval)
  }, [testimonials.length, itemsPerPage])

  const totalPages = Math.ceil(testimonials.length / itemsPerPage)
  const startIndex = currentPage * itemsPerPage
  const currentTestimonials = testimonials.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const renderStars = (rating: number) => {
    return (
      <div className={styles.rating}>
        {[...Array(5)].map((_, index) => (
          <span key={index} className={styles.star}>
            {index < rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long' })
  }

  if (loading || testimonials.length === 0) {
    return null
  }

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.slider}>
        <div 
          className={styles.sliderTrack}
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className={styles.sliderItem}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialHeader}>
                  <div className={styles.avatar}>
                    {testimonial.customerAvatar || '👤'}
                  </div>
                  <div className={styles.customerInfo}>
                    <h4 className={styles.customerName}>{testimonial.customerName}</h4>
                    {testimonial.customerTitle && (
                      <p className={styles.customerTitle}>{testimonial.customerTitle}</p>
                    )}
                  </div>
                </div>
                
                {renderStars(testimonial.rating)}
                
                <p className={styles.content}>"{testimonial.content}"</p>
                
                {testimonial.date && (
                  <div className={styles.date}>{formatDate(testimonial.date)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className={styles.dots}>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentPage ? styles.dotActive : ''}`}
              onClick={() => goToPage(index)}
              aria-label={`Aller à la page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
