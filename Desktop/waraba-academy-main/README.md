# 🎓 Waraba Academy

Plateforme de formation en ligne moderne pour les compétences numériques.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🚀 Démarrage Rapide

```bash
# Cloner le projet
git clone https://github.com/diack96/waraba-academy.git
cd waraba-academy

# Installer les dépendances
npm install

# Configurer l'environnement
cp env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Lancer l'application
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## ✨ Fonctionnalités Principales

- 🎓 **Cours Interactifs** - Vidéos, textes, quiz et ressources
- 📊 **Suivi de Progression** - Suivi détaillé de l'avancement
- 🏆 **Certificats** - Génération automatique de certificats
- 💳 **Paiements** - Intégration Stripe pour les cours payants
- 👥 **Multi-Rôles** - Étudiants, Instructeurs, Administrateurs
- 🔐 **Authentification** - Email/Password et OAuth Google
- 📱 **Responsive** - Interface adaptée à tous les appareils
- 🎨 **Moderne** - UI/UX moderne avec Tailwind CSS

## 🛠️ Stack Technologique

### Frontend
- **Next.js 16** - Framework React avec App Router
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Zustand** - Gestion d'état

### Backend
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Storage
  - Real-time

### Services
- **Stripe** - Paiements
- **Vercel** - Hébergement
- **Docker** - Containerisation

## 📚 Documentation

### Documentation Complète
👉 **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Documentation complète de la plateforme

### Guides Rapides
- **[QUICK_START.md](./QUICK_START.md)** - Guide de démarrage rapide
- **[DEVOPS_QUICK_START.md](./DEVOPS_QUICK_START.md)** - Guide DevOps
- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Configuration authentification
- **[SECURITY.md](./SECURITY.md)** - Guide de sécurité
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Dépannage

### Infrastructure DevOps
- **[DEVOPS.md](./DEVOPS.md)** - Infrastructure DevOps complète
- **[VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)** - Configuration Vercel

## 🏗️ Structure du Projet

```
waraba-academy/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Composants React
│   ├── contexts/         # Contextes React
│   ├── hooks/            # Hooks personnalisés
│   ├── lib/              # Utilitaires
│   ├── services/         # Services métier
│   └── types/            # Types TypeScript
├── public/               # Assets statiques
├── scripts/              # Scripts utilitaires
├── supabase/             # Configuration Supabase
└── .github/              # GitHub Actions
```

## 🔐 Authentification

### Comptes de Test

- **Admin** : `admin@waraba.com` / `WarabaAdmin2024!`
- **Étudiant** : Créer un compte via `/auth/register`

### OAuth

- Connexion Google disponible
- Configuration dans Supabase Dashboard

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

Voir **[DEVOPS_QUICK_START.md](./DEVOPS_QUICK_START.md)** pour plus de détails.

### Docker

```bash
docker build -t waraba-academy .
docker-compose up -d
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Avec coverage
npm run test:coverage

# Type check
npm run type-check
```

## 📊 Scripts Disponibles

```bash
# Développement
npm run dev              # Lancer en mode dev
npm run build            # Build de production
npm run start            # Lancer en production

# Qualité de code
npm run lint             # Linter
npm run lint:fix         # Fix automatique
npm run type-check       # Vérification TypeScript

# Base de données
npm run db:migrate       # Migrations
npm run db:studio        # Prisma Studio

# Tests
npm run test             # Tests unitaires
npm run test:coverage    # Coverage

# Déploiement
npm run pre-deploy-check # Vérifications pré-déploiement
```

## 🔒 Sécurité

- ✅ Row Level Security (RLS) sur Supabase
- ✅ Authentification sécurisée avec JWT
- ✅ Validation des entrées utilisateur
- ✅ Headers de sécurité configurés
- ✅ HTTPS en production

Voir **[SECURITY.md](./SECURITY.md)** pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- 📖 **Documentation** : [DOCUMENTATION.md](./DOCUMENTATION.md)
- 🐛 **Issues** : [GitHub Issues](https://github.com/diack96/waraba-academy/issues)
- 💬 **Contact** : contact@waraba-academy.com

## 🌟 Features à Venir

- [ ] Mode hors-ligne (PWA)
- [ ] Application mobile
- [ ] Chat en direct
- [ ] Forums de discussion
- [ ] Badges et gamification
- [ ] Intégration Zoom pour webinaires

---

**Waraba Academy** - Formez-vous aux compétences numériques de demain ! 🚀

Made with ❤️ by the Waraba Academy Team
