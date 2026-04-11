#!/bin/bash

echo "🔧 Correction du build frontend"
echo "==============================="
echo ""

# 1. Dashboard Component
echo "1️⃣ Correction du Dashboard Component..."
cat > frontend/src/app/features/dashboard/dashboard.component.ts << 'DASHBOARD'
import { Component, OnInit } from '@angular/core';
import { EquipmentService } from '../../core/services/equipment.service';
import { EmployeeService } from '../../core/services/employee.service';
import { Equipment } from '../../core/models/equipment.model';
import { Employee } from '../../core/models/employee.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalEquipment = 0;
  totalEmployees = 0;
  equipmentInStock = 0;
  equipmentAssigned = 0;
  recentEquipment: Equipment[] = [];
  recentEmployees: Employee[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.equipmentService.getEquipment(0, 100).subscribe({
      next: (response) => {
        const items = response.items || response || [];
        this.totalEquipment = response.total || items.length;
        this.recentEquipment = items.slice(0, 5);
        this.equipmentInStock = items.filter((e: Equipment) => e.status === 'in_stock').length;
        this.equipmentAssigned = items.filter((e: Equipment) => e.status === 'assigned').length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Erreur lors du chargement des équipements';
        this.loading = false;
      }
    });

    this.employeeService.getEmployees(0, 100).subscribe({
      next: (response) => {
        const items = response.items || response || [];
        this.totalEmployees = response.total || items.length;
        this.recentEmployees = items.slice(0, 5);
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  refresh(): void {
    this.loadDashboardData();
  }
}
DASHBOARD

# 2. Models
echo "2️⃣ Création des modèles..."
mkdir -p frontend/src/app/core/models

cat > frontend/src/app/core/models/equipment.model.ts << 'EQUIPMENT'
export interface Equipment {
  id: number;
  serial_number: string;
  model: string;
  equipment_type: string;
  condition: string;
  status: string;
  employee_id?: number;
  created_at: string;
  updated_at: string;
}
EQUIPMENT

cat > frontend/src/app/core/models/employee.model.ts << 'EMPLOYEE'
export interface Employee {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  created_at: string;
  updated_at: string;
}
EMPLOYEE

cat > frontend/src/app/core/models/emplacement.model.ts << 'EMPLACEMENT'
export interface Emplacement {
  id: number;
  equipment_id: number;
  etage?: string;
  rosace?: number;
  type_emplacement?: string;
  emplacement_exact?: string;
  designation: string;
  created_at: string;
  updated_at: string;
  equipment?: any;
}
EMPLACEMENT

# 3. Services
echo "3️⃣ Création des services..."
mkdir -p frontend/src/app/core/services

cat > frontend/src/app/core/services/equipment.service.ts << 'EQSERVICE'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Equipment } from '../models/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;

  constructor(private http: HttpClient) {}

  getEquipment(skip: number = 0, limit: number = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?skip=${skip}&limit=${limit}`);
  }

  getEquipmentById(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/${id}`);
  }

  createEquipment(equipment: Equipment): Observable<Equipment> {
    return this.http.post<Equipment>(this.apiUrl, equipment);
  }

  updateEquipment(id: number, equipment: Equipment): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.apiUrl}/${id}`, equipment);
  }

  deleteEquipment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
EQSERVICE

cat > frontend/src/app/core/services/employee.service.ts << 'EMPSERVICE'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getEmployees(skip: number = 0, limit: number = 100): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?skip=${skip}&limit=${limit}`);
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
EMPSERVICE

# 4. Environnement
echo "4️⃣ Configuration de l'environnement..."
mkdir -p frontend/src/environments

cat > frontend/src/environments/environment.ts << 'ENV'
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1'
};
ENV

cat > frontend/src/environments/environment.prod.ts << 'ENVPROD'
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000/api/v1'
};
ENVPROD

echo ""
echo "✅ Corrections appliquées !"
echo ""
echo "🔨 Rebuild du frontend..."
docker compose build --no-cache frontend

if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
    echo ""
    echo "🚀 Démarrage..."
    docker compose up -d frontend
    sleep 10
    docker logs inventory-frontend --tail 20
else
    echo "❌ Erreur de build"
    exit 1
fi
