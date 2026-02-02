import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a class="navbar-brand" routerLink="/dashboard">
          🖥️ IT Inventory
        </a>
        
        <div class="navbar-menu">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            📊 Dashboard
          </a>
          <a routerLink="/equipment" routerLinkActive="active">
            💻 Équipements
          </a>
          <a routerLink="/employees" routerLinkActive="active">
            👥 Employés
          </a>
          <a routerLink="/locations" routerLinkActive="active">
            📍 Localisations
          </a>
          <a routerLink="/chatbot" routerLinkActive="active">
            🤖 Chatbot
          </a>
        </div>
        
        <div class="navbar-user">
          <span class="user-name" *ngIf="authService.currentUserValue">
            {{ authService.currentUserValue.first_name }} {{ authService.currentUserValue.last_name }}
          </span>
          <button class="btn btn-sm btn-secondary" (click)="logout()">
            Déconnexion
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
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }
    
    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      height: 60px;
    }
    
    .navbar-brand {
      font-size: 1.25rem;
      font-weight: 700;
      color: #667eea;
      text-decoration: none;
      margin-right: 2rem;
    }
    
    .navbar-menu {
      display: flex;
      gap: 0.5rem;
      flex: 1;
    }
    
    .navbar-menu a {
      padding: 0.5rem 1rem;
      color: #666;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s;
      font-size: 0.9rem;
    }
    
    .navbar-menu a:hover {
      background: #f5f5f5;
      color: #333;
    }
    
    .navbar-menu a.active {
      background: #667eea;
      color: white;
    }
    
    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .user-name {
      color: #666;
      font-size: 0.9rem;
    }
    
    @media (max-width: 992px) {
      .navbar-menu {
        display: none;
      }
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
