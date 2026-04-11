#!/bin/bash

echo "🔍 Vérification de la migration"
echo "==============================="
echo ""

# 1. Comparer les comptages
echo "1️⃣ Comparaison des données:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
    'Equipment total' as description,
    COUNT(*) as count
FROM equipment
UNION ALL
SELECT 
    'Equipment avec emplacement',
    COUNT(*)
FROM emplacements
UNION ALL
SELECT 
    'Equipment avec location',
    COUNT(*)
FROM equipment
WHERE location_id IS NOT NULL;
"

# 2. Vérifier les désignations par type
echo ""
echo "2️⃣ Répartition des désignations:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
    designation,
    COUNT(*) as count
FROM emplacements
GROUP BY designation
ORDER BY count DESC;
"

# 3. Vérifier les laptops
echo ""
echo "3️⃣ Désignations des laptops:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
    e.status,
    emp.designation,
    COUNT(*) as count
FROM emplacements emp
JOIN equipment e ON emp.equipment_id = e.id
WHERE LOWER(e.equipment_type::TEXT) = 'laptop'
GROUP BY e.status, emp.designation
ORDER BY e.status;
"

# 4. Vérifier les autres équipements
echo ""
echo "4️⃣ Autres équipements:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
    e.equipment_type,
    COUNT(*) as total,
    COUNT(emp.id) as with_emplacement
FROM equipment e
LEFT JOIN emplacements emp ON e.id = emp.equipment_id
WHERE LOWER(e.equipment_type::TEXT) != 'laptop'
GROUP BY e.equipment_type
ORDER BY total DESC;
"

# 5. Équipements sans emplacement (ne devrait pas y en avoir)
echo ""
echo "5️⃣ Équipements sans emplacement:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "
SELECT 
    e.id,
    e.serial_number,
    e.equipment_type,
    e.status
FROM equipment e
LEFT JOIN emplacements emp ON e.id = emp.equipment_id
WHERE emp.id IS NULL
LIMIT 10;
"

echo ""
echo "✅ Vérification terminée"
