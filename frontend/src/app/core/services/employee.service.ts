import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee, EquipmentHistory } from '../models/employee.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/api/v1/employees`;

  constructor(private http: HttpClient) {}

  getEmployees(skip: number = 0, limit: number = 100, filters?: any): Observable<Employee[]> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.department) params = params.set('department', filters.department);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<Employee[]>(this.apiUrl, { params });
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee);
  }

  updateEmployee(id: number, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ✅ Récupérer l'historique des équipements d'un employé
  getEmployeeHistory(id: number): Observable<EquipmentHistory[]> {
    return this.http.get<EquipmentHistory[]>(`${this.apiUrl}/${id}/history`);
  }
}
