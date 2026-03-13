# UNIGOM Biométrie Frontend

Frontend WhatsApp-Style pour le système de pointage biométrique de l'Université de Goma.

## 🎨 Caractéristiques

- **Design WhatsApp-Style** : Interface moderne et familière
- **Temps Réel** : Notifications instantanées des pointages via WebSocket
- **Responsive** : Compatible mobile et desktop
- **TypeScript** : Code typé et sécurisé
- **React 18** : Dernières fonctionnalités React

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env

# Démarrer le serveur de développement
npm run dev
```

## 📋 Pages

- **Dashboard** : Vue d'ensemble avec statistiques en temps réel
- **Employés** : Gestion complète du personnel
- **Pointages** : Suivi des présences avec synchronisation
- **Postes** : Organisation hiérarchique des services
- **Paramètres** : Configuration système et utilisateur

## 🔧 Configuration

Variables d'environnement requises :

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## 🎯 Fonctionnalités

### Authentification
- Login JWT sécurisé
- Session persistante
- Verrouillage automatique

### Temps Réel
- WebSocket connecté
- Notifications instantanées
- Mise à jour automatique

### Interface
- Design WhatsApp sombre
- Animations fluides
- Navigation intuitive

## 📱 Compatibilité

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🛠 Technologies

- React 18 + TypeScript
- TailwindCSS
- Zustand (state management)
- Socket.io (WebSocket)
- React Hook Form + Zod
- Lucide React (icons)

## 📝 Développement

```bash
# Build de production
npm run build

# Preview du build
npm run preview

# Linting
npm run lint
```

## 🔗 Connexion Backend

Le frontend se connecte automatiquement au backend UNIGOM sur :
- API REST : `http://localhost:8000/api/v1`
- WebSocket : `ws://localhost:8000`

## 🎨 Thème WhatsApp

L'interface utilise la palette de couleurs exacte de WhatsApp :
- Fond principal : `#0a141f`
- Barre latérale : `#111b21`
- Zone chat : `#202c33`
- Vert primaire : `#00a884`

## 📊 Stats en Temps Réel

Le dashboard affiche :
- Présents/Retards/Absents
- Taux de présence
- Activité récente
- Synchronisation automatique
