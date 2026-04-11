import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EquipmentService } from '../../../core/services/equipment.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/employee.model';
import { Equipment, EquipmentType, EquipmentStatus, EquipmentCondition } from '../../../core/models/equipment.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-equipment-list',
  template: `
<div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
  <h1>💻 Équipements</h1>
  <div class="button-group">
    <button class="btn btn-primary" (click)="createNew()">
      + Nouvel équipement
    </button>
    <label class="btn btn-primary cursor-pointer" style="margin-left: 1rem;">
      📤 Importer Excel
      <input type="file" accept=".xlsx,.xls" hidden (change)="onFileSelected($event)" />
    </label>
  </div>
</div>

<div class="filters card">
  <div class="card-body">
    <div class="filter-row">
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-control" [(ngModel)]="filterType" (change)="loadEquipment()">
          <option value="">Tous</option>
          <option *ngFor="let type of equipmentTypes" [value]="type">
            {{ getTypeName(type) }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Statut</label>
        <select class="form-control" [(ngModel)]="filterStatus" (change)="loadEquipment()">
          <option value="">Tous</option>
          <option value="in_stock">En stock</option>
          <option value="assigned">Affecté</option>
        </select>
      </div>
    </div>
  </div>
</div>

<div class="card">
  <div class="card-body" *ngIf="loading">
    <div class="loading">
      <div class="spinner"></div>
    </div>
  </div>

  <table class="table" *ngIf="!loading">
    <thead>
      <tr>
        <th>N° Série</th>
        <th>Modèle</th>
        <th>Type</th>
        <th>État</th>
        <th>Statut</th>
        <th>Employé</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let eq of equipment">
        <td><code>{{ eq.serial_number }}</code></td>
        <td>{{ eq.model }}</td>
        <td>
          <span class="type-badge">
            {{ getTypeIcon(eq.equipment_type) }} {{ getTypeName(eq.equipment_type) }}
          </span>
        </td>
        <td>
          <span class="badge" [ngClass]="getConditionBadge(eq.condition)">
            {{ getConditionName(eq.condition) }}
          </span>
        </td>
        <td>
          <span class="badge" [ngClass]="getStatusBadge(eq.status)">
            {{ getStatusName(eq.status) }}
          </span>
        </td>
        <td>
          <span *ngIf="eq.employee_id" class="employee-info">
            👤 ID: {{ eq.employee_id }}
          </span>
          <span *ngIf="!eq.employee_id" class="text-muted">
            Non assigné
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button 
              *ngIf="!eq.employee_id" 
              class="btn btn-sm btn-success" 
              (click)="openAssignModal(eq)"
              title="Assigner à un employé">
              👤➕ Assigner
            </button>
            <button 
              *ngIf="eq.employee_id" 
              class="btn btn-sm btn-warning" 
              (click)="unassign(eq)"
              title="Désassigner">
              👤➖ Désassigner
            </button>
            <button class="btn btn-sm btn-secondary" (click)="edit(eq)">Modifier</button>
            <button class="btn btn-sm btn-danger" (click)="delete(eq)">Supprimer</button>
          </div>
        </td>
      </tr>
      <tr *ngIf="equipment.length === 0">
        <td colspan="7" class="text-center text-muted">
          Aucun équipement trouvé
        </td>
      </tr>
    </tbody>
  </table>

  <div *ngIf="importing" class="loading">
    <div class="spinner"></div>
    Import en cours...
  </div>
</div>

<!-- Modal d'assignation -->
<div class="modal" [class.show]="showAssignModal" *ngIf="showAssignModal">
  <div class="modal-backdrop" (click)="closeAssignModal()"></div>
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Assigner un équipement</h5>
        <button type="button" class="close" (click)="closeAssignModal()">×</button>
      </div>
      <div class="modal-body">
        <p><strong>Équipement:</strong> {{ selectedEquipment?.model }} ({{ selectedEquipment?.serial_number }})</p>
        
        <div class="form-group">
          <label class="form-label">Sélectionner un employé</label>
          <select class="form-control" [(ngModel)]="selectedEmployeeId">
            <option value="">-- Choisir un employé --</option>
            <option *ngFor="let emp of employees" [value]="emp.id">
              {{ emp.name }} ({{ emp.cuid }})
            </option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="closeAssignModal()">Annuler</button>
        <button 
          type="button" 
          class="btn btn-primary" 
          [disabled]="!selectedEmployeeId"
          (click)="confirmAssign()">
          Assigner
        </button>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
.page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.filters { margin-bottom: 1.5rem; }
.filter-row { display: flex; gap: 1rem; }
.filter-row .form-group { flex: 1; max-width: 200px; margin-bottom: 0; }
.type-badge { display: inline-flex; align-items: center; gap: 0.25rem; }
.action-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
code { background: #f4f4f4; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.85rem; }
.employee-info { color: #28a745; font-weight: 500; }

/* Modal styles */
.modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1050; display: none; }
.modal.show { display: flex; align-items: center; justify-content: center; }
.modal-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
.modal-dialog { position: relative; z-index: 1051; width: 90%; max-width: 500px; }
.modal-content { background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.modal-header { padding: 1rem; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center; }
.modal-title { margin: 0; font-size: 1.25rem; }
.close { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 1rem; }
.modal-footer { padding: 1rem; border-top: 1px solid #dee2e6; display: flex; justify-content: flex-end; gap: 0.5rem; }
  `]
})
export class EquipmentListComponent implements OnInit {
  equipment: Equipment[] = [];
  employees: Employee[] = [];
  loading = false;
  importing = false;
  showAssignModal = false;
  selectedEquipment: Equipment | null = null;
  selectedEmployeeId: number | null = null;

  filterType = '';
  filterStatus = '';
  equipmentTypes = Object.values(EquipmentType);

  constructor(
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEquipment();
    this.loadEmployees();
  }

  loadEquipment(): void {
    this.loading = true;
    const filters: any = {};
    if (this.filterType) filters.equipment_type = this.filterType;
    if (this.filterStatus) filters.status = this.filterStatus;

    this.equipmentService.getEquipment(filters).subscribe({
      next: (data) => {
        this.equipment = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des employés:', err);
      }
    });
  }

  openAssignModal(equipment: Equipment): void {
    this.selectedEquipment = equipment;
    this.selectedEmployeeId = null;
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedEquipment = null;
    this.selectedEmployeeId = null;
  }

  confirmAssign(): void {
    if (!this.selectedEquipment || !this.selectedEmployeeId) return;

    this.equipmentService.assignEquipment(this.selectedEquipment.id!, this.selectedEmployeeId).subscribe({
      next: () => {
        alert('✅ Équipement assigné avec succès !');
        this.closeAssignModal();
        this.loadEquipment();
      },
      error: (err) => {
        console.error('Erreur lors de l\'assignation:', err);
        alert('❌ Erreur lors de l\'assignation');
      }
    });
  }

  unassign(equipment: Equipment): void {
    if (!confirm(`Voulez-vous vraiment désassigner cet équipement ?`)) return;

    this.equipmentService.unassignEquipment(equipment.id!).subscribe({
      next: () => {
        alert('✅ Équipement désassigné avec succès !');
        this.loadEquipment();
      },
      error: (err) => {
        console.error('Erreur lors de la désassignation:', err);
        alert('❌ Erreur lors de la désassignation');
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.xlsx$|\.xls$/)) {
      alert('Veuillez sélectionner un fichier Excel valide.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = this.authService.getToken();
    if (!token) {
      alert('Vous devez être connecté pour importer.');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.importing = true;
    this.http.post('/api/v1/equipment/import', formData, { headers }).subscribe({
      next: () => {
        alert('Import réussi ✅');
        this.loadEquipment();
        this.importing = false;
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l\'import ❌');
        this.importing = false;
      }
    });
  }

  createNew(): void { this.router.navigate(['/equipment/new']); }

  edit(eq: Equipment): void { this.router.navigate(['/equipment/edit', eq.id]); }

  delete(eq: Equipment): void {
    if (confirm(`Supprimer l'équipement ${eq.serial_number} ?`)) {
      this.equipmentService.deleteEquipment(eq.id!).subscribe(() => this.loadEquipment());
    }
  }

  getTypeIcon(type: EquipmentType): string {
    const icons: Record<EquipmentType, string> = {
      [EquipmentType.PC]: '🖥️',
      [EquipmentType.LAPTOP]: '💻',
      [EquipmentType.MONITOR]: '🖵',
      [EquipmentType.PHONE]: '📱',
      [EquipmentType.ACCESSORY]: '🔌'
    };
    return icons[type] || '📦';
  }

  getTypeName(type: EquipmentType): string {
    const names: Record<EquipmentType, string> = {
      [EquipmentType.PC]: 'PC',
      [EquipmentType.LAPTOP]: 'Laptop',
      [EquipmentType.MONITOR]: 'Écran',
      [EquipmentType.PHONE]: 'Téléphone',
      [EquipmentType.ACCESSORY]: 'Accessoire'
    };
    return names[type] || type;
  }

  getConditionName(condition: EquipmentCondition): string {
    const names: Record<EquipmentCondition, string> = {
      [EquipmentCondition.NEW]: 'Neuf',
      [EquipmentCondition.USED]: 'Utilisé',
      [EquipmentCondition.OUT_OF_SERVICE]: 'Hors service'
    };
    return names[condition] || condition;
  }

  getConditionBadge(condition: EquipmentCondition): string {
    const badges: Record<EquipmentCondition, string> = {
      [EquipmentCondition.NEW]: 'badge-success',
      [EquipmentCondition.USED]: 'badge-warning',
      [EquipmentCondition.OUT_OF_SERVICE]: 'badge-danger'
    };
    return badges[condition] || 'badge-info';
  }

  getStatusName(status: EquipmentStatus): string {
    return status === EquipmentStatus.IN_STOCK ? 'En stock' : 'Affecté';
  }

  getStatusBadge(status: EquipmentStatus): string {
    return status === EquipmentStatus.IN_STOCK ? 'badge-success' : 'badge-info';
  }
}
