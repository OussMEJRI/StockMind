import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatbotQuery, ChatbotResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}/chatbot`;

  constructor(private http: HttpClient) {}

  query(question: string, context?: any): Observable<ChatbotResponse> {
    const query: ChatbotQuery = { question, context };
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/query`, query);
  }
}
