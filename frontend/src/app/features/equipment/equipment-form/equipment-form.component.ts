import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EquipmentService } from '../../../core/services/equipment.service';
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
                        [class.invalid]="isInvalid('equipment_type')">
                  <option value="">Sélectionner un type</option>
                  <!-- ✅ Enums alignés avec le backend -->
                  <option *ngFor="let type of equipmentTypes" [value]="type">
                    {{ getTypeName(type) }}
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
                  <!-- ✅ Enums alignés avec le backend -->
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
                        [class.invalid]="isInvalid('status')">
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
  `]
})
export class EquipmentFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  equipmentId?: number;
  loading = false;
  error = '';

  // ✅ Enums alignés avec le backend
  equipmentTypes = Object.values(EquipmentType);
  conditions = Object.values(EquipmentCondition);
  statuses = Object.values(EquipmentStatus);

  constructor(
    private fb: FormBuilder,
    private equipmentService: EquipmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      serial_number: ['', Validators.required],
      model: ['', Validators.required],
      equipment_type: ['', Validators.required],
      condition: ['', Validators.required],
      status: ['', [Validators.required]]
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
      next: (eq) => { this.form.patchValue(eq); },
      error: () => { this.error = 'Erreur lors du chargement de l\'équipement'; }
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

    const request = this.isEditMode
      ? this.equipmentService.updateEquipment(this.equipmentId!, this.form.value)
      : this.equipmentService.createEquipment(this.form.value);

    request.subscribe({
      next: () => { this.router.navigate(['/equipment']); },
      error: (err) => {
        this.error = err.message || "Erreur lors de l'enregistrement";
        this.loading = false;
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  cancel(): void { this.router.navigate(['/equipment']); }

  // ✅ Méthodes d'affichage
  getTypeName(type: string): string {
    return EquipmentTypeLabels[type as EquipmentType] || type;
  }
  getConditionName(condition: string): string {
    return EquipmentConditionLabels[condition as EquipmentCondition] || condition;
  }
  getStatusName(status: string): string {
    return EquipmentStatusLabels[status as EquipmentStatus] || status;
  }
}
