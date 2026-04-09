import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatbotService, ChatMessage } from '../../core/services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  userInput: string = '';
  loading: boolean = false;
  dataLoaded: boolean = false;

  constructor(
    private chatbotService: ChatbotService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.addBotMessage("Bonjour ! 👋 Je charge les données de l'inventaire...");
    this.loadData();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadData(): void {
    this.loading = true;
    this.chatbotService.loadAppData().subscribe({
      next: (data) => {
        this.dataLoaded = true;
        this.loading = false;
        this.addBotMessage(
          `✅ Données chargées avec succès !\n\n` +
          `📊 **Résumé :**\n` +
          `• ${data.equipment.length} équipements\n` +
          `• ${data.employeesCount} employés\n` +
          `• ${data.locationsCount} localisations\n\n` +
          `Que souhaitez-vous savoir ? (Tapez "aide" pour voir les commandes)`
        );
      },
      error: (error) => {
        this.loading = false;
        this.addBotMessage("❌ Erreur lors du chargement des données. Veuillez réessayer.");
        console.error('Error loading data:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.userInput.trim()) {
      return;
    }

    // Ajouter le message de l'utilisateur
    this.addUserMessage(this.userInput);

    // Traiter le message
    const response = this.chatbotService.processMessage(this.userInput);
    
    // Ajouter la réponse du bot
    setTimeout(() => {
      this.addBotMessage(response);
    }, 500);

    // Réinitialiser l'input
    this.userInput = '';
  }

  addUserMessage(text: string): void {
    this.messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
  }

  addBotMessage(text: string): void {
    this.messages.push({
      text,
      isUser: false,
      timestamp: new Date()
    });
  }

  formatMessage(text: string): SafeHtml {
    // Convertir le markdown simple en HTML
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **texte** -> <strong>
      .replace(/\n/g, '<br>'); // Sauts de ligne

    return this.sanitizer.sanitize(1, formatted) || '';
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.messages = [];
    this.addBotMessage("💬 Chat réinitialisé. Comment puis-je vous aider ?");
  }

  refreshData(): void {
    this.addBotMessage("🔄 Actualisation des données...");
    this.loadData();
  }
}
