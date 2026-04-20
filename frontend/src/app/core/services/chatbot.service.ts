import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatbotResponse {
  answer: string;
  data: any;
  confidence?: number;
}

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private apiUrl = `${environment.apiUrl}/api/v1/chatbot/query`;

  public messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.addBotMessage(
      "Bonjour ! 👋 Je suis votre assistant **StockMind**.\n\nJe consulte la base de données en **temps réel** pour répondre à vos questions sur les équipements, employés et emplacements.\n\nTapez **aide** pour voir mes capacités."
    );
  }

  sendMessage(userMessage: string): void {
    // ✅ Ajouter le message utilisateur
    this.addUserMessage(userMessage);

    // Message de chargement temporaire
    const msgs = [...this.messagesSubject.value];
    msgs.push({ text: '', isUser: false, timestamp: new Date(), isLoading: true });
    this.messagesSubject.next(msgs);

    // Appel backend temps réel
    this.http.post<ChatbotResponse>(this.apiUrl, { question: userMessage }).subscribe({
      next: (res) => {
        const current = this.messagesSubject.value.filter(m => !m.isLoading);
        current.push({ text: res.answer, isUser: false, timestamp: new Date() });
        this.messagesSubject.next(current);
      },
      error: (err) => {
        const current = this.messagesSubject.value.filter(m => !m.isLoading);
        const errMsg = err.status === 401
          ? "🔒 Session expirée. Veuillez vous reconnecter."
          : "❌ Erreur de connexion au serveur. Veuillez réessayer.";
        current.push({ text: errMsg, isUser: false, timestamp: new Date() });
        this.messagesSubject.next(current);
      }
    });
  }

  // ✅ Méthode privée manquante ajoutée
  private addUserMessage(text: string): void {
    const msgs = [...this.messagesSubject.value];
    msgs.push({ text, isUser: true, timestamp: new Date() });
    this.messagesSubject.next(msgs);
  }

  public addBotMessage(text: string): void {
    const msgs = [...this.messagesSubject.value];
    msgs.push({ text, isUser: false, timestamp: new Date() });
    this.messagesSubject.next(msgs);
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
    this.addBotMessage("💬 Conversation réinitialisée. Comment puis-je vous aider ?");
  }
}
