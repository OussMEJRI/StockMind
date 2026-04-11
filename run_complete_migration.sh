#!/bin/bash

echo "🚀 MIGRATION COMPLÈTE"
echo "===================="
echo ""

# 1. Migration de la base de données
echo "ÉTAPE 1/3 : Migration de la base de données"
echo "============================================"
./safe_migration.sh

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la migration de la base de données"
    exit 1
fi

# 2. Vérification
echo ""
echo "ÉTAPE 2/3 : Vérification"
echo "========================"
./verify_migration.sh

# 3. Correction du frontend
echo ""
echo "ÉTAPE 3/3 : Correction du frontend"
echo "==================================="
./fix_frontend_only.sh

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la correction du frontend"
    exit 1
fi

echo ""
echo "✅✅✅ MIGRATION COMPLÈTE TERMINÉE ✅✅✅"
echo ""
echo "📊 Votre application est prête !"
echo "   Frontend: http://localhost:4200"
echo "   Backend: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔐 Connectez-vous avec vos identifiants habituels"
