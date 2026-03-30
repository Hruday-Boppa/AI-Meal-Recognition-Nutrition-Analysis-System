import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page animate-in">
      <div class="container">
        <header class="page-header">
          <h1 class="h1">Account Settings</h1>
          <p class="text-muted">Manage your personal information and calorie goals.</p>
        </header>

        <div class="sections-grid">
          <!-- Identity Section -->
          <section class="settings-card glass-card">
            <div class="card-header">
              <div class="header-icon primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div class="header-text">
                <h3 class="h3">Personal Profile</h3>
                <p class="text-xs text-muted">Your identity and contact details.</p>
              </div>
            </div>

            <div class="card-content p-6">
              <div class="avatar-section mb-6">
                <div class="avatar-large">{{ initials }}</div>
                <div class="avatar-info">
                  <span class="font-bold text-lg">{{ firstName }} {{ lastName }}</span>
                  <span class="text-sm text-muted">{{ email }}</span>
                </div>
              </div>

              <div class="form-grid">
                <div class="input-group">
                  <label>First Name</label>
                  <input class="input" [(ngModel)]="firstName" placeholder="First name">
                </div>
                <div class="input-group">
                  <label>Last Name</label>
                  <input class="input" [(ngModel)]="lastName" placeholder="Last name">
                </div>
                <div class="input-group full-width">
                  <label>Email Address</label>
                  <input class="input" [value]="email" disabled title="Email cannot be changed">
                </div>
              </div>
              
              <footer class="card-footer mt-6">
                <button class="btn btn-primary w-full" (click)="onSave()" [disabled]="saving">
                  <span *ngIf="!saving">Save Identity</span>
                  <div *ngIf="saving" class="spinner"></div>
                </button>
                <p class="success-msg mt-3 text-center" *ngIf="savedMsg">✓ {{ savedMsg }}</p>
              </footer>
            </div>
          </section>

          <!-- Goals Section -->
          <section class="settings-card glass-card">
            <div class="card-header">
              <div class="header-icon secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div class="header-text">
                <h3 class="h3">Daily Targets</h3>
                <p class="text-xs text-muted">Adjust your nutritional objectives.</p>
              </div>
            </div>

            <div class="card-content p-6">
              <div class="goal-input-area">
                <label class="font-medium mb-2 block">Daily Calorie Goal</label>
                <div class="input-with-badge">
                  <input class="input goal-input" type="number" [(ngModel)]="calorieGoal" min="1000" max="5000">
                  <span class="badge badge-green">kcal</span>
                </div>
                <p class="text-xs text-muted mt-3">Recommended for your activity level: 1,800 - 2,400 kcal</p>
              </div>

              <footer class="card-footer mt-6">
                <button class="btn btn-secondary w-full" (click)="onSaveGoal()" [disabled]="saving">
                  Update Targets
                </button>
              </footer>
            </div>
          </section>

          <!-- Session Section -->
          <section class="settings-card glass-card danger">
            <div class="card-header">
              <div class="header-icon error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </div>
              <div class="header-text">
                <h3 class="h3">Account Session</h3>
                <p class="text-xs text-muted">Logout or manage access.</p>
              </div>
            </div>
            <div class="card-content p-6 flex justify-center">
              <button class="btn btn-secondary sign-out-btn" (click)="onLogout()">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out of Device
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 40px; }
    .page-header p { font-size: 16px; margin-top: 4px; }
    
    .sections-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }

    .settings-card { border-radius: 24px; transition: var(--transition); }
    .settings-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-xl); }
    
    .card-header { 
      padding: 20px 24px; border-bottom: 1px solid var(--border-light);
      display: flex; align-items: center; gap: 16px;
    }
    .header-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .header-icon.primary { background: var(--primary-soft); color: var(--primary); }
    .header-icon.secondary { background: rgba(99, 102, 241, 0.1); color: var(--secondary); }
    .header-icon.error { background: #fee2e2; color: var(--danger); }
    .header-icon svg { width: 22px; height: 22px; }

    .avatar-section { display: flex; align-items: center; gap: 20px; }
    .avatar-large {
      width: 72px; height: 72px; background: var(--primary); color: white;
      border-radius: 20px; display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 800;
      box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
    }
    .avatar-info { display: flex; flex-direction: column; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .input-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; margin-left: 4px; }
    .full-width { grid-column: 1 / -1; }

    .input-with-badge { position: relative; }
    .input-with-badge .badge { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); }
    .goal-input { font-size: 24px; font-weight: 700; height: 60px; padding-right: 60px; }

    .sign-out-btn { width: 100%; height: 52px; border-radius: 16px; font-weight: 700; color: var(--danger); border-color: #fee2e2; }
    .sign-out-btn:hover { background: #fef2f2; border-color: var(--danger); }

    .success-msg { color: var(--success); font-weight: 600; }

    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ProfileComponent implements OnInit {
  firstName = ''; lastName = ''; email = '';
  calorieGoal = 2000; saving = false; savedMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  get initials(): string {
    return `${this.firstName[0] ?? ''}${this.lastName[0] ?? ''}`.toUpperCase();
  }

  ngOnInit(): void {
    const u = this.auth.currentUser;
    if (u) {
      this.firstName = u.firstName; this.lastName = u.lastName;
      this.email = u.email; this.calorieGoal = u.calorieGoal;
    }
  }

  onSave(): void {
    this.saving = true;
    this.auth.updateProfile({ firstName: this.firstName, lastName: this.lastName }).subscribe({
      next: () => { this.savedMsg = 'Profile updated'; this.saving = false; },
      error: () => { this.savedMsg = 'Failed to update'; this.saving = false; }
    });
  }

  onSaveGoal(): void {
    this.saving = true;
    this.auth.updateProfile({ calorieGoal: this.calorieGoal }).subscribe({
      next: () => { this.savedMsg = 'Goal updated'; this.saving = false; },
      error: () => { this.savedMsg = 'Failed to update'; this.saving = false; }
    });
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
