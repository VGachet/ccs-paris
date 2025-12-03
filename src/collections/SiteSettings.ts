import type { GlobalConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Paramètres du site',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Général',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo du site',
              admin: {
                description: 'Logo affiché dans le header de toutes les pages',
              },
            },
          ],
        },
        {
          label: 'Page d\'accueil',
          fields: [
            {
              name: 'heroBackgroundImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Image de fond du hero',
              admin: {
                description: 'Image affichée en arrière-plan de la section hero de la page d\'accueil',
              },
            },
            {
              name: 'heroOverlayOpacity',
              type: 'number',
              label: 'Opacité du calque du hero',
              defaultValue: 0.5,
              min: 0,
              max: 1,
              admin: {
                description: 'Opacité du calque sombre sur l\'image (0 = transparent, 1 = opaque)',
                step: 0.1,
              },
            },
            {
              name: 'homeMetaTitle',
              type: 'text',
              label: 'Titre SEO de la page d\'accueil',
              localized: true,
              admin: {
                description: 'Titre qui apparaît dans les résultats de recherche',
              },
            },
            {
              name: 'homeMetaDescription',
              type: 'textarea',
              label: 'Description SEO de la page d\'accueil',
              localized: true,
              admin: {
                description: 'Description qui apparaît dans les résultats de recherche',
              },
            },
            {
              name: 'servicesIntroText',
              type: 'richText',
              editor: lexicalEditor(),
              label: 'Texte d\'introduction aux services',
              localized: true,
              admin: {
                description: 'Contenu affiché au-dessus de la section "Nos Services" sur la page d\'accueil',
              },
            },
          ],
        },
        {
          label: 'Blog',
          fields: [
            {
              name: 'blogMetaTitle',
              type: 'text',
              label: 'Titre SEO de la page blog',
              localized: true,
              admin: {
                description: 'Titre qui apparaît dans les résultats de recherche',
              },
            },
            {
              name: 'blogMetaDescription',
              type: 'textarea',
              label: 'Description SEO de la page blog',
              localized: true,
              admin: {
                description: 'Description qui apparaît dans les résultats de recherche',
              },
            },
          ],
        },
        {
          label: 'À Propos',
          fields: [
            {
              name: 'aboutImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Image de la page à propos',
              admin: {
                description: 'Image affichée en haut de la page à propos',
              },
            },
            {
              name: 'aboutTitle',
              type: 'text',
              label: 'Titre de la page à propos',
              localized: true,
              admin: {
                description: 'Titre principal de la page à propos',
              },
            },
            {
              name: 'aboutText',
              type: 'richText',
              editor: lexicalEditor(),
              label: 'Texte de la page à propos',
              localized: true,
              admin: {
                description: 'Contenu descriptif affiché sur la page à propos',
              },
            },
            {
              name: 'aboutMetaTitle',
              type: 'text',
              label: 'Titre SEO de la page à propos',
              localized: true,
              admin: {
                description: 'Titre qui apparaît dans les résultats de recherche',
              },
            },
            {
              name: 'aboutMetaDescription',
              type: 'textarea',
              label: 'Description SEO de la page à propos',
              localized: true,
              admin: {
                description: 'Description qui apparaît dans les résultats de recherche',
              },
            },
          ],
        },
        {
          label: 'Réservations',
          fields: [
            {
              name: 'phoneNumber',
              type: 'text',
              label: 'Numéro de téléphone',
              defaultValue: '+33651135174',
              admin: {
                description: 'Numéro de téléphone affiché sur le site (format: +33XXXXXXXXX)',
              },
            },
            {
              name: 'minimumOrderAmount',
              type: 'number',
              label: 'Montant minimum de commande (€)',
              defaultValue: 50,
              min: 0,
              admin: {
                description: 'Montant minimum requis pour pouvoir passer une réservation',
                step: 1,
              },
            },
            {
              name: 'additionalServiceDiscount',
              type: 'number',
              label: 'Réduction services additionnels (%)',
              defaultValue: 20,
              min: 0,
              max: 100,
              admin: {
                description: 'Pourcentage de réduction appliqué aux services supplémentaires lors d\'une réservation (ex: 20 = -20%)',
                step: 1,
              },
            },
            {
              name: 'messageHint',
              type: 'textarea',
              label: 'Indication message optionnel',
              localized: true,
              defaultValue: '💡 Recommandé si : tissu fragile (soie, velours...), taches spéciales/hors normes, dimensions particulières, ou accès difficile à l\'adresse',
              admin: {
                description: 'Texte affiché au-dessus du champ message dans le récapitulatif du formulaire de réservation',
              },
            },
          ],
        },
        {
          label: 'Tarifs',
          fields: [
            {
              name: 'pricingIntroText',
              type: 'richText',
              editor: lexicalEditor(),
              label: 'Texte d\'introduction aux tarifs',
              localized: true,
              admin: {
                description: 'Contenu affiché sous le titre de la page Tarifs/Pricing',
              },
            },
            {
              name: 'pricingMetaTitle',
              type: 'text',
              label: 'Titre SEO de la page tarifs',
              localized: true,
              admin: {
                description: 'Titre qui apparaît dans les résultats de recherche',
              },
            },
            {
              name: 'pricingMetaDescription',
              type: 'textarea',
              label: 'Description SEO de la page tarifs',
              localized: true,
              admin: {
                description: 'Description qui apparaît dans les résultats de recherche',
              },
            },
          ],
        },
      ],
    },
  ],
}
