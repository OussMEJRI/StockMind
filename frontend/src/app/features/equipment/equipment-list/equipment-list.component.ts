import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentService } from '../../../core/services/equipment.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee } from '../../../core/models/employee.model';
import {
  Equipment,
  EquipmentType,
  EquipmentStatus,
  EquipmentCondition,
  EquipmentTypeLabels,
  EquipmentTypeIcons,
  EquipmentStatusLabels,
  EquipmentConditionLabels
} from '../../../core/models/equipment.model';

@Component({
  selector: 'app-equipment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- En-tête -->
      <div class="page-header">
        <h1>💻 Équipements</h1>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="createNew()">
            ➕ Nouvel équipement
          </button>
          <label class="btn btn-secondary">
            📤 Importer Excel
            <input type="file" accept=".xlsx,.xls" hidden (change)="onFileSelected($event)"/>
          </label>
        </div>
      </div>

      <!-- Filtres -->
      <div class="filters-card">
        <div class="filter-row">
          <div class="form-group">
            <label>Type</label>
            <select [(ngModel)]="filterType" (change)="loadEquipment()">
              <option value="">Tous les types</option>
              <option *ngFor="let type of equipmentTypes" [value]="type">
                {{ getTypeName(type) }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Statut</label>
            <select [(ngModel)]="filterStatus" (change)="loadEquipment()">
              <option value="">Tous les statuts</option>
              <option value="in_stock">En stock</option>
              <option value="assigned">Assigné</option>
              <option value="maintenance">En maintenance</option>
              <option value="retired">Retiré</option>
            </select>
          </div>
          <div class="form-group">
            <label>État</label>
            <select [(ngModel)]="filterCondition" (change)="loadEquipment()">
              <option value="">Tous les états</option>
              <option value="new">Neuf</option>
              <option value="good">Bon état</option>
              <option value="fair">État correct</option>
              <option value="poor">Mauvais état</option>
            </select>
          </div>
          <button class="btn btn-outline" (click)="clearFilters()">
            🔄 Réinitialiser
          </button>
        </div>
      </div>

      <!-- Erreur -->
      <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

      <!-- Chargement -->
      <div class="loading-container" *ngIf="loading">
        <div class="spinner"></div>
        <span>Chargement...</span>
      </div>

      <!-- Import en cours -->
      <div class="loading-container" *ngIf="importing">
        <div class="spinner"></div>
        <span>Import en cours...</span>
      </div>

      <!-- Tableau -->
      <div class="table-card" *ngIf="!loading">
        <table class="table">
          <thead>
            <tr>
              <th>N° Série</th>
              <th>Modèle</th>
              <th>Type</th>
              <th>État</th>
              <th>Statut</th>
              <th>Employé assigné</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let eq of equipment">
              <td><code>{{ eq.serial_number }}</code></td>
              <td>{{ eq.model }}</td>
              <td>
                <span class="type-badge">
                  {{ getTypeIcon(eq.equipment_type) }}
                  {{ getTypeName(eq.equipment_type) }}
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
                  👤 {{ getEmployeeName(eq.employee_id) }}
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
                    (click)="openAssignModal(eq)">
                    👤➕ Assigner
                  </button>
                  <button
                    *ngIf="eq.employee_id"
                    class="btn btn-sm btn-warning"
                    (click)="unassign(eq)">
                    👤➖ Désassigner
                  </button>
                  <button class="btn btn-sm btn-info" (click)="edit(eq)">
                    ✏️ Modifier
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="delete(eq)">
                    🗑️ Supprimer
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="equipment.length === 0">
              <td colspan="7" class="no-data">
                Aucun équipement trouvé
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal d'assignation -->
      <div class="modal-overlay" *ngIf="showAssignModal" (click)="closeAssignModal()">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>👤 Assigner un équipement</h3>
            <button class="close-btn" (click)="closeAssignModal()">✕</button>
          </div>
          <div class="modal-body">
            <p>
              <strong>Équipement :</strong>
              {{ selectedEquipment?.model }} ({{ selectedEquipment?.serial_number }})
            </p>
            <div class="form-group">
              <label>Sélectionner un employé</label>
              <select [(ngModel)]="selectedEmployeeId">
                <option [value]="null">-- Choisir un employé --</option>
                <option *ngFor="let emp of employees" [value]="emp.id">
                  {{ emp.name }}
                  <span *ngIf="emp.cuid"> ({{ emp.cuid }})</span>
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeAssignModal()">
              Annuler
            </button>
            <button
              class="btn btn-primary"
              [disabled]="!selectedEmployeeId"
              (click)="confirmAssign()">
              ✅ Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-header h1 { margin: 0; color: #2c3e50; }

    .header-actions { display: flex; gap: 1rem; }

    .filters-card {
      background: white;
      border-radius: 8px;
      padding: 1rem 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }
    .filter-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group label { font-size: 0.85rem; font-weight: 500; color: #555; }
    .form-group select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;
      min-width: 150px;
    }

    .table-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .table { width: 100%; border-collapse: collapse; }
    .table th {
      padding: 12px 16px;
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
      border-bottom: 2px solid #dee2e6;
      text-align: left;
    }
    .table td {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }
    .table tbody tr:hover { background: #f9f9f9; }

    code {
      background: #f4f4f4;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .type-badge { display: inline-flex; align-items: center; gap: 4px; }

    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .badge-success { background: #e8f5e9; color: #2e7d32; }
    .badge-info    { background: #e3f2fd; color: #1565c0; }
    .badge-warning { background: #fff8e1; color: #f57f17; }
    .badge-danger  { background: #ffebee; color: #c62828; }
    .badge-secondary { background: #f5f5f5; color: #616161; }

    .action-buttons { display: flex; gap: 6px; flex-wrap: wrap; }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-primary   { background: #667eea; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-success   { background: #28a745; color: white; }
    .btn-warning   { background: #ffc107; color: #333; }
    .btn-danger    { background: #dc3545; color: white; }
    .btn-info      { background: #17a2b8; color: white; }
    .btn-outline   { background: white; border: 1px solid #ddd; color: #333; }
    .btn-sm        { padding: 5px 10px; font-size: 0.8rem; }
    .btn:hover     { opacity: 0.85; }
    .btn:disabled  { opacity: 0.5; cursor: not-allowed; }

    .employee-info { color: #28a745; font-weight: 500; }
    .text-muted    { color: #999; font-style: italic; }
    .no-data       { text-align: center; padding: 40px; color: #999; }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .alert { padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
    .alert-danger { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }

    /* Modal */
    .modal-overlay {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .modal-box {
      background: white;
      border-radius: 8px;
      width: 90%; max-width: 480px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    .modal-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex; justify-content: space-between; align-items: center;
    }
    .modal-header h3 { margin: 0; }
    .close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #eee;
      display: flex; justify-content: flex-end; gap: 1rem;
    }
  `]
})
export class EquipmentListComponent implements OnInit {
  equipment: Equipment[] = [];
  employees: Employee[] = [];
  loading = false;
  importing = false;
  error = '';

  // Filtres
  filterType = '';
  filterStatus = '';
  filterCondition = '';

  // Modal
  showAssignModal = false;
  selectedEquipment: Equipment | null = null;
  selectedEmployeeId: number | null = null;

  // ✅ Enums alignés avec le backend
  equipmentTypes = Object.values(EquipmentType);

  constructor(
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEquipment();
    this.loadEmployees();
  }

  loadEquipment(): void {
    this.loading = true;
    this.error = '';

    const filters: any = {};
    if (this.filterType) filters.equipment_type = this.filterType;
    if (this.filterStatus) filters.status = this.filterStatus;
    if (this.filterCondition) filters.condition = this.filterCondition;

    // ✅ Appel correct avec (skip, limit, filters)
    this.equipmentService.getEquipment(0, 100, filters).subscribe({
      next: (data) => {
        this.equipment = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des équipements';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadEmployees(): void {
    // ✅ Appel correct avec (skip, limit)
    this.employeeService.getEmployees(0, 100).subscribe({
      next: (data) => { this.employees = data; },
      error: (err) => console.error('Erreur chargement employés:', err)
    });
  }

  clearFilters(): void {
    this.filterType = '';
    this.filterStatus = '';
    this.filterCondition = '';
    this.loadEquipment();
  }

  // ✅ Récupérer le nom de l'employé par ID
  getEmployeeName(employeeId: number): string {
    const emp = this.employees.find(e => e.id === employeeId);
    return emp ? emp.name : `ID: ${employeeId}`;
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
    if (!this.selectedEquipment?.id || !this.selectedEmployeeId) return;

    this.equipmentService.assignEquipment(
      this.selectedEquipment.id,
      this.selectedEmployeeId
    ).subscribe({
      next: () => {
        this.closeAssignModal();
        this.loadEquipment();
      },
      error: (err) => {
        this.error = "Erreur lors de l'assignation";
        console.error(err);
      }
    });
  }

  unassign(equipment: Equipment): void {
    if (!confirm('Voulez-vous vraiment désassigner cet équipement ?')) return;

    this.equipmentService.unassignEquipment(equipment.id!).subscribe({
      next: () => this.loadEquipment(),
      error: (err) => {
        this.error = 'Erreur lors de la désassignation';
        console.error(err);
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.xlsx$|\.xls$/)) {
      this.error = 'Veuillez sélectionner un fichier Excel valide (.xlsx ou .xls)';
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.error = 'Vous devez être connecté pour importer';
      return;
    }

    this.importing = true;
    this.error = '';

    this.equipmentService.importExcel(file, token).subscribe({
      next: () => {
        this.importing = false;
        this.loadEquipment();
      },
      error: (err) => {
        this.error = "Erreur lors de l'import Excel";
        this.importing = false;
        console.error(err);
      }
    });
  }

  createNew(): void { this.router.navigate(['/equipment/new']); }
  edit(eq: Equipment): void { this.router.navigate(['/equipment/edit', eq.id]); }

  delete(eq: Equipment): void {
    if (confirm(`Supprimer l'équipement ${eq.serial_number} ?`)) {
      this.equipmentService.deleteEquipment(eq.id!).subscribe({
        next: () => this.loadEquipment(),
        error: () => { this.error = 'Erreur lors de la suppression'; }
      });
    }
  }

  // ✅ Méthodes d'affichage alignées avec les Enums backend
  getTypeIcon(type: string): string {
    return EquipmentTypeIcons[type as EquipmentType] || '📦';
  }

  getTypeName(type: string): string {
    return EquipmentTypeLabels[type as EquipmentType] || type;
  }

  getConditionName(condition: string): string {
    return EquipmentConditionLabels[condition as EquipmentCondition] || condition;
  }

  getConditionBadge(condition: string): string {
    const badges: Record<string, string> = {
      'new': 'badge-success',
      'good': 'badge-info',
      'fair': 'badge-warning',
      'poor': 'badge-danger'
    };
    return badges[condition] || 'badge-secondary';
  }

  getStatusName(status: string): string {
    return EquipmentStatusLabels[status as EquipmentStatus] || status;
  }

  getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      'in_stock': 'badge-success',
      'assigned': 'badge-info',
      'maintenance': 'badge-warning',
      'retired': 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  }
}
