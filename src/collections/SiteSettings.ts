import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Paramètres du site',
  access: {
    read: () => true,
  },
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
  ],
}
