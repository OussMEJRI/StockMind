import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Equipment, EquipmentStatus } from '../models/equipment.model';
import { Employee } from '../models/employee.model';
import { Emplacement } from '../models/emplacement.model';

// ✅ Export de l'interface Message
export interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AppData {
  equipment: Equipment[];
  employees: Employee[];
  emplacements: Emplacement[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  // ✅ Public pour accès depuis le composant
  public messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private appData: AppData | null = null;

  constructor() {
    this.addBotMessage(
      "Bonjour ! 👋 Je suis votre assistant StockMind. Chargement des données..."
    );
  }

  // ✅ Méthode publique - pas un Observable
  loadAppData(
    equipment: Equipment[],
    employees: Employee[],
    emplacements: Emplacement[]
  ): void {
    this.appData = { equipment, employees, emplacements };
  }

  sendMessage(userMessage: string): void {
    this.addUserMessage(userMessage);
    setTimeout(() => {
      const response = this.processMessage(userMessage);
      this.addBotMessage(response);
    }, 500);
  }

  // ✅ Rendue publique pour accès depuis le composant
  public processMessage(message: string): string {
    const lower = message.toLowerCase().trim();

    if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello')) {
      return "Bonjour ! 😊 Comment puis-je vous aider ?";
    }
    if (lower.includes('aide') || lower.includes('help') || lower === '?') {
      return this.getHelpMessage();
    }
    if (lower.includes('statistique') || lower.includes('stat') || lower.includes('résumé')) {
      return this.getStatistics();
    }
    if (lower.includes('laptop') || lower.includes('portable')) {
      return this.getLaptopInfo();
    }
    if (lower.includes('équipement') || lower.includes('materiel') || lower.includes('pc')) {
      return this.getEquipmentInfo(lower);
    }
    if (lower.includes('employé') || lower.includes('employe') || lower.includes('personnel')) {
      return this.getEmployeeInfo();
    }
    if (lower.includes('emplacement') || lower.includes('site') || lower.includes('bureau')) {
      return this.getEmplacementInfo();
    }
    if (lower.includes('stock') || lower.includes('disponible')) {
      return this.getStockInfo();
    }

    return `Je n'ai pas compris votre question. 🤔\nTapez "aide" pour voir ce que je peux faire.`;
  }

  private getHelpMessage(): string {
    return `📋 Voici ce que je peux faire :\n\n` +
      `📊 **"statistiques"** → Résumé général\n` +
      `💻 **"équipements"** → Liste des équipements\n` +
      `💻 **"laptops"** → Infos sur les laptops\n` +
      `📦 **"stock"** → Équipements disponibles\n` +
      `👥 **"employés"** → Infos sur les employés\n` +
      `📍 **"emplacements"** → Infos sur les sites`;
  }

  private getStatistics(): string {
    if (!this.appData) return '⏳ Données en cours de chargement...';

    const total = this.appData.equipment.length;
    const inStock = this.appData.equipment
      .filter(e => e.status === EquipmentStatus.IN_STOCK).length;
    const assigned = this.appData.equipment
      .filter(e => e.status === EquipmentStatus.ASSIGNED).length;
    const maintenance = this.appData.equipment
      .filter(e => e.status === EquipmentStatus.MAINTENANCE).length;

    return `📊 **Statistiques de l'inventaire :**\n\n` +
      `💻 Équipements : ${total}\n` +
      `   • En stock : ${inStock}\n` +
      `   • Assignés : ${assigned}\n` +
      `   • En maintenance : ${maintenance}\n\n` +
      `👥 Employés : ${this.appData.employees.length}\n` +
      `📍 Emplacements : ${this.appData.emplacements.length}`;
  }

  private getLaptopInfo(): string {
    if (!this.appData) return '⏳ Données en cours de chargement...';

    const laptops = this.appData.equipment.filter(e => e.equipment_type === 'laptop');
    const inStock = laptops.filter(e => e.status === EquipmentStatus.IN_STOCK).length;
    const assigned = laptops.filter(e => e.status === EquipmentStatus.ASSIGNED).length;

    return `💻 **Laptops :**\n\n` +
      `• Total : ${laptops.length}\n` +
      `• En stock : ${inStock}\n` +
      `• Assignés : ${assigned}`;
  }

  private getEquipmentInfo(message: string): string {
    if (!this.appData) return '⏳ Données en cours de chargement...';

    if (message.includes('pc')) {
      const pcs = this.appData.equipment.filter(e => e.equipment_type === 'pc');
      return `🖥️ **PC de bureau :**\n• Total : ${pcs.length}`;
    }
    if (message.includes('écran') || message.includes('monitor')) {
      const monitors = this.appData.equipment.filter(e => e.equipment_type === 'monitor');
      return `🖵 **Écrans :**\n• Total : ${monitors.length}`;
    }

    const byType = this.appData.equipment.reduce((acc: any, eq) => {
      acc[eq.equipment_type as string] = (acc[eq.equipment_type as string] || 0) + 1;
      return acc;
    }, {});

    let response = `💻 **Équipements par type :**\n\n`;
    Object.entries(byType).forEach(([type, count]) => {
      response += `• ${type} : ${count}\n`;
    });
    return response;
  }

  private getEmployeeInfo(): string {
    if (!this.appData) return '⏳ Données en cours de chargement...';

    const byDept = this.appData.employees.reduce((acc: any, emp) => {
      const dept = emp.department || 'Non défini';
      acc[dept as string] = (acc[dept as string] || 0) + 1;
      return acc;
    }, {});

    let response = `👥 **Employés par département :**\n\n`;
    Object.entries(byDept).forEach(([dept, count]) => {
      response += `• ${dept} : ${count}\n`;
    });
    response += `\n**Total : ${this.appData.employees.length} employés**`;
    return response;
  }

  private getEmplacementInfo(): string {
    if (!this.appData) return '⏳ Données en cours de chargement...';

    const bySite = this.appData.emplacements.reduce((acc: any, emp) => {
      acc[emp.site] = (acc[emp.site] || 0) + 1;
      return acc;
    }, {});

    let response = `📍 **Emplacements par site :**\n\n`;
    Object.entries(bySite).forEach(([site, count]) => {
      response += `• ${site} : ${count} emplacement(s)\n`;
    });
    response += `\n**Total : ${this.appData.emplacements.length} emplacements**`;
    return response;
  }

  private getStockInfo(): string {
    if (!this.appData) return '⏳ Données en cours de chargement...';

    const inStock = this.appData.equipment
      .filter(e => e.status === EquipmentStatus.IN_STOCK);

    if (inStock.length === 0) {
      return '📦 Aucun équipement disponible en stock actuellement.';
    }

    const byType = inStock.reduce((acc: any, eq) => {
      acc[eq.equipment_type as string] = (acc[eq.equipment_type as string] || 0) + 1;
      return acc;
    }, {});

    let response = `📦 **Équipements en stock (${inStock.length}) :**\n\n`;
    Object.entries(byType).forEach(([type, count]) => {
      response += `• ${type} : ${count}\n`;
    });
    return response;
  }

  // ✅ Public pour accès depuis le composant
  public addBotMessage(text: string): void {
    const messages = [...this.messagesSubject.value];
    messages.push({ text, isUser: false, timestamp: new Date() });
    this.messagesSubject.next(messages);
  }

  private addUserMessage(text: string): void {
    const messages = [...this.messagesSubject.value];
    messages.push({ text, isUser: true, timestamp: new Date() });
    this.messagesSubject.next(messages);
  }

  clearMessages(): void {
    this.messagesSubject.next([]);
    this.addBotMessage("💬 Conversation réinitialisée. Comment puis-je vous aider ?");
  }
}
