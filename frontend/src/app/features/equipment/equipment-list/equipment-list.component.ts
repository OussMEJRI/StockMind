import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EquipmentService } from '../../../core/services/equipment.service';
import { Equipment, EquipmentType, EquipmentStatus, EquipmentCondition } from '../../../core/models/equipment.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-equipment-list',
  template: `
<div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
  <h1>💻 Équipements</h1>
  <div class="button-group">
    <button class="btn btn-primary" (click)="createNew()">
      + Nouvel équipement
    </button>
    <label class="btn btn-primary cursor-pointer" style="margin-left: 1rem;">
      📤 Importer Excel
      <input type="file" accept=".xlsx,.xls" hidden (change)="onFileSelected($event)" />
    </label>
  </div>
</div>

<div class="filters card">
  <div class="card-body">
    <div class="filter-row">
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-control" [(ngModel)]="filterType" (change)="loadEquipment()">
          <option value="">Tous</option>
          <option *ngFor="let type of equipmentTypes" [value]="type">
            {{ getTypeName(type) }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Statut</label>
        <select class="form-control" [(ngModel)]="filterStatus" (change)="loadEquipment()">
          <option value="">Tous</option>
          <option value="in_stock">En stock</option>
          <option value="assigned">Affecté</option>
        </select>
      </div>
    </div>
  </div>
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
        <th>N° Série</th>
        <th>Modèle</th>
        <th>Type</th>
        <th>État</th>
        <th>Statut</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let eq of equipment">
        <td><code>{{ eq.serial_number }}</code></td>
        <td>{{ eq.model }}</td>
        <td>
          <span class="type-badge">
            {{ getTypeIcon(eq.equipment_type) }} {{ getTypeName(eq.equipment_type) }}
          </span>
        </td>
        <td>
          <span class="badge" [ngClass]="getConditionBadge(eq.condition)">
            {{ getConditionName(eq.condition) }}
          </span>
        </td>
        <td>
          <span class="badge" [ngClass]="getStatusBadge(eq.status)">
            {{ getStatusName(eq.status) }}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-secondary" (click)="edit(eq)">Modifier</button>
            <button class="btn btn-sm btn-danger" (click)="delete(eq)">Supprimer</button>
          </div>
        </td>
      </tr>
      <tr *ngIf="equipment.length === 0">
        <td colspan="6" class="text-center text-muted">
          Aucun équipement trouvé
        </td>
      </tr>
    </tbody>
  </table>

  <div *ngIf="importing" class="loading">
    <div class="spinner"></div>
    Import en cours...
  </div>
</div>
  `,
  styles: [`
.page-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.filters { margin-bottom: 1.5rem; }
.filter-row { display: flex; gap: 1rem; }
.filter-row .form-group { flex: 1; max-width: 200px; margin-bottom: 0; }
.type-badge { display: inline-flex; align-items: center; gap: 0.25rem; }
.action-buttons { display: flex; gap: 0.5rem; }
code { background: #f4f4f4; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.85rem; }
  `]
})
export class EquipmentListComponent implements OnInit {
  equipment: Equipment[] = [];
  loading = false;
  importing = false;

  filterType = '';
  filterStatus = '';
  equipmentTypes = Object.values(EquipmentType);

  constructor(
    private equipmentService: EquipmentService,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEquipment();
  }

  loadEquipment(): void {
    this.loading = true;
    const filters: any = {};
    if (this.filterType) filters.equipment_type = this.filterType;
    if (this.filterStatus) filters.status = this.filterStatus;

    this.equipmentService.getEquipment(filters).subscribe({
      next: (data) => {
        this.equipment = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.xlsx$|\.xls$/)) {
      alert('Veuillez sélectionner un fichier Excel valide.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = this.authService.getToken();
    if (!token) {
      alert('Vous devez être connecté pour importer.');
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.importing = true;
    this.http.post('/api/v1/equipment/import', formData, { headers }).subscribe({
      next: () => {
        alert('Import réussi ✅');
        this.loadEquipment();
        this.importing = false;
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l\'import ❌');
        this.importing = false;
      }
    });
  }

  createNew(): void { this.router.navigate(['/equipment/new']); }

  edit(eq: Equipment): void { this.router.navigate(['/equipment/edit', eq.id]); }

  delete(eq: Equipment): void {
    if (confirm(`Supprimer l'équipement ${eq.serial_number} ?`)) {
      this.equipmentService.deleteEquipment(eq.id!).subscribe(() => this.loadEquipment());
    }
  }

  getTypeIcon(type: EquipmentType): string {
    const icons: Record<EquipmentType, string> = {
      [EquipmentType.PC]: '🖥️',
      [EquipmentType.LAPTOP]: '💻',
      [EquipmentType.MONITOR]: '🖵',
      [EquipmentType.PHONE]: '📱',
      [EquipmentType.ACCESSORY]: '🔌'
    };
    return icons[type] || '📦';
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

  getConditionBadge(condition: EquipmentCondition): string {
    const badges: Record<EquipmentCondition, string> = {
      [EquipmentCondition.NEW]: 'badge-success',
      [EquipmentCondition.USED]: 'badge-warning',
      [EquipmentCondition.OUT_OF_SERVICE]: 'badge-danger'
    };
    return badges[condition] || 'badge-info';
  }

  getStatusName(status: EquipmentStatus): string {
    return status === EquipmentStatus.IN_STOCK ? 'En stock' : 'Affecté';
  }

  getStatusBadge(status: EquipmentStatus): string {
    return status === EquipmentStatus.IN_STOCK ? 'badge-success' : 'badge-info';
  }
}