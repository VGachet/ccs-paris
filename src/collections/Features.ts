import type { CollectionConfig } from 'payload'

export const Features: CollectionConfig = {
  slug: 'features',
  admin: {
    useAsTitle: 'title',
    description: 'Caractéristiques pour la section "Pourquoi nous choisir"',
  },
  fields: [
    {
      name: 'icon',
      type: 'text',
      required: true,
      defaultValue: '✓',
      admin: {
        description: 'Emoji ou caractère à afficher (ex: ✓, ⚡, 🌱, etc.)',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Titre de la caractéristique',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Description de la caractéristique',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Ordre d\'affichage (du plus petit au plus grand)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Afficher cette caractéristique',
      },
    },
  ],
}
