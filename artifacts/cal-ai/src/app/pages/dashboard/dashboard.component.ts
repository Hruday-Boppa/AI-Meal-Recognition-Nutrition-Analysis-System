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
    <div class="page">
      <div class="container">

        <!-- Greeting -->
        <div class="greeting mb-6">
          <h2>Good {{ timeOfDay }}, {{ firstName }} 👋</h2>
          <p class="text-muted">{{ today | date:'EEEE, MMMM d' }}</p>
        </div>

        <!-- Stats cards -->
        <div class="stats-grid mb-6" *ngIf="!loadingStats">
          <div class="stat-card card">
            <div class="stat-label">Calories Today</div>
            <div class="stat-value">{{ stats?.totalCalories ?? 0 }}</div>
            <div class="stat-sub text-muted">/ {{ stats?.calorieGoal ?? 2000 }} goal</div>
            <div class="progress-bar mt-3">
              <div class="progress-fill" [style.width.%]="caloriePercent" [class.over]="caloriePercent > 100"></div>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-label">Remaining</div>
            <div class="stat-value" [class.text-danger]="(stats?.remainingCalories ?? 0) < 0">
              {{ stats?.remainingCalories ?? (stats?.calorieGoal ?? 2000) }}
            </div>
            <div class="stat-sub text-muted">calories left</div>
          </div>

          <div class="stat-card card">
            <div class="stat-label">Meals Logged</div>
            <div class="stat-value">{{ stats?.mealsCount ?? 0 }}</div>
            <div class="stat-sub text-muted">today</div>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div class="stats-grid mb-6" *ngIf="loadingStats">
          <div class="stat-card card skeleton" *ngFor="let i of [1,2,3]">
            <div class="skel-line"></div><div class="skel-line skel-short"></div>
          </div>
        </div>

        <!-- Macros -->
        <div class="card macro-card mb-6" *ngIf="stats">
          <div class="macro-title font-semibold mb-4">Today's Macros</div>
          <div class="macros">
            <div class="macro-item">
              <div class="macro-header">
                <span class="macro-dot protein-bg"></span>
                <span class="text-sm font-medium">Protein</span>
              </div>
              <div class="macro-value protein-color">{{ stats.totalProtein }}g</div>
            </div>
            <div class="macro-item">
              <div class="macro-header">
                <span class="macro-dot carbs-bg"></span>
                <span class="text-sm font-medium">Carbs</span>
              </div>
              <div class="macro-value carbs-color">{{ stats.totalCarbs }}g</div>
            </div>
            <div class="macro-item">
              <div class="macro-header">
                <span class="macro-dot fats-bg"></span>
                <span class="text-sm font-medium">Fats</span>
              </div>
              <div class="macro-value fats-color">{{ stats.totalFats }}g</div>
            </div>
          </div>
        </div>

        <!-- Recent meals -->
        <div class="section-header mb-3">
          <h3 class="font-semibold">Recently Logged</h3>
          <a routerLink="/food-database" class="text-primary text-sm font-medium">+ Add food</a>
        </div>

        <div *ngIf="loadingMeals" class="card p-4">
          <div class="skel-meal" *ngFor="let i of [1,2,3]"></div>
        </div>

        <div *ngIf="!loadingMeals && meals.length === 0" class="empty-state card">
          <div class="empty-icon">🍽️</div>
          <p class="font-semibold">No meals logged today</p>
          <p class="text-muted text-sm">Scan a meal or search the food database to get started</p>
          <a routerLink="/scan" class="btn btn-primary mt-4">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Scan Meal
          </a>
        </div>

        <div class="meals-list" *ngIf="!loadingMeals && meals.length > 0">
          <a class="meal-card card" *ngFor="let meal of meals" [routerLink]="['/meals', meal.id]">
            <div class="meal-img-wrap" *ngIf="meal.imageUrl">
              <img [src]="meal.imageUrl" [alt]="meal.name" class="meal-img" (error)="onImgError($event)">
            </div>
            <div class="meal-no-img" *ngIf="!meal.imageUrl">🍽️</div>
            <div class="meal-info">
              <div class="meal-name font-semibold">{{ meal.name }}</div>
              <div class="meal-meta text-muted text-sm">
                {{ meal.loggedAt | date:'h:mm a' }} · {{ meal.mealType | titlecase }}
              </div>
              <div class="meal-macros text-sm mt-1">
                <span class="protein-color">🥩 {{ meal.protein }}g</span>
                <span class="carbs-color">🌾 {{ meal.carbs }}g</span>
                <span class="fats-color">💧 {{ meal.fats }}g</span>
              </div>
            </div>
            <div class="meal-cals">
              <span class="fire">🔥</span>
              <span class="cal-num font-bold">{{ meal.calories }}</span>
              <span class="cal-label text-muted text-xs">cal</span>
            </div>
            <div class="meal-status badge badge-yellow" *ngIf="meal.analysisStatus === 'PROCESSING'">Processing</div>
          </a>
        </div>

      </div>

      <!-- FAB -->
      <a routerLink="/scan" class="fab">
        <svg width="26" height="26" fill="none" stroke="white" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </a>
    </div>
  `,
  styles: [`
    .page { padding-bottom: 80px; }
    .container { max-width: 700px; margin: 0 auto; padding: 24px 20px; }
    .greeting h2 { font-size: 22px; font-weight: 700; margin: 0 0 4px; color: #111827; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .stat-card { padding: 20px; }
    .stat-label { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
    .stat-value { font-size: 32px; font-weight: 700; color: #111827; line-height: 1; }
    .stat-sub { font-size: 13px; margin-top: 4px; }
    .progress-bar { height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: #22c55e; border-radius: 3px; transition: width .5s ease; max-width: 100%; }
    .progress-fill.over { background: #ef4444; }
    .macro-card { padding: 20px; }
    .macros { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .macro-item { text-align: center; }
    .macro-header { display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 8px; }
    .macro-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .macro-value { font-size: 22px; font-weight: 700; }
    .section-header { display: flex; align-items: center; justify-content: space-between; }
    .section-header h3 { font-size: 17px; margin: 0; }
    .meals-list { display: flex; flex-direction: column; gap: 10px; }
    .meal-card {
      display: flex; align-items: center; gap: 14px; padding: 14px 16px;
      text-decoration: none; color: inherit; transition: box-shadow .2s;
    }
    .meal-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }
    .meal-img-wrap { width: 60px; height: 60px; border-radius: 10px; overflow: hidden; flex-shrink: 0; }
    .meal-img { width: 100%; height: 100%; object-fit: cover; }
    .meal-no-img { width: 60px; height: 60px; border-radius: 10px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
    .meal-info { flex: 1; min-width: 0; }
    .meal-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meal-macros { display: flex; gap: 8px; }
    .meal-cals { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
    .fire { font-size: 18px; }
    .cal-num { font-size: 20px; line-height: 1; }
    .meal-status { margin-left: 8px; }
    .empty-state { padding: 48px 24px; text-align: center; }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .fab {
      position: fixed; bottom: 24px; right: 24px;
      width: 58px; height: 58px; background: #22c55e;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(34,197,94,.45); z-index: 50;
    }
    .fab:hover { background: #16a34a; }
    .skeleton { animation: pulse 1.5s ease-in-out infinite; }
    .skel-line { height: 16px; background: #e5e7eb; border-radius: 4px; margin-bottom: 10px; }
    .skel-short { width: 60%; }
    .skel-meal { height: 60px; background: #f3f4f6; border-radius: 8px; margin-bottom: 10px; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: 1fr 1fr; } .stat-value { font-size: 24px; } }
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
    return Math.round((this.stats.totalCalories / this.stats.calorieGoal) * 100);
  }

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
