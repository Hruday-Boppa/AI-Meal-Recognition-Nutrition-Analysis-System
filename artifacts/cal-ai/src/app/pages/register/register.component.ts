import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card card">
        <div class="auth-header">
          <div class="auth-logo">🍎</div>
          <h1>Create account</h1>
          <p class="text-muted">Start tracking your nutrition with AI</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="name-row">
            <div class="input-group">
              <label>First name</label>
              <input class="input" type="text" [(ngModel)]="firstName" name="firstName" placeholder="John" required>
            </div>
            <div class="input-group">
              <label>Last name</label>
              <input class="input" type="text" [(ngModel)]="lastName" name="lastName" placeholder="Doe" required>
            </div>
          </div>
          <div class="input-group">
            <label>Email</label>
            <input class="input" type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" required>
          </div>
          <div class="input-group">
            <label>Password</label>
            <input class="input" type="password" [(ngModel)]="password" name="password" placeholder="Min 8 characters" required>
          </div>
          <div class="input-group">
            <label>Daily Calorie Goal</label>
            <input class="input" type="number" [(ngModel)]="calorieGoal" name="calorieGoal" placeholder="2000" min="1000" max="5000">
          </div>

          <div class="error-msg" *ngIf="error">{{ error }}</div>

          <button class="btn btn-primary btn-lg w-full" [disabled]="loading" type="submit">
            <div class="spinner" *ngIf="loading" style="width:18px;height:18px;border-width:2px;border-top-color:#fff"></div>
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <p class="auth-footer">
          Already have an account? <a routerLink="/login" class="text-primary font-semibold">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%); padding: 20px;
    }
    .auth-card { padding: 40px; width: 100%; max-width: 420px; }
    .auth-header { text-align: center; margin-bottom: 28px; }
    .auth-logo { font-size: 48px; margin-bottom: 12px; }
    .auth-header h1 { font-size: 26px; font-weight: 700; margin: 0 0 8px; color: #111827; }
    .auth-header p { margin: 0; }
    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .name-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .error-msg { color: #ef4444; font-size: 14px; text-align: center; background: #fee2e2; padding: 10px; border-radius: 8px; }
    .auth-footer { text-align: center; margin-top: 24px; font-size: 14px; color: #6b7280; }
  `]
})
export class RegisterComponent {
  firstName = ''; lastName = ''; email = ''; password = '';
  calorieGoal = 2000; loading = false; error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) return;
    this.loading = true; this.error = '';
    this.auth.register({
      firstName: this.firstName, lastName: this.lastName,
      email: this.email, password: this.password, calorieGoal: this.calorieGoal
    }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => {
        this.error = err.error?.message || 'Registration failed. Please try again.';
        this.loading = false;
      }
    });
  }
}
