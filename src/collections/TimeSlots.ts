import type { CollectionConfig } from 'payload'

/**
 * Collection TimeSlots - Gestion des créneaux horaires
 * 
 * Les créneaux sont générés automatiquement par tranches de 2h:
 * - 9h-11h, 11h-13h, 13h-15h, 15h-17h, 17h-19h
 * 
 * Statuts possibles:
 * - available: Disponible pour réservation
 * - blocked: Bloqué par l'admin (jour férié, vacances, etc.)
 * - pending: Réservation en attente de validation
 * - confirmed: Réservation confirmée par l'admin
 */
export const TimeSlots: CollectionConfig = {
  slug: 'time-slots',
  labels: {
    singular: 'Créneau horaire',
    plural: 'Créneaux horaires',
  },
  access: {
    // Lecture publique pour afficher les disponibilités
    read: () => true,
    // Création par les utilisateurs connectés ou publique (via réservation)
    create: () => true,
    // Mise à jour par admin seulement
    update: ({ req: { user } }) => Boolean(user),
    // Suppression par admin seulement
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: 'displayTitle',
    defaultColumns: ['date', 'startTime', 'status', 'bookingId'],
    group: 'Gestion',
    description: 'Gérez les créneaux horaires disponibles pour les réservations',
  },
  fields: [
    {
      name: 'displayTitle',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data?.date && data?.startTime) {
              const dateStr = new Date(data.date).toLocaleDateString('fr-FR')
              return `${dateStr} - ${data.startTime}`
            }
            return 'Créneau'
          },
        ],
      },
    },
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
        description: 'Date du créneau',
      },
    },
    {
      name: 'startTime',
      label: 'Heure de début',
      type: 'select',
      required: true,
      options: [
        { label: '09:00', value: '09:00' },
        { label: '11:00', value: '11:00' },
        { label: '13:00', value: '13:00' },
        { label: '15:00', value: '15:00' },
        { label: '17:00', value: '17:00' },
      ],
      admin: {
        description: 'Heure de début du créneau (durée: 2h)',
      },
    },
    {
      name: 'endTime',
      label: 'Heure de fin',
      type: 'select',
      required: true,
      options: [
        { label: '11:00', value: '11:00' },
        { label: '13:00', value: '13:00' },
        { label: '15:00', value: '15:00' },
        { label: '17:00', value: '17:00' },
        { label: '19:00', value: '19:00' },
      ],
      admin: {
        description: 'Heure de fin du créneau',
      },
    },
    {
      name: 'status',
      label: 'Statut',
      type: 'select',
      required: true,
      defaultValue: 'available',
      options: [
        { label: '✅ Disponible', value: 'available' },
        { label: '🚫 Bloqué', value: 'blocked' },
        { label: '⏳ En attente de validation', value: 'pending' },
        { label: '✔️ Confirmé', value: 'confirmed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Statut actuel du créneau',
      },
    },
    {
      name: 'bookingId',
      label: 'Réservation associée',
      type: 'relationship',
      relationTo: 'bookings',
      admin: {
        position: 'sidebar',
        description: 'Réservation liée à ce créneau (si applicable)',
        condition: (data) => data.status === 'pending' || data.status === 'confirmed',
      },
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      admin: {
        description: 'Notes internes (raison du blocage, etc.)',
      },
    },
  ],
  // Note: L'index sera créé automatiquement par MongoDB via les options du schema
  // indexes: [
  //   {
  //     fields: { date: 1, startTime: 1 },
  //     options: { unique: true },
  //   },
  // ],
}
