import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CurrentUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'gestionnaire' | 'collaborateur';
  is_active: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/v1/auth`;
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);

  currentUser$      = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.getToken()) {
      this.loadCurrentUser().subscribe({ error: () => this.logout() });
    }
  }

  login(email: string, password: string): Observable<any> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);
    return this.http.post<any>(`${this.apiUrl}/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).pipe(
      tap(res => {
        localStorage.setItem('token', res.access_token);
        this.loadCurrentUser().subscribe();
      })
    );
  }

  loadCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ Alias utilisé par la navbar
  get currentUserValue(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  isGestionnaire(): boolean {
    return this.currentUserValue?.role === 'gestionnaire';
  }

  // ✅ Seul l'admin peut supprimer
  canDelete(): boolean {
    return this.isAdmin();
  }
}
