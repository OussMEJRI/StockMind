import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { SwitchLocatorService } from '../../core/services/switch-locator.service';

@Component({
  selector: 'app-carbon-footprint',
  templateUrl: './carbon-footprint.component.html',
  styleUrls: ['./carbon-footprint.component.css']
})
export class CarbonFootprintComponent implements OnInit, OnDestroy {
  nbPcs = 0;
  loading = true;
  error = false;

  // Constantes de calcul
  readonly WATTS_PER_PC = 150;           // Watts par PC
  readonly HOURS_PER_DAY = 8;            // Heures d'utilisation par jour
  readonly DAYS = 30;                    // Période 30 jours
  readonly CO2_PER_KWH = 0.0571;        // kg CO2 par kWh (France)
  readonly KM_VOITURE_PER_KG_CO2 = 4.58; // 1kg CO2 = 4.58 km voiture (218g/km)
  readonly KM_TGV_PER_KG_CO2 = 341.3;   // 1kg CO2 = 341.3 km TGV (2.93g/km)
  readonly MIN_STREAMING_PER_KG_CO2 = 94.5; // 1kg CO2 = 94.5 min streaming (63.7g/30min)

  // Résultats calculés
  consommationKwh = 0;
  co2Kg = 0;
  co2Grammes = 0;
  kmVoiture = 0;
  kmTgv = 0;
  heuresStreaming = 0;

  private refreshSubscription?: Subscription;

  constructor(private switchLocatorService: SwitchLocatorService) {}

  ngOnInit(): void {
    this.loadData();
    this.refreshSubscription = interval(5 * 60 * 1000).subscribe(() => this.loadData());
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
  }

  loadData(): void {
    this.loading = true;
    this.error = false;
    this.switchLocatorService.getNbPcs().subscribe({
      next: (response) => {
        this.nbPcs = response.nb_pcs;
        this.calculate();
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  calculate(): void {
    this.consommationKwh = (this.nbPcs * this.WATTS_PER_PC * this.HOURS_PER_DAY * this.DAYS) / 1000;
    this.co2Kg = this.consommationKwh * this.CO2_PER_KWH;
    this.co2Grammes = Math.round(this.co2Kg * 1000);
    this.kmVoiture = Math.round(this.co2Kg * this.KM_VOITURE_PER_KG_CO2);
    this.kmTgv = Math.round(this.co2Kg * this.KM_TGV_PER_KG_CO2);
    this.heuresStreaming = Math.round((this.co2Kg * this.MIN_STREAMING_PER_KG_CO2) / 60);
  }

  refresh(): void {
    this.loadData();
  }
}
