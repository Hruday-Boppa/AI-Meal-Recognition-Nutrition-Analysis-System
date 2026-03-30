import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { MealService } from '../../core/services/meal.service';
import { AuthService } from '../../core/services/auth.service';
import { DailyStats } from '../../core/models/dashboard.model';
import { Meal } from '../../core/models/meal.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page animate-in">
      <div class="container dash-container">

        <!-- Header -->
        <header class="dash-header mb-10">
          <div class="header-left">
            <h1 class="h1">Hello, {{ firstName }}!</h1>
            <p class="text-muted font-medium">It's a beautiful {{ timeOfDay }} to stay healthy.</p>
          </div>
          <div class="header-right hide-mobile">
            <span class="date-badge glass-card">{{ today | date:'EEEE, MMM d' }}</span>
          </div>
        </header>

        <!-- Main Stats Hub -->
        <div class="stats-hub glass-card mb-8">
          <div class="main-ring-area">
            <div class="progress-container">
              <svg class="progress-ring" viewBox="0 0 100 100">
                <circle class="ring-bg" cx="50" cy="50" r="45" />
                <circle class="ring-fill" cx="50" cy="50" r="45" pathLength="100" 
                        [style.stroke-dashoffset]="100 - caloriePercent" />
              </svg>
              <div class="progress-text">
                <span class="val">{{ stats?.totalCalories ?? 0 }}</span>
                <span class="label">of {{ stats?.calorieGoal ?? 2000 }} kcal</span>
              </div>
            </div>
            <div class="quick-stats">
              <div class="q-stat">
                <span class="q-val" [class.text-danger]="(stats?.remainingCalories ?? 0) < 0">
                  {{ stats?.remainingCalories ?? (stats?.calorieGoal ?? 2000) }}
                </span>
                <span class="q-label">Left</span>
              </div>
              <div class="q-divider"></div>
              <div class="q-stat">
                <span class="q-val">{{ stats?.mealsCount ?? 0 }}</span>
                <span class="q-label">Meals</span>
              </div>
            </div>
          </div>

          <div class="macro-strips">
            <div class="macro-strip">
              <div class="strip-info">
                <span class="dot protein-bg"></span>
                <span class="name">Protein</span>
                <span class="target">Goal 150g</span>
                <span class="amount">{{ stats?.totalProtein ?? 0 }}g</span>
              </div>
              <div class="strip-bar"><div class="fill protein-bg" [style.width.%]="proteinPct"></div></div>
            </div>
            <div class="macro-strip">
              <div class="strip-info">
                <span class="dot carbs-bg"></span>
                <span class="name">Carbs</span>
                <span class="target">Goal 250g</span>
                <span class="amount">{{ stats?.totalCarbs ?? 0 }}g</span>
              </div>
              <div class="strip-bar"><div class="fill carbs-bg" [style.width.%]="carbsPct"></div></div>
            </div>
            <div class="macro-strip">
              <div class="strip-info">
                <span class="dot fats-bg"></span>
                <span class="name">Fats</span>
                <span class="target">Goal 70g</span>
                <span class="amount">{{ stats?.totalFats ?? 0 }}g</span>
              </div>
              <div class="strip-bar"><div class="fill fats-bg" [style.width.%]="fatsPct"></div></div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <section class="activity-section">
          <div class="section-top flex items-center justify-between mb-4">
            <h2 class="h2">Today's Log</h2>
            <a routerLink="/food-database" class="add-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
              Quick Add
            </a>
          </div>

          <div *ngIf="loadingMeals" class="loading-meals">
            <div class="skel-meal glass-card animate-pulse" *ngFor="let i of [1,2,3]"></div>
          </div>

          <div *ngIf="!loadingMeals && meals.length === 0" class="empty-hub glass-card">
            <div class="empty-visual">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M21 5c0 1.66-4 3-9 3S3 6.66 3 5s4-3 9-3 9 1.34 9 3z"/></svg>
            </div>
            <h3 class="h3">Nothing logged today</h3>
            <p class="text-muted">Start fresh and log your first meal of the day.</p>
            <a routerLink="/scan" class="btn btn-primary mt-6">Scan Your Meal</a>
          </div>

          <div class="activity-list" *ngIf="!loadingMeals && meals.length > 0">
            <div class="meal-row glass-card" *ngFor="let meal of meals">
              <a [routerLink]="['/meals', meal.id]" class="meal-link">
                <div class="image-box">
                  <img *ngIf="meal.imageUrl" [src]="meal.imageUrl" [alt]="meal.name" (error)="onImgError($event)">
                  <div *ngIf="!meal.imageUrl" class="no-img-placeholder">🍲</div>
                  <div class="meal-time-badge">{{ meal.loggedAt | date:'h:mm' }}</div>
                </div>
                
                <div class="details">
                  <div class="top-row">
                    <span class="meal-type">{{ meal.mealType | titlecase }}</span>
                    <span class="meal-status-pill" [class]="meal.analysisStatus" *ngIf="meal.analysisStatus !== 'COMPLETED'">
                      {{ meal.analysisStatus | lowercase }}
                    </span>
                  </div>
                  <h4 class="meal-title font-bold">{{ meal.name }}</h4>
                  <div class="macro-pills">
                    <span class="p-pill">P: {{ meal.protein }}g</span>
                    <span class="c-pill">C: {{ meal.carbs }}g</span>
                    <span class="f-pill">F: {{ meal.fats }}g</span>
                  </div>
                </div>

                <div class="calories">
                  <span class="val">{{ meal.calories }}</span>
                  <span class="unit">kcal</span>
                </div>
              </a>
            </div>
          </div>
        </section>
      </div>

      <!-- Floating Action Button -->
      <a routerLink="/scan" class="main-fab" title="Scan new meal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>
      </a>
    </div>
  `,
  styles: [`
    .dash-container { max-width: 900px; padding-top: 40px; padding-bottom: 120px; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
    .date-badge { padding: 10px 24px; border-radius: 100px; font-weight: 700; color: var(--primary); font-size: 14px; box-shadow: var(--shadow-sm); }

    /* Stats Hub Redesign */
    .stats-hub {
      display: grid; grid-template-columns: 1fr 300px; gap: 40px;
      padding: 32px; border-radius: 32px;
      background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%);
    }
    .main-ring-area { display: flex; align-items: center; gap: 32px; }
    
    .progress-container { position: relative; width: 140px; height: 140px; flex-shrink: 0; }
    .progress-ring { width: 100%; height: 100%; }
    .ring-bg { fill: none; stroke: var(--surface-secondary); stroke-width: 8; }
    .ring-fill { 
      fill: none; stroke: var(--primary); stroke-width: 8; stroke-linecap: round;
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
      transition: stroke-dashoffset 1s ease-out;
    }
    .progress-text {
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center;
    }
    .progress-text .val { font-size: 28px; font-weight: 800; line-height: 1; color: var(--text-main); }
    .progress-text .label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 4px; }

    .quick-stats { display: flex; gap: 24px; align-items: center; }
    .q-stat { display: flex; flex-direction: column; }
    .q-val { font-size: 24px; font-weight: 800; color: var(--text-main); }
    .q-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
    .q-divider { width: 1px; height: 32px; background: var(--border); }

    .macro-strips { display: flex; flex-direction: column; gap: 16px; justify-content: center; }
    .macro-strip { display: flex; flex-direction: column; gap: 6px; }
    .strip-info { display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 700; }
    .strip-info .name { color: var(--text-muted); flex: 1; margin-left: 8px; }
    .strip-info .target { font-size: 11px; color: var(--text-muted); opacity: 0.7; margin-right: 12px; font-weight: 500; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .strip-bar { height: 6px; background: var(--surface-secondary); border-radius: 10px; overflow: hidden; }
    .strip-bar .fill { height: 100%; border-radius: 10px; }

    /* Activity List Redesign */
    .add-btn {
      display: flex; align-items: center; gap: 8px; padding: 10px 18px;
      background: var(--primary-soft); color: var(--primary);
      border-radius: 12px; font-weight: 700; font-size: 14px; transition: var(--transition);
    }
    .add-btn:hover { background: var(--primary); color: white; }

    .meal-row { margin-bottom: 16px; transition: var(--transition); overflow: hidden; }
    .meal-row:hover { transform: scale(1.01); }
    .meal-link { display: grid; grid-template-columns: 80px 1fr 100px; align-items: center; padding: 12px; color: inherit; }
    
    .image-box { position: relative; width: 80px; height: 80px; border-radius: 16px; overflow: hidden; background: var(--surface-secondary); }
    .image-box img { width: 100%; height: 100%; object-fit: cover; }
    .no-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 32px; }
    .meal-time-badge {
      position: absolute; bottom: 4px; right: 4px; padding: 2px 6px;
      background: rgba(0,0,0,0.5); color: white; font-size: 9px; font-weight: 700;
      border-radius: 6px; backdrop-filter: blur(4px);
    }

    .details { padding: 0 20px; }
    .meal-title { font-size: 18px; margin: 4px 0 8px; color: var(--text-main); }
    .top-row { display: flex; align-items: center; gap: 10px; }
    .meal-type { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--primary); letter-spacing: 0.5px; }
    .meal-status-pill { font-size: 9px; font-weight: 800; padding: 2px 8px; border-radius: 100px; text-transform: uppercase; }
    .meal-status-pill.PENDING { background: var(--surface-secondary); color: var(--text-muted); }
    .meal-status-pill.PROCESSING { background: #fef3c7; color: #92400e; animation: pulse 1.5s infinite; }

    .macro-pills { display: flex; gap: 12px; }
    .macro-pills span { font-size: 12px; font-weight: 600; }
    .p-pill { color: var(--protein); }
    .c-pill { color: var(--carbs); }
    .f-pill { color: var(--fats); }

    .calories { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .calories .val { font-size: 24px; font-weight: 800; color: var(--text-main); line-height: 1; }
    .calories .unit { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }

    /* Empty Hub */
    .empty-hub { padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; }
    .empty-visual { width: 80px; height: 80px; color: var(--primary); margin-bottom: 24px; opacity: 0.5; }

    .main-fab {
      position: fixed; bottom: 32px; right: 32px; width: 64px; height: 64px;
      background: var(--primary); color: white; border-radius: 22px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4); z-index: 100;
      transition: var(--transition);
    }
    .main-fab:hover { transform: scale(1.1) rotate(90deg); }
    .main-fab svg { width: 30px; height: 30px; }

    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    @media (max-width: 850px) {
      .stats-hub { grid-template-columns: 1fr; gap: 32px; }
    }
    @media (max-width: 600px) {
      .main-ring-area { flex-direction: column; text-align: center; }
      .meal-link { grid-template-columns: 70px 1fr; }
      .calories { display: none; }
      .meal-row .val { display: block; margin-top: 4px; font-size: 14px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DailyStats | null = null;
  meals: Meal[] = [];
  loadingStats = true;
  loadingMeals = true;
  today = new Date();

  constructor(
    private dashService: DashboardService,
    private mealService: MealService,
    private auth: AuthService
  ) {}

  get firstName(): string { return this.auth.currentUser?.firstName ?? ''; }
  get timeOfDay(): string {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }
  get caloriePercent(): number {
    if (!this.stats || !this.stats.calorieGoal) return 0;
    return Math.min(100, Math.round((this.stats.totalCalories / this.stats.calorieGoal) * 100));
  }

  get proteinPct(): number { return this.stats ? Math.min(100, (this.stats.totalProtein / 150) * 100) : 0; }
  get carbsPct(): number { return this.stats ? Math.min(100, (this.stats.totalCarbs / 250) * 100) : 0; }
  get fatsPct(): number { return this.stats ? Math.min(100, (this.stats.totalFats / 70) * 100) : 0; }

  ngOnInit(): void {
    this.dashService.getDaily().subscribe({
      next: s => { this.stats = s; this.loadingStats = false; },
      error: () => this.loadingStats = false
    });
    this.mealService.getMeals(0, 10).subscribe({
      next: r => { this.meals = r.content; this.loadingMeals = false; },
      error: () => this.loadingMeals = false
    });
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).style.display = 'none';
  }
}
