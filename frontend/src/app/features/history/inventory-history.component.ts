import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InventoryHistoryService } from '../../core/services/inventory-history.service';
import { InventoryHistoryItem } from '../../core/models/inventory-history.model';
import {
  EquipmentStatus,
  EquipmentStatusLabels,
  EquipmentType,
  EquipmentTypeLabels
} from '../../core/models/equipment.model';

@Component({
  selector: 'app-inventory-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>🕓 Historique global</h1>
          <p class="subtitle">
            Toutes les actions de l’inventaire : création, affectation, désaffectation,
            changement de statut et mises à jour.
          </p>
        </div>

        <div class="header-actions">
          <button class="btn btn-secondary" (click)="resetFilters()">🔄 Réinitialiser</button>
          <button class="btn btn-primary" (click)="loadHistory()">↻ Actualiser</button>
        </div>
      </div>

      <div class="filters-card">
        <div class="filters-row">
          <div class="form-group search-group">
            <label>Recherche</label>
            <input
              type="text"
              [(ngModel)]="search"
              (keyup.enter)="loadHistory()"
              placeholder="Ex: TEST-API-001, Jean Dupont, assigned..."
            />
          </div>

          <div class="form-group">
            <label>Action</label>
            <select [(ngModel)]="selectedAction" (change)="loadHistory()">
              <option value="">Toutes les actions</option>
              <option *ngFor="let action of availableActions" [value]="action">
                {{ getActionLabel(action) }}
              </option>
            </select>
          </div>

          <button class="btn btn-secondary" (click)="loadHistory()">🔍 Rechercher</button>
        </div>
      </div>

      <div class="summary-row" *ngIf="!loading && history.length > 0">
        <div class="summary-card">
          <span class="summary-value">{{ history.length }}</span>
          <span class="summary-label">Lignes chargées</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ countByAction('created') }}</span>
          <span class="summary-label">Créations</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ countByAction('assigned') + countByAction('reassigned') }}</span>
          <span class="summary-label">Affectations / Réaffectations</span>
        </div>
        <div class="summary-card">
          <span class="summary-value">{{ countByAction('status_changed') }}</span>
          <span class="summary-label">Changements de statut</span>
        </div>
      </div>

      <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

      <div class="table-card">
        <div class="loading" *ngIf="loading">
          <div class="spinner"></div>
          Chargement de l’historique...
        </div>

        <table class="table" *ngIf="!loading && history.length > 0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Équipement</th>
              <th>Type</th>
              <th>Statut</th>
              <th>De</th>
              <th>Vers</th>
              <th>Acteur</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of history">
              <td class="date-cell">{{ formatDate(item.timestamp) }}</td>

              <td>
                <span class="badge" [ngClass]="getActionBadge(item.action)">
                  {{ getActionLabel(item.action) }}
                </span>
              </td>

              <td>
                <div class="equipment-cell">
                  <div class="serial" *ngIf="item.equipment_serial">{{ item.equipment_serial }}</div>
                  <div class="model">{{ item.equipment_model || '-' }}</div>
                </div>
              </td>

              <td>
                <span class="badge badge-type" *ngIf="item.equipment_type">
                  {{ getTypeLabel(item.equipment_type) }}
                </span>
                <span class="text-muted" *ngIf="!item.equipment_type">-</span>
              </td>

              <td>
                <span
                  class="badge"
                  [ngClass]="getStatusBadge(item.current_status)"
                  *ngIf="item.current_status"
                >
                  {{ getStatusLabel(item.current_status) }}
                </span>
                <span class="text-muted" *ngIf="!item.current_status">-</span>
              </td>

              <td>{{ item.from_location || '-' }}</td>
              <td>{{ item.to_location || '-' }}</td>

              <td>
                <div class="actor-cell" *ngIf="item.actor_name || item.actor_email; else noActor">
                  <div class="actor-name">{{ item.actor_name || '-' }}</div>
                  <div class="actor-email" *ngIf="item.actor_email">{{ item.actor_email }}</div>
                </div>
                <ng-template #noActor>
                  <span class="text-muted">-</span>
                </ng-template>
              </td>

              <td class="notes-cell">{{ item.notes || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="!loading && history.length === 0">
          📭 Aucun historique trouvé
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem 2rem;
      max-width: 1500px;
      margin: 0 auto;
      background: #0d1117;
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      margin: 0 0 0.4rem 0;
      font-size: 1.5rem;
      color: #e6edf3;
      font-weight: 700;
    }

    .subtitle {
      margin: 0;
      color: #8b949e;
      font-size: 0.95rem;
      line-height: 1.45;
    }

    .header-actions {
      display: flex;
      gap: 0.7rem;
      flex-wrap: wrap;
    }

    .filters-card,
    .table-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 14px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    }

    .filters-card {
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .filters-row {
      display: flex;
      gap: 0.9rem;
      align-items: end;
      flex-wrap: wrap;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 220px;
    }

    .search-group {
      min-width: 360px;
      flex: 1;
    }

    .form-group label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #8b949e;
    }

    .form-group input,
    .form-group select {
      background: #0d1117;
      color: #e6edf3;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 0.7rem 0.85rem;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-group input:focus,
    .form-group select:focus {
      border-color: #58a6ff;
      box-shadow: 0 0 0 3px rgba(88,166,255,0.12);
    }

    .summary-row {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.9rem;
      margin-bottom: 1rem;
    }

    .summary-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .summary-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: #e6edf3;
    }

    .summary-label {
      color: #8b949e;
      font-size: 0.85rem;
    }

    .table-card {
      overflow: hidden;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th {
      background: #0d1117;
      color: #8b949e;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-align: left;
      padding: 14px 16px;
      border-bottom: 1px solid #30363d;
      white-space: nowrap;
    }

    .table td {
      padding: 14px 16px;
      border-bottom: 1px solid #21262d;
      color: #e6edf3;
      font-size: 0.9rem;
      vertical-align: top;
    }

    .table tr:hover td {
      background: #1c2128;
    }

    .table tr:last-child td {
      border-bottom: none;
    }

    .equipment-cell .serial {
      font-family: monospace;
      font-size: 0.84rem;
      color: #58a6ff;
      margin-bottom: 0.2rem;
    }

    .equipment-cell .model {
      color: #c9d1d9;
      font-weight: 500;
    }

    .actor-name {
      color: #e6edf3;
      font-weight: 600;
      margin-bottom: 0.2rem;
    }

    .actor-email {
      color: #8b949e;
      font-size: 0.78rem;
    }

    .date-cell,
    .notes-cell {
      white-space: nowrap;
    }

    .notes-cell {
      max-width: 360px;
      white-space: normal;
      line-height: 1.45;
      color: #c9d1d9;
    }

    .text-muted {
      color: #8b949e;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.36rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .badge-created {
      background: rgba(88,166,255,0.15);
      color: #58a6ff;
      border-color: rgba(88,166,255,0.35);
    }

    .badge-assigned {
      background: rgba(57,211,83,0.14);
      color: #39d353;
      border-color: rgba(57,211,83,0.3);
    }

    .badge-unassigned {
      background: rgba(245,158,11,0.14);
      color: #f59e0b;
      border-color: rgba(245,158,11,0.3);
    }

    .badge-reassigned {
      background: rgba(188,140,255,0.14);
      color: #bc8cff;
      border-color: rgba(188,140,255,0.3);
    }

    .badge-status {
      background: rgba(248,81,73,0.14);
      color: #f85149;
      border-color: rgba(248,81,73,0.3);
    }

    .badge-condition {
      background: rgba(34,197,94,0.14);
      color: #22c55e;
      border-color: rgba(34,197,94,0.3);
    }

    .badge-updated {
      background: rgba(139,148,158,0.14);
      color: #8b949e;
      border-color: rgba(139,148,158,0.3);
    }

    .badge-type {
      background: rgba(88,166,255,0.14);
      color: #c9d1d9;
      border-color: rgba(88,166,255,0.28);
    }

    .badge-status-in-stock {
      background: rgba(57,211,83,0.14);
      color: #39d353;
      border-color: rgba(57,211,83,0.3);
    }

    .badge-status-assigned {
      background: rgba(56,139,253,0.14);
      color: #58a6ff;
      border-color: rgba(56,139,253,0.3);
    }

    .badge-status-maintenance {
      background: rgba(245,158,11,0.14);
      color: #f59e0b;
      border-color: rgba(245,158,11,0.3);
    }

    .badge-status-stolen {
      background: rgba(248,81,73,0.14);
      color: #f85149;
      border-color: rgba(248,81,73,0.3);
    }

    .loading,
    .empty-state {
      padding: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      color: #8b949e;
    }

    .spinner {
      width: 22px;
      height: 22px;
      border: 3px solid #30363d;
      border-top-color: #58a6ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 1rem;
      border: 1px solid transparent;
    }

    .alert-danger {
      background: rgba(248,81,73,0.1);
      color: #f85149;
      border-color: rgba(248,81,73,0.25);
    }

    .btn {
      padding: 0.7rem 1rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.92rem;
      font-weight: 600;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-primary {
      background: rgba(57,211,83,0.12);
      border: 1px solid rgba(57,211,83,0.28);
      color: #39d353;
    }

    .btn-primary:hover {
      background: rgba(57,211,83,0.2);
    }

    .btn-secondary {
      background: rgba(56,139,253,0.12);
      border: 1px solid rgba(56,139,253,0.28);
      color: #58a6ff;
    }

    .btn-secondary:hover {
      background: rgba(56,139,253,0.2);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1200px) {
      .summary-row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 992px) {
      .page-container {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .filters-row {
        align-items: stretch;
      }

      .form-group,
      .search-group {
        min-width: 100%;
      }

      .table-card {
        overflow-x: auto;
      }
    }

    :host-context(body.light-theme) .page-container {
      background: #f6f8fa;
    }

    :host-context(body.light-theme) .page-header h1,
    :host-context(body.light-theme) .summary-value,
    :host-context(body.light-theme) .table td,
    :host-context(body.light-theme) .equipment-cell .model,
    :host-context(body.light-theme) .actor-name {
      color: #111827;
    }

    :host-context(body.light-theme) .subtitle,
    :host-context(body.light-theme) .summary-label,
    :host-context(body.light-theme) .actor-email,
    :host-context(body.light-theme) .text-muted {
      color: #475467;
    }

    :host-context(body.light-theme) .filters-card,
    :host-context(body.light-theme) .summary-card,
    :host-context(body.light-theme) .table-card {
      background: #ffffff;
      border-color: #e5e7eb;
      box-shadow: none;
    }

    :host-context(body.light-theme) .form-group input,
    :host-context(body.light-theme) .form-group select {
      background: #ffffff;
      color: #111827;
      border-color: #d0d5dd;
    }

    :host-context(body.light-theme) .table th {
      background: #f9fafb;
      color: #344054;
      border-bottom-color: #e5e7eb;
    }

    :host-context(body.light-theme) .table td {
      border-bottom-color: #e5e7eb;
    }

    :host-context(body.light-theme) .table tr:hover td {
      background: #f9fafb;
    }
  `]
})
export class InventoryHistoryComponent implements OnInit {
  history: InventoryHistoryItem[] = [];
  loading = false;
  error = '';

  search = '';
  selectedAction = '';

  readonly availableActions = [
    'created',
    'assigned',
    'unassigned',
    'reassigned',
    'status_changed',
    'condition_changed',
    'updated'
  ];

  constructor(
    private historyService: InventoryHistoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.error = '';

    this.historyService.getHistory({
      skip: 0,
      limit: 200,
      search: this.search?.trim() || undefined,
      action: this.selectedAction || undefined
    }).subscribe({
      next: (data) => {
        this.history = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Erreur lors du chargement de l’historique';
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.search = '';
    this.selectedAction = '';
    this.loadHistory();
  }

  countByAction(action: string): number {
    return this.history.filter(item => item.action === action).length;
  }

  getActionLabel(action: string): string {
    const map: Record<string, string> = {
      created: 'Création',
      assigned: 'Affectation',
      unassigned: 'Désaffectation',
      reassigned: 'Réaffectation',
      status_changed: 'Changement statut',
      condition_changed: 'Changement état',
      updated: 'Mise à jour'
    };
    return map[action] || action;
  }

  getActionBadge(action: string): string {
    const map: Record<string, string> = {
      created: 'badge-created',
      assigned: 'badge-assigned',
      unassigned: 'badge-unassigned',
      reassigned: 'badge-reassigned',
      status_changed: 'badge-status',
      condition_changed: 'badge-condition',
      updated: 'badge-updated'
    };
    return map[action] || 'badge-updated';
  }

  getTypeLabel(type: string | null | undefined): string {
    if (!type) return '-';
    return EquipmentTypeLabels[type as EquipmentType] || type;
  }

  getStatusLabel(status: string | null | undefined): string {
    if (!status) return '-';
    return EquipmentStatusLabels[status as EquipmentStatus] || status;
  }

  getStatusBadge(status: string | null | undefined): string {
    const map: Record<string, string> = {
      [EquipmentStatus.IN_STOCK]: 'badge-status-in-stock',
      [EquipmentStatus.ASSIGNED]: 'badge-status-assigned',
      [EquipmentStatus.MAINTENANCE]: 'badge-status-maintenance',
      [EquipmentStatus.STOLEN]: 'badge-status-stolen'
    };
    return status ? (map[status] || 'badge-updated') : 'badge-updated';
  }

  formatDate(value: string): string {
    if (!value) return '-';
    return new Date(value).toLocaleString('fr-FR');
  }
}