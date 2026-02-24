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
            <img src="/assets/logo.png" alt="Logo">
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

      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: url('/assets/sofrecom.jpg') no-repeat center center;
      background-size: cover;
      position: relative;
    }

    .login-container::before {
      content: "";
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .login-card {
      position: relative;
      background: rgba(255, 255, 255, 0.95);
      padding: 2.5rem;
      border-radius: 16px;
      width: 100%;
      max-width: 450px;
      backdrop-filter: blur(6px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo img {
      width: 120px;
      height: auto;
      margin-bottom: 1rem;
    }

    .btn-block {
      width: 100%;
      margin-top: 1rem;
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
