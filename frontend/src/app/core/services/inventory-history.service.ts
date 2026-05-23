import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryHistoryItem } from '../models/inventory-history.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryHistoryService {
  private apiUrl = `${environment.apiUrl}/api/v1/history`;

  constructor(private http: HttpClient) {}

  getHistory(filters?: {
    skip?: number;
    limit?: number;
    search?: string;
    action?: string;
  }): Observable<InventoryHistoryItem[]> {
    let params = new HttpParams()
      .set('skip', (filters?.skip ?? 0).toString())
      .set('limit', (filters?.limit ?? 200).toString());

    if (filters?.search) {
      params = params.set('search', filters.search);
    }

    if (filters?.action) {
      params = params.set('action', filters.action);
    }

    return this.http.get<InventoryHistoryItem[]>(this.apiUrl, { params });
  }
}