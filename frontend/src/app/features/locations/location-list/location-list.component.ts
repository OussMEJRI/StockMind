import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService } from '../../../core/services/location.service';
import { Location } from '../../../core/models/user.model';

@Component({
  selector: 'app-location-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>📍 Localisations</h1>
        <button class="btn btn-primary" (click)="showModal = true">
          + Nouvelle localisation
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
              <th>Site</th>
              <th>Étage</th>
              <th>Bureau</th>
              <th>Position exacte</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let loc of locations">
              <td><strong>{{ loc.site }}</strong></td>
              <td>{{ loc.floor }}</td>
              <td>{{ loc.room }}</td>
              <td>{{ loc.exact_position || '-' }}</td>
              <td>
                <button class="btn btn-sm btn-danger" (click)="delete(loc)">
                  Supprimer
                </button>
              </td>
            </tr>
            <tr *ngIf="locations.length === 0">
              <td colspan="5" class="text-center text-muted">
                Aucune localisation trouvée
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Nouvelle localisation</h3>
          <button class="modal-close" (click)="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="alert alert-danger" *ngIf="error">
            {{ error }}
          </div>
          
          <form [formGroup]="form" (ngSubmit)="onCreate()">
            <div class="form-group">
              <label class="form-label">Site *</label>
              <input type="text" class="form-control" formControlName="site" placeholder="ex: Paris, Lyon...">
            </div>
            
            <div class="form-group">
              <label class="form-label">Étage *</label>
              <input type="text" class="form-control" formControlName="floor" placeholder="ex: RDC, 1er, 2ème...">
            </div>
            
            <div class="form-group">
              <label class="form-label">Bureau *</label>
              <input type="text" class="form-control" formControlName="room" placeholder="ex: 101, 202...">
            </div>
            
            <div class="form-group">
              <label class="form-label">Position exacte</label>
              <input type="text" class="form-control" formControlName="exact_position" placeholder="ex: Armoire A, Poste 3...">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeModal()">Annuler</button>
          <button class="btn btn-primary" (click)="onCreate()" [disabled]="form.invalid || saving">
            {{ saving ? 'Création...' : 'Créer' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class LocationListComponent implements OnInit {
  locations: Location[] = [];
  loading = false;
  showModal = false;
  saving = false;
  error = '';
  
  form!: FormGroup;

  constructor(
    private locationService: LocationService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      site: ['', Validators.required],
      floor: ['', Validators.required],
      room: ['', Validators.required],
      exact_position: ['']
    });
    
    this.loadLocations();
  }

  loadLocations(): void {
    this.loading = true;
    this.locationService.getLocations().subscribe({
      next: (data) => {
        this.locations = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.error = '';
    this.form.reset();
  }

  onCreate(): void {
    if (this.form.invalid) return;
    
    this.saving = true;
    this.error = '';
    
    this.locationService.createLocation(this.form.value).subscribe({
      next: () => {
        this.closeModal();
        this.loadLocations();
        this.saving = false;
      },
      error: (err) => {
        this.error = err.message || 'Erreur lors de la création';
        this.saving = false;
      }
    });
  }

  delete(loc: Location): void {
    if (confirm(`Supprimer la localisation ${loc.site} - ${loc.room} ?`)) {
      this.locationService.deleteLocation(loc.id!).subscribe(() => {
        this.loadLocations();
      });
    }
  }
}
