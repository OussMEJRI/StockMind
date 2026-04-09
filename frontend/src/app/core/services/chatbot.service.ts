import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EquipmentService } from './equipment.service';
import { EmployeeService } from './employee.service';
import { LocationService } from './location.service';
import { Equipment, EquipmentStatus, EquipmentCondition } from '../models/equipment.model';

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface AppData {
  equipment: Equipment[];
  employeesCount: number;
  locationsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private appData: AppData | null = null;

  constructor(
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService,
    private locationService: LocationService
  ) {}

  loadAppData(): Observable<AppData> {
    return forkJoin({
      equipment: this.equipmentService.getEquipment(),
      employees: this.employeeService.getEmployees(),
      locations: this.locationService.getLocations()
    }).pipe(
      map(result => {
        this.appData = {
          equipment: result.equipment,
          employeesCount: result.employees.length,
          locationsCount: result.locations.total
        };
        return this.appData;
      }),
      catchError(error => {
        console.error('Error loading app data:', error);
        return of({
          equipment: [],
          employeesCount: 0,
          locationsCount: 0
        });
      })
    );
  }

  processMessage(message: string): string {
    if (!this.appData) {
      return "Je charge les données, veuillez patienter...";
    }

    const lowerMessage = message.toLowerCase();

    // Questions sur les équipements
    if (this.matchesKeywords(lowerMessage, ['équipement', 'equipement', 'stock', 'matériel', 'materiel'])) {
      return this.getEquipmentInfo(lowerMessage);
    }

    // Questions sur les employés
    if (this.matchesKeywords(lowerMessage, ['employé', 'employe', 'personnel', 'collaborateur', 'utilisateur'])) {
      return this.getEmployeeInfo(lowerMessage);
    }

    // Questions sur les localisations
    if (this.matchesKeywords(lowerMessage, ['localisation', 'emplacement', 'lieu', 'bureau', 'rosace', 'étage', 'etage'])) {
      return this.getLocationInfo(lowerMessage);
    }

    // Questions générales
    if (this.matchesKeywords(lowerMessage, ['total', 'combien', 'nombre', 'statistique', 'stat'])) {
      return this.getGeneralStats();
    }

    // Questions sur les PC
    if (this.matchesKeywords(lowerMessage, ['pc', 'ordinateur', 'computer'])) {
      return this.getEquipmentByType('pc');
    }

    // Questions sur les laptops
    if (this.matchesKeywords(lowerMessage, ['laptop', 'portable', 'notebook'])) {
      return this.getEquipmentByType('laptop');
    }

    // Questions sur les moniteurs
    if (this.matchesKeywords(lowerMessage, ['moniteur', 'écran', 'ecran', 'monitor', 'display'])) {
      return this.getEquipmentByType('monitor');
    }

    // Questions sur les téléphones
    if (this.matchesKeywords(lowerMessage, ['téléphone', 'telephone', 'phone', 'mobile'])) {
      return this.getEquipmentByType('phone');
    }

    // Questions sur les accessoires
    if (this.matchesKeywords(lowerMessage, ['accessoire', 'accessory', 'périphérique', 'peripherique'])) {
      return this.getEquipmentByType('accessory');
    }

    // Questions sur les équipements disponibles
    if (this.matchesKeywords(lowerMessage, ['disponible', 'libre', 'available'])) {
      return this.getAvailableEquipment();
    }

    // Questions sur les équipements assignés
    if (this.matchesKeywords(lowerMessage, ['assigné', 'assigne', 'attribué', 'attribue', 'assigned'])) {
      return this.getAssignedEquipment();
    }

    // Aide
    if (this.matchesKeywords(lowerMessage, ['aide', 'help', 'comment', 'que peux-tu', 'que peux tu'])) {
      return this.getHelp();
    }

    // Salutations
    if (this.matchesKeywords(lowerMessage, ['bonjour', 'salut', 'hello', 'hi', 'hey'])) {
      return "Bonjour ! 👋 Je suis votre assistant IT Inventory. Je peux vous donner des informations sur vos équipements, employés et localisations. Que souhaitez-vous savoir ?";
    }

    // Remerciements
    if (this.matchesKeywords(lowerMessage, ['merci', 'thanks', 'thank you'])) {
      return "De rien ! 😊 N'hésitez pas si vous avez d'autres questions.";
    }

    // Message par défaut
    return "Je n'ai pas compris votre question. Tapez 'aide' pour voir ce que je peux faire.";
  }

  private matchesKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword));
  }

  private getEquipmentInfo(message: string): string {
    const total = this.appData!.equipment.length;
    const inStock = this.appData!.equipment.filter(e => e.status === EquipmentStatus.IN_STOCK).length;
    const assigned = this.appData!.equipment.filter(e => e.status === EquipmentStatus.ASSIGNED).length;

    return `📊 **Informations sur les équipements :**\n\n` +
           `• Total : **${total}** équipements\n` +
           `• En stock : **${inStock}** équipements\n` +
           `• Assignés : **${assigned}** équipements\n\n` +
           `Vous pouvez me demander des détails sur un type spécifique (PC, laptop, moniteur, etc.)`;
  }

  private getEmployeeInfo(message: string): string {
    const total = this.appData!.employeesCount;
    const withEquipment = this.appData!.equipment.filter(e => e.employee_id).length;

    return `👥 **Informations sur les employés :**\n\n` +
           `• Total : **${total}** employés\n` +
           `• Avec équipement : **${withEquipment}** employés\n` +
           `• Sans équipement : **${total - withEquipment}** employés`;
  }

  private getLocationInfo(message: string): string {
    const total = this.appData!.locationsCount;
    const withEquipment = new Set(this.appData!.equipment.filter(e => e.location_id).map(e => e.location_id)).size;

    return `🏢 **Informations sur les localisations :**\n\n` +
           `• Total : **${total}** localisations\n` +
           `• Avec équipement : **${withEquipment}** localisations\n` +
           `• Vides : **${total - withEquipment}** localisations`;
  }

  private getGeneralStats(): string {
    const totalEquipment = this.appData!.equipment.length;
    const totalEmployees = this.appData!.employeesCount;
    const totalLocations = this.appData!.locationsCount;
    const inStock = this.appData!.equipment.filter(e => e.status === EquipmentStatus.IN_STOCK).length;
    const assigned = this.appData!.equipment.filter(e => e.status === EquipmentStatus.ASSIGNED).length;

    return `📈 **Statistiques générales :**\n\n` +
           `**Équipements :**\n` +
           `• Total : ${totalEquipment}\n` +
           `• En stock : ${inStock}\n` +
           `• Assignés : ${assigned}\n\n` +
           `**Employés :** ${totalEmployees}\n` +
           `**Localisations :** ${totalLocations}`;
  }

  private getEquipmentByType(type: string): string {
    const equipment = this.appData!.equipment.filter(e => e.equipment_type === type);
    const total = equipment.length;
    const inStock = equipment.filter(e => e.status === EquipmentStatus.IN_STOCK).length;
    const assigned = equipment.filter(e => e.status === EquipmentStatus.ASSIGNED).length;
    const newCondition = equipment.filter(e => e.condition === EquipmentCondition.NEW).length;
    const used = equipment.filter(e => e.condition === EquipmentCondition.USED).length;
    const outOfService = equipment.filter(e => e.condition === EquipmentCondition.OUT_OF_SERVICE).length;

    const typeNames: { [key: string]: string } = {
      'pc': 'PC',
      'laptop': 'Laptops',
      'monitor': 'Moniteurs',
      'phone': 'Téléphones',
      'accessory': 'Accessoires'
    };

    return `💻 **${typeNames[type]} :**\n\n` +
           `• Total : **${total}**\n` +
           `• En stock : **${inStock}**\n` +
           `• Assignés : **${assigned}**\n\n` +
           `**État :**\n` +
           `• Neuf : ${newCondition}\n` +
           `• Utilisé : ${used}\n` +
           `• Hors service : ${outOfService}`;
  }

  private getAvailableEquipment(): string {
    const available = this.appData!.equipment.filter(e => e.status === EquipmentStatus.IN_STOCK);
    const total = available.length;

    if (total === 0) {
      return "❌ Aucun équipement disponible actuellement.";
    }

    const byType: { [key: string]: number } = {};
    available.forEach(e => {
      byType[e.equipment_type] = (byType[e.equipment_type] || 0) + 1;
    });

    const typeNames: { [key: string]: string } = {
      'pc': 'PC',
      'laptop': 'Laptops',
      'monitor': 'Moniteurs',
      'phone': 'Téléphones',
      'accessory': 'Accessoires'
    };

    let response = `✅ **Équipements disponibles : ${total}**\n\n`;
    Object.entries(byType).forEach(([type, count]) => {
      response += `• ${typeNames[type]} : ${count}\n`;
    });

    return response;
  }

  private getAssignedEquipment(): string {
    const assigned = this.appData!.equipment.filter(e => e.status === EquipmentStatus.ASSIGNED);
    const total = assigned.length;

    if (total === 0) {
      return "❌ Aucun équipement assigné actuellement.";
    }

    const byType: { [key: string]: number } = {};
    assigned.forEach(e => {
      byType[e.equipment_type] = (byType[e.equipment_type] || 0) + 1;
    });

    const typeNames: { [key: string]: string } = {
      'pc': 'PC',
      'laptop': 'Laptops',
      'monitor': 'Moniteurs',
      'phone': 'Téléphones',
      'accessory': 'Accessoires'
    };

    let response = `👤 **Équipements assignés : ${total}**\n\n`;
    Object.entries(byType).forEach(([type, count]) => {
      response += `• ${typeNames[type]} : ${count}\n`;
    });

    return response;
  }

  private getHelp(): string {
    return `🤖 **Je peux vous aider avec :**\n\n` +
           `📊 **Statistiques générales :**\n` +
           `• "Combien d'équipements ?"\n` +
           `• "Nombre total d'employés ?"\n` +
           `• "Statistiques"\n\n` +
           `💻 **Équipements par type :**\n` +
           `• "Combien de PC ?"\n` +
           `• "Laptops disponibles ?"\n` +
           `• "Moniteurs en stock ?"\n\n` +
           `✅ **Disponibilité :**\n` +
           `• "Équipements disponibles ?"\n` +
           `• "Équipements assignés ?"\n\n` +
           `🏢 **Localisations :**\n` +
           `• "Nombre de localisations ?"\n` +
           `• "Bureaux disponibles ?"\n\n` +
           `Posez-moi vos questions en langage naturel ! 😊`;
  }
}
