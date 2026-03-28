import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav-shell">
      <div class="nav-inner">
        <a routerLink="/dashboard" class="nav-logo">
          <span class="logo-icon">🍎</span>
          <span class="logo-text">Cal AI</span>
        </a>

        <div class="nav-links hide-mobile">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Home
          </a>
          <a routerLink="/progress" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Progress
          </a>
          <a routerLink="/food-database" routerLinkActive="active" class="nav-link">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Food DB
          </a>
        </div>

        <div class="nav-actions">
          <a routerLink="/scan" class="btn btn-primary btn-sm">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Log Meal
          </a>
          <a routerLink="/profile" class="avatar-btn">
            <div class="avatar">{{ initials }}</div>
          </a>
        </div>
      </div>

      <!-- Mobile bottom nav -->
      <div class="mobile-nav hide-desktop">
        <a routerLink="/dashboard" routerLinkActive="active" class="mob-link">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Home</span>
        </a>
        <a routerLink="/progress" routerLinkActive="active" class="mob-link">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span>Progress</span>
        </a>
        <a routerLink="/scan" class="mob-link mob-scan">
          <div class="scan-fab">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
        </a>
        <a routerLink="/food-database" routerLinkActive="active" class="mob-link">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Search</span>
        </a>
        <a routerLink="/profile" routerLinkActive="active" class="mob-link">
          <svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Profile</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .nav-shell {
      position: sticky; top: 0; z-index: 100;
      background: rgba(255,255,255,.95); backdrop-filter: blur(12px);
      border-bottom: 1px solid #e5e7eb;
    }
    .nav-inner {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; gap: 16px;
      padding: 12px 20px;
    }
    .nav-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 18px; color: #111827; }
    .logo-icon { font-size: 22px; }
    .nav-links { display: flex; align-items: center; gap: 4px; margin-left: 24px; }
    .nav-link {
      display: flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 8px;
      font-size: 14px; font-weight: 500; color: #6b7280;
      transition: all .15s;
    }
    .nav-link:hover, .nav-link.active { color: #22c55e; background: #f0fdf4; }
    .nav-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .avatar-btn { display: flex; align-items: center; }
    .avatar {
      width: 34px; height: 34px; background: #22c55e; color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; cursor: pointer;
    }
    /* Mobile nav */
    .mobile-nav {
      display: flex; align-items: center; justify-content: space-around;
      padding: 8px 0 12px; border-top: 1px solid #f3f4f6;
    }
    .mob-link {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 4px 12px; color: #9ca3af; font-size: 10px; font-weight: 500;
      transition: color .15s;
    }
    .mob-link.active { color: #22c55e; }
    .mob-link.mob-scan { color: transparent; }
    .scan-fab {
      width: 52px; height: 52px; background: #22c55e; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; box-shadow: 0 4px 14px rgba(34,197,94,.4);
      margin-top: -20px;
    }
    @media (min-width: 769px) { .mobile-nav { display: none; } }
    @media (max-width: 768px) {
      .nav-inner { padding: 10px 16px; }
      .nav-links, .nav-actions .btn-primary { display: none; }
    }
  `]
})
export class NavComponent {
  constructor(private auth: AuthService) {}
  get initials(): string {
    const u = this.auth.currentUser;
    if (!u) return '?';
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
  }
}
