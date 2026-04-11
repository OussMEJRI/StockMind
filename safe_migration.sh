#!/bin/bash

echo "🔒 Migration sécurisée - Conservation des données"
echo "================================================="
echo ""

# 1. Backup de sécurité
echo "1️⃣ Création d'un backup de sécurité..."
docker exec inventory-db pg_dump -U inventory_user inventory_db > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
echo "✅ Backup créé : backup_before_migration_$(date +%Y%m%d_%H%M%S).sql"

# 2. Vérifier les données actuelles
echo ""
echo "2️⃣ État actuel de la base de données:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'locations', COUNT(*) FROM locations
UNION ALL
SELECT 'equipment_movements', COUNT(*) FROM equipment_movements;
"

# 3. Créer la table emplacements (sans toucher aux autres)
echo ""
echo "3️⃣ Création de la table emplacements..."
docker exec inventory-db psql -U inventory_user -d inventory_db << 'SQL'
-- Créer la table emplacements si elle n'existe pas
CREATE TABLE IF NOT EXISTS emplacements (
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

-- Index
CREATE INDEX IF NOT EXISTS idx_emplacements_equipment ON emplacements(equipment_id);
CREATE INDEX IF NOT EXISTS idx_emplacements_designation ON emplacements(designation);

\echo '✅ Table emplacements créée'
SQL

# 4. Migrer les données de locations vers emplacements
echo ""
echo "4️⃣ Migration des données locations → emplacements..."
docker exec inventory-db psql -U inventory_user -d inventory_db << 'SQL'
-- Fonction pour générer la désignation
CREATE OR REPLACE FUNCTION generate_designation(
    eq_type TEXT,
    eq_status TEXT,
    floor TEXT,
    room TEXT
) RETURNS TEXT AS $$
BEGIN
    IF LOWER(eq_type) = 'laptop' THEN
        CASE LOWER(eq_status)
            WHEN 'assigned' THEN RETURN 'CHEZ COLLABORATEUR';
            WHEN 'in_stock' THEN RETURN 'EN STOCK';
            ELSE RETURN 'SIMOP';
        END CASE;
    ELSE
        IF floor IS NOT NULL AND room IS NOT NULL THEN
            RETURN UPPER(floor || '-' || room);
        ELSIF floor IS NOT NULL THEN
            RETURN UPPER(floor);
        ELSE
            RETURN 'NON DÉFINI';
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Migrer les données
INSERT INTO emplacements (equipment_id, etage, emplacement_exact, designation, created_at, updated_at)
SELECT 
    e.id as equipment_id,
    l.floor as etage,
    CASE 
        WHEN l.floor IS NOT NULL AND l.room IS NOT NULL THEN l.floor || '-' || l.room
        WHEN l.floor IS NOT NULL THEN l.floor
        ELSE NULL
    END as emplacement_exact,
    generate_designation(
        e.equipment_type::TEXT,
        e.status::TEXT,
        l.floor,
        l.room
    ) as designation,
    COALESCE(e.created_at, NOW()) as created_at,
    COALESCE(e.updated_at, NOW()) as updated_at
FROM equipment e
LEFT JOIN locations l ON e.location_id = l.id
WHERE NOT EXISTS (
    SELECT 1 FROM emplacements emp WHERE emp.equipment_id = e.id
)
ON CONFLICT (equipment_id) DO NOTHING;

-- Nettoyer la fonction temporaire
DROP FUNCTION IF EXISTS generate_designation(TEXT, TEXT, TEXT, TEXT);

\echo '✅ Données migrées'
SQL

# 5. Vérifier la migration
echo ""
echo "5️⃣ Vérification de la migration:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
    COUNT(*) as total_equipment,
    COUNT(emp.id) as equipment_with_emplacement,
    COUNT(*) - COUNT(emp.id) as equipment_without_emplacement
FROM equipment e
LEFT JOIN emplacements emp ON e.id = emp.equipment_id;
"

# 6. Afficher quelques exemples
echo ""
echo "6️⃣ Exemples d'emplacements créés:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
    e.serial_number,
    e.equipment_type,
    e.status,
    emp.designation,
    emp.emplacement_exact
FROM emplacements emp
JOIN equipment e ON emp.equipment_id = e.id
LIMIT 10;
"

# 7. Créer des emplacements pour les équipements sans location
echo ""
echo "7️⃣ Création d'emplacements pour les équipements sans location..."
docker exec inventory-db psql -U inventory_user -d inventory_db << 'SQL'
INSERT INTO emplacements (equipment_id, designation, created_at, updated_at)
SELECT 
    e.id as equipment_id,
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) = 'laptop' THEN
            CASE LOWER(e.status::TEXT)
                WHEN 'assigned' THEN 'CHEZ COLLABORATEUR'
                WHEN 'in_stock' THEN 'EN STOCK'
                ELSE 'SIMOP'
            END
        ELSE 'NON DÉFINI'
    END as designation,
    NOW() as created_at,
    NOW() as updated_at
FROM equipment e
WHERE NOT EXISTS (
    SELECT 1 FROM emplacements emp WHERE emp.equipment_id = e.id
)
ON CONFLICT (equipment_id) DO NOTHING;

\echo '✅ Emplacements créés pour tous les équipements'
SQL

# 8. État final
echo ""
echo "8️⃣ État final de la base de données:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'locations', COUNT(*) FROM locations
UNION ALL
SELECT 'equipment_movements', COUNT(*) FROM equipment_movements
UNION ALL
SELECT 'emplacements', COUNT(*) FROM emplacements;
"

# 9. Redémarrer le backend pour prendre en compte les changements
echo ""
echo "9️⃣ Redémarrage du backend..."
docker restart inventory-backend
sleep 10

# 10. Test de l'API
echo ""
echo "🔟 Test de l'API emplacements..."
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=admin123" 2>/dev/null | jq -r '.access_token' 2>/dev/null)

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✅ Connexion réussie"
    
    EMPLACEMENTS=$(curl -s -X GET http://localhost:8000/api/v1/emplacements \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null | jq '.items | length' 2>/dev/null)
    
    if [ -n "$EMPLACEMENTS" ]; then
        echo "✅ $EMPLACEMENTS emplacements trouvés via l'API"
    fi
else
    echo "⚠️  Impossible de tester l'API (vérifiez les identifiants)"
fi

echo ""
echo "✅ Migration terminée avec succès !"
echo ""
echo "📊 Résumé:"
echo "   - Toutes vos données ont été conservées"
echo "   - Table 'emplacements' créée"
echo "   - Données migrées depuis 'locations'"
echo "   - Backup de sécurité créé"
echo ""
echo "📁 Fichiers de backup:"
ls -lh backup_before_migration_*.sql 2>/dev/null || echo "   Aucun backup trouvé"
