#!/bin/bash

echo "🔄 Remplacement de 'Localisation' par 'Emplacement'"
echo "==================================================="
echo ""

cd frontend/src

# Fonction de remplacement
replace_in_files() {
    local extension=$1
    echo "📝 Traitement des fichiers *.$extension..."
    
    find . -name "*.$extension" -type f | while read file; do
        if grep -q "Localisation" "$file" 2>/dev/null; then
            echo "  ✏️  $file"
            # macOS et Linux compatible
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' 's/Localisation/Emplacement/g' "$file"
            else
                sed -i 's/Localisation/Emplacement/g' "$file"
            fi
        fi
    done
}

# Remplacer dans tous les types de fichiers
replace_in_files "ts"
replace_in_files "html"
replace_in_files "json"
replace_in_files "css"
replace_in_files "scss"

cd ../..

echo ""
echo "✅ Remplacement terminé !"
echo ""
echo "🔍 Vérification:"
cd frontend/src
grep -r "Localisation" --include="*.ts" --include="*.html" . 2>/dev/null && echo "⚠️  Il reste des occurrences" || echo "✅ Toutes les occurrences remplacées"
cd ../..
