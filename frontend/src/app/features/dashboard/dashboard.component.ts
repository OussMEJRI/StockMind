import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EquipmentService } from '../../core/services/equipment.service';
import { Equipment } from '../../core/models/equipment.model';
import { EmployeeService } from '../../core/services/employee.service';
import { LocationService } from '../../core/services/location.service';

interface DashboardStats {
  totalEquipment: number;
  totalEmployees: number;
  totalLocations: number;
  assignedEquipment: number;
  availableEquipment: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalEquipment: 0,
    totalEmployees: 0,
    totalLocations: 0,
    assignedEquipment: 0,
    availableEquipment: 0
  };

  recentEquipment: Equipment[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService,
    private locationService: LocationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Charger les équipements
    this.equipmentService.getEquipment().subscribe({
      next: (equipment) => {
        this.stats.totalEquipment = equipment.length;
        this.stats.assignedEquipment = equipment.filter(e => e.employee_id !== null && e.employee_id !== undefined).length;
        this.stats.availableEquipment = equipment.filter(e => e.employee_id === null || e.employee_id === undefined).length;
        this.recentEquipment = equipment.slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading equipment:', error);
        this.error = 'Erreur lors du chargement des équipements';
      }
    });

    // Charger les employés
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.stats.totalEmployees = employees.length;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      }
    });

    // Charger les localisations
    this.locationService.getLocations().subscribe({
      next: (response) => {
        this.stats.totalLocations = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.loading = false;
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getStatusClass(equipment: Equipment): string {
    if (equipment.employee_id) {
      return 'status-assigned';
    }
    return 'status-available';
  }

  getStatusText(equipment: Equipment): string {
    if (equipment.employee_id) {
      return 'Assigné';
    }
    return 'Disponible';
  }
}
