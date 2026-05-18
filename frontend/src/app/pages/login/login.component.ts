import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="login-page">
      <div class="login-card card">
        <div class="login-header">
          <div class="login-logo">⚽</div>
          <h1 class="login-title">FIFA <span class="text-accent">CRM</span></h1>
          <p class="text-muted">Sign in to manage player data</p>
        </div>

        <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              class="form-control"
              formControlName="email"
              placeholder="admin@xacademy.com"
              autocomplete="email"
            />
            <span class="form-error"
              *ngIf="form.get('email')?.touched && form.get('email')?.invalid">
              Valid email required
            </span>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              class="form-control"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <span class="form-error"
              *ngIf="form.get('password')?.touched && form.get('password')?.invalid">
              Password required
            </span>
          </div>

          <button
            id="btn-login"
            type="submit"
            class="btn btn-primary w-100"
            [disabled]="loading"
          >
            <span *ngIf="loading">Signing in…</span>
            <span *ngIf="!loading">Sign In</span>
          </button>
        </form>

        <p class="login-hint text-muted">
          Demo: <code>admin@xacademy.com</code> / <code>password</code>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(ellipse at 50% 0%, rgba(26,115,232,0.12) 0%, transparent 70%),
                  var(--bg-main);
      padding: 20px;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 36px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .login-logo {
      font-size: 48px;
      line-height: 1;
      margin-bottom: 12px;
    }
    .login-title {
      font-family: 'Inter Tight', sans-serif;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .login-hint {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      code {
        background: var(--bg-input);
        padding: 1px 5px;
        border-radius: 4px;
        font-size: 11px;
      }
    }
  `],
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  error   = '';

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error   = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/players']),
      error: (err) => {
        this.error   = err?.error?.message ?? 'Invalid credentials';
        this.loading = false;
      },
    });
  }
}
