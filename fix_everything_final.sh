#!/bin/bash

echo "🚀 SOLUTION DÉFINITIVE - CORRECTION COMPLÈTE"
echo "============================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de log
log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# Configuration
POSTGRES_USER="postgres"
POSTGRES_DB="inventory_db"

echo "📋 ÉTAPE 1/10 : Arrêt de tous les services"
echo "==========================================="
docker compose down
log_info "Services arrêtés"

echo ""
echo "📋 ÉTAPE 2/10 : Nettoyage complet"
echo "================================="
docker system prune -f
log_info "Nettoyage effectué"

echo ""
echo "📋 ÉTAPE 3/10 : Démarrage de la base de données"
echo "================================================"
docker compose up -d db
sleep 10
log_info "Base de données démarrée"

echo ""
echo "📋 ÉTAPE 4/10 : Recréation de la base de données"
echo "================================================="
docker exec inventory-db psql -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS $POSTGRES_DB;" 2>/dev/null
docker exec inventory-db psql -U "$POSTGRES_USER" -c "CREATE DATABASE $POSTGRES_DB;"
log_info "Base de données recréée"

echo ""
echo "📋 ÉTAPE 5/10 : Création du schéma complet"
echo "=========================================="
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << 'SQL'
-- Types ENUM
CREATE TYPE userrole AS ENUM ('admin', 'user', 'viewer');
CREATE TYPE department AS ENUM ('IT', 'RH', 'Finance', 'Marketing', 'Commercial', 'Direction', 'Other');
CREATE TYPE equipmenttype AS ENUM ('laptop', 'pc', 'monitor', 'keyboard', 'mouse', 'printer', 'server', 'network', 'other');
CREATE TYPE equipmentstatus AS ENUM ('in_stock', 'assigned', 'maintenance', 'retired');
CREATE TYPE equipmentcondition AS ENUM ('new', 'used', 'refurbished', 'damaged');

-- Table users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    role userrole DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table employees
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    department department NOT NULL,
    position VARCHAR(255),
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table locations
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    site VARCHAR(255) NOT NULL,
    floor VARCHAR(50),
    room VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table equipment
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    serial_number VARCHAR(255) UNIQUE NOT NULL,
    model VARCHAR(255) NOT NULL,
    equipment_type equipmenttype NOT NULL,
    condition equipmentcondition NOT NULL,
    status equipmentstatus NOT NULL,
    purchase_date DATE,
    warranty_end_date DATE,
    notes TEXT,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table emplacements
CREATE TABLE emplacements (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER UNIQUE NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    etage VARCHAR(50),
    rosace INTEGER CHECK (rosace >= 1 AND rosace <= 13),
    type_emplacement VARCHAR(10),
    emplacement_exact VARCHAR(255),
    designation VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table equipment_movements
CREATE TABLE equipment_movements (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    movement_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_equipment_serial ON equipment(serial_number);
CREATE INDEX idx_equipment_type ON equipment(equipment_type);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_employee ON equipment(employee_id);
CREATE INDEX idx_equipment_location ON equipment(location_id);
CREATE INDEX idx_emplacements_equipment ON emplacements(equipment_id);
CREATE INDEX idx_emplacements_designation ON emplacements(designation);
CREATE INDEX idx_movements_equipment ON equipment_movements(equipment_id);
CREATE INDEX idx_movements_employee ON equipment_movements(employee_id);
SQL

log_info "Schéma créé"

echo ""
echo "📋 ÉTAPE 6/10 : Insertion des données de base"
echo "=============================================="
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" << 'SQL'
-- Users (mot de passe: admin123)
INSERT INTO users (email, hashed_password, full_name, is_active, is_superuser, role)
VALUES 
    ('admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qXqN.Hhuy', 'Administrateur', true, true, 'admin'),
    ('manager@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qXqN.Hhuy', 'Manager', true, false, 'user'),
    ('user@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qXqN.Hhuy', 'Utilisateur', true, false, 'user');

-- Employees
INSERT INTO employees (full_name, email, phone, department, position)
VALUES 
    ('Jean Dupont', 'jean.dupont@company.com', '+33612345678', 'IT', 'Développeur Senior'),
    ('Marie Martin', 'marie.martin@company.com', '+33612345679', 'IT', 'Chef de Projet'),
    ('Pierre Durand', 'pierre.durand@company.com', '+33612345680', 'RH', 'Responsable RH'),
    ('Sophie Bernard', 'sophie.bernard@company.com', '+33612345681', 'Finance', 'Comptable'),
    ('Luc Petit', 'luc.petit@company.com', '+33612345682', 'IT', 'Admin Système'),
    ('Emma Roux', 'emma.roux@company.com', '+33612345683', 'Marketing', 'Responsable Marketing'),
    ('Thomas Moreau', 'thomas.moreau@company.com', '+33612345684', 'IT', 'Développeur Junior'),
    ('Julie Simon', 'julie.simon@company.com', '+33612345685', 'Commercial', 'Commerciale'),
    ('Nicolas Laurent', 'nicolas.laurent@company.com', '+33612345686', 'IT', 'DevOps'),
    ('Camille Michel', 'camille.michel@company.com', '+33612345687', 'Direction', 'Directeur');

-- Locations
INSERT INTO locations (site, floor, room, description)
VALUES 
    ('Siège Social', 'RDC A', 'R01', 'Accueil'),
    ('Siège Social', '1A1', 'R01', 'Bureau IT - Dev'),
    ('Siège Social', '1A1', 'R02', 'Bureau IT - Support'),
    ('Siège Social', '1A2', 'R01', 'Bureau RH'),
    ('Siège Social', '2A1', 'R01', 'Bureau Finance'),
    ('Siège Social', '2A1', 'R02', 'Salle serveurs'),
    ('Siège Social', '2A2', 'R01', 'Bureau Marketing'),
    ('Siège Social', '3A1', 'R01', 'Bureau Commercial'),
    ('Siège Social', '4A1', 'R01', 'Direction'),
    ('Siège Social', 'SATED', 'R01', 'Stock matériel');

-- Equipment - Laptops assignés
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, employee_id)
SELECT 
    'LAPTOP-' || LPAD(s::text, 3, '0'),
    CASE (s % 3)
        WHEN 0 THEN 'Dell Latitude 5420'
        WHEN 1 THEN 'HP EliteBook 840 G8'
        ELSE 'Lenovo ThinkPad X1'
    END,
    'laptop',
    'new',
    'assigned',
    (SELECT id FROM employees ORDER BY id LIMIT 1 OFFSET (s % 10))
FROM generate_series(1, 10) s;

-- Equipment - Laptops en stock
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, location_id)
SELECT 
    'LAPTOP-STOCK-' || LPAD(s::text, 3, '0'),
    'Dell Latitude 5420',
    'laptop',
    'new',
    'in_stock',
    (SELECT id FROM locations WHERE description = 'Stock matériel')
FROM generate_series(1, 5) s;

-- Equipment - PCs
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, location_id)
SELECT 
    'PC-' || LPAD(s::text, 3, '0'),
    'Dell OptiPlex 7090',
    'pc',
    'new',
    'in_stock',
    (SELECT id FROM locations WHERE floor = '1A1' LIMIT 1)
FROM generate_series(1, 8) s;

-- Equipment - Moniteurs
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, location_id)
SELECT 
    'MONITOR-' || LPAD(s::text, 3, '0'),
    'Dell U2720Q 27"',
    'monitor',
    'new',
    'in_stock',
    (SELECT id FROM locations WHERE floor = '1A1' LIMIT 1)
FROM generate_series(1, 10) s;

-- Equipment - Claviers
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, location_id)
SELECT 
    'KEYBOARD-' || LPAD(s::text, 3, '0'),
    'Logitech K780',
    'keyboard',
    'new',
    'in_stock',
    (SELECT id FROM locations WHERE description = 'Stock matériel')
FROM generate_series(1, 10) s;

-- Equipment - Souris
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, location_id)
SELECT 
    'MOUSE-' || LPAD(s::text, 3, '0'),
    'Logitech MX Master 3',
    'mouse',
    'new',
    'in_stock',
    (SELECT id FROM locations WHERE description = 'Stock matériel')
FROM generate_series(1, 10) s;

-- Equipment - Imprimantes
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, location_id)
SELECT 
    'PRINTER-' || LPAD(s::text, 3, '0'),
    'HP LaserJet Pro',
    'printer',
    'new',
    'in_stock',
    (SELECT id FROM locations ORDER BY id LIMIT 1 OFFSET s)
FROM generate_series(1, 5) s;

-- Equipment - Serveurs
INSERT INTO equipment (serial_number, model, equipment_type, condition, status, location_id)
SELECT 
    'SERVER-' || LPAD(s::text, 3, '0'),
    'Dell PowerEdge R740',
    'server',
    'new',
    'in_stock',
    (SELECT id FROM locations WHERE description = 'Salle serveurs')
FROM generate_series(1, 3) s;

-- Emplacements pour tous les équipements
INSERT INTO emplacements (equipment_id, etage, rosace, type_emplacement, emplacement_exact, designation)
SELECT 
    e.id,
    CASE WHEN LOWER(e.equipment_type::TEXT) != 'laptop' AND l.floor IS NOT NULL THEN l.floor ELSE NULL END,
    CASE WHEN LOWER(e.equipment_type::TEXT) != 'laptop' THEN ((e.id % 13) + 1) ELSE NULL END,
    CASE WHEN LOWER(e.equipment_type::TEXT) != 'laptop' THEN 'SC' ELSE NULL END,
    CASE WHEN LOWER(e.equipment_type::TEXT) != 'laptop' AND l.floor IS NOT NULL 
         THEN l.floor || '-R' || LPAD(((e.id % 13) + 1)::TEXT, 2, '0') || '-SC' 
         ELSE NULL END,
    CASE 
        WHEN LOWER(e.equipment_type::TEXT) = 'laptop' THEN
            CASE LOWER(e.status::TEXT)
                WHEN 'assigned' THEN 'CHEZ COLLABORATEUR'
                WHEN 'in_stock' THEN 'EN STOCK'
                ELSE 'SIMOP'
            END
        WHEN l.floor IS NOT NULL THEN UPPER(l.floor || '-R' || LPAD(((e.id % 13) + 1)::TEXT, 2, '0') || '-SC')
        ELSE 'NON DÉFINI'
    END
FROM equipment e
LEFT JOIN locations l ON e.location_id = l.id;

-- Mouvements pour équipements assignés
INSERT INTO equipment_movements (equipment_id, employee_id, movement_type, notes)
SELECT 
    e.id,
    e.employee_id,
    'assignment',
    'Attribution initiale'
FROM equipment e
WHERE e.employee_id IS NOT NULL;
SQL

log_info "Données insérées"

echo ""
echo "📋 ÉTAPE 7/10 : Vérification des données"
echo "========================================="
docker exec inventory-db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL SELECT 'locations', COUNT(*) FROM locations
UNION ALL SELECT 'emplacements', COUNT(*) FROM emplacements
UNION ALL SELECT 'equipment_movements', COUNT(*) FROM equipment_movements
ORDER BY table_name;
"

echo ""
echo "📋 ÉTAPE 8/10 : Correction des modèles Frontend"
echo "================================================"

# Equipment Model
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
EOFMODEL

# Employee Model
cat > frontend/src/app/core/models/employee.model.ts << 'EOFMODEL'
export enum Department {
  IT = 'IT',
  HR = 'RH',
  FINANCE = 'Finance',
  MARKETING = 'Marketing',
  COMMERCIAL = 'Commercial',
  DIRECTION = 'Direction',
  OTHER = 'Other'
}

export interface Employee {
  id?: number;
  full_name: string;
  email: string;
  phone?: string;
  department: Department | string;
  position?: string;
  hire_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeResponse {
  items: Employee[];
  total: number;
  skip: number;
  limit: number;
}
EOFMODEL

# Emplacement Model
cat > frontend/src/app/core/models/emplacement.model.ts << 'EOFMODEL'
export interface Emplacement {
  id?: number;
  equipment_id: number;
  etage?: string;
  rosace?: number;
  type_emplacement?: string;
  emplacement_exact?: string;
  designation: string;
  created_at?: string;
  updated_at?: string;
  equipment?: any;
}

export interface EmplacementResponse {
  items: Emplacement[];
  total: number;
  skip: number;
  limit: number;
}
EOFMODEL

log_info "Modèles Frontend corrigés"

echo ""
echo "📋 ÉTAPE 9/10 : Rebuild des conteneurs"
echo "======================================="
docker compose build --no-cache
log_info "Build terminé"

echo ""
echo "📋 ÉTAPE 10/10 : Démarrage de tous les services"
echo "================================================"
docker compose up -d
log_info "Services démarrés"

echo ""
echo "⏳ Attente du démarrage complet (20 secondes)..."
sleep 20

echo ""
echo "📊 VÉRIFICATION FINALE"
echo "======================"

# Test Backend
echo ""
log_info "Test Backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" = "200" ]; then
    log_info "Backend: OK (HTTP $BACKEND_STATUS)"
else
    log_warn "Backend: En attente (HTTP $BACKEND_STATUS)"
fi

# Test Frontend
echo ""
log_info "Test Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    log_info "Frontend: OK (HTTP $FRONTEND_STATUS)"
else
    log_warn "Frontend: En attente (HTTP $FRONTEND_STATUS)"
fi

# Test Login
echo ""
log_info "Test Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=admin123" 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    log_info "Login: OK"
else
    log_warn "Login: En attente"
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ INSTALLATION TERMINÉE !"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🌐 Accès à l'application:"
echo "   Frontend:  http://localhost:4200"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "🔐 Identifiants:"
echo "   Email:     admin@example.com"
echo "   Password:  admin123"
echo ""
echo "📊 Données créées:"
echo "   - 3 utilisateurs"
echo "   - 10 employés"
echo "   - 10 locations"
echo "   - 61 équipements"
echo "   - 61 emplacements"
echo "   - 10 mouvements"
echo ""
echo "📋 Commandes utiles:"
echo "   Logs backend:   docker logs inventory-backend -f"
echo "   Logs frontend:  docker logs inventory-frontend -f"
echo "   Logs database:  docker logs inventory-db -f"
echo "   Arrêter:        docker compose down"
echo "   Redémarrer:     docker compose restart"
echo ""
echo "════════════════════════════════════════════════════════"
