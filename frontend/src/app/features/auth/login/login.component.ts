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
          <div class="logo">
            <img src="/assets/logo.png" alt="Logo Sofrecom">
          </div>
          <h1>IT Inventory</h1>
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
            <div
              class="error-message"
              *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
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
            <div
              class="error-message"
              *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
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

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }

    .login-container {
      min-height: 100vh;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;

      background-image: url('/assets/sofrecom.png');
      background-size: cover;
      background-position: center center;
      background-repeat: no-repeat;
      background-color: #f4f7fb;
    }

    .login-container::before {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.08);
      z-index: 0;
    }

    .login-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 450px;
      padding: 2.5rem;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(8px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo img {
      width: 130px;
      height: auto;
      margin-bottom: 1rem;
    }

    .login-header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: #0b376d;
    }

    .login-header p {
      margin-top: 0.5rem;
      color: #667085;
      font-size: 15px;
    }

    .form-group {
      margin-bottom: 1.2rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.45rem;
      font-weight: 600;
      color: #344054;
    }

    .form-control {
      width: 100%;
      height: 44px;
      padding: 0 14px;
      border: 1px solid #cfd7e3;
      border-radius: 8px;
      outline: none;
      font-size: 14px;
      background: #ffffff;
      color: #111827;
      box-sizing: border-box;
    }

    .form-control:focus {
      border-color: #0b5cab;
      box-shadow: 0 0 0 3px rgba(11, 92, 171, 0.15);
    }

    .btn-block {
      width: 100%;
      margin-top: 1rem;
      height: 44px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-primary {
      background: #0b5cab;
      color: #ffffff;
    }

    .btn-primary:hover {
      background: #084985;
    }

    .btn-primary:disabled {
      background: #b8d8f2;
      color: #ffffff;
      cursor: not-allowed;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 14px;
    }

    .alert-danger {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .error-message {
      margin-top: 0.35rem;
      color: #dc2626;
      font-size: 13px;
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
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

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