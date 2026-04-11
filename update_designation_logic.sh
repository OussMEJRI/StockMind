#!/bin/bash

echo "🔧 Mise à jour de la logique de désignation"
echo "==========================================="
echo ""

# 1. Recréer la table emplacements
echo "1️⃣ Recréation de la table emplacements..."
docker exec -i inventory-db psql -U inventory_user -d inventory_db << 'SQL'
DROP TABLE IF EXISTS emplacements CASCADE;

CREATE TABLE emplacements (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER UNIQUE NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    etage VARCHAR(50),
    rosace INTEGER CHECK (rosace >= 1 AND rosace <= 13),
    type_emplacement VARCHAR(10),
    emplacement_exact VARCHAR(255),
    designation VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emplacements_equipment ON emplacements(equipment_id);
CREATE INDEX idx_emplacements_designation ON emplacements(designation);

\echo '✅ Table emplacements recréée'
SQL

# 2. Créer des données de test avec différents statuts
echo ""
echo "2️⃣ Création de données de test..."
docker exec inventory-backend python << 'PYTHON'
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.equipment import Equipment
from app.models.emplacement import Emplacement

db = SessionLocal()

try:
    # Supprimer les anciens équipements
    db.query(Equipment).delete()
    db.commit()
    
    # Créer des laptops avec différents statuts
    laptops = [
        {
            "serial_number": "LAPTOP-001",
            "model": "Dell Latitude 5420",
            "equipment_type": "laptop",
            "condition": "new",
            "status": "assigned"  # → CHEZ COLLABORATEUR
        },
        {
            "serial_number": "LAPTOP-002",
            "model": "HP EliteBook 840",
            "equipment_type": "laptop",
            "condition": "new",
            "status": "in_stock"  # → EN STOCK
        },
        {
            "serial_number": "LAPTOP-003",
            "model": "Lenovo ThinkPad X1",
            "equipment_type": "laptop",
            "condition": "used",
            "status": "out_of_service"  # → SIMOP
        }
    ]
    
    # Créer d'autres équipements
    others = [
        {
            "serial_number": "PC-001",
            "model": "Dell OptiPlex 7090",
            "equipment_type": "pc",
            "condition": "new",
            "status": "in_stock"
        },
        {
            "serial_number": "MONITOR-001",
            "model": "Dell U2720Q",
            "equipment_type": "monitor",
            "condition": "new",
            "status": "in_stock"
        }
    ]
    
    all_equipment = laptops + others
    equipment_list = []
    
    for eq_data in all_equipment:
        eq = Equipment(**eq_data)
        db.add(eq)
        equipment_list.append(eq)
    
    db.commit()
    print(f"✅ {len(equipment_list)} équipements créés")
    
    # Créer les emplacements
    for eq in equipment_list:
        db.refresh(eq)
        
        emp = Emplacement(equipment_id=eq.id)
        
        # Si ce n'est pas un laptop, définir un emplacement physique
        if eq.equipment_type.lower() != "laptop":
            emp.etage = "1A1"
            emp.rosace = 5
            emp.type_emplacement = "SC"
        
        # Générer la désignation
        emp.generate_designation()
        
        db.add(emp)
    
    db.commit()
    print(f"✅ {len(equipment_list)} emplacements créés")
    
except Exception as e:
    print(f"❌ Erreur: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
PYTHON

# 3. Afficher les résultats
echo ""
echo "3️⃣ Résultats:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
    eq.serial_number,
    eq.equipment_type,
    eq.status,
    e.designation,
    e.emplacement_exact
FROM emplacements e
JOIN equipment eq ON e.equipment_id = eq.id
ORDER BY eq.equipment_type, eq.status;
"

echo ""
echo "✅ Mise à jour terminée !"
echo ""
echo "📋 Logique de désignation:"
echo "   Laptop + Assigné      → CHEZ COLLABORATEUR"
echo "   Laptop + En stock     → EN STOCK"
echo "   Laptop + Autre        → SIMOP"
echo "   Autres équipements    → CODE (ex: 1A1-R05-SC)"
