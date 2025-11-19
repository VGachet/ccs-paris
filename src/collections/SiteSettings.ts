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
