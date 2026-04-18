import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee, EquipmentHistory, Department, DepartmentLabels } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>👥 Employés</h1>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="fileInput.click()">
            📊 Importer Excel
          </button>
          <input #fileInput type="file" accept=".xlsx,.xls"
                 (change)="onFileSelected($event)" style="display:none">
          <button class="btn btn-secondary" (click)="downloadTemplate()">
            📥 Modèle Excel
          </button>
          <button class="btn btn-primary" (click)="addEmployee()">
            ➕ Nouvel employé
          </button>
        </div>
      </div>

      <div class="alert alert-danger" *ngIf="error">{{ error }}</div>
      <div class="filters-card">
  <div class="filters-row">
    <div class="form-group">
      <label>Département</label>
      <select [(ngModel)]="filterDepartment" (change)="loadEmployees()">
        <option value="">Tous les départements</option>
        <option *ngFor="let dept of departments" [value]="dept">
          {{ getDepartmentLabel(dept) }}
        </option>
      </select>
    </div>

    <div class="form-group search-group">
      <label>Recherche Nom / CUID</label>
      <input
        type="text"
        [(ngModel)]="filterSearch"
        (keyup.enter)="loadEmployees()"
        placeholder="Ex: Oussama ou AAAA1111"
      />
    </div>

    <button class="btn btn-secondary" (click)="loadEmployees()">
      🔍 Rechercher
    </button>

    <button class="btn btn-secondary" (click)="clearFilters()">
      🔄 Réinitialiser
    </button>
  </div>
</div>

      <div class="table-card">
        <table class="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>CUID</th>
              <th>Contrat</th>
              <th>Département</th>
              <th class="th-actions">⋮</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let employee of employees">
              <td><strong>{{ employee.name }}</strong></td>
              <td>{{ employee.email }}</td>
              <td>
                <span class="badge badge-info" *ngIf="employee.cuid">{{ employee.cuid }}</span>
                <span class="text-muted" *ngIf="!employee.cuid">-</span>
              </td>
              <td>
                <span class="badge" [ngClass]="getContractBadge(employee.contract_type)"
                      *ngIf="employee.contract_type">
                  {{ employee.contract_type }}
                </span>
              </td>
              <td>
                <span class="badge badge-primary" *ngIf="employee.department">
                  {{ employee.department }}
                </span>
              </td>
              <td class="td-actions">
                <!-- Bouton 3 points -->
                <div class="menu-wrapper">
                  <button class="btn-dots"
                          (click)="toggleMenu($event, employee.id!)">
                    ⋮
                  </button>
                  <!-- Dropdown menu -->
                  <div class="dropdown-menu"
                       *ngIf="openMenuId === employee.id">
                    <button class="dropdown-item item-history"
                            (click)="viewHistory(employee); closeMenu()">
                      📋 Historique
                    </button>
                    <button class="dropdown-item item-edit"
                            (click)="editEmployee(employee.id!); closeMenu()">
                      ✏️ Modifier
                    </button>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item item-delete"
                            (click)="deleteEmployee(employee.id!); closeMenu()">
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr *ngIf="employees.length === 0">
              <td colspan="6" class="no-data">Aucun employé trouvé</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Historique -->
    <div class="modal-overlay" *ngIf="showHistoryModal" (click)="closeHistory()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>📋 Historique des équipements</h2>
          <div class="employee-info" *ngIf="selectedEmployee">
            <span class="badge badge-info">{{ selectedEmployee.name }}</span>
            <span class="badge badge-primary">{{ selectedEmployee.department }}</span>
          </div>
          <button class="btn-close" (click)="closeHistory()">✕</button>
        </div>

        <div class="modal-body">
          <div class="loading" *ngIf="loadingHistory">
            ⏳ Chargement de l'historique...
          </div>
          <div class="no-data" *ngIf="!loadingHistory && history.length === 0">
            📭 Aucun équipement attribué à cet employé
          </div>
          <table class="table" *ngIf="!loadingHistory && history.length > 0">
            <thead>
              <tr>
                <th>Équipement</th>
                <th>Modèle</th>
                <th>Type</th>
                <th>Attribué le</th>
                <th>Restitué le</th>
                <th>Statut</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of history">
                <td><code>{{ h.equipment_serial || '-' }}</code></td>
                <td>{{ h.equipment_model || '-' }}</td>
                <td>
                  <span class="badge badge-info">{{ h.equipment_type || '-' }}</span>
                </td>
                <td>{{ formatDate(h.assigned_at) }}</td>
                <td>{{ h.returned_at ? formatDate(h.returned_at) : '-' }}</td>
                <td>
                  <span class="badge"
                    [ngClass]="h.returned_at ? 'badge-secondary' : 'badge-success'">
                    {{ h.returned_at ? '✅ Restitué' : '🟢 En cours' }}
                  </span>
                </td>
                <td>{{ h.notes || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeHistory()">Fermer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ─── Layout ─── */
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

    .header-actions { display: flex; gap: 0.7rem; flex-wrap: wrap; }

    .filters-card {
  background: #161b22;
  border: 1px solid #21262d;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.filters-row {
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

.search-group input {
  min-width: 260px;
}

    /* ─── Buttons ─── */
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
      background: rgba(57,211,83,0.12);
      border-color: rgba(57,211,83,0.35);
      color: #39d353;
    }
    .btn-primary:hover {
      background: rgba(57,211,83,0.22);
      border-color: rgba(57,211,83,0.6);
    }

    .btn-secondary {
      background: rgba(56,139,253,0.1);
      border-color: rgba(56,139,253,0.3);
      color: #388bfd;
    }
    .btn-secondary:hover {
      background: rgba(56,139,253,0.2);
      border-color: rgba(56,139,253,0.5);
    }

    /* ─── Table ─── */
    .table-card {
      background: #161b22;
      border: 1px solid #21262d;
      border-radius: 10px;
      overflow: visible;
    }

    .table { width: 100%; border-collapse: collapse; }

    .table th {
      padding: 0.7rem 1rem;
      background: #0d1117;
      font-weight: 600;
      font-size: 0.72rem;
      color: #484f58;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid #21262d;
      text-align: left;
    }

    .table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #21262d;
      font-size: 0.85rem;
      color: #8b949e;
    }

    .table td strong { color: #e6edf3; }
    .table tbody tr:last-child td { border-bottom: none; }
    .table tbody tr:hover { background: #1c2128; }
    .table tbody tr:hover td { color: #e6edf3; }

    /* ─── Colonne actions ─── */
    .th-actions {
      text-align: center !important;
      font-size: 1.2rem !important;
      color: #30363d !important;
      width: 50px;
    }

    .td-actions {
      text-align: center;
      position: relative;
      overflow: visible;
    }

    /* ─── Bouton 3 points ─── */
    .btn-dots {
      background: none;
      border: 1px solid transparent;
      color: #8b949e;
      font-size: 1.3rem;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      line-height: 1;
      transition: all 0.2s;
      font-weight: 700;
    }

    .btn-dots:hover {
      background: #21262d;
      border-color: #30363d;
      color: #e6edf3;
    }

    /* ─── Dropdown menu ─── */
    .menu-wrapper {
      position: relative;
      display: inline-block;
    }

    .dropdown-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      min-width: 160px;
      z-index: 9999;
      overflow: hidden;
      animation: fadeIn 0.12s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.55rem 1rem;
      background: none;
      border: none;
      font-size: 0.83rem;
      cursor: pointer;
      transition: background 0.15s;
      text-align: left;
      font-family: inherit;
    }

    .item-history { color: #e3b341; }
    .item-history:hover { background: rgba(227,179,65,0.1); }

    .item-edit { color: #388bfd; }
    .item-edit:hover { background: rgba(56,139,253,0.1); }

    .item-delete { color: #f85149; }
    .item-delete:hover { background: rgba(248,81,73,0.1); }

    .dropdown-divider {
      height: 1px;
      background: #21262d;
      margin: 0.2rem 0;
    }

    /* ─── Badges ─── */
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.3px;
    }

    .badge-info      { background: rgba(56,139,253,0.12);  color: #388bfd; border: 1px solid rgba(56,139,253,0.3); }
    .badge-primary   { background: rgba(188,140,255,0.12); color: #bc8cff; border: 1px solid rgba(188,140,255,0.3); }
    .badge-success   { background: rgba(57,211,83,0.12);   color: #39d353; border: 1px solid rgba(57,211,83,0.3); }
    .badge-warning   { background: rgba(227,179,65,0.12);  color: #e3b341; border: 1px solid rgba(227,179,65,0.3); }
    .badge-danger    { background: rgba(248,81,73,0.12);   color: #f85149; border: 1px solid rgba(248,81,73,0.3); }
    .badge-secondary { background: rgba(139,148,158,0.12); color: #8b949e; border: 1px solid rgba(139,148,158,0.3); }

    /* ─── Misc ─── */
    .text-muted { color: #484f58; }
    .no-data { text-align: center; padding: 2.5rem; color: #484f58; font-size: 0.88rem; }
    .loading  { text-align: center; padding: 2.5rem; color: #8b949e; font-size: 0.88rem; }

    .alert { padding: 0.8rem 1rem; border-radius: 6px; margin-bottom: 1rem; font-size: 0.85rem; }
    .alert-danger { background: rgba(248,81,73,0.08); border: 1px solid rgba(248,81,73,0.3); color: #f85149; }

    /* ─── Modal ─── */
    .modal-overlay {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex; align-items: center;
      justify-content: center; z-index: 1000;
      backdrop-filter: blur(2px);
    }

    .modal-content {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      width: 90%; max-width: 900px;
      max-height: 80vh;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    }

    .modal-header {
      display: flex; align-items: center;
      gap: 1rem; padding: 1.2rem 1.5rem;
      border-bottom: 1px solid #21262d;
      flex-wrap: wrap;
    }

    .modal-header h2 { margin: 0; flex: 1; color: #e6edf3; font-size: 1rem; }
    .employee-info { display: flex; gap: 0.5rem; }

    .btn-close {
      background: none; border: none;
      font-size: 1rem; cursor: pointer;
      color: #8b949e; padding: 4px 8px;
      border-radius: 4px; transition: all 0.2s;
    }
    .btn-close:hover { background: rgba(248,81,73,0.1); color: #f85149; }

    .modal-body { padding: 1.2rem 1.5rem; overflow-y: auto; flex: 1; }

    .modal-footer {
      padding: 0.8rem 1.5rem;
      border-top: 1px solid #21262d;
      display: flex; justify-content: flex-end;
    }

    code {
      background: #0d1117; padding: 2px 6px;
      border-radius: 4px; font-size: 0.82rem;
      color: #f778ba; border: 1px solid #21262d;
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  error = '';
  openMenuId: number | null = null;
  departments = Object.values(Department);
  departmentLabels = DepartmentLabels;

  filterDepartment = '';
  filterSearch = '';
  showHistoryModal = false;
  selectedEmployee: Employee | null = null;
  history: EquipmentHistory[] = [];
  loadingHistory = false;

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadEmployees(); }

  /* ─── Fermer menu si clic ailleurs ─── */
  @HostListener('document:click')
  onDocumentClick(): void { this.openMenuId = null; }

  toggleMenu(event: Event, id: number): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  closeMenu(): void { this.openMenuId = null; }

  /* ─── CRUD ─── */
loadEmployees(): void {
  const filters: any = {};

  if (this.filterDepartment) filters.department = this.filterDepartment;
  if (this.filterSearch.trim()) filters.search = this.filterSearch.trim();

  this.employeeService.getEmployees(0, 100, filters).subscribe({
    next: (data) => {
      this.employees = data;
      this.error = '';
    },
    error: (err) => {
      this.employees = [];
      this.error = 'Erreur lors du chargement des employés';
      console.error(err);
    }
  });
}
clearFilters(): void {
  this.filterDepartment = '';
  this.filterSearch = '';
  this.loadEmployees();
}

getDepartmentLabel(dept: string): string {
  return this.departmentLabels[dept as Department] || dept;
}

  viewHistory(employee: Employee): void {
    this.selectedEmployee = employee;
    this.showHistoryModal = true;
    this.loadingHistory = true;
    this.history = [];

    this.employeeService.getEmployeeHistory(employee.id!).subscribe({
      next: (data) => { this.history = data; this.loadingHistory = false; },
      error: () => { this.loadingHistory = false; }
    });
  }

  closeHistory(): void {
    this.showHistoryModal = false;
    this.selectedEmployee = null;
    this.history = [];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  addEmployee(): void { this.router.navigate(['/employees/new']); }
  editEmployee(id: number): void { this.router.navigate(['/employees/edit', id]); }

  deleteEmployee(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => this.loadEmployees(),
        error: () => { this.error = 'Erreur lors de la suppression'; }
      });
    }
  }

  getContractBadge(contractType: string | undefined): string {
    const badges: Record<string, string> = {
      'CDI': 'badge-success', 'CDD': 'badge-warning',
      'STAGIAIRE': 'badge-info', 'EXTERNE': 'badge-secondary'
    };
    return badges[contractType || ''] || 'badge-secondary';
  }

  downloadTemplate(): void {
    const template = [{
      'Nom complet': 'Jean Dupont',
      'Email': 'jean.dupont@sofrecom.com',
      'CUID': 'JDUP1234',
      'Type de contrat': 'CDI',
      'Département': 'SUPPORT'
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employés');
    XLSX.writeFile(wb, 'modele_employes.xlsx');
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
        const employees: Employee[] = jsonData.map(row => ({
          name: row['Nom complet'] || row['name'] || '',
          email: row['Email'] || row['email'] || '',
          cuid: row['CUID'] || row['cuid'] || undefined,
          contract_type: row['Type de contrat'] || row['contract_type'] || undefined,
          department: row['Département'] || row['department'] || undefined
        }));
        let success = 0, errors = 0;
        employees.forEach((emp, i) => {
          this.employeeService.createEmployee(emp).subscribe({
            next: () => { success++; if (i === employees.length - 1) this.showResult(success, errors); },
            error: () => { errors++; if (i === employees.length - 1) this.showResult(success, errors); }
          });
        });
      } catch { this.error = 'Erreur lors de la lecture du fichier Excel'; }
    };
    reader.readAsArrayBuffer(file);
  }

  private showResult(success: number, errors: number): void {
    alert(errors === 0 ? `✅ ${success} employé(s) importé(s) !` : `⚠️ ${success} importé(s), ${errors} erreur(s)`);
    this.loadEmployees();
  }
}
