import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: {
    singular: 'Réservation',
    plural: 'Réservations',
  },
  access: {
    // Permettre la lecture aux utilisateurs connectés (admin)
    read: ({ req: { user } }) => Boolean(user),
    // Permettre la création publique (depuis le formulaire)
    create: () => true,
    // Permettre la mise à jour aux utilisateurs connectés
    update: ({ req: { user } }) => Boolean(user),
    // Permettre la suppression aux utilisateurs connectés
    delete: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'status', 'totalAmount', 'createdAt'],
    group: 'Gestion',
    description: 'Liste des demandes de réservation reçues via le formulaire de contact',
  },
  fields: [
    {
      name: 'firstName',
      label: 'Prénom',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Nom',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      label: 'Téléphone',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'text',
      required: true,
    },
    // Service principal
    {
      name: 'primaryService',
      label: 'Service principal',
      type: 'group',
      fields: [
        {
          name: 'serviceId',
          label: 'Service',
          type: 'relationship',
          relationTo: 'services',
          required: true,
        },
        {
          name: 'quantity',
          label: 'Quantité',
          type: 'number',
          min: 1,
          defaultValue: 1,
          required: true,
        },
        {
          name: 'price',
          label: 'Prix unitaire',
          type: 'number',
          min: 0,
          admin: {
            step: 0.01,
          },
        },
      ],
    },
    // Service secondaire (optionnel avec -20%) - ANCIEN FORMAT (compatibilité)
    {
      name: 'secondaryService',
      label: 'Service secondaire (ancien format)',
      type: 'group',
      admin: {
        description: 'Ancien format pour compatibilité - utiliser secondaryServices',
      },
      fields: [
        {
          name: 'hasSecondaryService',
          label: 'Second service ajouté',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'serviceId',
          label: 'Service',
          type: 'relationship',
          relationTo: 'services',
          admin: {
            condition: (data) => data?.secondaryService?.hasSecondaryService,
          },
        },
        {
          name: 'quantity',
          label: 'Quantité',
          type: 'number',
          min: 1,
          defaultValue: 1,
          admin: {
            condition: (data) => data?.secondaryService?.hasSecondaryService,
          },
        },
        {
          name: 'price',
          label: 'Prix unitaire (avant réduction)',
          type: 'number',
          min: 0,
          admin: {
            step: 0.01,
            condition: (data) => data?.secondaryService?.hasSecondaryService,
          },
        },
        {
          name: 'discountedPrice',
          label: 'Prix avec réduction',
          type: 'number',
          min: 0,
          admin: {
            step: 0.01,
            condition: (data) => data?.secondaryService?.hasSecondaryService,
            readOnly: true,
          },
        },
      ],
    },
    // Services secondaires (nouveau format - multiples avec réduction configurable)
    {
      name: 'secondaryServices',
      label: 'Services supplémentaires',
      type: 'array',
      admin: {
        description: 'Services additionnels avec réduction appliquée',
      },
      fields: [
        {
          name: 'serviceId',
          label: 'Service',
          type: 'relationship',
          relationTo: 'services',
          required: true,
        },
        {
          name: 'quantity',
          label: 'Quantité',
          type: 'number',
          min: 1,
          defaultValue: 1,
          required: true,
        },
        {
          name: 'price',
          label: 'Prix unitaire (avant réduction)',
          type: 'number',
          min: 0,
          required: true,
          admin: {
            step: 0.01,
          },
        },
        {
          name: 'discountPercent',
          label: 'Réduction appliquée (%)',
          type: 'number',
          min: 0,
          max: 100,
          defaultValue: 20,
        },
        {
          name: 'discountedPrice',
          label: 'Prix après réduction',
          type: 'number',
          min: 0,
          admin: {
            step: 0.01,
            readOnly: true,
          },
        },
      ],
    },
    // Pourcentage de réduction appliqué
    {
      name: 'discountPercent',
      label: 'Réduction appliquée (%)',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 20,
      admin: {
        description: 'Pourcentage de réduction appliqué aux services supplémentaires',
      },
    },
    // Ancien champ pour compatibilité
    {
      name: 'service',
      label: 'Services demandés (ancien format)',
      type: 'text',
      admin: {
        description: 'Format texte pour compatibilité avec anciennes réservations',
      },
    },
    // Créneaux sélectionnés
    {
      name: 'timeSlots',
      label: 'Créneaux sélectionnés',
      type: 'array',
      admin: {
        description: 'Créneaux horaires réservés',
      },
      fields: [
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'startTime',
          label: 'Heure de début',
          type: 'text',
          required: true,
        },
        {
          name: 'endTime',
          label: 'Heure de fin',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'date',
      label: 'Date de la demande',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
    },
    {
      name: 'photos',
      label: 'Photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'Photos du mobilier ou sol à nettoyer',
      },
    },
    // Montants calculés
    {
      name: 'totalAmount',
      label: 'Montant total estimé',
      type: 'number',
      min: 0,
      admin: {
        step: 0.01,
        position: 'sidebar',
        description: 'Montant total calculé (hors frais supplémentaires)',
      },
    },
    {
      name: 'status',
      label: 'Statut',
      type: 'select',
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Contacté', value: 'contacted' },
        { label: 'Confirmé', value: 'confirmed' },
        { label: 'Complété', value: 'completed' },
        { label: 'Annulé', value: 'cancelled' },
      ],
      defaultValue: 'pending',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'notes',
      label: 'Notes internes',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'Notes internes (non visibles par le client)',
      },
    },
    // Email de confirmation envoyé au client
    {
      name: 'clientEmailSent',
      label: 'Email client envoyé',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
