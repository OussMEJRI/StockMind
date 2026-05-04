import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/v1/notifications`;

  constructor(private http: HttpClient) {}

  getMyNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}/my`);
  }

  requestDeleteEquipment(equipmentId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/equipment/${equipmentId}/request-delete`,
      {}
    );
  }

  approveDeleteRequest(notificationId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${notificationId}/approve-delete`,
      {}
    );
  }

  rejectDeleteRequest(notificationId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${notificationId}/reject-delete`,
      {}
    );
  }

  markAsRead(notificationId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${notificationId}/read`,
      {}
    );
  }
}