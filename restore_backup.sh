echo "🔄 Restauration du backup"
echo "========================="
echo ""

# Vérifier que le fichier backup existe
if [ ! -f "backup.sql" ]; then
    echo "❌ Fichier backup.sql introuvable"
    exit 1
fi

# 1. Arrêter les conteneurs
echo "1️⃣ Arrêt des conteneurs..."
docker compose down

# 2. Supprimer le volume de la base de données
echo "2️⃣ Suppression du volume de la base de données..."
docker volume rm stockmind_postgres_data 2>/dev/null || true

# 3. Redémarrer seulement la DB
echo "3️⃣ Démarrage de la base de données..."
docker compose up -d db

# 4. Attendre que la DB soit prête
echo "4️⃣ Attente de la base de données..."
for i in {1..30}; do
    if docker exec inventory-db pg_isready -U inventory_user > /dev/null 2>&1; then
        echo "✅ Base de données prête"
        break
    fi
    echo "   Tentative $i/30..."
    sleep 2
done

# 5. Créer la base de données si elle n'existe pas
echo "5️⃣ Création de la base de données..."
docker exec inventory-db psql -U inventory_user -d postgres -c "DROP DATABASE IF EXISTS inventory_db;" 2>/dev/null || true
docker exec inventory-db psql -U inventory_user -d postgres -c "CREATE DATABASE inventory_db;"

# 6. Restaurer le backup
echo "6️⃣ Restauration du backup..."
cat backup.sql | docker exec -i inventory-db psql -U inventory_user -d inventory_db

# 7. Vérifier les tables
echo ""
echo "7️⃣ Vérification des tables:"
docker exec inventory-db psql -U inventory_user -d inventory_db -c "\dt"

# 8. Vérifier les données
echo ""
echo "8️⃣ Vérification des données:"
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

# 9. Démarrer le backend
echo ""
echo "9️⃣ Démarrage du backend..."
docker compose up -d backend

# 10. Attendre le backend
echo "🔟 Attente du backend..."
sleep 15

# 11. Démarrer le frontend
echo "1️⃣1️⃣ Démarrage du frontend..."
docker compose up -d frontend

# 12. Vérifier tout
echo ""
echo "1️⃣2️⃣ Vérification finale:"
docker ps

echo ""
echo "✅ Restauration terminée !"
echo ""
echo "📊 Accès:"
echo "   Frontend: http://localhost:4200"
echo "   Backend: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
