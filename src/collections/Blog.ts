import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Blog: CollectionConfig = {
  slug: 'blog',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      localized: true,
      admin: {
        description: 'URL slug généré automatiquement',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Résumé court de l\'article',
      },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
      localized: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'author',
      type: 'text',
      defaultValue: 'CCS Paris',
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
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
      name: 'metaKeywords',
      type: 'text',
      localized: true,
      admin: { description: 'Mots-clés séparés par virgule' },
    },
  ],
  versions: {
    drafts: { autosave: true },
  },
}
