import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EmplacementService } from '../../core/services/emplacement.service';
import { Emplacement } from '../../core/models/emplacement.model';

@Component({
  selector: 'app-emplacement-form',
  templateUrl: './emplacement-form.component.html',
  styleUrls: ['./emplacement-form.component.css']
})
export class EmplacementFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  emplacementId?: number;
  loading = false;
  error = '';

  sites = ['Sterling', 'Sfax'];

  etages = [
    'RDC A', 'RDC B', 'SATED', 'BLI',
    '1A1', '1A2', '1CENTRALE', '1B1', '1B2',
    '2A1', '2A2', '2CENTRALE', '2B1', '2B2',
    '3A1', '3A2', '3CENTRALE', '3B1', '3B2',
    '4A1', '4A2', 'DIRECTION'
  ];

  rosaces = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  constructor(
    private fb: FormBuilder,
    private emplacementService: EmplacementService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      site: ['', Validators.required],
      etage: ['', Validators.required],
      rosace: ['', Validators.required],
      exact_position: ['']
    });

    // ✅ Génération automatique de exact_position
    this.form.get('site')?.valueChanges.subscribe(() => this.updateExactPosition());
    this.form.get('etage')?.valueChanges.subscribe(() => this.updateExactPosition());
    this.form.get('rosace')?.valueChanges.subscribe(() => this.updateExactPosition());

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.emplacementId = +id;
      this.loadEmplacement();
    }
  }

  updateExactPosition(): void {
    const site = this.form.get('site')?.value;
    const etage = this.form.get('etage')?.value;
    const rosace = this.form.get('rosace')?.value;

    if (site && etage && rosace) {
      this.form.patchValue(
        { exact_position: `${site} - ${etage} - Rosace ${rosace}` },
        { emitEvent: false }
      );
    }
  }

  loadEmplacement(): void {
    this.loading = true;
    this.emplacementService.getEmplacement(this.emplacementId!).subscribe({
      next: (emp) => {
        this.form.patchValue({
          site: emp.site,
          etage: emp.etage,
          rosace: emp.rosace,
          exact_position: emp.exact_position || ''
        });
        this.loading = false;
      },
      error: () => {
        this.error = "Erreur lors du chargement de l'emplacement";
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(k =>
        this.form.get(k)?.markAsTouched()
      );
      return;
    }

    this.loading = true;
    this.error = '';

    const data: Emplacement = {
      site: this.form.value.site,
      etage: this.form.value.etage,
      rosace: this.form.value.rosace,
      exact_position: this.form.value.exact_position || undefined
    };

    const request = this.isEditMode
      ? this.emplacementService.updateEmplacement(this.emplacementId!, data)
      : this.emplacementService.createEmplacement(data);

    request.subscribe({
      next: () => { this.router.navigate(['/emplacements']); },
      error: (err) => {
        this.error = this.isEditMode
          ? "Erreur lors de la modification"
          : "Erreur lors de la création";
        this.loading = false;
        console.error(err);
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  cancel(): void { this.router.navigate(['/emplacements']); }
}
