import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/user.model';

@Component({
  selector: 'app-employee-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>👥 Employés</h1>
        <button class="btn btn-primary" (click)="createNew()">
          + Nouvel employé
        </button>
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
              <th>Nom</th>
              <th>Email</th>
              <th>Département</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let emp of employees">
              <td>
                <strong>{{ emp.first_name }} {{ emp.last_name }}</strong>
              </td>
              <td>{{ emp.email }}</td>
              <td>
                <span class="badge badge-primary">{{ emp.department }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn btn-sm btn-secondary" (click)="edit(emp)">
                    Modifier
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="delete(emp)">
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="employees.length === 0">
              <td colspan="4" class="text-center text-muted">
                Aucun employé trouvé
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = false;

  constructor(
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  createNew(): void {
    this.router.navigate(['/employees/new']);
  }

  edit(emp: Employee): void {
    this.router.navigate(['/employees/edit', emp.id]);
  }

  delete(emp: Employee): void {
    if (confirm(`Supprimer l'employé ${emp.first_name} ${emp.last_name} ?`)) {
      this.employeeService.deleteEmployee(emp.id!).subscribe(() => {
        this.loadEmployees();
      });
    }
  }
}
