import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const LegalPages: CollectionConfig = {
  slug: 'legal-pages',
  admin: {
    useAsTitle: 'title',
    group: 'Contenu',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Titre de la page légale',
      },
    },
    {
      name: 'slug',
      type: 'select',
      unique: true,
      required: true,
      options: [
        {
          label: 'Mentions légales',
          value: 'legal-notices',
        },
        {
          label: 'Conditions Générales',
          value: 'general-terms',
        },
      ],
      admin: {
        description: 'Sélectionner le type de page légale',
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
      localized: true,
      admin: {
        description: 'Contenu de la page légale',
      },
    },
    {
      name: 'metaTitle',
      type: 'text',
      localized: true,
      admin: { description: 'Titre SEO' },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      admin: { description: 'Description SEO' },
    },
    {
      name: 'lastUpdated',
      type: 'date',
      admin: {
        description: 'Date de dernière mise à jour',
      },
    },
  ],
  versions: {
    drafts: { autosave: true },
  },
}
