import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>🖥️ IT Inventory</h1>
          <p>Connectez-vous à votre compte</p>
        </div>
        
        <div class="alert alert-danger" *ngIf="error">
          {{ error }}
        </div>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              class="form-control" 
              formControlName="email"
              placeholder="votre@email.com">
            <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Email requis et doit être valide
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              class="form-control" 
              formControlName="password"
              placeholder="••••••••">
            <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Mot de passe requis
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-block" 
            [disabled]="loginForm.invalid || loading">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </form>
        
        <div class="features-list">
          <h4>🚀 Fonctionnalités disponibles</h4>
          <div class="features-grid">
            <div class="feature-item">
              <span class="feature-icon">📊</span>
              <span>Dashboard</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">💻</span>
              <span>Équipements</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">👥</span>
              <span>Employés</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📍</span>
              <span>Localisations</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🤖</span>
              <span>Chatbot IA</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔐</span>
              <span>Sécurité JWT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }
    
    .login-card {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 450px;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .login-header h1 {
      color: #667eea;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .login-header p {
      color: #666;
    }
    
    .btn-block {
      width: 100%;
      margin-top: 1rem;
    }
    
    .features-list {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e0e0e0;
    }
    
    .features-list h4 {
      color: #667eea;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      text-align: center;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #666;
    }
    
    .feature-icon {
      font-size: 1.2rem;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    
    this.loading = true;
    this.error = '';
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.message || 'Erreur de connexion';
        this.loading = false;
      }
    });
  }
}
