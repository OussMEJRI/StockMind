import { Component, OnInit } from '@angular/core';
import { EquipmentService } from '../../core/services/equipment.service';
import { EmployeeService } from '../../core/services/employee.service';
import { LocationService } from '../../core/services/location.service';
import { Equipment, EquipmentStatus, EquipmentType } from '../../core/models/equipment.model';
import { Employee, Location } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <h1>📊 Tableau de bord</h1>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">💻</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalEquipment }}</div>
            <div class="stat-label">Équipements</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ availableEquipment }}</div>
            <div class="stat-label">Disponibles</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalEmployees }}</div>
            <div class="stat-label">Employés</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📍</div>
          <div class="stat-content">
            <div class="stat-value">{{ totalLocations }}</div>
            <div class="stat-label">Localisations</div>
          </div>
        </div>
      </div>
      
      <div class="nav-cards">
        <a routerLink="/equipment" class="nav-card">
          <span class="nav-icon">💻</span>
          <span class="nav-title">Équipements</span>
          <span class="nav-desc">Gérer le matériel IT</span>
        </a>
        <a routerLink="/employees" class="nav-card">
          <span class="nav-icon">👥</span>
          <span class="nav-title">Employés</span>
          <span class="nav-desc">Gérer les collaborateurs</span>
        </a>
        <a routerLink="/locations" class="nav-card">
          <span class="nav-icon">📍</span>
          <span class="nav-title">Localisations</span>
          <span class="nav-desc">Sites et bureaux</span>
        </a>
        <a routerLink="/chatbot" class="nav-card">
          <span class="nav-icon">🤖</span>
          <span class="nav-title">Chatbot</span>
          <span class="nav-desc">Assistant intelligent</span>
        </a>
      </div>
      
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h3>📈 Répartition par type</h3>
          </div>
          <div class="card-body">
            <div class="type-list">
              <div class="type-item" *ngFor="let type of equipmentByType">
                <span class="type-icon">{{ getTypeIcon(type.type) }}</span>
                <span class="type-name">{{ getTypeName(type.type) }}</span>
                <span class="type-count">{{ type.count }}</span>
              </div>
              <p *ngIf="equipmentByType.length === 0" class="text-muted text-center">
                Aucune donnée
              </p>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>🕐 Derniers équipements</h3>
          </div>
          <div class="card-body">
            <div class="recent-list">
              <div class="recent-item" *ngFor="let eq of recentEquipment">
                <div class="recent-info">
                  <strong>{{ eq.model }}</strong>
                  <span class="text-muted">{{ eq.serial_number }}</span>
                </div>
                <span class="badge" [ngClass]="getStatusBadge(eq.status)">
                  {{ getStatusName(eq.status) }}
                </span>
              </div>
              <p *ngIf="recentEquipment.length === 0" class="text-muted text-center">
                Aucun équipement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .stat-icon {
      font-size: 2.5rem;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
    }
    
    .stat-label {
      color: #666;
      font-size: 0.9rem;
    }
    
    .nav-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .nav-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      text-decoration: none;
      color: inherit;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .nav-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
    
    .nav-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    
    .nav-title {
      font-weight: 600;
      font-size: 1.1rem;
      color: #333;
    }
    
    .nav-desc {
      font-size: 0.85rem;
      color: #666;
      margin-top: 0.25rem;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    
    .type-list, .recent-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .type-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .type-icon {
      font-size: 1.5rem;
    }
    
    .type-name {
      flex: 1;
      font-weight: 500;
    }
    
    .type-count {
      font-weight: 700;
      color: #667eea;
    }
    
    .recent-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .recent-info {
      display: flex;
      flex-direction: column;
    }
    
    .recent-info span {
      font-size: 0.85rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalEquipment = 0;
  availableEquipment = 0;
  totalEmployees = 0;
  totalLocations = 0;
  
  equipmentByType: { type: EquipmentType; count: number }[] = [];
  recentEquipment: Equipment[] = [];

  constructor(
    private equipmentService: EquipmentService,
    private employeeService: EmployeeService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.equipmentService.getEquipment().subscribe(equipment => {
      this.totalEquipment = equipment.length;
      this.availableEquipment = equipment.filter(e => e.status === EquipmentStatus.IN_STOCK).length;
      this.recentEquipment = equipment.slice(0, 5);
      
      // Count by type
      const typeCount = new Map<EquipmentType, number>();
      equipment.forEach(e => {
        typeCount.set(e.equipment_type, (typeCount.get(e.equipment_type) || 0) + 1);
      });
      this.equipmentByType = Array.from(typeCount.entries()).map(([type, count]) => ({ type, count }));
    });
    
    this.employeeService.getEmployees().subscribe(employees => {
      this.totalEmployees = employees.length;
    });
    
    this.locationService.getLocations().subscribe(locations => {
      this.totalLocations = locations.length;
    });
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
      [EquipmentType.LAPTOP]: 'Laptops',
      [EquipmentType.MONITOR]: 'Écrans',
      [EquipmentType.PHONE]: 'Téléphones',
      [EquipmentType.ACCESSORY]: 'Accessoires'
    };
    return names[type] || type;
  }

  getStatusName(status: EquipmentStatus): string {
    return status === EquipmentStatus.IN_STOCK ? 'En stock' : 'Affecté';
  }

  getStatusBadge(status: EquipmentStatus): string {
    return status === EquipmentStatus.IN_STOCK ? 'badge-success' : 'badge-info';
  }
}
