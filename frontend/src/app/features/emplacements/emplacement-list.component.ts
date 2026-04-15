import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmplacementService } from '../../core/services/emplacement.service';
import { Emplacement } from '../../core/models/emplacement.model';

@Component({
  selector: 'app-emplacement-list',
  templateUrl: './emplacement-list.component.html',
  styleUrls: ['./emplacement-list.component.css']
})
export class EmplacementListComponent implements OnInit {
  emplacements: Emplacement[] = [];
  loading = false;
  error: string | null = null;

  searchTerm = '';
  selectedEtage = '';
  selectedSite = '';

  etages: string[] = [
    'RDC A', 'RDC B', 'SATED', 'BLI',
    '1A1', '1A2', '1CENTRALE', '1B1', '1B2',
    '2A1', '2A2', '2CENTRALE', '2B1', '2B2',
    '3A1', '3A2', '3CENTRALE', '3B1', '3B2',
    '4A1', '4A2', 'DIRECTION'
  ];
  sites: string[] = ['Sterling', 'Sfax'];

  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private emplacementService: EmplacementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmplacements();
  }

  loadEmplacements(): void {
    this.loading = true;
    this.error = null;

    this.emplacementService.getEmplacements(
      this.currentPage * this.pageSize,
      this.pageSize
    ).subscribe({
      next: (data) => {
        this.emplacements = data.filter(e => {
          const matchSearch = !this.searchTerm ||
            e.site.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            e.etage.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            e.rosace.toLowerCase().includes(this.searchTerm.toLowerCase());
          const matchEtage = !this.selectedEtage || e.etage === this.selectedEtage;
          const matchSite  = !this.selectedSite  || e.site  === this.selectedSite;
          return matchSearch && matchEtage && matchSite;
        });
        this.totalItems = this.emplacements.length;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des emplacements';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadEmplacements();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedEtage = '';
    this.selectedSite = '';
    this.currentPage = 0;
    this.loadEmplacements();
  }

  // ✅ Méthode pour la pagination dans le template
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  addEmplacement(): void {
    this.router.navigate(['/emplacements/new']);
  }

  editEmplacement(id: number): void {
    this.router.navigate(['/emplacements/edit', id]);
  }

  deleteEmplacement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) {
      this.emplacementService.deleteEmplacement(id).subscribe({
        next: () => this.loadEmplacements(),
        error: () => {
          this.error = "Erreur lors de la suppression de l'emplacement";
        }
      });
    }
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmplacements();
  }
}
