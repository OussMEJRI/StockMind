import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee, EquipmentHistory } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
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

      <div class="table-card">
        <table class="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>CUID</th>
              <th>Contrat</th>
              <th>Département</th>
              <th>Actions</th>
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
              <td>
                <div class="action-buttons">
                  <!-- ✅ Bouton Historique -->
                  <button class="btn btn-sm btn-history"
                          (click)="viewHistory(employee)">
                    📋 Historique
                  </button>
                  <button class="btn btn-sm btn-info"
                          (click)="editEmployee(employee.id!)">
                    ✏️ Modifier
                  </button>
                  <button class="btn btn-sm btn-danger"
                          (click)="deleteEmployee(employee.id!)">
                    🗑️ Supprimer
                  </button>
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

    <!-- ✅ Modal Historique -->
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
          <!-- Chargement -->
          <div class="loading" *ngIf="loadingHistory">
            ⏳ Chargement de l'historique...
          </div>

          <!-- Aucun historique -->
          <div class="no-data" *ngIf="!loadingHistory && history.length === 0">
            📭 Aucun équipement attribué à cet employé
          </div>

          <!-- Tableau historique -->
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
                <td>
                  <code>{{ h.equipment_serial || '-' }}</code>
                </td>
                <td>{{ h.equipment_model || '-' }}</td>
                <td>
                  <span class="badge badge-info">
                    {{ h.equipment_type || '-' }}
                  </span>
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
    .page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 1.5rem;
    }
    .page-header h1 { margin: 0; color: #2c3e50; }
    .header-actions { display: flex; gap: 1rem; }

    .table-card {
      background: white; border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;
    }
    .table { width: 100%; border-collapse: collapse; }
    .table th {
      padding: 12px 16px; background: #f8f9fa;
      font-weight: 600; color: #555;
      border-bottom: 2px solid #dee2e6; text-align: left;
    }
    .table td { padding: 12px 16px; border-bottom: 1px solid #eee; }
    .table tbody tr:hover { background: #f9f9f9; }

    .badge {
      padding: 4px 10px; border-radius: 12px;
      font-size: 0.8rem; font-weight: 500;
    }
    .badge-info      { background: #e3f2fd; color: #1565c0; }
    .badge-primary   { background: #ede7f6; color: #4527a0; }
    .badge-success   { background: #e8f5e9; color: #2e7d32; }
    .badge-warning   { background: #fff8e1; color: #f57f17; }
    .badge-danger    { background: #ffebee; color: #c62828; }
    .badge-secondary { background: #f5f5f5; color: #616161; }

    .action-buttons { display: flex; gap: 6px; flex-wrap: wrap; }
    .btn {
      padding: 8px 16px; border: none; border-radius: 6px;
      cursor: pointer; font-size: 0.9rem; font-weight: 500;
    }
    .btn-primary   { background: #667eea; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-info      { background: #17a2b8; color: white; }
    .btn-danger    { background: #dc3545; color: white; }
    .btn-history   { background: #fd7e14; color: white; }
    .btn-sm        { padding: 5px 10px; font-size: 0.8rem; }
    .btn:hover     { opacity: 0.85; }

    .text-muted { color: #999; }
    .no-data { text-align: center; padding: 40px; color: #999; }
    .loading { text-align: center; padding: 40px; color: #667eea; font-size: 1.1rem; }
    .alert { padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
    .alert-danger { background: #f8d7da; color: #721c24; }

    /* ✅ Modal styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center;
      justify-content: center; z-index: 1000;
    }
    .modal-content {
      background: white; border-radius: 12px;
      width: 90%; max-width: 900px;
      max-height: 80vh; display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .modal-header {
      display: flex; align-items: center;
      gap: 1rem; padding: 1.5rem;
      border-bottom: 1px solid #eee;
      flex-wrap: wrap;
    }
    .modal-header h2 { margin: 0; flex: 1; color: #2c3e50; }
    .employee-info { display: flex; gap: 0.5rem; }
    .btn-close {
      background: none; border: none;
      font-size: 1.2rem; cursor: pointer;
      color: #999; padding: 4px 8px;
      border-radius: 4px;
    }
    .btn-close:hover { background: #f0f0f0; color: #333; }
    .modal-body {
      padding: 1.5rem; overflow-y: auto; flex: 1;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #eee;
      display: flex; justify-content: flex-end;
    }
    code {
      background: #f4f4f4; padding: 2px 6px;
      border-radius: 4px; font-size: 0.85rem;
      color: #e83e8c;
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  error = '';

  // ✅ Historique
  showHistoryModal = false;
  selectedEmployee: Employee | null = null;
  history: EquipmentHistory[] = [];
  loadingHistory = false;

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees(0, 100).subscribe({
      next: (data) => { this.employees = data; },
      error: (err) => {
        this.error = 'Erreur lors du chargement des employés';
        console.error(err);
      }
    });
  }

  // ✅ Ouvrir le modal historique
  viewHistory(employee: Employee): void {
    this.selectedEmployee = employee;
    this.showHistoryModal = true;
    this.loadingHistory = true;
    this.history = [];

    this.employeeService.getEmployeeHistory(employee.id!).subscribe({
      next: (data) => {
        this.history = data;
        this.loadingHistory = false;
      },
      error: () => {
        this.loadingHistory = false;
        this.error = 'Erreur lors du chargement de l\'historique';
      }
    });
  }

  // ✅ Fermer le modal
  closeHistory(): void {
    this.showHistoryModal = false;
    this.selectedEmployee = null;
    this.history = [];
  }

  // ✅ Formater les dates
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
      'CDI': 'badge-success',
      'CDD': 'badge-warning',
      'STAGIAIRE': 'badge-info',
      'EXTERNE': 'badge-secondary'
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

        let success = 0;
        let errors = 0;

        employees.forEach((emp, i) => {
          this.employeeService.createEmployee(emp).subscribe({
            next: () => {
              success++;
              if (i === employees.length - 1) this.showResult(success, errors);
            },
            error: () => {
              errors++;
              if (i === employees.length - 1) this.showResult(success, errors);
            }
          });
        });
      } catch {
        this.error = 'Erreur lors de la lecture du fichier Excel';
      }
    };
    reader.readAsArrayBuffer(file);
  }

  private showResult(success: number, errors: number): void {
    if (errors === 0) {
      alert(`✅ ${success} employé(s) importé(s) avec succès !`);
    } else {
      alert(`⚠️ ${success} importé(s), ${errors} erreur(s)`);
    }
    this.loadEmployees();
  }
}
