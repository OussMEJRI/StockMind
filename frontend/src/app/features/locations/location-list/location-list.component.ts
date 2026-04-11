import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocationService, Location } from '../../../core/services/location.service';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.css']
})
export class LocationListComponent implements OnInit {
  locations: Location[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private locationService: LocationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.loading = true;
    this.error = null;
    
    this.locationService.getLocations().subscribe({
      next: (response) => {
        this.locations = response.items;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des emplacements';
        this.loading = false;
        console.error('Error loading locations:', error);
      }
    });
  }

  addLocation(): void {
    this.router.navigate(['/locations/new']);
  }

  editLocation(id: number): void {
    this.router.navigate(['/locations/edit', id]);
  }

  deleteLocation(id: number, name: string): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la emplacement "${name}" ?`)) {
      this.locationService.deleteLocation(id).subscribe({
        next: () => {
          this.loadLocations();
        },
        error: (error) => {
          alert('Erreur lors de la suppression de la emplacement');
          console.error('Error deleting location:', error);
        }
      });
    }
  }
}
