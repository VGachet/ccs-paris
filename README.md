# CCS Paris - Site Web Vitrine

Site web vitrine pour **CCS Paris**, entreprise spécialisée dans le nettoyage textile professionnel à Paris. Le site permet de présenter les services, publier des articles de blog et gérer les demandes de réservation.

## 🚀 Fonctionnalités

- **CMS Administrable** : Gestion complète du contenu via Payload CMS
- **Multilingue** : Interface disponible en Français et Anglais (next-intl)
- **Blog** : Publication d'articles avec images et SEO optimisé
- **Services** : Présentation des services de nettoyage textile
- **Réservations** : Formulaire de demande de devis sans paiement
- **Design Épuré** : Interface moderne et responsive
- **SEO Ready** : Métadonnées, sitemap et structure optimisée

## 🛠 Stack Technique

- **Framework** : Next.js 15 (App Router)
- **CMS** : Payload CMS 3.x
- **Base de données** : MongoDB
- **i18n** : next-intl
- **Styling** : CSS Modules
- **TypeScript** : Full type-safety
- **Déploiement** : Compatible Vercel/Netlify

## 📦 Installation

### Prérequis

- Node.js 18+ ou 20+
- MongoDB (local ou Atlas)
- npm/pnpm/yarn

### Configuration

1. **Cloner le projet**
```bash
git clone https://github.com/VGachet/ccs-paris.git
cd ccs-paris-website
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine :
```env
DATABASE_URI=mongodb://localhost:27017/ccs-paris
PAYLOAD_SECRET=your-secret-key-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

⚠️ **Important** : Ne jamais commit le fichier `.env` avec de vraies credentials

4. **Lancer le serveur de développement**
```bash
npm run dev
```

Accéder à :
- Site : http://localhost:3000
- Admin : http://localhost:3000/admin

## 📚 Collections Payload CMS

### Pages
Pages administrables avec éditeur riche (texte, images, vidéos)

### Blog
Articles de blog avec :
- Titre, slug, contenu riche
- Image à la une
- Métadonnées SEO
- Date de publication

### Services
Services de nettoyage textile :
- Nom, description
- Image
- Tarification

### Bookings
Demandes de réservation :
- Informations client
- Service demandé
- Date souhaitée
- Statut (en attente, contacté, complété)

### Media
Gestion des médias (images, vidéos)

## 🌍 Internationalisation

Le site est disponible en 2 langues :
- Français (par défaut)
- Anglais

Routes générées automatiquement :
- `/fr/...` - Version française
- `/en/...` - Version anglaise

## 🚢 Déploiement

### Vercel (Recommandé)

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Build de production

```bash
npm run build
npm start
```

## 📝 Scripts disponibles

```bash
npm run dev          # Développement
npm run build        # Build production
npm start            # Serveur production
npm run lint         # Linter
npm run generate:types  # Générer types Payload
```

## 🔒 Sécurité

- Aucune credential dans le code source
- Variables d'environnement pour les secrets
- Access control sur les collections Payload
- Validation des données côté serveur

## 📄 Licence

MIT

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
