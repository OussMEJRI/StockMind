#!/bin/bash

echo "🔧 Correction des modèles Frontend"
echo "==================================="
echo ""

# 1. Equipment Model
echo "1️⃣ Correction de equipment.model.ts..."
cat > frontend/src/app/core/models/equipment.model.ts << 'EQUIPMENT'
export enum EquipmentType {
  LAPTOP = 'laptop',
  DESKTOP = 'desktop',
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
EQUIPMENT

echo "✅ equipment.model.ts corrigé"

# 2. Employee Model
echo ""
echo "2️⃣ Correction de employee.model.ts..."
cat > frontend/src/app/core/models/employee.model.ts << 'EMPLOYEE'
export enum Department {
  IT = 'IT',
  HR = 'HR',
  FINANCE = 'Finance',
  MARKETING = 'Marketing',
  SALES = 'Sales',
  OPERATIONS = 'Operations',
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
EMPLOYEE

echo "✅ employee.model.ts corrigé"

# 3. Equipment Service
echo ""
echo "3️⃣ Correction de equipment.service.ts..."
cat > frontend/src/app/core/services/equipment.service.ts << 'EQUIPSERVICE'
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment, EquipmentResponse } from '../models/equipment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;

  constructor(private http: HttpClient) {}

  getEquipment(skip: number = 0, limit: number = 100, filters?: any): Observable<EquipmentResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.equipment_type) {
        params = params.set('equipment_type', filters.equipment_type);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.condition) {
        params = params.set('condition', filters.condition);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }

    return this.http.get<EquipmentResponse>(this.apiUrl, { params });
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

  assignEquipment(equipmentId: number, employeeId: number): Observable<Equipment> {
    return this.http.post<Equipment>(`${this.apiUrl}/${equipmentId}/assign`, { employee_id: employeeId });
  }

  unassignEquipment(equipmentId: number): Observable<Equipment> {
    return this.http.post<Equipment>(`${this.apiUrl}/${equipmentId}/unassign`, {});
  }

  exportEquipment(format: string = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export?format=${format}`, {
      responseType: 'blob'
    });
  }
}
EQUIPSERVICE

echo "✅ equipment.service.ts corrigé"

# 4. Employee Service
echo ""
echo "4️⃣ Correction de employee.service.ts..."
cat > frontend/src/app/core/services/employee.service.ts << 'EMPSERVICE'
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EmployeeResponse } from '../models/employee.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getEmployees(skip: number = 0, limit: number = 100, filters?: any): Observable<EmployeeResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.department) {
        params = params.set('department', filters.department);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }

    return this.http.get<EmployeeResponse>(this.apiUrl, { params });
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

  exportEmployees(format: string = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export?format=${format}`, {
      responseType: 'blob'
    });
  }
}
EMPSERVICE

echo "✅ employee.service.ts corrigé"

echo ""
echo "✅ Tous les fichiers ont été corrigés !"
echo ""
echo "🔄 Rebuild maintenant:"
echo "   docker compose build frontend"
