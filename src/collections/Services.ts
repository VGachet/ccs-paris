import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { invalidateCache } from '@/lib/api-cache'

export const Services: CollectionConfig = {
  slug: 'services',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order', 'pricingType'],
  },
  hooks: {
    afterChange: [
      ({ doc, operation }) => {
        console.log(`📝 Service ${operation}: ${doc.name || doc.id} - Invalidation du cache...`)
        invalidateCache('services')
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        console.log(`🗑️ Service supprimé: ${doc.name || doc.id} - Invalidation du cache...`)
        invalidateCache('services')
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Ordre d\'affichage (les nombres les plus petits apparaissent en premier)',
        position: 'sidebar',
      },
    },
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
    // Configuration du choix de quantité
    {
      name: 'allowQuantity',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Autoriser le choix de la quantité dans le formulaire de réservation',
      },
    },
    // Type de tarification
    {
      name: 'pricingType',
      type: 'select',
      required: true,
      defaultValue: 'fixed',
      options: [
        { label: 'Prix fixe', value: 'fixed' },
        { label: 'Prix au m²', value: 'per_m2' },
        { label: 'À partir de (prix minimum)', value: 'min_price' },
        { label: 'Sur devis', value: 'quote' },
      ],
      admin: {
        description: 'Type de tarification pour ce service',
      },
    },
    // Prix fixe (pricingType = "fixed")
    {
      name: 'fixedPrice',
      type: 'number',
      min: 0,
      admin: { 
        description: 'Prix fixe du service en euros',
        step: 0.01,
        condition: (data) => data?.pricingType === 'fixed',
      },
    },
    // Prix au m² (pricingType = "per_m2")
    {
      name: 'pricePerM2',
      type: 'number',
      min: 0,
      admin: { 
        description: 'Prix par m² en euros',
        step: 0.01,
        condition: (data) => data?.pricingType === 'per_m2',
      },
    },
    {
      name: 'minimumOrder',
      type: 'number',
      min: 0,
      admin: { 
        description: 'Commande minimum en m²',
        step: 1,
        condition: (data) => data?.pricingType === 'per_m2',
      },
    },
    // Prix minimum (pricingType = "min_price")
    {
      name: 'startingPrice',
      type: 'number',
      min: 0,
      admin: { 
        description: 'Prix de départ en euros (affiché comme "À partir de X€")',
        step: 0.01,
        condition: (data) => data?.pricingType === 'min_price',
      },
    },
    // Sur devis (pricingType = "quote")
    {
      name: 'quoteInfo',
      type: 'text',
      localized: true,
      admin: { 
        description: 'Texte personnalisé pour le devis (ex: "Prix sur devis", "Nous contacter"...)',
        condition: (data) => data?.pricingType === 'quote',
      },
    },
    // Champs legacy (pour rétrocompatibilité)
    {
      name: 'pricing',
      type: 'text',
      localized: true,
      admin: { 
        description: '(Déprécié) Informations de tarification - utiliser pricingType à la place',
      },
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      admin: { 
        description: '(Déprécié) Prix du service - utiliser fixedPrice/pricePerM2/startingPrice à la place',
        step: 0.01,
      },
    },
    {
      name: 'pricePrefix',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: '(Déprécié) Utiliser pricingType = "min_price" à la place',
      },
    },
    {
      name: 'columnSpan',
      type: 'select',
      defaultValue: '1',
      options: [
        { label: '1 colonne', value: '1' },
        { label: '2 colonnes', value: '2' },
        { label: '3 colonnes', value: '3' },
        { label: '4 colonnes', value: '4' },
      ],
      admin: {
        description: 'Nombre de colonnes que prend ce service dans la grille (grille de 4 colonnes)',
      },
    },
  ],
}
