import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Emplacement } from '../models/emplacement.model';

@Injectable({
  providedIn: 'root'
})
export class EmplacementService {
  // ✅ URL correcte
  private apiUrl = `${environment.apiUrl}/api/v1/emplacements`;

  constructor(private http: HttpClient) {}

  getEmplacements(skip = 0, limit = 100): Observable<Emplacement[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());
    return this.http.get<Emplacement[]>(this.apiUrl, { params });
  }

  getEmplacement(id: number): Observable<Emplacement> {
    return this.http.get<Emplacement>(`${this.apiUrl}/${id}`);
  }

  createEmplacement(emplacement: Emplacement): Observable<Emplacement> {
    return this.http.post<Emplacement>(this.apiUrl, emplacement);
  }

  updateEmplacement(id: number, emplacement: Partial<Emplacement>): Observable<Emplacement> {
    return this.http.put<Emplacement>(`${this.apiUrl}/${id}`, emplacement);
  }

  
  getEquipmentsByEmplacement(emplacementId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${emplacementId}/equipments`);
  }
  deleteEmplacement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
