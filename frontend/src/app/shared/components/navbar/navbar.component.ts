import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a class="navbar-brand" routerLink="/dashboard">
          📦 StockMind
        </a>

        <div class="navbar-menu">
          <a routerLink="/dashboard" routerLinkActive="active"
             [routerLinkActiveOptions]="{exact: true}">
            📊 Dashboard
          </a>
          <a routerLink="/equipment" routerLinkActive="active">
            💻 Équipements
          </a>
          <a routerLink="/employees" routerLinkActive="active">
            👥 Employés
          </a>
          <a routerLink="/emplacements" routerLinkActive="active">
            📍 Emplacements
          </a>
          <a routerLink="/carbon" routerLinkActive="active">
            🌱 Empreinte Carbone
          </a>
        </div>

        <div class="navbar-user">
          <span class="user-name" *ngIf="authService.currentUserValue">
            👤 {{ authService.currentUserValue.first_name }}
            {{ authService.currentUserValue.last_name }}
          </span>
          <button class="btn-logout" (click)="logout()">
            🚪 Déconnexion
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #161b22;
      border-bottom: 1px solid #21262d;
      box-shadow: 0 1px 8px rgba(0,0,0,0.4);
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.2rem;
      display: flex;
      align-items: center;
      height: 60px;
      gap: 1rem;
    }

    .navbar-brand {
      font-size: 1.1rem;
      font-weight: 700;
      color: #39d353;
      text-decoration: none;
      margin-right: 1.5rem;
      white-space: nowrap;
      letter-spacing: 0.3px;
    }

    .navbar-brand:hover { color: #56d364; }

    .navbar-menu {
      display: flex;
      gap: 0.2rem;
      flex: 1;
    }

    .navbar-menu a {
      padding: 0.4rem 0.85rem;
      color: #8b949e;
      text-decoration: none;
      border-radius: 6px;
      transition: all 0.2s;
      font-size: 0.85rem;
      white-space: nowrap;
      border: 1px solid transparent;
    }

    .navbar-menu a:hover {
      background: #21262d;
      color: #e6edf3;
      border-color: #30363d;
    }

    .navbar-menu a.active {
      background: rgba(57,211,83,0.12);
      color: #39d353;
      border-color: rgba(57,211,83,0.3);
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-left: auto;
    }

    .user-name {
      color: #8b949e;
      font-size: 0.82rem;
      white-space: nowrap;
    }

    .btn-logout {
      background: rgba(248,81,73,0.1);
      border: 1px solid rgba(248,81,73,0.3);
      color: #f85149;
      padding: 0.35rem 0.85rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-logout:hover {
      background: rgba(248,81,73,0.2);
      border-color: rgba(248,81,73,0.5);
    }

    @media (max-width: 992px) {
      .navbar-menu { display: none; }
    }
  `]
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
  }
}
