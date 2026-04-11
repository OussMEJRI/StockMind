#!/bin/bash

echo "🔍 Recherche de 'Localisation' dans le frontend"
echo "==============================================="
echo ""

cd frontend/src

echo "📁 Fichiers TypeScript (.ts):"
grep -r "Localisation" --include="*.ts" . 2>/dev/null || echo "Aucun trouvé"

echo ""
echo "📁 Fichiers HTML (.html):"
grep -r "Localisation" --include="*.html" . 2>/dev/null || echo "Aucun trouvé"

echo ""
echo "📁 Fichiers de traduction (.json):"
grep -r "Localisation" --include="*.json" . 2>/dev/null || echo "Aucun trouvé"

cd ../..
