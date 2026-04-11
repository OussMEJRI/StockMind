#!/bin/bash

echo "🔍 Vérification des données créées"
echo "==================================="
echo ""

POSTGRES_USER=$(docker exec inventory-db env | grep POSTGRES_USER | cut -d'=' -f2)
if [ -z "$POSTGRES_USER" ]; then
    POSTGRES_USER="postgres"
fi

POSTGRES_DB=$(docker exec inventory-db env | grep POSTGRES_DB | cut -d'=' -f2)
if [ -z "$POSTGRES_DB" ]; then
    POSTGRES_DB="inventory_db"
fi

# Comptages
echo "📊 Nombre d'enregistrements par table:"
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'locations', COUNT(*) FROM locations
UNION ALL
SELECT 'emplacements', COUNT(*) FROM emplacements
UNION ALL
SELECT 'equipment_movements', COUNT(*) FROM equipment_movements
ORDER BY table_name;
"

# Exemples de données
echo ""
echo "👥 Exemples d'employés:"
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT id, full_name, email, department, position 
FROM employees 
LIMIT 5;
"

echo ""
echo "💻 Exemples d'équipements:"
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT id, serial_number, model, equipment_type, status 
FROM equipment 
LIMIT 10;
"

echo ""
echo "📍 Exemples d'emplacements:"
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 
    emp.id,
    e.serial_number,
    e.equipment_type,
    emp.designation,
    emp.emplacement_exact
FROM emplacements emp
JOIN equipment e ON emp.equipment_id = e.id
LIMIT 10;
"

echo ""
echo "📊 Répartition des équipements par type:"
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT equipment_type, COUNT(*) as count
FROM equipment
GROUP BY equipment_type
ORDER BY count DESC;
"

echo ""
echo "📊 Répartition des désignations:"
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT designation, COUNT(*) as count
FROM emplacements
GROUP BY designation
ORDER BY count DESC;
"

echo ""
echo "✅ Vérification terminée !"
