import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { MealService } from '../../core/services/meal.service';
import { Meal } from '../../core/models/meal.model';

@Component({
  selector: 'app-meal-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page">
      <div class="container">

        <div class="back-link mb-4">
          <a routerLink="/dashboard" class="btn btn-secondary btn-sm">
            ← Back to Dashboard
          </a>
        </div>

        <!-- Loading -->
        <div class="card p-6 text-center" *ngIf="loading">
          <div class="spinner" style="margin: 0 auto 12px"></div>
          <p class="text-muted">Loading meal details...</p>
        </div>

        <!-- Processing -->
        <div class="card processing-banner mb-4" *ngIf="meal?.analysisStatus === 'PROCESSING'">
          <div class="spinner" style="width:18px;height:18px;border-width:2px;margin-right:10px"></div>
          <span>AI is still analyzing this meal...</span>
        </div>

        <div *ngIf="meal && !loading">
          <!-- Image header -->
          <div class="meal-header card mb-4" *ngIf="meal.imageUrl">
            <img [src]="meal.imageUrl" [alt]="meal.name" class="meal-hero">
          </div>

          <!-- Nutrition card -->
          <div class="card nutrition-card mb-4">
            <div class="nutrition-header">
              <div>
                <div class="meal-time text-muted text-sm">{{ meal.loggedAt | date:'h:mm a' }} · {{ meal.mealType | titlecase }}</div>
                <h2 class="meal-name">{{ meal.name }}</h2>
              </div>
              <div class="health-score">
                <div class="score-label text-xs text-muted">Health Score</div>
                <div class="score-val">{{ meal.healthScore }}/10</div>
                <div class="score-bar">
                  <div class="score-fill" [style.width.%]="meal.healthScore * 10"></div>
                </div>
              </div>
            </div>

            <div class="calorie-big">
              <span class="fire-icon">🔥</span>
              <span class="cal-number">{{ meal.calories }}</span>
              <span class="cal-label text-muted">calories</span>
            </div>

            <div class="macros-grid">
              <div class="macro-box">
                <div class="macro-icon">🥩</div>
                <div class="macro-val protein-color font-bold">{{ meal.protein }}g</div>
                <div class="macro-lbl text-muted text-xs">Protein</div>
              </div>
              <div class="macro-box">
                <div class="macro-icon">🌾</div>
                <div class="macro-val carbs-color font-bold">{{ meal.carbs }}g</div>
                <div class="macro-lbl text-muted text-xs">Carbs</div>
              </div>
              <div class="macro-box">
                <div class="macro-icon">💧</div>
                <div class="macro-val fats-color font-bold">{{ meal.fats }}g</div>
                <div class="macro-lbl text-muted text-xs">Fats</div>
              </div>
            </div>

            <div class="confidence-row" *ngIf="meal.confidence">
              <span class="text-sm text-muted">AI Confidence:</span>
              <span class="badge" [class.badge-green]="meal.confidence >= 80" [class.badge-yellow]="meal.confidence >= 60 && meal.confidence < 80" [class.badge-red]="meal.confidence < 60">
                {{ meal.confidence }}%
              </span>
            </div>
          </div>

          <!-- Notes -->
          <div class="card p-4 mb-4" *ngIf="meal.notes">
            <div class="font-semibold text-sm mb-1">Notes</div>
            <p class="text-muted text-sm m-0">{{ meal.notes }}</p>
          </div>

          <!-- Actions -->
          <div class="actions">
            <button class="btn btn-danger" (click)="onDelete()">Delete Meal</button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page { padding-bottom: 80px; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px 20px; }
    .processing-banner { display: flex; align-items: center; padding: 14px 20px; background: #fefce8; border-color: #fde68a; }
    .meal-hero { width: 100%; max-height: 320px; object-fit: cover; border-radius: 12px; display: block; }
    .nutrition-card { padding: 24px; }
    .nutrition-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .meal-name { font-size: 22px; font-weight: 700; margin: 4px 0 0; color: #111827; }
    .health-score { text-align: right; }
    .score-val { font-size: 18px; font-weight: 700; color: #22c55e; }
    .score-bar { width: 80px; height: 5px; background: #e5e7eb; border-radius: 3px; margin-top: 4px; }
    .score-fill { height: 100%; background: #22c55e; border-radius: 3px; }
    .calorie-big { display: flex; align-items: baseline; gap: 8px; margin-bottom: 24px; }
    .fire-icon { font-size: 32px; }
    .cal-number { font-size: 56px; font-weight: 800; color: #111827; line-height: 1; }
    .cal-label { font-size: 18px; color: #9ca3af; }
    .macros-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .macro-box { background: #f9fafb; border-radius: 10px; padding: 16px 12px; text-align: center; }
    .macro-icon { font-size: 22px; margin-bottom: 6px; }
    .macro-val { font-size: 22px; margin-bottom: 2px; }
    .confidence-row { display: flex; align-items: center; gap: 10px; }
    .actions { display: flex; gap: 12px; }
  `]
})
export class MealDetailComponent implements OnInit {
  meal: Meal | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private mealService: MealService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.mealService.getMealById(id).subscribe({
      next: m => { this.meal = m; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onDelete(): void {
    if (!this.meal || !confirm('Delete this meal?')) return;
    this.mealService.deleteMeal(this.meal.id).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => alert('Failed to delete meal.')
    });
  }
}
