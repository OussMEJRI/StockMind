import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Equipment {
  id?: number;
  serial_number: string;
  model: string;
  equipment_type: string;
  condition: string;
  status: string;
  location_id?: number;
  employee_id?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {
  private apiUrl = `${environment.apiUrl}/equipment`;

  constructor(private http: HttpClient) {}

  getEquipment(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(this.apiUrl);
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

  deleteEquipment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  assignEquipment(equipmentId: number, employeeId: number): Observable<Equipment> {
    return this.http.post<Equipment>(`${this.apiUrl}/${equipmentId}/assign?employee_id=${employeeId}`, {});
  }

  unassignEquipment(equipmentId: number): Observable<Equipment> {
    return this.http.post<Equipment>(`${this.apiUrl}/${equipmentId}/unassign`, {});
  }
}
