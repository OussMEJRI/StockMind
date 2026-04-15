import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { EmployeeService } from '../../../core/services/employee.service';
// ✅ Import depuis employee.model et non user.model
import { Employee } from '../../../core/models/employee.model';

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
              <!-- ✅ Utilise employee.name et non employee.full_name -->
              <td><strong>{{ employee.name }}</strong></td>
              <td>{{ employee.email }}</td>
              <td>
                <span class="badge badge-info" *ngIf="employee.cuid">
                  {{ employee.cuid }}
                </span>
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
    .badge-info     { background: #e3f2fd; color: #1565c0; }
    .badge-primary  { background: #ede7f6; color: #4527a0; }
    .badge-success  { background: #e8f5e9; color: #2e7d32; }
    .badge-warning  { background: #fff8e1; color: #f57f17; }
    .badge-danger   { background: #ffebee; color: #c62828; }
    .badge-secondary{ background: #f5f5f5; color: #616161; }

    .action-buttons { display: flex; gap: 6px; }
    .btn {
      padding: 8px 16px; border: none; border-radius: 6px;
      cursor: pointer; font-size: 0.9rem; font-weight: 500;
    }
    .btn-primary   { background: #667eea; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-info      { background: #17a2b8; color: white; }
    .btn-danger    { background: #dc3545; color: white; }
    .btn-sm        { padding: 5px 10px; font-size: 0.8rem; }
    .btn:hover     { opacity: 0.85; }

    .text-muted { color: #999; }
    .no-data { text-align: center; padding: 40px; color: #999; }
    .alert { padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
    .alert-danger { background: #f8d7da; color: #721c24; }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  error = '';

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    // ✅ Appel correct avec (skip, limit)
    this.employeeService.getEmployees(0, 100).subscribe({
      next: (data) => { this.employees = data; },
      error: (err) => {
        this.error = 'Erreur lors du chargement des employés';
        console.error(err);
      }
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

  // ✅ Badge selon le type de contrat
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

        // ✅ Mapping avec le bon champ "name"
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
