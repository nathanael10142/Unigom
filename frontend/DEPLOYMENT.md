# Déploiement Production - UNIGOM Biométrie

## 🚀 Configuration Production

### Variables d'environnement configurées :
- **API URL** : `http://95.216.18.174:8000`
- **WebSocket URL** : `ws://95.216.18.174:8000`
- **Environment** : `production`

## 📦 Build pour Production

```bash
# Installer les dépendances
npm install

# Build pour production
npm run build:prod

# Servir localement pour tester
npm run serve
```

## 🗂️ Structure des fichiers

Après le build :
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].css
│   ├── index-[hash].js
│   └── [autres chunks optimisés]
└── public/
    └── logo.png (votre logo)
```

## 🌐 Déploiement sur serveur

### Option 1: NGINX/Apache
1. Copier le dossier `dist/` sur le serveur
2. Configurer le serveur web pour servir les fichiers statiques
3. Rediriger toutes les routes vers `index.html` (SPA)

### Option 2: Docker
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Vérifications avant déploiement

- ✅ Logo placé dans `public/logo.png`
- ✅ Variables d'environnement OK
- ✅ Build optimisé avec chunks
- ✅ Connexion API vers 95.216.18.174:8000
- ✅ WebSocket configuré

## 📱 Fonctionnalités en production

- ✅ Authentification OAuth2
- ✅ Dashboard avec stats temps réel
- ✅ Gestion employés et postes
- ✅ Pointages et historique
- ✅ Notifications (bientôt disponible)
- ✅ Interface WhatsApp-style responsive

## 🐛 Débugage production

Pour vérifier que tout fonctionne :
1. Ouvrir les outils de développement
2. Vérifier les appels API vers `95.216.18.174:8000`
3. Vérifier la connexion WebSocket
4. Tester l'authentification

## 🔄 Mise à jour

Pour mettre à jour :
1. Pousser les nouvelles modifications
2. Relancer `npm run build:prod`
3. Remplacer les fichiers sur le serveur
