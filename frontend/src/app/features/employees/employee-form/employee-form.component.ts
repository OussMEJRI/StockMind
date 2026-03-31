import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../../core/services/employee.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
                <label class="form-label">Nom complet *</label>
                <input type="text" class="form-control" formControlName="name" placeholder="ex: Jean Dupont">
                <div class="error-message" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
                  Nom complet requis
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input type="email" class="form-control" formControlName="email" placeholder="ex: jean.dupont@example.com">
                <div class="error-message" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
                  Email requis et valide
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">CUID</label>
                <input 
                  type="text" 
                  class="form-control" 
                  formControlName="cuid" 
                  placeholder="ex: ABCD1234" 
                  maxlength="8"
                  (input)="onCuidInput($event)"
                  style="text-transform: uppercase;">
                <small class="form-text">4 lettres MAJUSCULES + 4 chiffres (ex: ABCD1234)</small>
                <div class="error-message" *ngIf="form.get('cuid')?.invalid && form.get('cuid')?.touched">
                  Format invalide : 4 lettres MAJUSCULES + 4 chiffres
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Type de contrat</label>
                <select class="form-control" formControlName="contract_type">
                  <option value="">Sélectionner...</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="STAGIAIRE">STAGIAIRE</option>
                  <option value="EXTERNE">EXTERNE</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Département</label>
                <select class="form-control" formControlName="department">
                  <option value="">Sélectionner...</option>
                  <option value="BLI">BLI</option>
                  <option value="CCI">CCI</option>
                  <option value="DTSI">DTSI</option>
                  <option value="OBDS">OBDS</option>
                  <option value="OBS">OBS</option>
                  <option value="OIT">OIT</option>
                  <option value="OW">OW</option>
                  <option value="SAH">SAH</option>
                  <option value="SN3">SN3</option>
                  <option value="SUPPORT">SUPPORT</option>
                </select>
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
    
    .page-header {
      margin-bottom: 2rem;
    }
    
    .page-header h1 {
      margin: 0;
      color: #2c3e50;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .card-body {
      padding: 2rem;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #374151;
    }
    
    .form-control {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .form-text {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
    
    .error-message {
      color: #dc2626;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
    
    .alert {
      padding: 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }
    
    .alert-danger {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e0e0e0;
    }
    
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }
    
    .btn-primary {
      background-color: #6366f1;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #4f46e5;
    }
    
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background-color: #e5e7eb;
      color: #374151;
    }
    
    .btn-secondary:hover {
      background-color: #d1d5db;
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
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cuid: ['', [Validators.pattern(/^[A-Z]{4}\d{4}$/)]],
      contract_type: [''],
      department: ['']
    });
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.employeeId = +id;
      this.loadEmployee();
    }
  }

  onCuidInput(event: any): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();
    this.form.patchValue({ cuid: value }, { emitEvent: false });
  }

  loadEmployee(): void {
    this.employeeService.getEmployeeById(this.employeeId!).subscribe({
      next: (emp) => {
        this.form.patchValue(emp);
      },
      error: (err) => {
        this.error = this.formatError(err);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.error = 'Veuillez corriger les erreurs dans le formulaire';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    const data = { ...this.form.value };
    
    // Nettoyer les champs vides
    if (!data.cuid || data.cuid.trim() === '') delete data.cuid;
    if (!data.contract_type) delete data.contract_type;
    if (!data.department) delete data.department;
    
    const request = this.isEditMode
      ? this.employeeService.updateEmployee(this.employeeId!, data)
      : this.employeeService.createEmployee(data);
    
    request.subscribe({
      next: () => {
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.error = this.formatError(err);
        this.loading = false;
      }
    });
  }

  private formatError(err: any): string {
    console.error('Erreur complète:', err);
    
    // Erreur de validation FastAPI
    if (err.error?.detail) {
      if (Array.isArray(err.error.detail)) {
        return err.error.detail.map((e: any) => 
          `${e.loc?.join(' → ') || 'Erreur'}: ${e.msg}`
        ).join('\n');
      }
      if (typeof err.error.detail === 'string') {
        return err.error.detail;
      }
      return JSON.stringify(err.error.detail);
    }
    
    if (err.error?.message) {
      return err.error.message;
    }
    
    if (err.message) {
      return err.message;
    }
    
    return 'Une erreur est survenue lors de l\'enregistrement';
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
