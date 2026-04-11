#!/bin/bash

echo "📊 REMPLISSAGE IMMÉDIAT DE TOUTES LES DONNÉES"
echo "=============================================="
echo ""

POSTGRES_USER="postgres"
POSTGRES_DB="inventory_db"

echo "1️⃣ Insertion des données..."
echo ""

docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << 'SQL'

-- Vider les tables d'abord
TRUNCATE TABLE equipment_movements CASCADE;
TRUNCATE TABLE emplacements CASCADE;
TRUNCATE TABLE equipment CASCADE;
TRUNCATE TABLE employees CASCADE;
TRUNCATE TABLE locations CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE employees_id_seq RESTART WITH 1;
ALTER SEQUENCE locations_id_seq RESTART WITH 1;
ALTER SEQUENCE equipment_id_seq RESTART WITH 1;
ALTER SEQUENCE emplacements_id_seq RESTART WITH 1;
ALTER SEQUENCE equipment_movements_id_seq RESTART WITH 1;

-- ============================================
-- USERS (mot de passe: admin123 pour tous)
-- ============================================
INSERT INTO users (email, hashed_password, full_name, is_active, is_superuser, role, created_at, updated_at)
VALUES 
    ('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qXqN.Hhuy', 'Administrateur Principal', true, true, 'admin', NOW(), NOW()),
    ('manager@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qXqN.Hhuy', 'Manager IT', true, false, 'user', NOW(), NOW()),
    ('user@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qXqN.Hhuy', 'Utilisateur Standard', true, false, 'user', NOW(), NOW()),
    ('tech@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qXqN.Hhuy', 'Technicien IT', true, false, 'user', NOW(), NOW()),
    ('viewer@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qXqN.Hhuy', 'Observateur', true, false, 'viewer', NOW(), NOW());

-- ============================================
-- EMPLOYEES
-- ============================================
INSERT INTO employees (full_name, email, phone, department, position, hire_date, created_at, updated_at)
VALUES 
    ('Jean Dupont', 'jean.dupont@company.com', '+33612345678', 'IT', 'Développeur Senior', '2020-01-15', NOW(), NOW()),
    ('Marie Martin', 'marie.martin@company.com', '+33612345679', 'IT', 'Chef de Projet', '2019-03-20', NOW(), NOW()),
    ('Pierre Durand', 'pierre.durand@company.com', '+33612345680', 'RH', 'Responsable RH', '2018-06-10', NOW(), NOW()),
    ('Sophie Bernard', 'sophie.bernard@company.com', '+33612345681', 'Finance', 'Comptable', '2021-02-01', NOW(), NOW()),
    ('Luc Petit', 'luc.petit@company.com', '+33612345682', 'IT', 'Administrateur Système', '2020-09-15', NOW(), NOW()),
    ('Emma Roux', 'emma.roux@company.com', '+33612345683', 'Marketing', 'Responsable Marketing', '2019-11-05', NOW(), NOW()),
    ('Thomas Moreau', 'thomas.moreau@company.com', '+33612345684', 'IT', 'Développeur Junior', '2022-01-10', NOW(), NOW()),
    ('Julie Simon', 'julie.simon@company.com', '+33612345685', 'Commercial', 'Commerciale', '2020-07-20', NOW(), NOW()),
    ('Nicolas Laurent', 'nicolas.laurent@company.com', '+33612345686', 'IT', 'DevOps Engineer', '2021-04-12', NOW(), NOW()),
    ('Camille Michel', 'camille.michel@company.com', '+33612345687', 'Direction', 'Directeur Général', '2015-01-01', NOW(), NOW()),
    ('Alexandre Leroy', 'alexandre.leroy@company.com', '+33612345688', 'IT', 'Analyste', '2021-08-15', NOW(), NOW()),
    ('Laura Garnier', 'laura.garnier@company.com', '+33612345689', 'RH', 'Assistante RH', '2022-03-01', NOW(), NOW()),
    ('Maxime Faure', 'maxime.faure@company.com', '+33612345690', 'IT', 'Support Technique', '2020-11-20', NOW(), NOW()),
    ('Chloé Girard', 'chloe.girard@company.com', '+33612345691', 'Finance', 'Contrôleur de Gestion', '2019-05-15', NOW(), NOW()),
    ('Hugo Bonnet', 'hugo.bonnet@company.com', '+33612345692', 'IT', 'Architecte Logiciel', '2018-09-01', NOW(), NOW());

-- ============================================
-- LOCATIONS
-- ============================================
INSERT INTO locations (site, floor, room, description, created_at, updated_at)
VALUES 
    ('Siège Social', 'RDC A', 'R01', 'Accueil et réception', NOW(), NOW()),
    ('Siège Social', 'RDC A', 'R02', 'Salle de réunion principale', NOW(), NOW()),
    ('Siège Social', '1A1', 'R01', 'Bureau IT - Développement', NOW(), NOW()),
    ('Siège Social', '1A1', 'R02', 'Bureau IT - Support', NOW(), NOW()),
    ('Siège Social', '1A2', 'R01', 'Bureau RH', NOW(), NOW()),
    ('Siège Social', '2A1', 'R01', 'Bureau Finance', NOW(), NOW()),
    ('Siège Social', '2A1', 'R02', 'Salle serveurs', NOW(), NOW()),
    ('Siège Social', '2A2', 'R01', 'Bureau Marketing', NOW(), NOW()),
    ('Siège Social', '3A1', 'R01', 'Bureau Commercial', NOW(), NOW()),
    ('Siège Social', '3A1', 'R02', 'Salle de formation', NOW(), NOW()),
    ('Siège Social', '4A1', 'R01', 'Direction', NOW(), NOW()),
    ('Siège Social', 'SATED', 'R01', 'Stock matériel informatique', NOW(), NOW()),
    ('Siège Social', 'BLI', 'R01', 'Archives et stockage', NOW(), NOW()),
    ('Annexe', 'RDC B', 'R01', 'Entrepôt principal', NOW(), NOW()),
    ('Annexe', '1B1', 'R01', 'Bureau annexe', NOW(), NOW());

-- ============================================
-- EQUIPMENT - LAPTOPS ASSIGNÉS
-- ============================================
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, purchase_date, warranty_end_date, employee_id, location_id, created_at, updated_at)
VALUES 
    ('LAPTOP-001', 'Dell Latitude 5420', 'laptop', 'new', 'assigned', '2023-01-15', '2026-01-15', 1, NULL, NOW(), NOW()),
    ('LAPTOP-002', 'HP EliteBook 840 G8', 'laptop', 'new', 'assigned', '2023-02-10', '2026-02-10', 2, NULL, NOW(), NOW()),
    ('LAPTOP-003', 'Lenovo ThinkPad X1 Carbon', 'laptop', 'new', 'assigned', '2023-03-05', '2026-03-05', 5, NULL, NOW(), NOW()),
    ('LAPTOP-004', 'Dell Latitude 5420', 'laptop', 'used', 'assigned', '2022-06-20', '2025-06-20', 7, NULL, NOW(), NOW()),
    ('LAPTOP-005', 'HP EliteBook 840 G8', 'laptop', 'new', 'assigned', '2023-04-12', '2026-04-12', 9, NULL, NOW(), NOW()),
    ('LAPTOP-006', 'Lenovo ThinkPad X1 Carbon', 'laptop', 'new', 'assigned', '2023-05-08', '2026-05-08', 11, NULL, NOW(), NOW()),
    ('LAPTOP-007', 'Dell Latitude 5420', 'laptop', 'used', 'assigned', '2022-09-15', '2025-09-15', 13, NULL, NOW(), NOW()),
    ('LAPTOP-008', 'HP EliteBook 840 G8', 'laptop', 'new', 'assigned', '2023-06-20', '2026-06-20', 15, NULL, NOW(), NOW()),
    ('LAPTOP-009', 'Lenovo ThinkPad X1 Carbon', 'laptop', 'new', 'assigned', '2023-07-10', '2026-07-10', 2, NULL, NOW(), NOW()),
    ('LAPTOP-010', 'Dell Latitude 5420', 'laptop', 'new', 'assigned', '2023-08-05', '2026-08-05', 5, NULL, NOW(), NOW());

-- ============================================
-- EQUIPMENT - LAPTOPS EN STOCK
-- ============================================
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, purchase_date, warranty_end_date, employee_id, location_id, created_at, updated_at)
VALUES 
    ('LAPTOP-STOCK-001', 'Dell Latitude 5420', 'laptop', 'new', 'in_stock', '2023-09-01', '2026-09-01', NULL, 12, NOW(), NOW()),
    ('LAPTOP-STOCK-002', 'HP EliteBook 840 G8', 'laptop', 'new', 'in_stock', '2023-09-01', '2026-09-01', NULL, 12, NOW(), NOW()),
    ('LAPTOP-STOCK-003', 'Lenovo ThinkPad X1 Carbon', 'laptop', 'new', 'in_stock', '2023-09-01', '2026-09-01', NULL, 12, NOW(), NOW()),
    ('LAPTOP-STOCK-004', 'Dell Latitude 5420', 'laptop', 'new', 'in_stock', '2023-09-15', '2026-09-15', NULL, 12, NOW(), NOW()),
    ('LAPTOP-STOCK-005', 'HP EliteBook 840 G8', 'laptop', 'new', 'in_stock', '2023-09-15', '2026-09-15', NULL, 12, NOW(), NOW());

-- ============================================
-- EQUIPMENT - PCS DE BUREAU
-- ============================================
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, purchase_date, warranty_end_date, employee_id, location_id, created_at, updated_at)
VALUES 
    ('PC-001', 'Dell OptiPlex 7090', 'pc', 'new', 'in_stock', '2023-05-10', '2026-05-10', NULL, 3, NOW(), NOW()),
    ('PC-002', 'HP ProDesk 600 G6', 'pc', 'new', 'in_stock', '2023-05-10', '2026-05-10', NULL, 3, NOW(), NOW()),
    ('PC-003', 'Dell OptiPlex 7090', 'pc', 'new', 'in_stock', '2023-05-15', '2026-05-15', NULL, 3, NOW(), NOW()),
    ('PC-004', 'HP ProDesk 600 G6', 'pc', 'new', 'in_stock', '2023-05-15', '2026-05-15', NULL, 4, NOW(), NOW()),
    ('PC-005', 'Dell OptiPlex 7090', 'pc', 'new', 'in_stock', '2023-06-01', '2026-06-01', NULL, 4, NOW(), NOW()),
    ('PC-006', 'HP ProDesk 600 G6', 'pc', 'used', 'in_stock', '2022-03-20', '2025-03-20', NULL, 4, NOW(), NOW()),
    ('PC-007', 'Dell OptiPlex 7090', 'pc', 'new', 'in_stock', '2023-06-10', '2026-06-10', NULL, 3, NOW(), NOW()),
    ('PC-008', 'HP ProDesk 600 G6', 'pc', 'new', 'in_stock', '2023-06-10', '2026-06-10', NULL, 3, NOW(), NOW());

-- ============================================
-- EQUIPMENT - MONITEURS
-- ============================================
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, purchase_date, warranty_end_date, employee_id, location_id, created_at, updated_at)
VALUES 
    ('MONITOR-001', 'Dell U2720Q 27"', 'monitor', 'new', 'in_stock', '2023-04-01', '2026-04-01', NULL, 3, NOW(), NOW()),
    ('MONITOR-002', 'HP E24 G4 24"', 'monitor', 'new', 'in_stock', '2023-04-01', '2026-04-01', NULL, 3, NOW(), NOW()),
    ('MONITOR-003', 'LG 27UK850-W 27"', 'monitor', 'new', 'in_stock', '2023-04-05', '2026-04-05', NULL, 3, NOW(), NOW()),
    ('MONITOR-004', 'Dell U2720Q 27"', 'monitor', 'new', 'in_stock', '2023-04-05', '2026-04-05', NULL, 4, NOW(), NOW()),
    ('MONITOR-005', 'HP E24 G4 24"', 'monitor', 'new', 'in_stock', '2023-04-10', '2026-04-10', NULL, 4, NOW(), NOW()),
    ('MONITOR-006', 'LG 27UK850-W 27"', 'monitor', 'used', 'in_stock', '2022-08-15', '2025-08-15', NULL, 4, NOW(), NOW()),
    ('MONITOR-007', 'Dell U2720Q 27"', 'monitor', 'new', 'in_stock', '2023-04-15', '2026-04-15', NULL, 3, NOW(), NOW()),
    ('MONITOR-008', 'HP E24 G4 24"', 'monitor', 'new', 'in_stock', '2023-04-15', '2026-04-15', NULL, 3, NOW(), NOW()),
    ('MONITOR-009', 'LG 27UK850-W 27"', 'monitor', 'new', 'in_stock', '2023-04-20', '2026-04-20', NULL, 12, NOW(), NOW()),
    ('MONITOR-010', 'Dell U2720Q 27"', 'monitor', 'new', 'in_stock', '2023-04-20', '2026-04-20', NULL, 12, NOW(), NOW());

-- ============================================
-- EQUIPMENT - CLAVIERS
-- ============================================
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, purchase_date, employee_id, location_id, created_at, updated_at)
VALUES 
    ('KEYBOARD-001', 'Logitech K780', 'keyboard', 'new', 'in_stock', '2023-03-01', NULL, 12, NOW(), NOW()),
    ('KEYBOARD-002', 'Microsoft Ergonomic', 'keyboard', 'new', 'in_stock', '2023-03-01', NULL, 12, NOW(), NOW()),
    ('KEYBOARD-003', 'Logitech K780', 'keyboard', 'new', 'in_stock', '2023-03-05', NULL, 12, NOW(), NOW()),
    ('KEYBOARD-004', 'Microsoft Ergonomic', 'keyboard', 'new', 'in_stock', '2023-03-05', NULL, 12, NOW(), NOW()),
    ('KEYBOARD-005', 'Logitech K780', 'keyboard', 'new', 'in_stock', '2023-03-10', NULL, 12, NOW(), NOW()),
    ('KEYBOARD-006', 'Microsoft Ergonomic', 'keyboard', 'used', 'in_stock', '2022-05-20', NULL, 12, NOW(), NOW()),
    ('KEYBOARD-007', 'Logitech K780', 'keyboard', 'new', 'in_stock', '2023-03-15', NULL, 12, NOW(), NOW()),
    ('KEYBOARD-008', 'Microsoft Ergonomic', 'keyboard', 'new', 'in_stock', '2023-03-15', NULL, 12, NOW(), NOW()),
    ('KEYBOARD-009', 'Logitech K780', 'keyboard', 'new', 'in_stock', '2023-03-20', NULL, 12, NOW(), NOW()),
    ('KEYBOARD-010', 'Microsoft Ergonomic', 'keyboard', 'new', 'in_stock', '2023-03-20', NULL, 12, NOW(), NOW());

-- ============================================
-- EQUIPMENT - SOURIS
-- ============================================
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, purchase_date, employee_id, location_id, created_at, updated_at)
VALUES 
    ('MOUSE-001', 'Logitech MX Master 3', 'mouse', 'new', 'in_stock', '2023-03-01', NULL, 12, NOW(), NOW()),
    ('MOUSE-002', 'Microsoft Surface Mouse', 'mouse', 'new', 'in_stock', '2023-03-01', NULL, 12, NOW(), NOW()),
    ('MOUSE-003', 'Logitech MX Master 3', 'mouse', 'new', 'in_stock', '2023-03-05', NULL, 12, NOW(), NOW()),
    ('MOUSE-004', 'Microsoft Surface Mouse', 'mouse', 'new', 'in_stock', '2023-03-05', NULL, 12, NOW(), NOW()),
    ('MOUSE-005', 'Logitech MX Master 3', 'mouse', 'new', 'in_stock', '2023-03-10', NULL, 12, NOW(), NOW()),
    ('MOUSE-006', 'Microsoft Surface Mouse', 'mouse', 'used', 'in_stock', '2022-05-20', NULL, 12, NOW(), NOW()),
    ('MOUSE-007', 'Logitech MX Master 3', 'mouse', 'new', 'in_stock', '2023-03-15', NULL, 12, NOW(), NOW()),
    ('MOUSE-008', 'Microsoft Surface Mouse', 'mouse', 'new', 'in_stock', '2023-03-15', NULL, 12, NOW(), NOW()),
    ('MOUSE-009', 'Logitech MX Master 3', 'mouse', 'new', 'in_stock', '2023-03-20', NULL, 12, NOW(), NOW()),
    ('MOUSE-010', 'Microsoft Surface Mouse', 'mouse', 'new', 'in_stock', '2023-03-20', NULL, 12, NOW(), NOW());

-- ============================================
-- EQUIPMENT - IMPRIMANTES
-- ============================================
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, purchase_date, warranty_end_date, employee_id, location_id, created_at, updated_at)
VALUES 
    ('PRINTER-001', 'HP LaserJet Pro M404dn', 'printer', 'new', 'in_stock', '2023-02-01', '2026-02-01', NULL, 3, NOW(), NOW()),
    ('PRINTER-002', 'Canon imageRUNNER 2625i', 'printer', 'new', 'in_stock', '2023-02-01', '2026-02-01', NULL, 5, NOW(), NOW()),
    ('PRINTER-003', 'HP LaserJet Pro M404dn', 'printer', 'new', 'in_stock', '2023-02-10', '2026-02-10', NULL, 6, NOW(), NOW()),
    ('PRINTER-004', 'Canon imageRUNNER 2625i', 'printer', 'used', 'in_stock', '2022-04-15', '2025-04-15', NULL, 8, NOW(), NOW()),
    ('PRINTER-005', 'HP LaserJet Pro M404dn', 'printer', 'new', 'in_stock', '2023-02-15', '2026-02-15', NULL, 9, NOW(), NOW());

-- ============================================
-- EQUIPMENT - SERVEURS
-- ============================================
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, purchase_date, warranty_end_date, notes, employee_id, location_id, created_at, updated_at)
VALUES 
    ('SERVER-001', 'Dell PowerEdge R740', 'server', 'new', 'in_stock', '2023-01-10', '2028-01-10', 'Serveur principal - Production', NULL, 7, NOW(), NOW()),
    ('SERVER-002', 'HP ProLiant DL380 Gen10', 'server', 'new', 'in_stock', '2023-01-10', '2028-01-10', 'Serveur de backup', NULL, 7, NOW(), NOW()),
    ('SERVER-003', 'Dell PowerEdge R740', 'server', 'new', 'in_stock', '2023-01-15', '2028-01-15', 'Serveur de développement', NULL, 7, NOW(), NOW());

-- ============================================
-- EMPLACEMENTS
-- ============================================
INSERT INTO emplacements (equipment_id, etage, rosace, type_emplacement, emplacement_exact, designation, created_at, updated_at)
SELECT 
    e.id,
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) = 'laptop' THEN NULL
        WHEN l.floor IS NOT NULL THEN l.floor
        ELSE NULL
    END,
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) = 'laptop' THEN NULL
        ELSE ((e.id % 13) + 1)
    END,
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) = 'laptop' THEN NULL
        ELSE CASE (e.id % 3)
            WHEN 0 THEN 'SC'
            WHEN 1 THEN 'DS'
            ELSE 'SC1'
        END
    END,
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) = 'laptop' THEN NULL
        WHEN l.floor IS NOT NULL THEN 
            l.floor || '-R' || LPAD(((e.id % 13) + 1)::TEXT, 2, '0') || '-' || 
            CASE (e.id % 3)
                WHEN 0 THEN 'SC'
                WHEN 1 THEN 'DS'
                ELSE 'SC1'
            END
        ELSE NULL
    END,
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) = 'laptop' THEN
            CASE LOWER(e.status::TEXT)
                WHEN 'assigned' THEN 'CHEZ COLLABORATEUR'
                WHEN 'in_stock' THEN 'EN STOCK'
                WHEN 'maintenance' THEN 'EN MAINTENANCE'
                ELSE 'SIMOP'
            END
        WHEN l.floor IS NOT NULL THEN 
            UPPER(l.floor || '-R' || LPAD(((e.id % 13) + 1)::TEXT, 2, '0') || '-' || 
            CASE (e.id % 3)
                WHEN 0 THEN 'SC'
                WHEN 1 THEN 'DS'
                ELSE 'SC1'
            END)
        ELSE 'NON DÉFINI'
    END,
    NOW(),
    NOW()
FROM equipment e
LEFT JOIN locations l ON e.location_id = l.id;

-- ============================================
-- EQUIPMENT MOVEMENTS
-- ============================================
INSERT INTO equipment_movements (equipment_id, employee_id, movement_type, timestamp, notes, created_at, updated_at)
SELECT 
    e.id,
    e.employee_id,
    'assignment',
    e.created_at,
    'Attribution initiale de l''équipement',
    NOW(),
    NOW()
FROM equipment e
WHERE e.employee_id IS NOT NULL;

-- ============================================
-- AFFICHAGE DES RÉSULTATS
-- ============================================
\echo ''
\echo '✅ DONNÉES INSÉRÉES AVEC SUCCÈS !'
\echo ''
\echo '📊 RÉSUMÉ :'

SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'locations', COUNT(*) FROM locations
UNION ALL SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL SELECT 'emplacements', COUNT(*) FROM emplacements
UNION ALL SELECT 'equipment_movements', COUNT(*) FROM equipment_movements
ORDER BY table_name;

\echo ''
\echo '💻 ÉQUIPEMENTS PAR TYPE :'

SELECT equipment_type, COUNT(*) as count
FROM equipment
GROUP BY equipment_type
ORDER BY count DESC;

\echo ''
\echo '📍 ÉQUIPEMENTS PAR STATUT :'

SELECT status, COUNT(*) as count
FROM equipment
GROUP BY status
ORDER BY count DESC;

SQL

echo ""
echo "✅ DONNÉES INSÉRÉES !"
echo ""
echo "2️⃣ Redémarrage du backend..."
docker restart inventory-backend
sleep 10

echo ""
echo "✅ TERMINÉ !"
echo ""
echo "📊 Données créées :"
echo "   - 5 utilisateurs"
echo "   - 15 employés"
echo "   - 15 locations"
echo "   - 61 équipements"
echo "   - 61 emplacements"
echo "   - 10 mouvements"
echo ""
echo "🔐 Connexion :"
echo "   Email: admin@example.com"
echo "   Mot de passe: admin123"
echo ""
echo "🌐 Accès : http://localhost:4200"
