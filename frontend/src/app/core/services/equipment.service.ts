import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment } from '../models/equipment.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/api/v1/equipment`;

  constructor(private http: HttpClient) {}

  getEquipment(skip = 0, limit = 100, filters?: any): Observable<Equipment[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.equipment_type) params = params.set('equipment_type', filters.equipment_type);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.condition) params = params.set('condition', filters.condition);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<Equipment[]>(this.apiUrl, { params });
  }

  getEquipmentById(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/${id}`);
  }

  createEquipment(equipment: Partial<Equipment>): Observable<Equipment> {
    return this.http.post<Equipment>(this.apiUrl, equipment);
  }

  updateEquipment(id: number, equipment: Partial<Equipment>): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.apiUrl}/${id}`, equipment);
  }

  deleteEquipment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

assignEquipmentToEmployee(equipmentId: number, employeeId: number): Observable<Equipment> {
  return this.http.put<Equipment>(`${this.apiUrl}/${equipmentId}`, {
    employee_id: employeeId,
    emplacement_id: null,
    status: 'assigned'
  });
}

assignEquipmentToEmplacement(equipmentId: number, emplacementId: number): Observable<Equipment> {
  return this.http.put<Equipment>(`${this.apiUrl}/${equipmentId}`, {
    emplacement_id: emplacementId,
    employee_id: null,
    status: 'assigned'
  });
}

unassignEquipment(equipmentId: number): Observable<Equipment> {
  return this.http.put<Equipment>(`${this.apiUrl}/${equipmentId}`, {
    employee_id: null,
    emplacement_id: null,
    status: 'in_stock'
  });
}

  // ✅ Import Excel via l'API backend
  importExcel(file: File, token: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post(
      `${environment.apiUrl}/api/v1/import/equipment`,
      formData,
      { headers }
    );
  }
}
