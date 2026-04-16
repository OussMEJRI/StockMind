import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, interval, Subscription } from 'rxjs';
import { EquipmentService } from '../../core/services/equipment.service';
import { EmployeeService } from '../../core/services/employee.service';
import { EmplacementService } from '../../core/services/emplacement.service';
import { ChatbotService } from '../../core/services/chatbot.service';
import { SwitchLocatorService } from '../../core/services/switch-locator.service';
import { Equipment, EquipmentStatus } from '../../core/models/equipment.model';
import { Employee } from '../../core/models/employee.model';
import { Emplacement } from '../../core/models/emplacement.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  totalEquipment = 0;
  totalEmployees = 0;
  totalEmplacements = 0;
  equipmentInStock = 0;
  equipmentAssigned = 0;
  equipmentMaintenance = 0;

  nbPcs = 0;
  nbPcsDisplay = 0;
  nbPcsLoading = true;
  nbPcsError = false;

  recentEquipment: Equipment[] = [];
  recentEmployees: Employee[] = [];

  loading = false;
  error: string | null = null;

  private counterSubscription?: Subscription;

  constructor(
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService,
    private emplacementService: EmplacementService,
    private chatbotService: ChatbotService,
    private switchLocatorService: SwitchLocatorService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadNbPcs();
  }

  ngOnDestroy(): void {
    this.counterSubscription?.unsubscribe();
  }

  animateCounter(target: number): void {
    this.counterSubscription?.unsubscribe();
    this.nbPcsDisplay = 0;
    const steps = 60;
    const duration = 2000;
    const stepValue = target / steps;
    let current = 0;

    this.counterSubscription = interval(duration / steps).subscribe(() => {
      current += stepValue;
      if (current >= target) {
        this.nbPcsDisplay = target;
        this.counterSubscription?.unsubscribe();
      } else {
        this.nbPcsDisplay = Math.floor(current);
      }
    });
  }

  loadNbPcs(): void {
    this.nbPcsLoading = true;
    this.nbPcsError = false;
    this.switchLocatorService.getNbPcs().subscribe({
      next: (response: { nb_pcs: number }) => {
        this.nbPcs = response.nb_pcs;
        this.nbPcsLoading = false;
        this.animateCounter(response.nb_pcs);
      },
      error: () => {
        this.nbPcsLoading = false;
        this.nbPcsError = true;
      }
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      equipment: this.equipmentService.getEquipment(0, 100),
      employees: this.employeeService.getEmployees(0, 100),
      emplacements: this.emplacementService.getEmplacements(0, 100)
    }).subscribe({
      next: ({ equipment, employees, emplacements }) => {
        this.totalEquipment = equipment.length;
        this.totalEmployees = employees.length;
        this.totalEmplacements = emplacements.length;

        this.equipmentInStock = equipment
          .filter((e: Equipment) => e.status === EquipmentStatus.IN_STOCK).length;
        this.equipmentAssigned = equipment
          .filter((e: Equipment) => e.status === EquipmentStatus.ASSIGNED).length;
        this.equipmentMaintenance = equipment
          .filter((e: Equipment) => e.status === EquipmentStatus.MAINTENANCE).length;

        this.recentEquipment = equipment.slice(0, 5);
        this.recentEmployees = employees.slice(0, 5);

        this.chatbotService.loadAppData(equipment, employees, emplacements);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement dashboard:', err);
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadDashboardData();
    this.loadNbPcs();
  }
}
