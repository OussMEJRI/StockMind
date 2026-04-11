#!/bin/bash

echo "🔄 Remplacement de 'localisation' par 'emplacement'"
echo "===================================================="
echo ""

# Fonction de remplacement
replace_in_file() {
    local file=$1
    if [ -f "$file" ]; then
        # Remplacements (en préservant la casse)
        sed -i 's/localisation/emplacement/g' "$file"
        sed -i 's/Localisation/Emplacement/g' "$file"
        sed -i 's/LOCALISATION/EMPLACEMENT/g' "$file"
        sed -i 's/localisations/emplacements/g' "$file"
        sed -i 's/Localisations/Emplacements/g' "$file"
        sed -i 's/LOCALISATIONS/EMPLACEMENTS/g' "$file"
        echo "✅ $file"
    fi
}

# 1. BACKEND - Fichiers Python
echo "1️⃣ Backend Python..."
find backend -type f -name "*.py" | while read file; do
    replace_in_file "$file"
done

# 2. FRONTEND - Fichiers TypeScript
echo ""
echo "2️⃣ Frontend TypeScript..."
find frontend/src -type f -name "*.ts" | while read file; do
    replace_in_file "$file"
done

# 3. FRONTEND - Fichiers HTML
echo ""
echo "3️⃣ Frontend HTML..."
find frontend/src -type f -name "*.html" | while read file; do
    replace_in_file "$file"
done

# 4. FRONTEND - Fichiers CSS
echo ""
echo "4️⃣ Frontend CSS..."
find frontend/src -type f -name "*.css" | while read file; do
    replace_in_file "$file"
done

# 5. FRONTEND - Fichiers SCSS
echo ""
echo "5️⃣ Frontend SCSS..."
find frontend/src -type f -name "*.scss" | while read file; do
    replace_in_file "$file"
done

# 6. Fichiers de configuration
echo ""
echo "6️⃣ Fichiers de configuration..."
replace_in_file "docker-compose.yml"
replace_in_file "README.md"

# 7. Renommer les fichiers et dossiers
echo ""
echo "7️⃣ Renommage des fichiers et dossiers..."

# Backend
if [ -d "backend/app/api/v1/endpoints/localisations.py" ]; then
    mv backend/app/api/v1/endpoints/localisations.py backend/app/api/v1/endpoints/emplacements.py 2>/dev/null
    echo "✅ Renommé: localisations.py → emplacements.py"
fi

# Frontend - Composants
if [ -d "frontend/src/app/features/localisations" ]; then
    mv frontend/src/app/features/localisations frontend/src/app/features/emplacements 2>/dev/null
    echo "✅ Renommé: dossier localisations → emplacements"
fi

# Frontend - Services
if [ -f "frontend/src/app/core/services/localisation.service.ts" ]; then
    mv frontend/src/app/core/services/localisation.service.ts frontend/src/app/core/services/emplacement.service.ts 2>/dev/null
    echo "✅ Renommé: localisation.service.ts → emplacement.service.ts"
fi

# Frontend - Models
if [ -f "frontend/src/app/core/models/localisation.model.ts" ]; then
    mv frontend/src/app/core/models/localisation.model.ts frontend/src/app/core/models/emplacement.model.ts 2>/dev/null
    echo "✅ Renommé: localisation.model.ts → emplacement.model.ts"
fi

echo ""
echo "✅ Remplacement terminé !"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifier les changements: git diff"
echo "   2. Rebuild: docker compose build"
echo "   3. Redémarrer: docker compose up -d"
