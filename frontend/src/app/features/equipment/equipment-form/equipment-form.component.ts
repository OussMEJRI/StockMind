import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EquipmentService } from '../../../core/services/equipment.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { EmplacementService } from '../../../core/services/emplacement.service';
import { Employee } from '../../../core/models/employee.model';
import { Emplacement } from '../../../core/models/emplacement.model';
import {
  EquipmentType,
  EquipmentCondition,
  EquipmentStatus,
  EquipmentTypeLabels,
  EquipmentConditionLabels,
  EquipmentStatusLabels
} from '../../../core/models/equipment.model';

@Component({
  selector: 'app-equipment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ isEditMode ? '✏️ Modifier' : '➕ Nouvel' }} équipement</h1>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <!-- Numéro de série -->
              <div class="form-group">
                <label>Numéro de série <span class="required">*</span></label>
                <input type="text" formControlName="serial_number"
                       placeholder="Ex: SN-2024-001"
                       [class.invalid]="isInvalid('serial_number')">
                <div class="error-msg" *ngIf="isInvalid('serial_number')">
                  Numéro de série requis
                </div>
              </div>

              <!-- Modèle -->
              <div class="form-group">
                <label>Modèle <span class="required">*</span></label>
                <input type="text" formControlName="model"
                       placeholder="Ex: Dell Latitude 5520"
                       [class.invalid]="isInvalid('model')">
                <div class="error-msg" *ngIf="isInvalid('model')">
                  Modèle requis
                </div>
              </div>
            </div>

            <div class="form-row">
              <!-- Type -->
              <div class="form-group">
                <label>Type <span class="required">*</span></label>
                <select formControlName="equipment_type"
                        [class.invalid]="isInvalid('equipment_type')"
                        (change)="onTypeChange()">
                  <option value="">Sélectionner un type</option>
                  <option *ngFor="let type of equipmentTypes" [value]="type">
                    {{ getTypeIcon(type) }} {{ getTypeName(type) }}
                  </option>
                </select>
                <div class="error-msg" *ngIf="isInvalid('equipment_type')">
                  Type requis
                </div>
              </div>

              <!-- État -->
              <div class="form-group">
                <label>État <span class="required">*</span></label>
                <select formControlName="condition"
                        [class.invalid]="isInvalid('condition')">
                  <option value="">Sélectionner un état</option>
                  <option *ngFor="let cond of conditions" [value]="cond">
                    {{ getConditionName(cond) }}
                  </option>
                </select>
                <div class="error-msg" *ngIf="isInvalid('condition')">
                  État requis
                </div>
              </div>

              <!-- Statut -->
              <div class="form-group">
                <label>Statut <span class="required">*</span></label>
                <select formControlName="status"
                        [class.invalid]="isInvalid('status')"
                        (change)="onStatusChange()">
                  <option value="">Sélectionner un statut</option>
                  <option *ngFor="let stat of statuses" [value]="stat">
                    {{ getStatusName(stat) }}
                  </option>
                </select>
                <div class="error-msg" *ngIf="isInvalid('status')">
                  Statut requis
                </div>
              </div>
            </div>

            <!-- ✅ SECTION ASSIGNATION — visible uniquement si statut = ASSIGNED -->
            <div class="assignment-section" *ngIf="isAssigned">

              <!-- CAS 1 : LAPTOP → Assignation à un employé -->
              <div *ngIf="isLaptop" class="assignment-card employee-card">
                <div class="assignment-header">
                  <span class="assignment-icon">👤</span>
                  <div>
                    <h3>Assignation à un employé</h3>
                    <p>Les laptops sont assignés directement à un employé</p>
                  </div>
                </div>

                <div class="form-group">
                  <label>Employé <span class="required">*</span></label>

                  <!-- Chargement -->
                  <div *ngIf="loadingEmployees" class="loading-inline">
                    <span class="spinner-sm"></span> Chargement des employés...
                  </div>

                  <!-- Select employé -->
                  <select *ngIf="!loadingEmployees"
                          formControlName="employee_id"
                          [class.invalid]="isInvalid('employee_id')">
                    <option value="">-- Sélectionner un employé --</option>
                    <option *ngFor="let emp of employees" [value]="emp.id">
                      {{ emp.name }}
                      <ng-container *ngIf="emp.department"> — {{ emp.department }}</ng-container>
                      <ng-container *ngIf="emp.cuid"> ({{ emp.cuid }})</ng-container>
                    </option>
                  </select>
                  <div class="error-msg" *ngIf="isInvalid('employee_id')">
                    Veuillez sélectionner un employé
                  </div>
                </div>
              </div>

              <!-- CAS 2 : Autres types → Assignation à un emplacement -->
              <div *ngIf="!isLaptop" class="assignment-card emplacement-card">
                <div class="assignment-header">
                  <span class="assignment-icon">📍</span>
                  <div>
                    <h3>Assignation à un emplacement</h3>
                    <p>Sélectionnez la rosace où sera installé cet équipement</p>
                  </div>
                </div>

                <div class="form-group">
                  <label>Emplacement (Rosace) <span class="required">*</span></label>

                  <!-- Chargement -->
                  <div *ngIf="loadingEmplacements" class="loading-inline">
                    <span class="spinner-sm"></span> Chargement des emplacements...
                  </div>

                  <!-- Select emplacement -->
                  <select *ngIf="!loadingEmplacements"
                          formControlName="emplacement_id"
                          [class.invalid]="isInvalid('emplacement_id')">
                    <option value="">-- Sélectionner un emplacement --</option>
                    <optgroup *ngFor="let site of emplacementsBySite | keyvalue" [label]="'🏢 ' + site.key">
                      <option *ngFor="let emp of site.value" [value]="emp.id">
                        {{ emp.etage }} — Rosace {{ emp.rosace }}
                        <ng-container *ngIf="emp.exact_position"> ({{ emp.exact_position }})</ng-container>
                      </option>
                    </optgroup>
                  </select>
                  <div class="error-msg" *ngIf="isInvalid('emplacement_id')">
                    Veuillez sélectionner un emplacement
                  </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="cancel()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary"
                      [disabled]="form.invalid || loading">
                {{ loading ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 900px; margin: 0 auto; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; color: #2c3e50; }

    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .card-body { padding: 2rem; }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-weight: 500; color: #555; font-size: 0.9rem; }

    input, select {
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.2s;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }
    input.invalid, select.invalid { border-color: #dc3545; }

    .required { color: #dc3545; }
    .error-msg { font-size: 0.8rem; color: #dc3545; }

    /* ===== SECTION ASSIGNATION ===== */
    .assignment-section {
      margin-bottom: 1.5rem;
      animation: fadeIn 0.3s ease;
    }

    .assignment-card {
      border-radius: 10px;
      padding: 1.5rem;
      border: 2px solid transparent;
    }

    .employee-card {
      background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
      border-color: #667eea;
    }

    .emplacement-card {
      background: linear-gradient(135deg, #f0fff4 0%, #e8f8ee 100%);
      border-color: #48bb78;
    }

    .assignment-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.2rem;
    }

    .assignment-icon {
      font-size: 2rem;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .assignment-header h3 {
      margin: 0 0 4px 0;
      font-size: 1rem;
      color: #2d3748;
    }

    .assignment-header p {
      margin: 0;
      font-size: 0.82rem;
      color: #718096;
    }

    .loading-inline {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #718096;
      font-size: 0.9rem;
      padding: 10px 0;
    }

    .spinner-sm {
      width: 16px;
      height: 16px;
      border: 2px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
    }
    .btn-primary { background: #667eea; color: white; }
    .btn-primary:hover:not(:disabled) { background: #5568d3; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-secondary:hover { background: #5a6268; }

    .alert { padding: 1rem; border-radius: 6px; margin-bottom: 1rem; }
    .alert-danger { background: #f8d7da; color: #721c24; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class EquipmentFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  equipmentId?: number;
  loading = false;
  error = '';

  equipmentTypes = Object.values(EquipmentType);
  conditions     = Object.values(EquipmentCondition);
  statuses       = Object.values(EquipmentStatus);

  // Données pour l'assignation
  employees: Employee[] = [];
  emplacements: Emplacement[] = [];
  emplacementsBySite: Record<string, Emplacement[]> = {};
  loadingEmployees   = false;
  loadingEmplacements = false;

  // États réactifs
  get isAssigned(): boolean {
    return this.form?.get('status')?.value === EquipmentStatus.ASSIGNED;
  }

  get isLaptop(): boolean {
    return this.form?.get('equipment_type')?.value === EquipmentType.LAPTOP;
  }

  constructor(
    private fb: FormBuilder,
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService,
    private emplacementService: EmplacementService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      serial_number:  ['', Validators.required],
      model:          ['', Validators.required],
      equipment_type: ['', Validators.required],
      condition:      ['', Validators.required],
      status:         [EquipmentStatus.IN_STOCK, Validators.required],
      employee_id:    [null],
      emplacement_id: [null]
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.equipmentId = +id;
      this.loadEquipment();
    }
  }

  loadEquipment(): void {
    this.equipmentService.getEquipmentById(this.equipmentId!).subscribe({
      next: (eq) => {
        this.form.patchValue(eq);
        // Si déjà assigné, charger les listes
        if (eq.status === EquipmentStatus.ASSIGNED) {
          this.loadAssignmentData();
        }
      },
      error: () => { this.error = "Erreur lors du chargement de l'équipement"; }
    });
  }

  onStatusChange(): void {
    if (this.isAssigned) {
      this.loadAssignmentData();
    } else {
      // Réinitialiser les champs d'assignation
      this.form.patchValue({ employee_id: null, emplacement_id: null });
    }
  }

  onTypeChange(): void {
    // Réinitialiser les champs d'assignation si on change de type
    this.form.patchValue({ employee_id: null, emplacement_id: null });
    // Recharger si déjà en mode assigné
    if (this.isAssigned) {
      this.loadAssignmentData();
    }
  }

  loadAssignmentData(): void {
    if (this.isLaptop) {
      this.loadEmployees();
    } else {
      this.loadEmplacements();
    }
  }

  loadEmployees(): void {
    if (this.employees.length > 0) return; // déjà chargés
    this.loadingEmployees = true;
    this.employeeService.getEmployees(0, 500).subscribe({
      next: (data) => {
        this.employees = data;
        this.loadingEmployees = false;
      },
      error: () => { this.loadingEmployees = false; }
    });
  }

  loadEmplacements(): void {
    if (this.emplacements.length > 0) return; // déjà chargés
    this.loadingEmplacements = true;
    this.emplacementService.getEmplacements(0, 500).subscribe({
      next: (data) => {
        this.emplacements = data;
        // Grouper par site
        this.emplacementsBySite = data.reduce((acc, emp) => {
          if (!acc[emp.site]) acc[emp.site] = [];
          acc[emp.site].push(emp);
          return acc;
        }, {} as Record<string, Emplacement[]>);
        this.loadingEmplacements = false;
      },
      error: () => { this.loadingEmplacements = false; }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(k =>
        this.form.get(k)?.markAsTouched()
      );
      return;
    }

    this.loading = true;
    this.error = '';

    const formValue = { ...this.form.value };

    // Nettoyer les champs non utilisés selon le type
    if (formValue.status !== EquipmentStatus.ASSIGNED) {
      formValue.employee_id   = null;
      formValue.emplacement_id = null;
    } else if (this.isLaptop) {
      formValue.emplacement_id = null;
    } else {
      formValue.employee_id = null;
    }

    const request = this.isEditMode
      ? this.equipmentService.updateEquipment(this.equipmentId!, formValue)
      : this.equipmentService.createEquipment(formValue);

    request.subscribe({
      next: () => { this.router.navigate(['/equipment']); },
      error: (err) => {
        const detail = err?.error?.detail;
        if (typeof detail === 'string') {
          this.error = detail;
        } else if (Array.isArray(detail)) {
          this.error = detail.map((d: any) => d?.msg || JSON.stringify(d)).join(' | ');
        } else {
          this.error = "Erreur lors de l'enregistrement";
        }
        this.loading = false;
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  cancel(): void { this.router.navigate(['/equipment']); }

  getTypeName(type: string): string {
    return EquipmentTypeLabels[type as EquipmentType] || type;
  }
  getConditionName(condition: string): string {
    return EquipmentConditionLabels[condition as EquipmentCondition] || condition;
  }
  getStatusName(status: string): string {
    return EquipmentStatusLabels[status as EquipmentStatus] || status;
  }
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'LAPTOP': '💻', 'PC': '🖥️', 'MONITOR': '🖵',
      'PHONE': '📱', 'ACCESSORY': '🔌'
    };
    return icons[type] || '📦';
  }
}
