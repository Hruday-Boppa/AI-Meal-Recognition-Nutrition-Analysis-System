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
    <div class="page">
      <div class="container">
        <h2 class="page-title">Profile & Settings</h2>

        <!-- Avatar -->
        <div class="profile-header card mb-6">
          <div class="avatar-large">{{ initials }}</div>
          <div>
            <div class="profile-name font-bold">{{ firstName }} {{ lastName }}</div>
            <div class="profile-email text-muted text-sm">{{ email }}</div>
          </div>
        </div>

        <!-- Edit form -->
        <div class="card p-5 mb-4">
          <h4 class="font-semibold mb-4">Personal Information</h4>
          <div class="form-grid">
            <div class="input-group">
              <label>First name</label>
              <input class="input" [(ngModel)]="firstName" placeholder="First name">
            </div>
            <div class="input-group">
              <label>Last name</label>
              <input class="input" [(ngModel)]="lastName" placeholder="Last name">
            </div>
            <div class="input-group" style="grid-column:1/-1">
              <label>Email</label>
              <input class="input" [value]="email" disabled>
            </div>
          </div>
          <button class="btn btn-primary mt-4" (click)="onSave()" [disabled]="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
          <div class="success-msg mt-2" *ngIf="savedMsg">✓ {{ savedMsg }}</div>
        </div>

        <!-- Calorie goal -->
        <div class="card p-5 mb-4">
          <h4 class="font-semibold mb-4">Daily Calorie Goal</h4>
          <div class="calorie-goal-wrap">
            <input class="input" type="number" [(ngModel)]="calorieGoal" min="1000" max="5000" style="max-width:160px">
            <span class="text-muted text-sm">calories / day</span>
          </div>
          <button class="btn btn-primary mt-4" (click)="onSaveGoal()" [disabled]="saving">
            Update Goal
          </button>
        </div>

        <!-- Danger zone -->
        <div class="card p-5 danger-zone">
          <h4 class="font-semibold mb-2 text-danger">Danger Zone</h4>
          <button class="btn btn-secondary" (click)="onLogout()">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page { padding-bottom: 80px; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px 20px; }
    .page-title { font-size: 24px; font-weight: 700; margin: 0 0 24px; }
    .profile-header { display: flex; align-items: center; gap: 16px; padding: 20px 24px; }
    .avatar-large { width: 60px; height: 60px; background: #22c55e; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; flex-shrink: 0; }
    .profile-name { font-size: 18px; margin-bottom: 2px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .calorie-goal-wrap { display: flex; align-items: center; gap: 12px; }
    .success-msg { color: #16a34a; font-size: 14px; font-weight: 500; }
    .danger-zone { border-color: #fee2e2; }
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
