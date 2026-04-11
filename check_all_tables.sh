#!/bin/bash

echo "🔍 VÉRIFICATION COMPLÈTE DES TABLES"
echo "===================================="
echo ""

# 1. Liste de toutes les tables
echo "1️⃣ LISTE DES TABLES"
echo "==================="
docker exec inventory-db psql -U inventory_user -d inventory_db -c "\dt"

# 2. Nombre d'enregistrements par table
echo ""
echo "2️⃣ NOMBRE D'ENREGISTREMENTS"
echo "============================"
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
SELECT 'emplacements', COUNT(*) FROM emplacements WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'emplacements')
ORDER BY table_name;
"

# 3. Structure de la table users
echo ""
echo "3️⃣ STRUCTURE DE LA TABLE USERS"
echo "==============================="
docker exec inventory-db psql -U inventory_user -d inventory_db -c "\d users"

# 4. Structure de la table employees
echo ""
echo "4️⃣ STRUCTURE DE LA TABLE EMPLOYEES"
echo "==================================="
docker exec inventory-db psql -U inventory_user -d inventory_db -c "\d employees"

# 5. Structure de la table equipment
echo ""
echo "5️⃣ STRUCTURE DE LA TABLE EQUIPMENT"
echo "==================================="
docker exec inventory-db psql -U inventory_user -d inventory_db -c "\d equipment"

# 6. Structure de la table locations
echo ""
echo "6️⃣ STRUCTURE DE LA TABLE LOCATIONS"
echo "==================================="
docker exec inventory-db psql -U inventory_user -d inventory_db -c "\d locations"

# 7. Structure de la table emplacements (si elle existe)
echo ""
echo "7️⃣ STRUCTURE DE LA TABLE EMPLACEMENTS"
echo "======================================"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "\d emplacements" 2>/dev/null || echo "Table emplacements n'existe pas encore"

# 8. Aperçu des données users
echo ""
echo "8️⃣ APERÇU DES DONNÉES - USERS"
echo "=============================="
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT id, email, full_name, is_active, created_at 
FROM users 
LIMIT 5;
"

# 9. Aperçu des données employees
echo ""
echo "9️⃣ APERÇU DES DONNÉES - EMPLOYEES"
echo "=================================="
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT id, full_name, email, department, position 
FROM employees 
LIMIT 5;
"

# 10. Aperçu des données equipment
echo ""
echo "🔟 APERÇU DES DONNÉES - EQUIPMENT"
echo "================================="
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT id, serial_number, model, equipment_type, status, condition 
FROM equipment 
LIMIT 5;
"

# 11. Aperçu des données locations
echo ""
echo "1️⃣1️⃣ APERÇU DES DONNÉES - LOCATIONS"
echo "===================================="
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT id, site, floor, room, description 
FROM locations 
LIMIT 5;
"

# 12. Aperçu des données emplacements (si existe)
echo ""
echo "1️⃣2️⃣ APERÇU DES DONNÉES - EMPLACEMENTS"
echo "======================================="
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT emp.id, e.serial_number, e.equipment_type, emp.designation, emp.emplacement_exact
FROM emplacements emp
JOIN equipment e ON emp.equipment_id = e.id
LIMIT 5;
" 2>/dev/null || echo "Table emplacements n'existe pas encore"

# 13. Relations entre tables
echo ""
echo "1️⃣3️⃣ RELATIONS ENTRE TABLES"
echo "============================"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
    'Equipment avec location' as relation,
    COUNT(*) as count
FROM equipment
WHERE location_id IS NOT NULL
UNION ALL
SELECT 
    'Equipment avec employee',
    COUNT(*)
FROM equipment
WHERE employee_id IS NOT NULL
UNION ALL
SELECT 
    'Equipment avec emplacement',
    COUNT(*)
FROM equipment e
WHERE EXISTS (SELECT 1 FROM emplacements emp WHERE emp.equipment_id = e.id);
"

# 14. Types ENUM
echo ""
echo "1️⃣4️⃣ TYPES ENUM DÉFINIS"
echo "========================"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT n.nspname as schema, t.typname as type_name
FROM pg_type t 
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
WHERE (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid)) 
AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid)
AND n.nspname NOT IN ('pg_catalog', 'information_schema')
AND t.typname LIKE '%type' OR t.typname LIKE '%status' OR t.typname LIKE '%condition' OR t.typname LIKE '%department' OR t.typname LIKE '%role'
ORDER BY t.typname;
"

# 15. Index
echo ""
echo "1️⃣5️⃣ INDEX CRÉÉS"
echo "================"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
"

echo ""
echo "✅ Vérification terminée !"
