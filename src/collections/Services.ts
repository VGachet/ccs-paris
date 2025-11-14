import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Nom du service' },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor(),
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image principale du service' },
    },
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      admin: { 
        description: 'Vidéo du service (prioritaire sur les images si présente)',
      },
    },
    {
      name: 'beforeImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image "Avant" pour la comparaison' },
    },
    {
      name: 'afterImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Image "Après" pour la comparaison' },
    },
    {
      name: 'pricing',
      type: 'text',
      localized: true,
      admin: { description: 'Informations de tarification' },
    },
    {
      name: 'columnSpan',
      type: 'select',
      defaultValue: '1',
      options: [
        { label: '1 colonne', value: '1' },
        { label: '2 colonnes', value: '2' },
        { label: '3 colonnes', value: '3' },
      ],
      admin: {
        description: 'Nombre de colonnes que prend ce service dans la grille',
      },
    },
  ],
}
