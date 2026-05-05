import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-navbar *ngIf="authService.isAuthenticated()"></app-navbar>
      <main class="main-content" [class.no-nav]="!authService.isAuthenticated()">
        <router-outlet></router-outlet>
      </main>
      <app-chatbot *ngIf="authService.isAuthenticated()"></app-chatbot>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: var(--app-bg);
    }
    .main-content {
      padding-top: 60px;
    }
    .main-content.no-nav {
      padding-top: 0;
    }
  `]
})
export class AppComponent {
  title = 'IT Inventory Manager';

  constructor(
    public authService: AuthService,
    private themeService: ThemeService
  ) {
    this.themeService.initTheme();
  }
}