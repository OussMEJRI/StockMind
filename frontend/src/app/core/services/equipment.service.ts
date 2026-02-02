import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Equipment, EquipmentType, EquipmentStatus } from '../models/equipment.model';

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;

  constructor(private http: HttpClient) {}

  getEquipment(filters?: {
    skip?: number;
    limit?: number;
    equipment_type?: EquipmentType;
    status?: EquipmentStatus;
  }): Observable<Equipment[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.skip !== undefined) params = params.set('skip', filters.skip.toString());
      if (filters.limit !== undefined) params = params.set('limit', filters.limit.toString());
      if (filters.equipment_type) params = params.set('equipment_type', filters.equipment_type);
      if (filters.status) params = params.set('status', filters.status);
    }
    return this.http.get<Equipment[]>(this.apiUrl, { params });
  }

  getEquipmentById(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.apiUrl}/${id}`);
  }

  createEquipment(equipment: Equipment): Observable<Equipment> {
    return this.http.post<Equipment>(this.apiUrl, equipment);
  }

  updateEquipment(id: number, equipment: Partial<Equipment>): Observable<Equipment> {
    return this.http.put<Equipment>(`${this.apiUrl}/${id}`, equipment);
  }

  deleteEquipment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignEquipment(equipmentId: number, employeeId: number, notes?: string): Observable<Equipment> {
    return this.http.post<Equipment>(`${this.apiUrl}/assign`, {
      equipment_id: equipmentId,
      employee_id: employeeId,
      notes
    });
  }
}
