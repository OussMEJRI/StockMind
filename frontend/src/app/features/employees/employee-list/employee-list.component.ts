import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>👥 Employés</h1>
        <div class="header-actions">
          <button class="btn-secondary" (click)="fileInput.click()">
            📊 Importer Excel
          </button>
          <input #fileInput type="file" accept=".xlsx,.xls" (change)="onFileSelected($event)" style="display: none">
          <button class="btn-secondary" (click)="downloadTemplate()">
            📥 Télécharger modèle
          </button>
          <button class="btn-primary" (click)="addEmployee()">
            + Nouvel employé
          </button>
        </div>
      </div>

      <div class="alert alert-danger" *ngIf="error">
        {{ error }}
      </div>

      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>CUID</th>
                  <th>Type de contrat</th>
                  <th>Département</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let employee of employees">
                  <td>{{ employee.name }}</td>
                  <td>{{ employee.email }}</td>
                  <td>
                    <span class="badge badge-info" *ngIf="employee.cuid">
                      {{ employee.cuid }}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-success" *ngIf="employee.contract_type">
                      {{ employee.contract_type }}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-primary" *ngIf="employee.department">
                      {{ employee.department }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-sm btn-secondary" (click)="editEmployee(employee.id!)">
                      Modifier
                    </button>
                    <button class="btn-sm btn-danger" (click)="deleteEmployee(employee.id!)">
                      Supprimer
                    </button>
                  </td>
                </tr>
                <tr *ngIf="employees.length === 0">
                  <td colspan="6" class="text-center">Aucun employé trouvé</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0;
      color: #2c3e50;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
    }

    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .card-body {
      padding: 1.5rem;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th,
    .table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }

    .table th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }

    .table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary:hover {
      background-color: #5568d3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-secondary:hover {
      background-color: #5a6268;
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      margin-right: 0.5rem;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c82333;
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .badge-info {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .badge-success {
      background-color: #e8f5e9;
      color: #388e3c;
    }

    .badge-primary {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .text-center {
      text-align: center;
    }

    .alert {
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  error: string = '';
  selectedFile: File | null = null;

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des employés';
        console.error(err);
      }
    });
  }

  addEmployee(): void {
    this.router.navigate(['/employees/new']);
  }

  editEmployee(id: number): void {
    this.router.navigate(['/employees/edit', id]);
  }

  deleteEmployee(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression';
          console.error(err);
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.importFile();
    }
  }

  downloadTemplate(): void {
    // Créer un modèle Excel avec les colonnes attendues
    const template = [
      {
        'Nom complet': 'Jean Dupont',
        'Email': 'jean.dupont@example.com',
        'CUID': 'CMCX1234',
        'Type de contrat': 'CDI',
        'Département': 'SUPPORT'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employés');
    XLSX.writeFile(wb, 'modele_employes.xlsx');
  }

  importFile(): void {
    if (!this.selectedFile) {
      this.error = 'Veuillez sélectionner un fichier';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Transformer les données Excel en format Employee
        const employees: Partial<Employee>[] = jsonData.map((row: any) => ({
          name: row['Nom complet'] || row['name'],
          email: row['Email'] || row['email'],
          cuid: row['CUID'] || row['cuid'],
          contract_type: row['Type de contrat'] || row['contract_type'],
          department: row['Département'] || row['department']
        }));

        // Importer chaque employé
        let successCount = 0;
        let errorCount = 0;

        employees.forEach((emp, index) => {
          this.employeeService.createEmployee(emp as Employee).subscribe({
            next: () => {
              successCount++;
              if (index === employees.length - 1) {
                this.showImportResult(successCount, errorCount);
              }
            },
            error: (err) => {
              errorCount++;
              console.error('Erreur import:', err);
              if (index === employees.length - 1) {
                this.showImportResult(successCount, errorCount);
              }
            }
          });
        });

      } catch (error) {
        this.error = 'Erreur lors de la lecture du fichier Excel';
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  private showImportResult(success: number, errors: number): void {
    if (errors === 0) {
      alert(`✅ ${success} employé(s) importé(s) avec succès !`);
    } else {
      alert(`⚠️ ${success} importé(s), ${errors} erreur(s)`);
    }
    this.loadEmployees();
    this.selectedFile = null;
  }
}
