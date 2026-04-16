import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwitchLocatorService {
  private apiUrl = '/nb_pcs';


  constructor(private http: HttpClient) {}

  getNbPcs(): Observable<{ nb_pcs: number }> {
    return this.http.get<{ nb_pcs: number }>(this.apiUrl);
  }
}
