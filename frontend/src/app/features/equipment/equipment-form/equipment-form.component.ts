import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EquipmentService } from '../../../core/services/equipment.service';
import { EquipmentType, EquipmentCondition, EquipmentStatus } from '../../../core/models/equipment.model';

@Component({
  selector: 'app-equipment-form',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>{{ isEditMode ? 'Modifier' : 'Nouvel' }} équipement</h1>
      </div>
      
      <div class="card">
        <div class="card-body">
          <div class="alert alert-danger" *ngIf="error">
            {{ error }}
          </div>
          
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Numéro de série *</label>
                <input type="text" class="form-control" formControlName="serial_number">
                <div class="error-message" *ngIf="form.get('serial_number')?.invalid && form.get('serial_number')?.touched">
                  Numéro de série requis
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">Modèle *</label>
                <input type="text" class="form-control" formControlName="model">
                <div class="error-message" *ngIf="form.get('model')?.invalid && form.get('model')?.touched">
                  Modèle requis
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Type *</label>
                <select class="form-control" formControlName="equipment_type">
                  <option value="">Sélectionner un type</option>
                  <option *ngFor="let type of equipmentTypes" [value]="type">
                    {{ getTypeName(type) }}
                  </option>
                </select>
                <div class="error-message" *ngIf="form.get('equipment_type')?.invalid && form.get('equipment_type')?.touched">
                  Type requis
                </div>
              </div>
              
              <div class="form-group">
                <label class="form-label">État *</label>
                <select class="form-control" formControlName="condition">
                  <option value="">Sélectionner un état</option>
                  <option *ngFor="let cond of conditions" [value]="cond">
                    {{ getConditionName(cond) }}
                  </option>
                </select>
                <div class="error-message" *ngIf="form.get('condition')?.invalid && form.get('condition')?.touched">
                  État requis
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Statut *</label>
                <select class="form-control" formControlName="status">
                  <option value="">Sélectionner un statut</option>
                  <option *ngFor="let stat of statuses" [value]="stat">
                    {{ getStatusName(stat) }}
                  </option>
                </select>
                <div class="error-message" *ngIf="form.get('status')?.invalid && form.get('status')?.touched">
                  Statut requis
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
export class EquipmentFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  equipmentId?: number;
  loading = false;
  error = '';
  
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
      status: ['', Validators.required]
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
      ? this.equipmentService.updateEquipment(this.equipmentId!, data)
      : this.equipmentService.createEquipment(data);
    
    request.subscribe({
      next: () => {
        this.router.navigate(['/equipment']);
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de l\'enregistrement';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/equipment']);
  }

  getTypeName(type: EquipmentType): string {
    const names: Record<EquipmentType, string> = {
      [EquipmentType.PC]: 'PC',
      [EquipmentType.LAPTOP]: 'Laptop',
      [EquipmentType.MONITOR]: 'Écran',
      [EquipmentType.PHONE]: 'Téléphone',
      [EquipmentType.ACCESSORY]: 'Accessoire'
    };
    return names[type] || type;
  }

  getConditionName(condition: EquipmentCondition): string {
    const names: Record<EquipmentCondition, string> = {
      [EquipmentCondition.NEW]: 'Neuf',
      [EquipmentCondition.USED]: 'Utilisé',
      [EquipmentCondition.OUT_OF_SERVICE]: 'Hors service'
    };
    return names[condition] || condition;
  }

  getStatusName(status: EquipmentStatus): string {
    return status === EquipmentStatus.IN_STOCK ? 'En stock' : 'Affecté';
  }
}
