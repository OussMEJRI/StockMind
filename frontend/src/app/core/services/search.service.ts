import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SearchResult {
  type: 'employee' | 'equipment';
  employee?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    equipment: Array<{
      id: number;
      name: string;
      type: string;
      serial_number: string;
    }>;
  };
  equipment?: {
    id: number;
    name: string;
    type: string;
    serial_number: string;
    assigned_to?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  search(query: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${this.apiUrl}?q=${encodeURIComponent(query)}`);
  }
}
