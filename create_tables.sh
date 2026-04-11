#!/bin/bash

echo "🔨 Création des tables de la base de données"
echo "============================================"
echo ""

# 1. Vérifier que la DB tourne
echo "1️⃣ Vérification de la base de données..."
docker exec inventory-db psql -U inventory_user -d inventory_db -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Base de données accessible"
else
    echo "❌ Base de données non accessible"
    exit 1
fi

# 2. Créer les tables via Python
echo ""
echo "2️⃣ Création des tables..."
docker exec inventory-backend python << 'PYTHON'
from app.database import engine, Base
from app.models import user, employee, equipment, emplacement

print("📋 Création des tables...")
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées avec succès")
except Exception as e:
    print(f"❌ Erreur: {e}")
    exit(1)
PYTHON

# 3. Vérifier les tables créées
echo ""
echo "3️⃣ Vérification des tables..."
docker exec inventory-db psql -U inventory_user -d inventory_db -c "\dt"

# 4. Créer l'utilisateur admin
echo ""
echo "4️⃣ Création de l'utilisateur admin..."
docker exec inventory-backend python << 'PYTHON'
from app.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()

# Vérifier si admin existe déjà
existing_admin = db.query(User).filter(User.email == "admin@example.com").first()

if existing_admin:
    print("ℹ️  Utilisateur admin existe déjà")
else:
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Administrateur",
        is_active=True
    )
    db.add(admin)
    db.commit()
    print("✅ Utilisateur admin créé")
    print("   Email: admin@example.com")
    print("   Password: admin123")

db.close()
PYTHON

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "🔐 Identifiants:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
