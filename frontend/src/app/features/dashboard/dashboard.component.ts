import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { EquipmentService } from '../../core/services/equipment.service';
import { EmployeeService } from '../../core/services/employee.service';
import { EmplacementService } from '../../core/services/emplacement.service';
import { ChatbotService } from '../../core/services/chatbot.service';
import { Equipment, EquipmentStatus } from '../../core/models/equipment.model';
import { Employee } from '../../core/models/employee.model';
import { Emplacement } from '../../core/models/emplacement.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Statistiques
  totalEquipment = 0;
  totalEmployees = 0;
  totalEmplacements = 0;
  equipmentInStock = 0;
  equipmentAssigned = 0;
  equipmentMaintenance = 0;

  // Données récentes
  recentEquipment: Equipment[] = [];
  recentEmployees: Employee[] = [];

  // États
  loading = false;
  error: string | null = null;

  constructor(
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService,
    private emplacementService: EmplacementService,
    private chatbotService: ChatbotService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // ✅ Chargement parallèle avec forkJoin
    forkJoin({
      equipment: this.equipmentService.getEquipment(0, 100),
      employees: this.employeeService.getEmployees(0, 100),
      emplacements: this.emplacementService.getEmplacements(0, 100)
    }).subscribe({
      next: ({ equipment, employees, emplacements }) => {
        // ✅ Les services retournent directement des tableaux
        this.totalEquipment = equipment.length;
        this.totalEmployees = employees.length;
        this.totalEmplacements = emplacements.length;

        // ✅ Statistiques correctes
        this.equipmentInStock = equipment
          .filter(e => e.status === EquipmentStatus.IN_STOCK).length;
        this.equipmentAssigned = equipment
          .filter(e => e.status === EquipmentStatus.ASSIGNED).length;
        this.equipmentMaintenance = equipment
          .filter(e => e.status === EquipmentStatus.MAINTENANCE).length;

        // Données récentes
        this.recentEquipment = equipment.slice(0, 5);
        this.recentEmployees = employees.slice(0, 5);

        // ✅ Alimenter le chatbot avec les données
        this.chatbotService.loadAppData(equipment, employees, emplacements);

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement dashboard:', error);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadDashboardData();
  }
}
