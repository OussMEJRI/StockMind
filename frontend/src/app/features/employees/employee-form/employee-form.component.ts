import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ isEditMode ? 'Modifier' : 'Nouvel' }} employé</h1>
      </div>
      
      <div class="card">
        <div class="card-body">
          <div class="alert alert-danger" *ngIf="error">
            {{ error }}
          </div>
          
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Prénom *</label>
                <input type="text" class="form-control" formControlName="first_name">
                <div class="error-message" *ngIf="form.get('first_name')?.invalid && form.get('first_name')?.touched">
                  Prénom requis
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Nom *</label>
                <input type="text" class="form-control" formControlName="last_name">
                <div class="error-message" *ngIf="form.get('last_name')?.invalid && form.get('last_name')?.touched">
                  Nom requis
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input type="email" class="form-control" formControlName="email">
                <div class="error-message" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
                  Email requis et valide
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Département *</label>
                <input type="text" class="form-control" formControlName="department" placeholder="ex: Informatique, RH, Finance...">
                <div class="error-message" *ngIf="form.get('department')?.invalid && form.get('department')?.touched">
                  Département requis
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="cancel()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
                {{ loading ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  employeeId?: number;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required]
    });
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.employeeId = +id;
      this.loadEmployee();
    }
  }

  loadEmployee(): void {
    this.employeeService.getEmployeeById(this.employeeId!).subscribe({
      next: (emp) => {
        this.form.patchValue(emp);
      },
      error: () => {
        this.error = 'Erreur lors du chargement';
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    
    this.loading = true;
    this.error = '';
    
    const data = this.form.value;
    
    const request = this.isEditMode
      ? this.employeeService.updateEmployee(this.employeeId!, data)
      : this.employeeService.createEmployee(data);
    
    request.subscribe({
      next: () => {
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de l\'enregistrement';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
