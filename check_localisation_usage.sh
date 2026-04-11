#!/bin/bash

echo "🔍 Recherche de 'localisation' dans le code"
echo "==========================================="
echo ""

echo "📁 Backend Python:"
grep -r "localisation" backend --include="*.py" | wc -l
echo ""

echo "📁 Frontend TypeScript:"
grep -r "localisation" frontend/src --include="*.ts" | wc -l
echo ""

echo "📁 Frontend HTML:"
grep -r "localisation" frontend/src --include="*.html" | wc -l
echo ""

echo "📄 Fichiers contenant 'localisation':"
echo "======================================"
grep -rl "localisation" backend frontend --include="*.py" --include="*.ts" --include="*.html" --include="*.css"

echo ""
echo "📊 Occurrences détaillées:"
echo "=========================="
grep -rn "localisation" backend frontend --include="*.py" --include="*.ts" --include="*.html" | head -20
