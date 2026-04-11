#!/bin/bash

echo "🔄 Remplacement avec backup"
echo "==========================="
echo ""

# 1. Créer un backup
echo "1️⃣ Création du backup..."
BACKUP_DIR="backup_before_replace_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

cp -r backend "$BACKUP_DIR/"
cp -r frontend "$BACKUP_DIR/"
cp docker-compose.yml "$BACKUP_DIR/" 2>/dev/null

echo "✅ Backup créé dans: $BACKUP_DIR"

# 2. Fonction de remplacement
replace_in_file() {
    local file=$1
    if [ -f "$file" ]; then
        # Remplacements
        sed -i 's/\blocalisation\b/emplacement/g' "$file"
        sed -i 's/\bLocalisation\b/Emplacement/g' "$file"
        sed -i 's/\bLOCALISATION\b/EMPLACEMENT/g' "$file"
        sed -i 's/\blocalisations\b/emplacements/g' "$file"
        sed -i 's/\bLocalisations\b/Emplacements/g' "$file"
        sed -i 's/\bLOCALISATIONS\b/EMPLACEMENTS/g' "$file"
        
        # Cas spéciaux pour les URLs et routes
        sed -i 's/\/localisations/\/emplacements/g' "$file"
        sed -i 's/\/localisation/\/emplacement/g' "$file"
        
        echo "  ✅ $file"
    fi
}

# 3. Backend
echo ""
echo "2️⃣ Remplacement dans le Backend..."
find backend -type f \( -name "*.py" -o -name "*.txt" -o -name "*.md" \) | while read file; do
    replace_in_file "$file"
done

# 4. Frontend
echo ""
echo "3️⃣ Remplacement dans le Frontend..."
find frontend/src -type f \( -name "*.ts" -o -name "*.html" -o -name "*.css" -o -name "*.scss" -o -name "*.json" \) | while read file; do
    replace_in_file "$file"
done

# 5. Renommer les fichiers
echo ""
echo "4️⃣ Renommage des fichiers..."

# Backend - Endpoints
find backend -type f -name "*localisation*" | while read file; do
    newfile=$(echo "$file" | sed 's/localisation/emplacement/g')
    if [ "$file" != "$newfile" ]; then
        mv "$file" "$newfile"
        echo "  ✅ $file → $newfile"
    fi
done

# Frontend - Tous les fichiers
find frontend -type f -name "*localisation*" | while read file; do
    newfile=$(echo "$file" | sed 's/localisation/emplacement/g')
    if [ "$file" != "$newfile" ]; then
        mv "$file" "$newfile"
        echo "  ✅ $file → $newfile"
    fi
done

# 6. Renommer les dossiers
echo ""
echo "5️⃣ Renommage des dossiers..."

find backend -depth -type d -name "*localisation*" | while read dir; do
    newdir=$(echo "$dir" | sed 's/localisation/emplacement/g')
    if [ "$dir" != "$newdir" ]; then
        mv "$dir" "$newdir"
        echo "  ✅ $dir → $newdir"
    fi
done

find frontend -depth -type d -name "*localisation*" | while read dir; do
    newdir=$(echo "$dir" | sed 's/localisation/emplacement/g')
    if [ "$dir" != "$newdir" ]; then
        mv "$dir" "$newdir"
        echo "  ✅ $dir → $newdir"
    fi
done

# 7. Vérification
echo ""
echo "6️⃣ Vérification..."
REMAINING=$(grep -r "localisation" backend frontend --include="*.py" --include="*.ts" --include="*.html" 2>/dev/null | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "✅ Aucune occurrence de 'localisation' trouvée !"
else
    echo "⚠️  $REMAINING occurrences restantes:"
    grep -rn "localisation" backend frontend --include="*.py" --include="*.ts" --include="*.html" 2>/dev/null | head -10
fi

echo ""
echo "✅ Remplacement terminé !"
echo ""
echo "📁 Backup disponible dans: $BACKUP_DIR"
echo ""
echo "📋 Prochaines étapes:"
echo "   1. Vérifier: git diff (si vous utilisez git)"
echo "   2. Rebuild: docker compose build"
echo "   3. Redémarrer: docker compose up -d"
echo ""
echo "⚠️  Pour restaurer le backup:"
echo "   rm -rf backend frontend"
echo "   cp -r $BACKUP_DIR/backend ."
echo "   cp -r $BACKUP_DIR/frontend ."
