import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, ChangeDetectorRef, NgZone
} from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { EquipmentService } from '../../core/services/equipment.service';
import { EmployeeService } from '../../core/services/employee.service';
import { EmplacementService } from '../../core/services/emplacement.service';
import { Equipment, EquipmentStatus } from '../../core/models/equipment.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  template: `
<div class="dash-wrap">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar-section">
      <div class="section-label">CATÉGORIES</div>
      <div class="sidebar-item" *ngFor="let cat of categories"
           [class.active]="activeCat === cat.key"
           (click)="activeCat = cat.key">
        <span>{{ cat.icon }}</span>
        <span class="item-label">{{ cat.label }}</span>
        <span class="item-badge" [style.background]="cat.color+'22'" [style.color]="cat.color">
          {{ cat.count }}
        </span>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="section-label">STATUTS</div>
      <div class="sidebar-item" *ngFor="let st of statutsList">
        <span class="dot" [style.background]="st.color"></span>
        <span class="item-label">{{ st.label }}</span>
        <span class="item-badge" [style.background]="st.color+'22'" [style.color]="st.color">
          {{ st.count }}
        </span>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="section-label">NAVIGATION</div>
      <div class="sidebar-item" (click)="go('/equipment')">
        <span>⚙️</span><span class="item-label">Équipements</span>
      </div>
      <div class="sidebar-item" (click)="go('/employees')">
        <span>👥</span><span class="item-label">Employés</span>
        <span class="item-badge">{{ totalEmployees }}</span>
      </div>
      <div class="sidebar-item" (click)="go('/emplacements')">
        <span>🏢</span><span class="item-label">Emplacements</span>
        <span class="item-badge">{{ totalEmplacements }}</span>
      </div>
      <div class="sidebar-item" (click)="go('/carbon')">
        <span>🌱</span><span class="item-label">Empreinte Carbone</span>
      </div>
    </div>
  </aside>

  <!-- MAIN -->
  <main class="main">

    <div class="topbar">
      <div>
        <h1 class="title">📊 Vue d'ensemble IT</h1>
        <p class="subtitle" *ngIf="!loading">
          <strong>{{ totalEquipments }}</strong> équipements &nbsp;·&nbsp;
          <strong>{{ totalEmployees }}</strong> employés &nbsp;·&nbsp;
          <strong>{{ totalEmplacements }}</strong> emplacements
        </p>
      </div>
      <div class="topbar-right">
        <button class="btn btn-outline" (click)="go('/equipment/new')">＋ Ajouter</button>
        <button class="btn btn-green" (click)="reload()" [disabled]="loading">↻ Actualiser</button>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading-state" *ngIf="loading">
      <div class="spinner"></div>
      <span>Chargement...</span>
    </div>

    <ng-container *ngIf="!loading">

      <!-- KPI -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">ÉQUIPEMENTS</div>
          <div class="kpi-val">{{ totalEquipments }}</div>
        </div>
        <div class="kpi-card border-green">
          <div class="kpi-label">ASSIGNÉS</div>
          <div class="kpi-val">{{ assignes }}</div>
          <div class="kpi-sub" style="color:#39d353">{{ assignesPct }}% du parc</div>
        </div>
        <div class="kpi-card border-blue">
          <div class="kpi-label">EN STOCK</div>
          <div class="kpi-val">{{ enStock }}</div>
        </div>
        <div class="kpi-card border-orange">
          <div class="kpi-label">MAINTENANCE</div>
          <div class="kpi-val">{{ enMaintenance }}</div>
          <div class="kpi-sub" [style.color]="enMaintenance>0?'#e3b341':'#39d353'">
            {{ enMaintenance > 0 ? '⚠ Action requise' : '✅ Aucune' }}
          </div>
        </div>
        <div class="kpi-card border-red">
          <div class="kpi-label">RETIRÉS</div>
          <div class="kpi-val">{{ retires }}</div>
        </div>
        <div class="kpi-card border-purple">
          <div class="kpi-label">EMPLOYÉS</div>
          <div class="kpi-val">{{ totalEmployees }}</div>
        </div>
        <div class="kpi-card border-teal">
          <div class="kpi-label">EMPLACEMENTS</div>
          <div class="kpi-val">{{ totalEmplacements }}</div>
        </div>
        <div class="kpi-card border-yellow">
          <div class="kpi-label">TAUX ASSIGNATION</div>
          <div class="kpi-val">{{ assignesPct }}<span class="kpi-unit">%</span></div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">🍩 Par type</div>
          <div class="chart-body"><canvas #donutChart></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">📊 Statuts par type</div>
          <div class="chart-body"><canvas #barChart></canvas></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">🔍 État</div>
          <div class="chart-body"><canvas #condChart></canvas></div>
        </div>
      </div>

      <!-- Tableau -->
      <div class="table-card">
        <div class="table-header">
          <span>💻 Derniers équipements</span>
          <button class="btn-link" (click)="go('/equipment')">Voir tout →</button>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>N° SÉRIE</th><th>MODÈLE</th><th>TYPE</th>
                <th>STATUT</th><th>ÉTAT</th><th>EMPLOYÉ</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let eq of recentEquipments">
                <td><code>{{ eq.serial_number || '-' }}</code></td>
                <td><strong>{{ eq.model || '-' }}</strong></td>
                <td>
                  <span class="badge-type">
                    {{ getTypeIcon(eq.equipment_type) }} {{ getTypeLabel(eq.equipment_type) }}
                  </span>
                </td>
                <td>
                  <span class="badge-pill"
                    [style.background]="getStatusColor(eq.status)+'22'"
                    [style.color]="getStatusColor(eq.status)">
                    {{ getStatusLabel(eq.status) }}
                  </span>
                </td>
                <td>
                  <span class="badge-pill"
                    [style.background]="getCondColor(eq.condition)+'22'"
                    [style.color]="getCondColor(eq.condition)">
                    {{ getCondLabel(eq.condition) }}
                  </span>
                </td>
                <td>{{ eq.employee?.name || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </ng-container>
  </main>
</div>
  `,
  styles: [`
    .dash-wrap {
      display: flex;
      min-height: calc(100vh - 60px);
      background: #0d1117;
    }

    /* Sidebar — dans le flux, pas fixed */
    .sidebar {
      width: 195px;
      min-width: 195px;
      flex-shrink: 0;
      background: #0d1117;
      border-right: 1px solid #21262d;
      padding: 1rem 0;
      overflow-y: auto;
    }
    .sidebar-section { margin-bottom: 1.2rem; }
    .section-label {
      font-size: 0.6rem; font-weight: 700; color: #484f58;
      letter-spacing: 1px; padding: 0 1rem 0.4rem;
      text-transform: uppercase;
    }
    .sidebar-item {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.38rem 1rem; cursor: pointer;
      font-size: 0.8rem; color: #8b949e; transition: all 0.15s;
    }
    .sidebar-item:hover, .sidebar-item.active {
      background: #161b22; color: #e6edf3;
    }
    .item-label { flex: 1; }
    .item-badge {
      font-size: 0.65rem; font-weight: 700;
      padding: 1px 6px; border-radius: 10px;
      background: #21262d; color: #8b949e;
    }
    .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

    /* Main */
    .main { flex: 1; padding: 1.2rem 1.5rem; overflow-x: hidden; min-width: 0; }

    /* Topbar */
    .topbar {
      display: flex; justify-content: space-between;
      align-items: flex-start; margin-bottom: 1.2rem; gap: 1rem;
    }
    .title { margin: 0 0 0.2rem; font-size: 1.2rem; font-weight: 700; color: #e6edf3; }
    .subtitle { margin: 0; font-size: 0.78rem; color: #8b949e; }
    .subtitle strong { color: #e6edf3; }
    .topbar-right { display: flex; gap: 0.5rem; align-items: center; }

    .btn {
      padding: 0.38rem 0.85rem; font-size: 0.8rem; border-radius: 6px;
      cursor: pointer; border: 1px solid transparent;
      font-family: inherit; font-weight: 500; transition: all 0.2s;
    }
    .btn-green {
      background: rgba(57,211,83,0.12);
      border-color: rgba(57,211,83,0.35); color: #39d353;
    }
    .btn-green:hover { background: rgba(57,211,83,0.22); }
    .btn-green:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-outline { background: transparent; border-color: #30363d; color: #8b949e; }
    .btn-outline:hover { background: #21262d; color: #e6edf3; }
    .btn-link {
      background: none; border: none; color: #388bfd;
      font-size: 0.78rem; cursor: pointer; padding: 0;
    }
    .btn-link:hover { text-decoration: underline; }

    /* Loading */
    .loading-state {
      display: flex; align-items: center; gap: 0.8rem;
      padding: 3rem; color: #8b949e; font-size: 0.85rem;
    }
    .spinner {
      width: 20px; height: 20px; border: 2px solid #21262d;
      border-top-color: #39d353; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* KPI */
    .kpi-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 0.7rem; margin-bottom: 0.8rem;
    }
    .kpi-card {
      background: #161b22; border: 1px solid #21262d;
      border-left: 3px solid #21262d; border-radius: 10px;
      padding: 0.9rem 1rem;
    }
    .border-green  { border-left-color: #39d353; }
    .border-blue   { border-left-color: #388bfd; }
    .border-orange { border-left-color: #e3b341; }
    .border-red    { border-left-color: #f85149; }
    .border-purple { border-left-color: #bc8cff; }
    .border-teal   { border-left-color: #56d4dd; }
    .border-yellow { border-left-color: #f0883e; }

    .kpi-label {
      font-size: 0.6rem; font-weight: 700; color: #484f58;
      letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 0.3rem;
    }
    .kpi-val { font-size: 1.9rem; font-weight: 800; color: #e6edf3; line-height: 1; }
    .kpi-unit { font-size: 1rem; color: #8b949e; }
    .kpi-sub { font-size: 0.7rem; margin-top: 0.3rem; color: #8b949e; }

    /* Charts */
    .charts-row {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 0.7rem; margin-bottom: 0.8rem;
    }
    .chart-card {
      background: #161b22; border: 1px solid #21262d;
      border-radius: 10px; padding: 1rem 1.1rem;
    }
    .chart-title { font-size: 0.8rem; font-weight: 600; color: #e6edf3; margin-bottom: 0.7rem; }
    .chart-body { position: relative; height: 190px; }
    .chart-body canvas { max-height: 190px !important; }

    /* Table */
    .table-card {
      background: #161b22; border: 1px solid #21262d;
      border-radius: 10px; padding: 1rem 1.1rem; margin-bottom: 1rem;
    }
    .table-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 0.7rem; font-size: 0.8rem; font-weight: 600; color: #e6edf3;
    }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th {
      padding: 0.5rem 0.8rem; background: #0d1117;
      font-size: 0.6rem; font-weight: 700; color: #484f58;
      text-transform: uppercase; letter-spacing: 0.8px;
      border-bottom: 1px solid #21262d; text-align: left; white-space: nowrap;
    }
    td {
      padding: 0.55rem 0.8rem; font-size: 0.78rem; color: #8b949e;
      border-bottom: 1px solid #21262d; white-space: nowrap;
    }
    td strong { color: #e6edf3; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #1c2128; }
    tbody tr:hover td { color: #e6edf3; }

    .badge-type {
      background: rgba(56,139,253,0.1); color: #388bfd;
      border: 1px solid rgba(56,139,253,0.25);
      padding: 0.15rem 0.5rem; border-radius: 4px;
      font-size: 0.7rem; font-weight: 600;
    }
    .badge-pill {
      display: inline-block; padding: 0.15rem 0.55rem;
      border-radius: 20px; font-size: 0.7rem; font-weight: 600;
    }
    code {
      background: #0d1117; padding: 2px 5px; border-radius: 4px;
      font-size: 0.75rem; color: #f778ba; border: 1px solid #21262d;
    }

    @media (max-width: 1100px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .sidebar { display: none; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild('donutChart') donutRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart')   barRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('condChart')  condRef!:  ElementRef<HTMLCanvasElement>;

  loading = true;
  activeCat = '';

  allEquipments:    Equipment[] = [];
  totalEquipments   = 0;
  totalEmployees    = 0;
  totalEmplacements = 0;
  assignes          = 0;
  enStock           = 0;
  enMaintenance     = 0;
  retires           = 0;
  assignesPct       = 0;
  recentEquipments: Equipment[] = [];
  categories:  any[] = [];
  statutsList: any[] = [];

  private charts: Chart[] = [];

  private typeLabels: Record<string,string> = {
    pc:'PC de bureau', laptop:'Laptop',
    monitor:'Écran', printer:'Imprimante', other:'Autre'
  };
  private typeIcons: Record<string,string> = {
    pc:'🖥️', laptop:'💻', monitor:'🖵', printer:'🖨️', other:'📦'
  };
  private statusLabels: Record<string,string> = {
    in_stock:'En stock', assigned:'Assigné',
    maintenance:'En maintenance', retired:'Retiré'
  };
  private statusColors: Record<string,string> = {
    in_stock:'#388bfd', assigned:'#39d353',
    maintenance:'#e3b341', retired:'#f85149'
  };
  private condLabels: Record<string,string> = {
    new:'Neuf', good:'Bon état', fair:'Correct', poor:'Mauvais'
  };
  private condColors: Record<string,string> = {
    new:'#39d353', good:'#388bfd', fair:'#e3b341', poor:'#f85149'
  };
  private typeColors = ['#388bfd','#39d353','#e3b341','#bc8cff','#f0883e'];

  constructor(
    private equipmentService:   EquipmentService,
    private employeeService:    EmployeeService,
    private emplacementService: EmplacementService,
    private router: Router,
    private cdr:    ChangeDetectorRef,
    private zone:   NgZone
  ) {}

  ngOnInit(): void  { this.loadAll(); }
  ngOnDestroy(): void { this.destroyCharts(); }

  go(path: string): void { this.router.navigate([path]); }
  reload(): void { this.loadAll(); }

  private destroyCharts(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  loadAll(): void {
    this.loading = true;
    this.destroyCharts();

    // ── 1. Équipements (limite 100 pour ne pas geler) ──
    this.equipmentService.getEquipment(0, 100).subscribe({
      next: (equipments: Equipment[]) => {
        this.allEquipments    = equipments;
        this.recentEquipments = equipments.slice(0, 8);

        this.assignes      = equipments.filter(e => e.status === EquipmentStatus.ASSIGNED).length;
        this.enStock       = equipments.filter(e => e.status === EquipmentStatus.IN_STOCK).length;
        this.enMaintenance = equipments.filter(e => e.status === EquipmentStatus.MAINTENANCE).length;
        this.retires       = equipments.filter(e => e.status === EquipmentStatus.RETIRED).length;

        // Catégories sidebar
        const typeMap: Record<string,number> = {};
        equipments.forEach(e => {
          const t = (e.equipment_type as string) || 'other';
          typeMap[t] = (typeMap[t] || 0) + 1;
        });
        this.categories = Object.entries(typeMap).map(([key, count], i) => ({
          key, count,
          label: this.typeLabels[key] || key,
          icon:  this.typeIcons[key]  || '📦',
          color: this.typeColors[i % this.typeColors.length]
        }));

        this.statutsList = [
          { label:'En stock',    color:'#388bfd', count: this.enStock },
          { label:'Assignés',    color:'#39d353', count: this.assignes },
          { label:'Maintenance', color:'#e3b341', count: this.enMaintenance },
          { label:'Retirés',     color:'#f85149', count: this.retires },
        ];

        // ── 2. Compter total réel via un 2e appel léger ──
        this.equipmentService.getEquipment(0, 1).subscribe();
        this.totalEquipments = equipments.length; // affiché tel quel

        this.assignesPct = this.totalEquipments > 0
          ? Math.round((this.assignes / this.totalEquipments) * 100) : 0;

        this.loading = false;
        this.cdr.detectChanges();

        // Charts hors zone Angular pour ne pas bloquer l'UI
        this.zone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            this.buildCharts();
          });
        });
      },
      error: () => { this.loading = false; }
    });

    // ── 3. Employés et emplacements — juste le count ──
    this.employeeService.getEmployees(0, 1).subscribe({
      next: () => {}
    });
    this.employeeService.getEmployees(0, 500).subscribe({
      next: (data) => {
        this.totalEmployees = data.length;
        this.cdr.detectChanges();
      }
    });

    this.emplacementService.getEmplacements(0, 100).subscribe({
      next: (data) => {
        this.totalEmplacements = data.length;
        this.cdr.detectChanges();
      }
    });
  }

  buildCharts(): void {
    this.destroyCharts();

    const legendOpts = {
      labels: { color:'#8b949e', font:{ size:10 }, padding:8, boxWidth:10 }
    };
    const scaleOpts: any = {
      x: { ticks:{ color:'#484f58', font:{ size:9 } }, grid:{ color:'#21262d' } },
      y: { ticks:{ color:'#484f58', font:{ size:9 } }, grid:{ color:'#21262d' }, beginAtZero:true }
    };

    // Donut types
    if (this.donutRef?.nativeElement && this.categories.length > 0) {
      this.charts.push(new Chart(this.donutRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: this.categories.map(c => `${c.icon} ${c.label}`),
          datasets: [{
            data: this.categories.map(c => c.count),
            backgroundColor: this.categories.map(c => c.color + 'bb'),
            borderColor:     this.categories.map(c => c.color),
            borderWidth: 2, hoverOffset: 4
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '60%',
          animation: { duration: 400 },
          plugins: { legend: { ...legendOpts, position: 'bottom' } }
        }
      }));
    }

    // Barres
    if (this.barRef?.nativeElement && this.categories.length > 0) {
      const gc = (type: string, status: string) =>
        this.allEquipments.filter(e =>
          (e.equipment_type as string) === type && e.status === status
        ).length;

      this.charts.push(new Chart(this.barRef.nativeElement, {
        type: 'bar',
        data: {
          labels: this.categories.map(c => c.label),
          datasets: [
            { label:'En stock',    data: this.categories.map(c => gc(c.key, EquipmentStatus.IN_STOCK)),    backgroundColor:'rgba(56,139,253,0.6)',  borderColor:'#388bfd', borderWidth:1, borderRadius:3 },
            { label:'Assignés',    data: this.categories.map(c => gc(c.key, EquipmentStatus.ASSIGNED)),    backgroundColor:'rgba(57,211,83,0.6)',   borderColor:'#39d353', borderWidth:1, borderRadius:3 },
            { label:'Maintenance', data: this.categories.map(c => gc(c.key, EquipmentStatus.MAINTENANCE)), backgroundColor:'rgba(227,179,65,0.6)',  borderColor:'#e3b341', borderWidth:1, borderRadius:3 },
            { label:'Retirés',     data: this.categories.map(c => gc(c.key, EquipmentStatus.RETIRED)),     backgroundColor:'rgba(248,81,73,0.5)',   borderColor:'#f85149', borderWidth:1, borderRadius:3 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: { legend: legendOpts },
          scales: scaleOpts
        }
      }));
    }

    // Donut conditions
    if (this.condRef?.nativeElement) {
      const condMap: Record<string,number> = {};
      this.allEquipments.forEach(e => {
        const c = (e.condition as string) || 'good';
        condMap[c] = (condMap[c] || 0) + 1;
      });
      const entries = Object.entries(condMap).filter(([,v]) => v > 0);
      if (entries.length > 0) {
        this.charts.push(new Chart(this.condRef.nativeElement, {
          type: 'doughnut',
          data: {
            labels: entries.map(([k]) => this.condLabels[k] || k),
            datasets: [{
              data: entries.map(([,v]) => v),
              backgroundColor: entries.map(([k]) => (this.condColors[k]||'#8b949e')+'bb'),
              borderColor:     entries.map(([k]) => this.condColors[k]||'#8b949e'),
              borderWidth: 2, hoverOffset: 4
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false, cutout: '60%',
            animation: { duration: 400 },
            plugins: { legend: { ...legendOpts, position: 'bottom' } }
          }
        }));
      }
    }
  }

  getTypeLabel(t: string): string   { return this.typeLabels[t]   || t || '-'; }
  getTypeIcon(t: string): string    { return this.typeIcons[t]    || '📦'; }
  getStatusLabel(s: string): string { return this.statusLabels[s] || s || '-'; }
  getStatusColor(s: string): string { return this.statusColors[s] || '#8b949e'; }
  getCondLabel(c: string): string   { return this.condLabels[c]   || c || '-'; }
  getCondColor(c: string): string   { return this.condColors[c]   || '#8b949e'; }
}
