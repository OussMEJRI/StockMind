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
