import type { CollectionConfig } from 'payload'

export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  admin: {
    useAsTitle: 'customerName',
    description: 'Avis clients pour la section "Pourquoi nous choisir"',
    defaultColumns: ['customerName', 'rating', 'isApproved', 'isActive', 'updatedAt'],
  },
  fields: [
    {
      name: 'customerName',
      type: 'text',
      required: true,
      admin: {
        description: 'Nom du client',
      },
    },
    {
      name: 'customerTitle',
      type: 'text',
      admin: {
        description: 'Titre/profession du client (optionnel)',
      },
    },
    {
      name: 'customerAvatar',
      type: 'text',
      admin: {
        description: 'URL de l\'avatar ou emoji (ex: 👤, 🙍, etc.)',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Contenu de l\'avis',
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 5,
      required: true,
      defaultValue: 5,
      admin: {
        description: 'Note sur 5 étoiles',
      },
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        description: 'Date de l\'avis (optionnel)',
      },
    },
    {
      name: 'isApproved',
      type: 'checkbox',
      defaultValue: false,
      required: true,
      admin: {
        description: '✅ Avis modéré et validé',
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Afficher cet avis',
        position: 'sidebar',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Ordre d\'affichage (du plus petit au plus grand)',
        position: 'sidebar',
      },
    },
  ],
}
