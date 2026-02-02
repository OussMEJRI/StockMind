import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-navbar *ngIf="authService.isAuthenticated()"></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f5f5f5;
    }
    .main-content {
      padding-top: 60px;
    }
  `]
})
export class AppComponent {
  title = 'IT Inventory Manager';

  constructor(public authService: AuthService) {}
}
