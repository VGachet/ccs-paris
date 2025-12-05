import type { CollectionConfig } from 'payload'
import { invalidateCache } from '@/lib/api-cache'

interface PromotionData {
  id: string
  isActive: boolean
  [key: string]: unknown
}

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  admin: {
    useAsTitle: 'title',
    group: 'Contenu',
    defaultColumns: ['title', 'discountPercentage', 'isActive'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Titre de l\'offre promotionnelle (ex: "Offre de lancement")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Description de l\'offre (optionnel)',
      },
    },
    {
      name: 'discountPercentage',
      type: 'number',
      required: false,
      min: 0,
      max: 100,
      admin: {
        description: 'Pourcentage de réduction (0-100) - Optionnel, laisser vide pour afficher uniquement un message',
        step: 1,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: false,
      required: true,
      admin: {
        description: 'Activer/désactiver l\'affichage de l\'offre',
        position: 'sidebar',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        description: 'Date de début de l\'offre (optionnel)',
        position: 'sidebar',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description: 'Date de fin de l\'offre (optionnel)',
        position: 'sidebar',
      },
    },
    {
      name: 'bannerColor',
      type: 'select',
      defaultValue: 'primary',
      options: [
        {
          label: 'Bleu (Primaire)',
          value: 'primary',
        },
        {
          label: 'Rouge',
          value: 'red',
        },
        {
          label: 'Vert',
          value: 'green',
        },
        {
          label: 'Orange',
          value: 'orange',
        },
      ],
      admin: {
        description: 'Couleur de l\'encart promotionnel',
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Si on active cette promotion, désactiver toutes les autres
        if (data.isActive && operation === 'update') {
          const promotions = await req.payload.find({
            collection: 'promotions' as any,
            where: {
              id: {
                not_equals: data.id,
              },
              isActive: {
                equals: true,
              },
            },
          })

                    // Désactiver toutes les autres promotions actives
          for (const promo of promotions.docs as PromotionData[]) {
            await req.payload.update({
              collection: 'promotions' as any,
              id: promo.id,
              data: {
                isActive: false,
              },
            })
          }
        }
        return data
      },
    ],
    afterChange: [
      () => {
        invalidateCache('promotions')
      },
    ],
    afterDelete: [
      () => {
        invalidateCache('promotions')
      },
    ],
  },
}
