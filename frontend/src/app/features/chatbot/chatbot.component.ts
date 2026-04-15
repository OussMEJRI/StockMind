import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { ChatbotService, Message } from '../../core/services/chatbot.service';
import { EquipmentService } from '../../core/services/equipment.service';
import { EmployeeService } from '../../core/services/employee.service';
import { EmplacementService } from '../../core/services/emplacement.service';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: Message[] = [];
  userInput = '';
  loading = false;
  dataLoaded = false;

  constructor(
    private chatbotService: ChatbotService,
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService,
    private emplacementService: EmplacementService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // ✅ S'abonner au flux de messages du service
    this.chatbotService.messages$.subscribe(msgs => {
      this.messages = msgs;
    });

    // ✅ Charger les données
    this.loadData();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadData(): void {
    this.loading = true;

    // ✅ Chargement parallèle avec forkJoin
    forkJoin({
      equipment: this.equipmentService.getEquipment(0, 100),
      employees: this.employeeService.getEmployees(0, 100),
      emplacements: this.emplacementService.getEmplacements(0, 100)
    }).subscribe({
      next: ({ equipment, employees, emplacements }) => {
        // ✅ Appel correct - loadAppData n'est pas un Observable
        this.chatbotService.loadAppData(equipment, employees, emplacements);
        this.dataLoaded = true;
        this.loading = false;

        // ✅ Message de bienvenue avec les vraies données
        this.chatbotService.clearMessages();
        this.addBotMessage(
          `✅ Données chargées !\n\n` +
          `📊 Résumé de l'inventaire :\n` +
          `• ${equipment.length} équipements\n` +
          `• ${employees.length} employés\n` +
          `• ${emplacements.length} emplacements\n\n` +
          `Tapez "aide" pour voir ce que je peux faire.`
        );
      },
      error: (err) => {
        this.loading = false;
        this.addBotMessage(
          "❌ Erreur lors du chargement des données. Veuillez réessayer."
        );
        console.error('Erreur chargement données chatbot:', err);
      }
    });
  }

  sendMessage(): void {
    const message = this.userInput.trim();
    if (!message) return;

    this.userInput = '';
    // ✅ sendMessage gère tout en interne (user + bot)
    this.chatbotService.sendMessage(message);
  }

  // ✅ Méthode locale pour ajouter un message bot directement
  private addBotMessage(text: string): void {
    const messages = [...this.chatbotService['messagesSubject'].value];
    messages.push({ text, isUser: false, timestamp: new Date() });
    this.chatbotService['messagesSubject'].next(messages);
  }

  formatMessage(text: string): SafeHtml {
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  scrollToBottom(): void {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (e) {}
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.chatbotService.clearMessages();
  }

  refreshData(): void {
    this.addBotMessage("🔄 Actualisation des données...");
    this.loadData();
  }
}
