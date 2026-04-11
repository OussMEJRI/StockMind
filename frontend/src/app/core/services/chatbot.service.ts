import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Equipment, EquipmentStatus, EquipmentCondition } from '../models/equipment.model';
import { Employee } from '../models/employee.model';

export interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AppData {
  equipment: Equipment[];
  employees: Employee[];
  emplacements: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  
  private appData: AppData | null = null;

  constructor(private http: HttpClient) {
    this.addBotMessage("Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider ?");
  }

  loadAppData(): Observable<AppData> {
    return this.http.get<any>(`${environment.apiUrl}/chatbot/data`).pipe(
      map(data => {
        this.appData = data;
        return data;
      })
    );
  }

  sendMessage(userMessage: string): void {
    this.addUserMessage(userMessage);
    
    if (!this.appData) {
      this.loadAppData().subscribe(() => {
        this.processMessage(userMessage);
      });
    } else {
      this.processMessage(userMessage);
    }
  }

  private processMessage(message: string): void {
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
      response = 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?';
    } else if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
      response = this.getHelpMessage();
    } else if (lowerMessage.includes('statistique') || lowerMessage.includes('stat')) {
      response = this.getStatistics();
    } else if (lowerMessage.includes('équipement') || lowerMessage.includes('equipment')) {
      response = this.getEquipmentInfo(lowerMessage);
    } else if (lowerMessage.includes('employé') || lowerMessage.includes('employee')) {
      response = this.getEmployeeInfo(lowerMessage);
    } else if (lowerMessage.includes('emplacement') || lowerMessage.includes('location')) {
      response = this.getEmplacementInfo(lowerMessage);
    } else {
      response = 'Je ne suis pas sûr de comprendre. Tapez "aide" pour voir ce que je peux faire.';
    }

    setTimeout(() => this.addBotMessage(response), 500);
  }

  private getHelpMessage(): string {
    return `Je peux vous aider avec :
    
📊 Statistiques - "statistiques" ou "stats"
💻 Équipements - "équipements" ou "liste des laptops"
👥 Employés - "employés" ou "liste des employés"
📍 Emplacements - "emplacements" ou "où est..."

Posez-moi une question !`;
  }

  private getStatistics(): string {
    if (!this.appData) return 'Chargement des données...';

    const totalEquipment = this.appData.equipment.length;
    const totalEmployees = this.appData.employees.length;
    const assignedEquipment = this.appData.equipment.filter(e => e.status === EquipmentStatus.IN_STOCK).length;
    const inStockEquipment = this.appData.equipment.filter(e => e.status === EquipmentStatus.ASSIGNED).length;

    return `📊 Statistiques actuelles:

💻 Équipements: ${totalEquipment}
   - Assignés: ${assignedEquipment}
   - En stock: ${inStockEquipment}

👥 Employés: ${totalEmployees}

📍 Emplacements: ${this.appData.emplacements.length}`;
  }

  private getEquipmentInfo(message: string): string {
    if (!this.appData) return 'Chargement des données...';

    if (message.includes('laptop') || message.includes('portable')) {
      const laptops = this.appData.equipment.filter(e => e.equipment_type === 'laptop');
      const assigned = laptops.filter(e => e.status === EquipmentStatus.ASSIGNED).length;
      const inStock = laptops.filter(e => e.status === EquipmentStatus.IN_STOCK).length;
      
      return `💻 Laptops:
      
Total: ${laptops.length}
- Assignés: ${assigned}
- En stock: ${inStock}`;
    }

    if (message.includes('condition')) {
      const newEquip = this.appData.equipment.filter(e => e.condition === EquipmentCondition.NEW).length;
      const used = this.appData.equipment.filter(e => e.condition === EquipmentCondition.USED).length;
      const refurbished = this.appData.equipment.filter(e => e.condition === EquipmentCondition.REFURBISHED).length;
      
      return `🔧 État des équipements:
      
- Neufs: ${newEquip}
- Utilisés: ${used}
- Reconditionnés: ${refurbished}`;
    }

    return `💻 Équipements disponibles:

Total: ${this.appData.equipment.length}
Types: laptop, pc, monitor, keyboard, mouse, printer, server

Demandez-moi des détails sur un type spécifique !`;
  }

  private getEmployeeInfo(message: string): string {
    if (!this.appData) return 'Chargement des données...';

    const byDepartment = this.appData.employees.reduce((acc: any, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {});

    let response = `👥 Employés par département:\n\n`;
    Object.entries(byDepartment).forEach(([dept, count]) => {
      response += `${dept}: ${count}\n`;
    });

    return response;
  }

  private getEmplacementInfo(message: string): string {
    if (!this.appData) return 'Chargement des données...';

    const totalEmplacements = this.appData.emplacements.length;
    
    return `📍 Emplacements:

Total: ${totalEmplacements}

Les équipements sont répartis dans différents emplacements.
Demandez-moi des détails sur un emplacement spécifique !`;
  }

  private addUserMessage(text: string): void {
    const messages = this.messagesSubject.value;
    messages.push({
      text,
      isUser: true,
      timestamp: new Date()
    });
    this.messagesSubject.next(messages);
  }

  private addBotMessage(text: string): void {
    const messages = this.messagesSubject.value;
    messages.push({
      text,
      isUser: false,
      timestamp: new Date()
    });
    this.messagesSubject.next(messages);
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
    this.addBotMessage("Conversation réinitialisée. Comment puis-je vous aider ?");
  }
}
