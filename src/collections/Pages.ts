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
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
    },
    {
      name: 'metaTitle',
      type: 'text',
      admin: { description: 'Titre SEO' },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: { description: 'Description SEO' },
    },
    {
      name: 'keywords',
      type: 'text',
      admin: { description: 'Mots-clés séparés par virgule' },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor(),
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
            },
            {
              name: 'features',
              type: 'array',
              minRows: 1,
              maxRows: 6,
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
                },
                {
                  name: 'description',
                  type: 'textarea',
                  required: true,
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
