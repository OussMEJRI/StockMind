# IT Inventory Manager

Application web de gestion intelligente d'inventaire informatique avec chatbot intégré.

## 📋 Table des matières

- [Architecture](#architecture)
- [Stack Technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Déploiement](#déploiement)
- [Utilisation](#utilisation)
- [API Documentation](#api-documentation)
- [Sécurité](#sécurité)

## 🏗️ Architecture

### Architecture Globale

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  Angular        │─────▶│  FastAPI        │─────▶│  PostgreSQL     │
│  Frontend       │      │  Backend        │      │  Database       │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │
        │                        │
        │                ┌───────▼────────┐
        │                │                │
        └───────────────▶│  Chatbot LLM   │
                         │  (Ready)       │
                         │                │
                         └────────────────┘
```

### Architecture Backend

```
backend/
├── app/
│   ├── api/v1/
│   │   └── endpoints/
│   │       ├── auth.py          # Authentification JWT
│   │       ├── equipment.py     # Gestion matériel
│   │       ├── employees.py     # Gestion employés
│   │       ├── locations.py     # Gestion localisations
│   │       └── chatbot.py       # Interface chatbot
│   ├── core/
│   │   ├── config.py            # Configuration
│   │   ├── security.py          # JWT & passwords
│   │   └── deps.py              # Dépendances
│   ├── models/                  # Modèles SQLAlchemy
│   ├── schemas/                 # Schémas Pydantic
│   ├── services/
│   │   └── chatbot.py           # Service chatbot
│   └── db/
│       └── session.py           # Session database
├── Dockerfile
└── requirements.txt
```

## 🛠️ Stack Technique

### Backend
- **Framework**: FastAPI (Python 3.11)
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL 15
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Bcrypt (passlib)
- **Validation**: Pydantic
- **ASGI Server**: Uvicorn

### Frontend
- **Framework**: Angular 17
- **HTTP Client**: RxJS
- **Router**: Angular Router
- **Forms**: Reactive Forms

### DevOps
- **Conteneurisation**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitLab CI/CD
- **Reverse Proxy**: Nginx (frontend)

## 🚀 Fonctionnalités

### 1. Gestion d'Inventaire IT
- ✅ CRUD complet pour le matériel informatique
- ✅ Types: PC, Laptop, Écran, Téléphone, Accessoires
- ✅ Suivi du numéro de série, modèle, état (neuf/utilisé/HS)
- ✅ Statut: en stock / affecté

### 2. Localisation Précise
- ✅ Site, Étage, Bureau
- ✅ Position exacte (armoire, poste)
- ✅ Historique des mouvements

### 3. Gestion des Collaborateurs
- ✅ Informations personnelles
- ✅ Département
- ✅ Affectation de matériel
- ✅ Historique complet

### 4. Chatbot Intelligent
- ✅ Questions en langage naturel
- ✅ "Où se trouve le PC de Jean Dupont?"
- ✅ "Avons-nous des laptops disponibles?"
- ✅ "Quel matériel est au 3e étage bureau 312?"
- ✅ Architecture prête pour LLM (OpenAI/Azure OpenAI)

### 5. Authentification & Autorisations
- ✅ JWT Authentication
- ✅ 3 rôles: Admin, Gestionnaire, Collaborateur
- ✅ Permissions granulaires par endpoint

## 📦 Installation

### Prérequis
- Docker & Docker Compose
- Python 3.11+ (pour développement local)
- Node.js 20+ (pour développement local)
- PostgreSQL 15+ (pour développement local)

### Installation Locale

#### 1. Cloner le repository
```bash
git clone <repository-url>
cd it-inventory-manager
```

#### 2. Backend
```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cat > .env << EOF
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=inventory_db
SECRET_KEY=your-secret-key-here
EOF

# Lancer le serveur
uvicorn app.main:app --reload
```

L'API sera disponible sur: http://localhost:8000
Documentation: http://localhost:8000/api/v1/docs

#### 3. Frontend
```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start
```

L'application sera disponible sur: http://localhost:4200

### Installation avec Docker Compose

**Note**: Si vous utilisez WSL2, assurez-vous que Docker Desktop est installé et que l'intégration WSL2 est activée dans les paramètres Docker Desktop.

```bash
# Lancer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

Services disponibles:
- Frontend: http://localhost:4200
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

## 🚢 Déploiement

### Déploiement Kubernetes

#### 1. Créer les secrets
```bash
# Créer le secret pour les mots de passe
kubectl create secret generic backend-secret \
  --from-literal=POSTGRES_PASSWORD=<your-password> \
  --from-literal=SECRET_KEY=<your-jwt-secret> \
  -n it-inventory
```

#### 2. Déployer l'application
```bash
# Créer le namespace
kubectl apply -f k8s/namespace.yaml

# Déployer PostgreSQL
kubectl apply -f k8s/postgres-statefulset.yaml

# Déployer le backend
kubectl apply -f k8s/backend/configmap.yaml
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml

# Déployer le frontend
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml
```

#### 3. Vérifier le déploiement
```bash
# Vérifier les pods
kubectl get pods -n it-inventory

# Vérifier les services
kubectl get svc -n it-inventory

# Obtenir l'URL du frontend
kubectl get svc frontend-service -n it-inventory
```

### GitLab CI/CD

Le pipeline GitLab CI/CD est configuré avec les stages suivants:

1. **Lint**: Vérification du code (flake8, black, eslint)
2. **Test**: Exécution des tests unitaires
3. **Build**: Construction des images Docker
4. **Deploy**: Déploiement sur Kubernetes (manuel)

#### Variables GitLab à configurer:
- `CI_REGISTRY_USER`: Utilisateur du registry
- `CI_REGISTRY_PASSWORD`: Mot de passe du registry
- `KUBE_URL`: URL du cluster Kubernetes
- `KUBE_TOKEN`: Token d'authentification Kubernetes

## 📖 Utilisation

### Créer un utilisateur admin (première utilisation)

```bash
# Depuis le conteneur backend
docker exec -it inventory-backend python

>>> from app.db.session import SessionLocal
>>> from app.models.user import User, UserRole
>>> from app.core.security import get_password_hash
>>> 
>>> db = SessionLocal()
>>> admin = User(
...     email="admin@example.com",
...     hashed_password=get_password_hash("admin123"),
...     first_name="Admin",
...     last_name="User",
...     role=UserRole.ADMIN,
...     is_active=True
... )
>>> db.add(admin)
>>> db.commit()
>>> exit()
```

### Utiliser l'API

#### 1. S'authentifier
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=admin123"
```

Réponse:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

#### 2. Créer un équipement
```bash
curl -X POST "http://localhost:8000/api/v1/equipment/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "serial_number": "SN123456",
    "model": "Dell Latitude 5520",
    "equipment_type": "laptop",
    "condition": "new",
    "status": "in_stock"
  }'
```

#### 3. Utiliser le chatbot
```bash
curl -X POST "http://localhost:8000/api/v1/chatbot/query" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Avons-nous des laptops disponibles en stock?"
  }'
```

## 📚 API Documentation

La documentation complète de l'API est disponible via Swagger UI:
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

### Endpoints principaux

#### Authentification
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/register` - Inscription (admin uniquement)
- `GET /api/v1/auth/me` - Profil utilisateur

#### Équipement
- `GET /api/v1/equipment/` - Liste des équipements
- `POST /api/v1/equipment/` - Créer un équipement
- `GET /api/v1/equipment/{id}` - Détails d'un équipement
- `PUT /api/v1/equipment/{id}` - Modifier un équipement
- `DELETE /api/v1/equipment/{id}` - Supprimer un équipement
- `POST /api/v1/equipment/assign` - Affecter un équipement

#### Employés
- `GET /api/v1/employees/` - Liste des employés
- `POST /api/v1/employees/` - Créer un employé
- `GET /api/v1/employees/{id}` - Détails d'un employé
- `PUT /api/v1/employees/{id}` - Modifier un employé
- `DELETE /api/v1/employees/{id}` - Supprimer un employé

#### Localisations
- `GET /api/v1/locations/` - Liste des localisations
- `POST /api/v1/locations/` - Créer une localisation

#### Chatbot
- `POST /api/v1/chatbot/query` - Poser une question

## 🔒 Sécurité

### Bonnes pratiques implémentées

1. **Authentification**
   - JWT avec expiration
   - Hachage bcrypt pour les mots de passe
   - Tokens Bearer dans les headers

2. **Autorisations**
   - Rôles: Admin, Gestionnaire, Collaborateur
   - Permissions granulaires par endpoint
   - Vérification des rôles via dépendances

3. **Base de données**
   - Mots de passe jamais stockés en clair
   - Secrets Kubernetes pour les credentials
   - Connexions chiffrées

4. **Docker & Kubernetes**
   - Images légères (Alpine)
   - Utilisateur non-root
   - Health checks
   - Resource limits
   - Security headers Nginx

### À configurer en production

- [ ] Changer SECRET_KEY dans les secrets Kubernetes
- [ ] Utiliser un mot de passe fort pour PostgreSQL
- [ ] Configurer HTTPS avec certificat SSL
- [ ] Activer le monitoring (Prometheus/Grafana)
- [ ] Configurer les backups de la base de données
- [ ] Limiter les CORS aux domaines autorisés
- [ ] Activer les logs centralisés

## 🧪 Tests

### Backend
```bash
cd backend
pytest tests/ -v --cov=app
```

### Frontend
```bash
cd frontend
npm test
```

## 📝 Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

Développé par l'équipe IT Inventory Manager

## 🆘 Support

Pour toute question ou problème:
- Créer une issue sur GitLab
- Contacter l'équipe de développement

---

**Note**: Cette application est prête pour la production avec quelques ajustements de configuration nécessaires (voir section Sécurité).
