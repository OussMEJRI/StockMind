#!/bin/bash

echo "🔧 MISE À JOUR DES TYPES D'ÉQUIPEMENTS"
echo "======================================"
echo ""

POSTGRES_USER="postgres"
POSTGRES_DB="inventory_db"

echo "1️⃣ Ajout du type 'docking_station'..."
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << 'SQL'

-- Ajouter le nouveau type à l'ENUM
ALTER TYPE equipmenttype ADD VALUE IF NOT EXISTS 'docking_station';

\echo '✅ Type docking_station ajouté'

SQL

echo ""
echo "2️⃣ Mise à jour de la logique des emplacements..."
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << 'SQL'

-- Supprimer les emplacements existants
TRUNCATE TABLE emplacements CASCADE;

-- Recréer les emplacements avec la nouvelle logique
INSERT INTO emplacements (equipment_id, etage, rosace, type_emplacement, emplacement_exact, designation)
SELECT 
    e.id,
    -- Étage : NULL pour laptop, monitor, docking_station
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) IN ('laptop', 'monitor', 'docking_station') THEN NULL
        WHEN l.floor IS NOT NULL THEN l.floor 
        ELSE NULL 
    END,
    -- Rosace : NULL pour laptop, monitor, docking_station
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) IN ('laptop', 'monitor', 'docking_station') THEN NULL
        ELSE ((e.id % 13) + 1) 
    END,
    -- Type emplacement : NULL pour laptop, monitor, docking_station
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) IN ('laptop', 'monitor', 'docking_station') THEN NULL
        ELSE CASE (e.id % 3) 
            WHEN 0 THEN 'SC' 
            WHEN 1 THEN 'DS' 
            ELSE 'SC1' 
        END 
    END,
    -- Emplacement exact : NULL pour laptop, monitor, docking_station
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) IN ('laptop', 'monitor', 'docking_station') THEN NULL
        WHEN l.floor IS NOT NULL THEN 
            l.floor || '-R' || LPAD(((e.id % 13) + 1)::TEXT, 2, '0') || '-' || 
            CASE (e.id % 3) 
                WHEN 0 THEN 'SC' 
                WHEN 1 THEN 'DS' 
                ELSE 'SC1' 
            END
        ELSE NULL 
    END,
    -- Désignation
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) = 'laptop' THEN
            CASE LOWER(e.status::TEXT)
                WHEN 'assigned' THEN 'CHEZ COLLABORATEUR'
                WHEN 'in_stock' THEN 'EN STOCK'
                WHEN 'maintenance' THEN 'EN MAINTENANCE'
                ELSE 'SIMOP'
            END
        WHEN LOWER(e.equipment_type::TEXT) = 'monitor' THEN 'ÉCRAN - NON LOCALISÉ'
        WHEN LOWER(e.equipment_type::TEXT) = 'docking_station' THEN 'DOCKING STATION - NON LOCALISÉ'
        WHEN l.floor IS NOT NULL THEN 
            UPPER(l.floor || '-R' || LPAD(((e.id % 13) + 1)::TEXT, 2, '0') || '-' || 
            CASE (e.id % 3) 
                WHEN 0 THEN 'SC' 
                WHEN 1 THEN 'DS' 
                ELSE 'SC1' 
            END)
        ELSE 'NON DÉFINI'
    END
FROM equipment e
LEFT JOIN locations l ON e.location_id = l.id;

\echo '✅ Emplacements mis à jour'

SQL

echo ""
echo "3️⃣ Ajout d'équipements Docking Station..."
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << 'SQL'

-- Docking stations en stock
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, purchase_date, warranty_end_date, location_id)
VALUES 
    ('DOCK-001', 'Dell WD19TB Thunderbolt', 'docking_station', 'new', 'in_stock', '2023-05-01', '2026-05-01', 12),
    ('DOCK-002', 'HP USB-C Dock G5', 'docking_station', 'new', 'in_stock', '2023-05-01', '2026-05-01', 12),
    ('DOCK-003', 'Lenovo ThinkPad USB-C Dock', 'docking_station', 'new', 'in_stock', '2023-05-05', '2026-05-05', 12),
    ('DOCK-004', 'Dell WD19TB Thunderbolt', 'docking_station', 'new', 'in_stock', '2023-05-10', '2026-05-10', 12),
    ('DOCK-005', 'HP USB-C Dock G5', 'docking_station', 'new', 'in_stock', '2023-05-10', '2026-05-10', 12),
    ('DOCK-006', 'Lenovo ThinkPad USB-C Dock', 'docking_station', 'used', 'in_stock', '2022-08-20', '2025-08-20', 12),
    ('DOCK-007', 'Dell WD19TB Thunderbolt', 'docking_station', 'new', 'in_stock', '2023-05-15', '2026-05-15', 12),
    ('DOCK-008', 'HP USB-C Dock G5', 'docking_station', 'new', 'in_stock', '2023-05-15', '2026-05-15', 12);

-- Créer les emplacements pour les nouvelles docking stations
INSERT INTO emplacements (equipment_id, designation)
SELECT 
    e.id,
    'DOCKING STATION - NON LOCALISÉ'
FROM equipment e
WHERE LOWER(e.equipment_type::TEXT) = 'docking_station'
AND NOT EXISTS (SELECT 1 FROM emplacements emp WHERE emp.equipment_id = e.id);

\echo '✅ Docking stations ajoutées'

SQL

echo ""
echo "4️⃣ Vérification..."
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << 'SQL'

\echo ''
\echo '📊 ÉQUIPEMENTS PAR TYPE :'
SELECT equipment_type, COUNT(*) as count
FROM equipment
GROUP BY equipment_type
ORDER BY count DESC;

\echo ''
\echo '📍 EMPLACEMENTS PAR DÉSIGNATION :'
SELECT designation, COUNT(*) as count
FROM emplacements
GROUP BY designation
ORDER BY count DESC;

\echo ''
\echo '🔍 EXEMPLES D''EMPLACEMENTS :'
SELECT 
    e.serial_number,
    e.equipment_type,
    emp.etage,
    emp.rosace,
    emp.type_emplacement,
    emp.emplacement_exact,
    emp.designation
FROM emplacements emp
JOIN equipment e ON emp.equipment_id = e.id
ORDER BY e.equipment_type, e.id
LIMIT 20;

SQL

echo ""
echo "5️⃣ Mise à jour du modèle Frontend..."
cat > frontend/src/app/core/models/equipment.model.ts << 'EOFMODEL'
export enum EquipmentType {
  LAPTOP = 'laptop',
  PC = 'pc',
  MONITOR = 'monitor',
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  PRINTER = 'printer',
  SERVER = 'server',
  NETWORK = 'network',
  DOCKING_STATION = 'docking_station',
  OTHER = 'other'
}

export enum EquipmentStatus {
  IN_STOCK = 'in_stock',
  ASSIGNED = 'assigned',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired'
}

export enum EquipmentCondition {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished',
  DAMAGED = 'damaged'
}

export interface Equipment {
  id?: number;
  serial_number: string;
  model: string;
  equipment_type: EquipmentType | string;
  condition: EquipmentCondition | string;
  status: EquipmentStatus | string;
  purchase_date?: string;
  warranty_end_date?: string;
  notes?: string;
  employee_id?: number;
  employee?: any;
  location_id?: number;
  location?: any;
  emplacement_id?: number;
  emplacement?: any;
  created_at?: string;
  updated_at?: string;
}

export interface EquipmentResponse {
  items: Equipment[];
  total: number;
  skip: number;
  limit: number;
}

// Labels pour l'affichage
export const EquipmentTypeLabels: { [key in EquipmentType]: string } = {
  [EquipmentType.LAPTOP]: 'Laptop',
  [EquipmentType.PC]: 'PC de bureau',
  [EquipmentType.MONITOR]: 'Écran',
  [EquipmentType.KEYBOARD]: 'Clavier',
  [EquipmentType.MOUSE]: 'Souris',
  [EquipmentType.PRINTER]: 'Imprimante',
  [EquipmentType.SERVER]: 'Serveur',
  [EquipmentType.NETWORK]: 'Équipement réseau',
  [EquipmentType.DOCKING_STATION]: 'Docking Station',
  [EquipmentType.OTHER]: 'Autre'
};

export const EquipmentStatusLabels: { [key in EquipmentStatus]: string } = {
  [EquipmentStatus.IN_STOCK]: 'En stock',
  [EquipmentStatus.ASSIGNED]: 'Assigné',
  [EquipmentStatus.MAINTENANCE]: 'En maintenance',
  [EquipmentStatus.RETIRED]: 'Retiré'
};

export const EquipmentConditionLabels: { [key in EquipmentCondition]: string } = {
  [EquipmentCondition.NEW]: 'Neuf',
  [EquipmentCondition.USED]: 'Utilisé',
  [EquipmentCondition.REFURBISHED]: 'Reconditionné',
  [EquipmentCondition.DAMAGED]: 'Endommagé'
};
EOFMODEL

echo "✅ Modèle Frontend mis à jour"

echo ""
echo "6️⃣ Redémarrage des services..."
docker compose restart backend frontend
sleep 10

echo ""
echo "✅ MISE À JOUR TERMINÉE !"
echo ""
echo "📊 Résumé des changements :"
echo "   ✅ Type 'docking_station' ajouté"
echo "   ✅ 8 docking stations créées"
echo "   ✅ Logique d'emplacement mise à jour :"
echo "      - Laptops : Pas de localisation (CHEZ COLLABORATEUR / EN STOCK)"
echo "      - Moniteurs : Pas de localisation (ÉCRAN - NON LOCALISÉ)"
echo "      - Docking Stations : Pas de localisation (DOCKING STATION - NON LOCALISÉ)"
echo "      - Autres équipements : Localisation complète (Étage-Rosace-Type)"
echo ""
echo "🌐 Accès : http://localhost:4200"
