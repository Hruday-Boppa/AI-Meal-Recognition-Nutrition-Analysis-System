import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav-shell glass-card">
      <div class="nav-inner">
        <a routerLink="/dashboard" class="nav-logo">
          <div class="logo-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span class="logo-text">CalAI</span>
        </a>

        <div class="nav-links hide-mobile">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <span>Dashboard</span>
          </a>
          <a routerLink="/progress" routerLinkActive="active" class="nav-link">
            <span>Insights</span>
          </a>
          <a routerLink="/food-database" routerLinkActive="active" class="nav-link">
            <span>Library</span>
          </a>
        </div>

        <div class="nav-actions">
          <a routerLink="/scan" class="btn btn-primary log-btn hide-mobile">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Scan Meal
          </a>
          <a routerLink="/profile" class="profile-link">
            <div class="avatar">{{ initials }}</div>
          </a>
        </div>
      </div>

      <!-- Mobile Floating Navigation -->
      <div class="mobile-nav hide-desktop glass-card">
        <a routerLink="/dashboard" routerLinkActive="active" class="mob-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
          <span>Home</span>
        </a>
        <a routerLink="/progress" routerLinkActive="active" class="mob-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          <span>Insights</span>
        </a>
        <a routerLink="/scan" class="mob-scan">
          <div class="scan-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>
          </div>
        </a>
        <a routerLink="/food-database" routerLinkActive="active" class="mob-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span>Explore</span>
        </a>
        <a routerLink="/profile" routerLinkActive="active" class="mob-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Me</span>
        </a>
      </div>
    </nav>
  `,
  styles: [`
    .nav-shell {
      position: sticky; top: 16px; z-index: 1000;
      margin: 0 16px; padding: 4px 0;
      border-radius: 20px;
    }
    .nav-inner {
      max-width: 1200px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 20px;
    }
    .nav-logo { display: flex; align-items: center; gap: 10px; }
    .logo-box {
      width: 36px; height: 36px; background: var(--primary);
      color: white; border-radius: 10px; display: flex;
      align-items: center; justify-content: center; padding: 7px;
      box-shadow: 0 4px 12px var(--primary-soft);
    }
    .logo-text { font-size: 20px; font-weight: 800; color: var(--text-main); letter-spacing: -0.5px; }

    .nav-links { display: flex; gap: 8px; }
    .nav-link {
      padding: 8px 16px; border-radius: 12px; font-size: 15px;
      font-weight: 600; color: var(--text-muted); transition: var(--transition);
    }
    .nav-link:hover { color: var(--primary); background: var(--primary-soft); }
    .nav-active, .nav-link.active { color: var(--primary); background: var(--primary-soft); }

    .nav-actions { display: flex; align-items: center; gap: 16px; }
    .log-btn { height: 42px; padding: 0 18px; border-radius: 12px; }
    
    .profile-link { transition: var(--transition); }
    .profile-link:hover { transform: scale(1.05); }
    .avatar {
      width: 40px; height: 40px; background: var(--surface-secondary);
      border: 2px solid var(--border); color: var(--primary);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700;
    }

    /* Floating Mobile Navigation */
    .mobile-nav {
      position: fixed; bottom: 24px; left: 16px; right: 16px;
      height: 72px; padding: 0 12px; border-radius: 24px;
      display: none; align-items: center; justify-content: space-between;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .mob-link {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      width: 60px; color: var(--text-muted); font-size: 11px; font-weight: 600;
    }
    .mob-link svg { width: 22px; height: 22px; transition: var(--transition); }
    .mob-link.active { color: var(--primary); }
    .mob-link.active svg { transform: translateY(-2px); }

    .mob-scan { transform: translateY(-24px); }
    .scan-btn {
      width: 60px; height: 60px; background: var(--primary);
      color: white; border-radius: 20px; display: flex;
      align-items: center; justify-content: center;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      border: 4px solid var(--surface);
    }
    .scan-btn svg { width: 28px; height: 28px; }

    @media (max-width: 768px) {
      .nav-shell { top: 0; margin: 0; border-radius: 0; border-top: none; }
      .mobile-nav { display: flex; }
      .hide-mobile { display: none !important; }
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
