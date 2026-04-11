import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Emplacement, EmplacementResponse, EmplacementCreate, EmplacementUpdate } from '../models/emplacement.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmplacementService {
  private apiUrl = `${environment.apiUrl}/emplacements`;

  constructor(private http: HttpClient) {}

  getEmplacements(skip: number = 0, limit: number = 100, filters?: any): Observable<EmplacementResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (filters) {
      if (filters.etage) {
        params = params.set('etage', filters.etage);
      }
      if (filters.designation) {
        params = params.set('designation', filters.designation);
      }
      if (filters.search) {
        params = params.set('search', filters.search);
      }
    }

    return this.http.get<EmplacementResponse>(this.apiUrl, { params });
  }

  getEmplacementById(id: number): Observable<Emplacement> {
    return this.http.get<Emplacement>(`${this.apiUrl}/${id}`);
  }

  getEmplacementByEquipmentId(equipmentId: number): Observable<Emplacement> {
    return this.http.get<Emplacement>(`${this.apiUrl}/equipment/${equipmentId}`);
  }

  createEmplacement(emplacement: EmplacementCreate): Observable<Emplacement> {
    return this.http.post<Emplacement>(this.apiUrl, emplacement);
  }

  updateEmplacement(id: number, emplacement: EmplacementUpdate): Observable<Emplacement> {
    return this.http.put<Emplacement>(`${this.apiUrl}/${id}`, emplacement);
  }

  deleteEmplacement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  exportEmplacements(format: string = 'csv'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export?format=${format}`, {
      responseType: 'blob'
    });
  }
}
