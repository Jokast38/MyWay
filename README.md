# MyWay

MyWay est une plateforme éducative innovante conçue pour connecter les étudiants, faciliter l'échange d'informations et promouvoir l'apprentissage collaboratif. L'application permet aux utilisateurs de partager des informations, des événements, des messages et de gérer leur profil personnel.

## 🚀 Fonctionnalités

### Pour les Étudiants
- **Authentification sécurisée** : Inscription et connexion avec JWT
- **Gestion de profil** : Photo de profil, bio, intérêts, informations personnelles
- **Partage d'informations** : Publication et consultation d'informations éducatives
- **Événements** : Création et participation à des événements communautaires
- **Messagerie** : Communication entre utilisateurs
- **Recherche avancée** : Filtrage par catégorie, date, etc.

### Fonctionnalités Techniques
- **Upload d'images** : Intégration Cloudinary pour la gestion des médias
- **Base de données** : MongoDB avec Motor pour les opérations asynchrones
- **API REST** : FastAPI pour un backend performant
- **Interface moderne** : React avec Tailwind CSS et composants Radix UI
- **Responsive Design** : Optimisé pour mobile et desktop

## 🛠️ Technologies Utilisées

### Backend
- **Python 3.9+**
- **FastAPI** : Framework web moderne et rapide
- **MongoDB** : Base de données NoSQL
- **Motor** : Driver MongoDB asynchrone
- **Uvicorn** : Serveur ASGI
- **JWT** : Authentification sécurisée
- **Bcrypt** : Hashage des mots de passe
- **Cloudinary** : Gestion des images

### Frontend
- **React 19** : Bibliothèque JavaScript moderne
- **React Router** : Navigation côté client
- **Axios** : Client HTTP
- **Tailwind CSS** : Framework CSS utilitaire
- **Radix UI** : Composants accessibles
- **React Hook Form** : Gestion des formulaires
- **Zod** : Validation des données
- **Lucide React** : Icônes modernes

### Outils de Développement
- **CRACO** : Configuration CRA personnalisée
- **ESLint** : Linting du code
- **Prettier** : Formatage du code
- **Yarn** : Gestionnaire de paquets

## 📁 Structure du Projet

`
MyWay/
├── backend/
│   ├── server.py              # Application FastAPI principale
│   ├── requirements.txt       # Dépendances Python
│   ├── .env                   # Variables d'environnement
│   └── tests/
│       └── test_myway_backend.py  # Tests backend
├── frontend/
│   ├── public/
│   │   └── index.html         # Template HTML
│   ├── src/
│   │   ├── App.js             # Composant principal
│   │   ├── index.js           # Point d'entrée
│   │   ├── components/        # Composants réutilisables
│   │   │   ├── ui/            # Composants UI (Radix)
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Contexte d'authentification
│   │   ├── hooks/
│   │   │   └── use-toast.js   # Hook personnalisé
│   │   ├── lib/
│   │   │   ├── api.js         # Configuration API
│   │   │   └── utils.js       # Utilitaires
│   │   ├── pages/             # Pages de l'application
│   │   │   ├── AuthPage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── InfoDetailPage.jsx
│   │   │   ├── InfosPage.jsx
│   │   │   ├── MessagesPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── StudentsPage.jsx
│   │   └── ...
│   ├── package.json           # Dépendances Node.js
│   ├── craco.config.js        # Configuration CRACO
│   ├── tailwind.config.js     # Configuration Tailwind
│   ├── jsconfig.json          # Configuration JavaScript
│   └── README.md              # README frontend (CRA)
├── render.yaml                # Configuration déploiement Render
└── README.md                  # Ce fichier
`

## 🏃‍♂️ Installation et Configuration

### Prérequis
- **Python 3.9+**
- **Node.js 18+**
- **Yarn** (recommandé) ou npm
- **MongoDB** (local ou Atlas)
- **Cloudinary** account (pour les images)

### Configuration Backend

1. **Cloner le repository**
   `ash
   git clone <repository-url>
   cd MyWay
   `

2. **Configurer l'environnement Python**
   `ash
   cd backend
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   `

3. **Installer les dépendances**
   `ash
   pip install -r requirements.txt
   `

4. **Configurer les variables d'environnement**
   Créer un fichier .env dans le dossier ackend/ :
   `env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=myway
   JWT_SECRET=votre_secret_jwt_unique
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   `

5. **Démarrer le backend**
   `ash
   uvicorn server:app --reload
   `
   L'API sera disponible sur http://localhost:8000

### Configuration Frontend

1. **Installer les dépendances**
   `ash
   cd frontend
   yarn install
   # ou npm install
   `

2. **Configurer les variables d'environnement**
   Créer un fichier .env dans le dossier rontend/ :
   `env
   REACT_APP_BACKEND_URL=http://localhost:8000
   `

3. **Démarrer le frontend**
   `ash
   yarn start
   # ou npm start
   `
   L'application sera disponible sur http://localhost:3000

## 🚀 Déploiement

Le projet est configuré pour un déploiement facile sur **Render** :

1. **Pousser le code sur GitHub**
2. **Créer un projet Render** et connecter le repository
3. **Render détectera automatiquement** le fichier ender.yaml
4. **Configurer les variables d'environnement** dans le dashboard Render :
   - Pour le backend : MONGO_URL, DB_NAME, JWT_SECRET, etc.
   - Pour le frontend : REACT_APP_BACKEND_URL (URL du service backend)

### Services Render
- **Backend** : Service web Python avec FastAPI
- **Frontend** : Site statique React

## 🧪 Tests

### Tests Backend
`ash
cd backend
python -m pytest tests/
`

### Tests Frontend
`ash
cd frontend
yarn test
`

## 👥 Équipe de Développement

- **Jokast Kassa** - Développeur Full-Stack
- **Serge Donou** - Développeur Backend
- **Hermann Ngatat** - Développeur Frontend

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (git checkout -b feature/AmazingFeature)
3. Commit vos changements (git commit -m 'Add some AmazingFeature')
4. Push vers la branche (git push origin feature/AmazingFeature)
5. Ouvrir une Pull Request

## 📞 Support

Pour toute question ou problème, contactez l'équipe de développement ou ouvrez une issue sur GitHub.

---

**MyWay** - Connecter les étudiants, enrichir les connaissances.