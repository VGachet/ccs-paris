'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import styles from './BookingForm.module.css'

interface BookingFormProps {
  title?: string
  description?: string
  variant?: 'default' | 'compact' | 'modal'
}

export const BookingForm = ({
  title,
  description,
  variant = 'default',
}: BookingFormProps) => {
  const t = useTranslations('booking')
  const tServices = useTranslations('services')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erreur lors de l\'envoi')

      setSuccess(true)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        message: '',
      })

      setTimeout(() => setSuccess(false), 5000)
    } catch (_err) {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.bookingForm} ${styles[variant]}`}>
      <div className={styles.header}>
        <h3>{title || t('title')}</h3>
        {description && <p>{description || t('description')}</p>}
      </div>

      {success && <div className={styles.successMessage}>{t('success')}</div>}

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
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

        <div className={styles.row}>
          <select
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
          >
            <option value="">{t('selectService')}</option>
            <option value="carpet-cleaning">{tServices('carpetCleaning')}</option>
            <option value="sofa-cleaning">{tServices('sofaCleaning')}</option>
            <option value="auto-seats">{tServices('autoSeats')}</option>
            <option value="other">{tServices('other')}</option>
          </select>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <textarea
          name="message"
          placeholder={t('message')}
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className={styles.formTextarea}
        />

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? t('sending') : t('submit')}
        </button>
      </form>
    </div>
  )
}
