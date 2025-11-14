import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Pages: CollectionConfig = {
  slug: 'pages',
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
      name: 'keywords',
      type: 'text',
      localized: true,
      admin: { description: 'Mots-clés séparés par virgule' },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
      localized: true,
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: [
        {
          slug: 'whyChooseUs',
          labels: {
            singular: 'Pourquoi nous choisir',
            plural: 'Pourquoi nous choisir',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              defaultValue: 'Pourquoi nous choisir ?',
              localized: true,
            },
            {
              name: 'features',
              type: 'array',
              minRows: 1,
              maxRows: 6,
              localized: true,
              fields: [
                {
                  name: 'icon',
                  type: 'text',
                  defaultValue: '✓',
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
                  localized: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: { autosave: true },
  },
}
