# Configuration de la Localisation Payload CMS

## Langues Actives

Le site supporte actuellement les langues suivantes :
- **Français (fr)** - Langue par défaut
- **English (en)**

## Comment Ajouter une Nouvelle Langue

### 1. Ajouter la Langue dans Payload Config

Éditez le fichier `src/payload.config.ts` et ajoutez la nouvelle langue dans la section `localization.locales` :

```typescript
localization: {
  locales: [
    {
      code: 'fr',
      label: 'Français',
    },
    {
      code: 'en',
      label: 'English',
    },
    // Ajoutez votre nouvelle langue ici
    {
      code: 'es', // Code de langue ISO 639-1
      label: 'Español',
    },
  ],
  defaultLocale: 'fr',
  fallback: true,
}
```

### 2. Collections Localisées

Les collections suivantes supportent la localisation :

- **Blog** - Tous les champs de contenu (title, slug, excerpt, content, meta)
- **Services** - Tous les champs descriptifs (name, slug, description, pricing)
- **Features** - Titre et description
- **Pages** - Tous les champs de contenu et sections

**Note :** La collection `Bookings` n'est pas localisée car elle contient des données de formulaire soumises par les utilisateurs.

### 3. Champs Localisés vs Non-Localisés

#### Champs Localisés (avec `localized: true`)
- Textes affichés aux utilisateurs
- Contenus éditoriaux
- Métadonnées SEO
- Slugs d'URL

#### Champs Non-Localisés
- Images et médias (partagés entre langues)
- Dates
- États/Status
- Données techniques

### 4. Utilisation dans l'Admin

Dans l'interface d'administration Payload :

1. **Sélectionner une Langue** : Un sélecteur de langue apparaît en haut de chaque document
2. **Éditer par Langue** : Chaque langue a son propre ensemble de valeurs pour les champs localisés
3. **Fallback** : Si une traduction est manquante, le système utilise la langue par défaut (français)

### 5. Ajouter des Messages de l'Interface

Pour traduire l'interface utilisateur frontend, ajoutez vos messages dans :
- `src/messages/fr.json` - Français
- `src/messages/en.json` - Anglais
- Créez un nouveau fichier pour chaque langue (ex: `src/messages/es.json`)

### 6. Configuration Next.js i18n

Mettez à jour `src/i18n/config.ts` pour inclure la nouvelle langue :

```typescript
export const locales = ['fr', 'en', 'es'] as const
export const defaultLocale = 'fr' as const
```

## Bonnes Pratiques

1. **Complétude des Traductions** : Assurez-vous de fournir des traductions pour toutes les langues activées
2. **Slugs Uniques** : Les slugs doivent être uniques par langue pour éviter les conflits d'URL
3. **SEO** : Remplissez les métadonnées SEO pour chaque langue
4. **Tests** : Testez l'affichage dans toutes les langues avant publication

## Requêtes API avec Locale

Pour récupérer du contenu dans une langue spécifique via l'API :

```typescript
// GET avec query parameter
fetch('/api/services?locale=en')

// Dans le code serveur
const services = await payload.find({
  collection: 'services',
  locale: 'en',
})
```

## Troubleshooting

- **Les traductions ne s'affichent pas** : Vérifiez que `localization: true` est défini sur la collection
- **Fallback ne fonctionne pas** : Assurez-vous que `fallback: true` est dans la config
- **Slugs en double** : Les slugs doivent être uniques par langue, utilisez des préfixes si nécessaire
