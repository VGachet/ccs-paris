'use client'

import { useEffect, useState } from 'react'
import styles from './PromoBanner.module.css'

interface Promotion {
  id: string
  title: string
  description?: string
  discountPercentage?: number
  bannerColor?: 'primary' | 'red' | 'green' | 'orange'
}

interface PromoBannerProps {
  locale: string
}

export const PromoBanner = ({ locale }: PromoBannerProps) => {
  const [promotion, setPromotion] = useState<Promotion | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await fetch(`/api/public/promotions?locale=${locale}`)
        const data = await response.json()
        setPromotion(data.promotion)
      } catch (error) {
        console.error('Error fetching promotion:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPromotion()
  }, [locale])

  if (isLoading || !promotion) {
    return null
  }

  const colorClass = promotion.bannerColor || 'primary'

  return (
    <div className={`${styles.banner} ${styles[colorClass]}`}>
      <div className={styles.content}>
        <div className={styles.mainContent}>
          <p className={styles.text}>
            {promotion.title}
            {promotion.discountPercentage && (
              <span className={styles.discount}>-{promotion.discountPercentage}%</span>
            )}
          </p>
          {promotion.description && (
            <p className={styles.description}>{promotion.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
