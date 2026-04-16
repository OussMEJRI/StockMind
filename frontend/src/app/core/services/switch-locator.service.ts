import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwitchLocatorService {
  private apiUrl = '/api/v1/equipment/nb_pcs/online';

  constructor(private http: HttpClient) {}

  getNbPcs(): Observable<{ nb_pcs: number }> {
    return this.http.get<{ nb_pcs: number }>(this.apiUrl);
  }
}
