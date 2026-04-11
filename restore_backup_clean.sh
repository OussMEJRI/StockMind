#!/bin/bash

echo "🔄 Restauration du backup (nettoyage des tables)"
echo "================================================"
echo ""

# 1. Supprimer toutes les tables existantes
echo "1️⃣ Suppression des tables existantes..."
docker exec inventory-db psql -U inventory_user -d inventory_db << 'SQL'
-- Supprimer les contraintes de clés étrangères
DROP TABLE IF EXISTS equipment_movements CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Supprimer les types ENUM
DROP TYPE IF EXISTS contracttype CASCADE;
DROP TYPE IF EXISTS department CASCADE;
DROP TYPE IF EXISTS equipmentcondition CASCADE;
DROP TYPE IF EXISTS equipmentstatus CASCADE;
DROP TYPE IF EXISTS equipmenttype CASCADE;
DROP TYPE IF EXISTS userrole CASCADE;

\echo '✅ Tables supprimées'
SQL

# 2. Restaurer le backup
echo ""
echo "2️⃣ Restauration du backup..."
cat backup.sql | docker exec -i inventory-db psql -U inventory_user -d inventory_db 2>&1 | grep -v "ERROR"

# 3. Vérifier les tables
echo ""
echo "3️⃣ Tables créées:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "\dt"

# 4. Vérifier les données
echo ""
echo "4️⃣ Données importées:"
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

# 5. Redémarrer le backend
echo ""
echo "5️⃣ Redémarrage du backend..."
docker restart inventory-backend

sleep 10

# 6. Test
echo ""
echo "6️⃣ Test de l'API:"
curl -s http://localhost:8000/health | jq '.' || echo "Backend pas encore prêt"

echo ""
echo "✅ Restauration terminée !"
