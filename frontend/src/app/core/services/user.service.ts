import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppUser {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'gestionnaire';
  is_active: boolean;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/v1/users`;
  constructor(private http: HttpClient) {}

  getUsers(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.apiUrl);
  }
  createUser(user: AppUser): Observable<AppUser> {
    return this.http.post<AppUser>(this.apiUrl, user);
  }
  updateUser(id: number, user: Partial<AppUser>): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.apiUrl}/${id}`, user);
  }
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
