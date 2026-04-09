import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService, Location } from '../../../core/services/location.service';

@Component({
  selector: 'app-location-form',
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.css']
})
export class LocationFormComponent implements OnInit {
  locationForm: FormGroup;
  isEditMode = false;
  locationId: number | null = null;
  loading = false;
  error: string | null = null;

  // Options pour les sélecteurs
  sites = ['Sterling', 'Sfax'];
  
  etages = [
    'RDC A', 'RDC B', 'SATED', 'BLI',
    '1A1', '1A2', '1CENTRALE', '1B1', '1B2',
    '2A1', '2A2', '2CENTRALE', '2B1', '2B2',
    '3A1', '3A2', '3CENTRALE', '3B1', '3B2',
    '4A1', '4A2', 'DIRECTION'
  ];
  
  rosaces = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, 3, ..., 12]

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.locationForm = this.fb.group({
      site: ['', Validators.required],
      etage: ['', Validators.required],
      rosace: ['', Validators.required],
      name: ['', Validators.required],
      address: [''],
      city: [''],
      country: ['Tunisie']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.locationId = +id;
      this.loadLocation(this.locationId);
    }

    // Mettre à jour automatiquement le nom et la position exacte
    this.locationForm.get('site')?.valueChanges.subscribe(() => this.updateLocationName());
    this.locationForm.get('etage')?.valueChanges.subscribe(() => this.updateLocationName());
    this.locationForm.get('rosace')?.valueChanges.subscribe(() => this.updateLocationName());
  }

  updateLocationName(): void {
    const site = this.locationForm.get('site')?.value;
    const etage = this.locationForm.get('etage')?.value;
    const rosace = this.locationForm.get('rosace')?.value;

    if (site && etage && rosace) {
      // Format: Site - Étage - Rosace X
      const name = `${site} - ${etage} - Rosace ${rosace}`;
      this.locationForm.patchValue({ name }, { emitEvent: false });
    }
  }

  loadLocation(id: number): void {
    this.loading = true;
    this.locationService.getLocation(id).subscribe({
      next: (location) => {
        // Parser le nom pour extraire site, étage et rosace
        this.parseLocationName(location);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement de la localisation';
        this.loading = false;
        console.error('Error loading location:', error);
      }
    });
  }

  parseLocationName(location: Location): void {
    // Essayer de parser le nom au format "Site - Étage - Rosace X"
    const parts = location.name.split(' - ');
    if (parts.length === 3) {
      const site = parts[0];
      const etage = parts[1];
      const rosaceMatch = parts[2].match(/Rosace (\d+)/);
      const rosace = rosaceMatch ? rosaceMatch[1] : '';

      this.locationForm.patchValue({
        site,
        etage,
        rosace,
        name: location.name,
        address: location.address || '',
        city: location.city || '',
        country: location.country || 'Tunisie'
      });
    } else {
      // Si le format ne correspond pas, charger tel quel
      this.locationForm.patchValue({
        name: location.name,
        address: location.address || '',
        city: location.city || '',
        country: location.country || 'Tunisie'
      });
    }
  }

  onSubmit(): void {
    if (this.locationForm.invalid) {
      Object.keys(this.locationForm.controls).forEach(key => {
        this.locationForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    const locationData: Location = {
      name: this.locationForm.value.name,
      address: this.locationForm.value.address || undefined,
      city: this.locationForm.value.city || undefined,
      country: this.locationForm.value.country || undefined
    };

    const request = this.isEditMode && this.locationId
      ? this.locationService.updateLocation(this.locationId, locationData)
      : this.locationService.createLocation(locationData);

    request.subscribe({
      next: () => {
        this.router.navigate(['/locations']);
      },
      error: (error) => {
        this.error = this.isEditMode 
          ? 'Erreur lors de la modification de la localisation'
          : 'Erreur lors de la création de la localisation';
        this.loading = false;
        console.error('Error saving location:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/locations']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.locationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
