import { Component, OnInit } from '@angular/core';
import { EmplacementService } from '../../core/services/emplacement.service';
import { Emplacement } from '../../core/models/emplacement.model';

@Component({
  selector: 'app-emplacement-list',
  templateUrl: './emplacement-list.component.html',
  styleUrls: ['./emplacement-list.component.css']
})
export class EmplacementListComponent implements OnInit {
  emplacements: Emplacement[] = [];
  filteredEmplacements: Emplacement[] = [];
  loading = false;
  error: string | null = null;
  
  searchTerm = '';
  selectedEtage = '';
  selectedDesignation = '';
  
  etages: string[] = [];
  designations: string[] = [];
  
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  displayedColumns: string[] = ['equipment', 'designation', 'etage', 'rosace', 'type', 'emplacement_exact', 'actions'];

  constructor(private emplacementService: EmplacementService) {}

  ngOnInit(): void {
    this.loadEmplacements();
  }

  loadEmplacements(): void {
    this.loading = true;
    this.error = null;

    const filters: any = {};
    if (this.selectedEtage) filters.etage = this.selectedEtage;
    if (this.selectedDesignation) filters.designation = this.selectedDesignation;
    if (this.searchTerm) filters.search = this.searchTerm;

    this.emplacementService.getEmplacements(this.currentPage * this.pageSize, this.pageSize, filters).subscribe({
      next: (response) => {
        this.emplacements = response.items || [];
        this.filteredEmplacements = this.emplacements;
        this.totalItems = response.total || 0;
        
        // Extraire les valeurs uniques pour les filtres
        this.etages = [...new Set(this.emplacements.map(e => e.etage).filter(e => e))];
        this.designations = [...new Set(this.emplacements.map(e => e.designation))];
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des emplacements:', error);
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
    this.selectedDesignation = '';
    this.currentPage = 0;
    this.loadEmplacements();
  }

  deleteEmplacement(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) {
      this.emplacementService.deleteEmplacement(id).subscribe({
        next: () => {
          this.loadEmplacements();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'emplacement');
        }
      });
    }
  }

  exportData(format: string): void {
    this.emplacementService.exportEmplacements(format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emplacements.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de l\'export:', error);
        alert('Erreur lors de l\'export');
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmplacements();
  }
}
