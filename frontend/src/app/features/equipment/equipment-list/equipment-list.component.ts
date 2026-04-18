import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipmentService } from '../../../core/services/equipment.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { EmplacementService } from '../../../core/services/emplacement.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee } from '../../../core/models/employee.model';
import { Emplacement } from '../../../core/models/emplacement.model';
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
           <div class="form-group search-group">
    <label>Recherche N° série</label>
    <input
      type="text"
      [(ngModel)]="filterSearch"
      (keyup.enter)="loadEquipment()"
      placeholder="Ex: SN-2024-001"
    />
  </div>

  <button class="btn btn-primary" (click)="loadEquipment()">
    🔍 Rechercher
  </button>

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
              <th>Affectation</th>
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
  <span *ngIf="!eq.employee_id && eq.emplacement_id" class="employee-info">
    📍 {{ getEmplacementName(eq.emplacement_id) }}
  </span>
  <span *ngIf="!eq.employee_id && !eq.emplacement_id" class="text-muted">
    Non assigné
  </span>
</td>
              <td>
  <div class="action-buttons">
    <button
      *ngIf="!eq.employee_id && !eq.emplacement_id"
      class="btn btn-sm btn-success"
      (click)="openAssignModal(eq)">
      ➕ Affecter
    </button>

    <button
      *ngIf="eq.employee_id || eq.emplacement_id"
      class="btn btn-sm btn-warning"
      (click)="unassign(eq)">
      ➖ Retirer
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

  <div class="form-group" *ngIf="selectedEquipment && isLaptop(selectedEquipment)">
    <label>Sélectionner un employé</label>
    <select [(ngModel)]="selectedEmployeeId">
      <option [ngValue]="null">-- Choisir un employé --</option>
      <option *ngFor="let emp of employees" [ngValue]="emp.id">
        {{ emp.name }}<span *ngIf="emp.cuid"> ({{ emp.cuid }})</span>
      </option>
    </select>
  </div>

  <div class="form-group" *ngIf="selectedEquipment && !isLaptop(selectedEquipment)">
    <label>Sélectionner un emplacement</label>
    <select [(ngModel)]="selectedEmplacementId">
      <option [ngValue]="null">-- Choisir un emplacement --</option>
      <option *ngFor="let emp of emplacements" [ngValue]="emp.id">
        {{ formatEmplacement(emp) }}
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
  [disabled]="isLaptop(selectedEquipment) ? !selectedEmployeeId : !selectedEmplacementId"
  (click)="confirmAssign()">
  ✅ Confirmer
</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
  .page-container {
    padding: 1.5rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
    background: #0d1117;
    min-height: 100vh;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    margin: 0;
    font-size: 1.4rem;
    color: #e6edf3;
    font-weight: 600;
  }

  .header-actions {
    display: flex;
    gap: 0.7rem;
    flex-wrap: wrap;
  }

  .filters-card {
    background: #161b22;
    border: 1px solid #21262d;
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1.2rem;
  }

  .filter-row {
    display: flex;
    gap: 0.8rem;
    align-items: end;
    flex-wrap: wrap;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .form-group label {
    font-size: 0.8rem;
    color: #8b949e;
    font-weight: 500;
  }

  .form-group select,
  .form-group input {
    padding: 0.55rem 0.8rem;
    border: 1px solid #30363d;
    border-radius: 6px;
    background: #0d1117;
    color: #e6edf3;
    font-size: 0.9rem;
    min-width: 180px;
  }

  .form-group select:focus,
  .form-group input:focus {
    outline: none;
    border-color: #388bfd;
    box-shadow: 0 0 0 3px rgba(56, 139, 253, 0.15);
  }

  .table-card {
    background: #161b22;
    border: 1px solid #21262d;
    border-radius: 10px;
    overflow: hidden;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table th {
    padding: 0.7rem 1rem;
    background: #0d1117;
    font-weight: 600;
    font-size: 0.72rem;
    color: #8b949e;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border-bottom: 1px solid #21262d;
    text-align: left;
  }

  .table td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #21262d;
    font-size: 0.85rem;
    color: #c9d1d9;
  }

  .table tbody tr:last-child td {
    border-bottom: none;
  }

  .table tbody tr:hover {
    background: #1c2128;
  }

  code {
    background: #21262d;
    color: #c9d1d9;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.82rem;
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #c9d1d9;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.28rem 0.75rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    border: 1px solid transparent;
  }

  .badge-success {
    background: rgba(57, 211, 83, 0.12);
    border-color: rgba(57, 211, 83, 0.35);
    color: #39d353;
  }

  .badge-info {
    background: rgba(56, 139, 253, 0.12);
    border-color: rgba(56, 139, 253, 0.35);
    color: #58a6ff;
  }

  .badge-warning {
    background: rgba(210, 153, 34, 0.12);
    border-color: rgba(210, 153, 34, 0.35);
    color: #d29922;
  }

  .badge-danger {
    background: rgba(248, 81, 73, 0.12);
    border-color: rgba(248, 81, 73, 0.35);
    color: #f85149;
  }

  .badge-secondary {
    background: rgba(139, 148, 158, 0.12);
    border-color: rgba(139, 148, 158, 0.35);
    color: #8b949e;
  }

  .action-buttons {
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.45rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
    font-family: inherit;
  }

  .btn-primary {
    background: rgba(56, 139, 253, 0.15);
    border-color: rgba(56, 139, 253, 0.35);
    color: #58a6ff;
  }

  .btn-secondary {
    background: #21262d;
    border-color: #30363d;
    color: #e6edf3;
  }

  .btn-success {
    background: rgba(57, 211, 83, 0.15);
    border-color: rgba(57, 211, 83, 0.35);
    color: #39d353;
  }

  .btn-warning {
    background: rgba(210, 153, 34, 0.15);
    border-color: rgba(210, 153, 34, 0.35);
    color: #d29922;
  }

  .btn-danger {
    background: rgba(248, 81, 73, 0.15);
    border-color: rgba(248, 81, 73, 0.35);
    color: #f85149;
  }

  .btn-info {
    background: rgba(56, 139, 253, 0.15);
    border-color: rgba(56, 139, 253, 0.35);
    color: #58a6ff;
  }

  .btn-outline {
    background: #0d1117;
    border: 1px solid #30363d;
    color: #c9d1d9;
  }

  .btn-sm {
    padding: 0.38rem 0.8rem;
    font-size: 0.8rem;
  }

  .btn:hover {
    filter: brightness(1.08);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .employee-info {
    color: #39d353;
    font-weight: 500;
  }

  .text-muted {
    color: #8b949e;
    font-style: italic;
  }

  .no-data {
    text-align: center;
    padding: 2rem;
    color: #8b949e;
  }

  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: #c9d1d9;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #21262d;
    border-top: 3px solid #388bfd;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .alert {
    padding: 0.9rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    border: 1px solid transparent;
  }

  .alert-danger {
    background: rgba(248, 81, 73, 0.12);
    border-color: rgba(248, 81, 73, 0.35);
    color: #ff7b72;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(1, 4, 9, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-box {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 12px;
    width: 90%;
    max-width: 480px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    color: #e6edf3;
  }

  .modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #21262d;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal-header h3 {
    margin: 0;
    color: #e6edf3;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #8b949e;
  }

  .modal-body {
    padding: 1.5rem;
    color: #c9d1d9;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #21262d;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
  }
`]
})
export class EquipmentListComponent implements OnInit {
  equipment: Equipment[] = [];
  employees: Employee[] = [];
  emplacements: Emplacement[] = [];
selectedEmplacementId: number | null = null;
  loading = false;
  importing = false;
  error = '';

  // Filtres
  filterType = '';
  filterStatus = '';
  filterCondition = '';
  filterSearch = '';

  // Modal
  showAssignModal = false;
  selectedEquipment: Equipment | null = null;
  selectedEmployeeId: number | null = null;

  // ✅ Enums alignés avec le backend
  equipmentTypes = Object.values(EquipmentType);

  constructor(
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService,
    private emplacementService: EmplacementService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEquipment();
    this.loadEmployees();
    this.loadEmplacements();
  }

  loadEmplacements(): void {
  this.emplacementService.getEmplacements(0, 100).subscribe({
    next: (data) => { this.emplacements = data; },
    error: (err) => console.error('Erreur chargement emplacements:', err)
  });
}

  loadEquipment(): void {
    this.loading = true;
    this.error = '';

    const filters: any = {};
    if (this.filterType) filters.equipment_type = this.filterType;
    if (this.filterStatus) filters.status = this.filterStatus;
    if (this.filterCondition) filters.condition = this.filterCondition;
    if (this.filterSearch.trim()) filters.search = this.filterSearch.trim();

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
    this.filterSearch = '';
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
  this.selectedEmplacementId = null;
  this.showAssignModal = true;
}

 closeAssignModal(): void {
  this.showAssignModal = false;
  this.selectedEquipment = null;
  this.selectedEmployeeId = null;
  this.selectedEmplacementId = null;
}

confirmAssign(): void {
  if (!this.selectedEquipment?.id) return;

  const request = this.isLaptop(this.selectedEquipment)
    ? (
        this.selectedEmployeeId
          ? this.equipmentService.assignEquipmentToEmployee(
              this.selectedEquipment.id,
              this.selectedEmployeeId
            )
          : null
      )
    : (
        this.selectedEmplacementId
          ? this.equipmentService.assignEquipmentToEmplacement(
              this.selectedEquipment.id,
              this.selectedEmplacementId
            )
          : null
      );

  if (!request) return;

  request.subscribe({
    next: () => {
      this.closeAssignModal();
      this.loadEquipment();
    },
    error: (err) => {
      this.error = err?.error?.detail || "Erreur lors de l'affectation";
      console.error(err);
    }
  });
}
isLaptop(equipment: Equipment | null): boolean {
  return String(equipment?.equipment_type || '').toLowerCase() === 'laptop';
}

getEmplacementName(emplacementId: number): string {
  const emplacement = this.emplacements.find(e => e.id === emplacementId);
  return emplacement ? this.formatEmplacement(emplacement) : `ID: ${emplacementId}`;
}

formatEmplacement(emplacement: Emplacement): string {
  return `${emplacement.site} / ${emplacement.etage} / ${emplacement.rosace}`;
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
