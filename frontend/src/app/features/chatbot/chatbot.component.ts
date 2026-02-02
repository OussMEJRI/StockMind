import { Component } from '@angular/core';
import { ChatbotService } from '../../core/services/chatbot.service';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-chatbot',
  template: `
    <div class="chatbot-container">
      <div class="page-header">
        <h1>🤖 Assistant Intelligent</h1>
      </div>
      
      <div class="chat-card card">
        <div class="chat-messages" #chatMessages>
          <div class="welcome-message" *ngIf="messages.length === 0">
            <div class="welcome-icon">🤖</div>
            <h3>Bienvenue !</h3>
            <p>Je suis votre assistant IT. Posez-moi des questions sur votre inventaire.</p>
            <div class="suggestions">
              <button class="suggestion" (click)="askQuestion('Avons-nous des laptops disponibles ?')">
                💻 Laptops disponibles ?
              </button>
              <button class="suggestion" (click)="askQuestion('Combien d\\'équipements avons-nous ?')">
                📊 Total équipements
              </button>
              <button class="suggestion" (click)="askQuestion('Liste des employés')">
                👥 Liste employés
              </button>
            </div>
          </div>
          
          <div *ngFor="let msg of messages" class="message" [ngClass]="{'user': msg.isUser, 'bot': !msg.isUser}">
            <div class="message-avatar">
              {{ msg.isUser ? '👤' : '🤖' }}
            </div>
            <div class="message-content">
              <p>{{ msg.text }}</p>
              <span class="message-time">{{ msg.timestamp | date:'HH:mm' }}</span>
            </div>
          </div>
          
          <div class="message bot" *ngIf="loading">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <input 
            type="text" 
            class="form-control"
            [(ngModel)]="question"
            (keyup.enter)="sendMessage()"
            placeholder="Posez votre question..."
            [disabled]="loading">
          <button class="btn btn-primary" (click)="sendMessage()" [disabled]="!question.trim() || loading">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-container {
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
      height: calc(100vh - 60px);
      display: flex;
      flex-direction: column;
    }
    
    .chat-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .chat-messages {
      flex: 1;
      padding: 1.5rem;
      overflow-y: auto;
    }
    
    .welcome-message {
      text-align: center;
      padding: 2rem;
    }
    
    .welcome-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .welcome-message h3 {
      color: #667eea;
      margin-bottom: 0.5rem;
    }
    
    .welcome-message p {
      color: #666;
      margin-bottom: 1.5rem;
    }
    
    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }
    
    .suggestion {
      background: #f0f2ff;
      border: 1px solid #667eea;
      color: #667eea;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.9rem;
    }
    
    .suggestion:hover {
      background: #667eea;
      color: white;
    }
    
    .message {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
      max-width: 80%;
    }
    
    .message.user {
      margin-left: auto;
      flex-direction: row-reverse;
    }
    
    .message-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f0f2ff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    
    .message.user .message-avatar {
      background: #667eea;
    }
    
    .message-content {
      background: #f8f9fa;
      padding: 0.75rem 1rem;
      border-radius: 12px;
    }
    
    .message.user .message-content {
      background: #667eea;
      color: white;
    }
    
    .message-content p {
      margin: 0;
      line-height: 1.5;
    }
    
    .message-time {
      font-size: 0.75rem;
      color: #999;
      display: block;
      margin-top: 0.25rem;
    }
    
    .message.user .message-time {
      color: rgba(255, 255, 255, 0.7);
    }
    
    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 0.5rem 0;
    }
    
    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
    
    .chat-input {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
    }
    
    .chat-input input {
      flex: 1;
    }
  `]
})
export class ChatbotComponent {
  messages: Message[] = [];
  question = '';
  loading = false;

  constructor(private chatbotService: ChatbotService) {}

  askQuestion(question: string): void {
    this.question = question;
    this.sendMessage();
  }

  sendMessage(): void {
    if (!this.question.trim() || this.loading) return;
    
    const userMessage: Message = {
      text: this.question,
      isUser: true,
      timestamp: new Date()
    };
    this.messages.push(userMessage);
    
    const questionText = this.question;
    this.question = '';
    this.loading = true;
    
    this.chatbotService.query(questionText).subscribe({
      next: (response) => {
        const botMessage: Message = {
          text: response.answer,
          isUser: false,
          timestamp: new Date()
        };
        this.messages.push(botMessage);
        this.loading = false;
      },
      error: (err) => {
        const errorMessage: Message = {
          text: 'Désolé, une erreur est survenue. Veuillez réessayer.',
          isUser: false,
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.loading = false;
      }
    });
  }
}
