import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { MealService } from '../../core/services/meal.service';
import { Meal } from '../../core/models/meal.model';
import { Subject, interval } from 'rxjs';
import { switchMap, takeUntil, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-meal-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page animate-in">
      <div class="container detail-container">
        
        <div class="nav-bar mb-6">
          <a routerLink="/dashboard" class="back-btn glass-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5m7 7l-7-7 7-7"/></svg>
            Dashboard
          </a>
        </div>

        <!-- Global Status Messages -->
        <div class="status-pill glass-card processing active mb-6" *ngIf="meal?.analysisStatus === 'PROCESSING' || meal?.analysisStatus === 'PENDING'">
          <div class="spinner"></div>
          <span>AI is performing nutritional analysis...</span>
        </div>

        <div class="status-pill glass-card error mb-6" *ngIf="meal?.analysisStatus === 'FAILED'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <div class="error-content">
            <span class="error-title">Analysis Failed</span>
            <span class="error-sub">We couldn't reach the AI. Values shown are empty.</span>
          </div>
          <button class="retry-btn" (click)="onRetry()" [disabled]="retrying">
            <span *ngIf="!retrying">Retry AI Scan</span>
            <div class="spinner sm" *ngIf="retrying"></div>
          </button>
        </div>

        <div *ngIf="meal && !loading" class="meal-content">
          <!-- Hero Image -->
          <div class="hero-box glass-card mb-8" *ngIf="meal.imageUrl">
            <img [src]="meal.imageUrl" [alt]="meal.name" class="hero-img">
            <div class="hero-overlay">
              <div class="meal-meta-pills">
                <span class="pill">{{ meal.loggedAt | date:'h:mm a' }}</span>
                <span class="pill primary">{{ meal.mealType | titlecase }}</span>
              </div>
            </div>
          </div>

          <!-- Main Stats Card -->
          <div class="detail-card glass-card mb-6" [class.is-editing]="isEditing">
            <div class="card-header">
              <div class="title-area">
                <h1 class="h1" *ngIf="!isEditing">{{ meal.name }}</h1>
                <input *ngIf="isEditing" type="text" [(ngModel)]="editMeal.name" class="input title-input">
              </div>
              <div class="health-badge" *ngIf="!isEditing">
                <div class="badge-ring" [style.background]="'conic-gradient(var(--primary) ' + (meal.healthScore * 10) + '%, var(--surface-secondary) 0)'">
                  <div class="inner">
                    <span class="score">{{ meal.healthScore | number:'1.0-1' }}</span>
                    <span class="label">Score</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="calories-focus mb-8">
              <div class="cal-main">
                <span class="val" *ngIf="!isEditing">{{ meal.calories }}</span>
                <input *ngIf="isEditing" type="number" [(ngModel)]="editMeal.calories" class="input cal-input-large">
                <span class="unit">kCal Total</span>
              </div>
              <div class="confidence-indicator" *ngIf="meal.confidence && !isEditing">
                <div class="conf-bar"><div class="conf-fill" [style.width.%]="meal.confidence"></div></div>
                <span class="conf-text">{{ meal.confidence }}% AI Confidence</span>
              </div>
            </div>

            <div class="macros-grid">
              <div class="macro-cell protein">
                <div class="icon">🥩</div>
                <div class="val" *ngIf="!isEditing">{{ meal.protein | number:'1.1-1' }}g</div>
                <input *ngIf="isEditing" type="number" [(ngModel)]="editMeal.protein" class="input cell-input">
                <div class="label">Protein</div>
              </div>
              <div class="macro-cell carbs">
                <div class="icon">🌾</div>
                <div class="val" *ngIf="!isEditing">{{ meal.carbs | number:'1.1-1' }}g</div>
                <input *ngIf="isEditing" type="number" [(ngModel)]="editMeal.carbs" class="input cell-input">
                <div class="label">Carbs</div>
              </div>
              <div class="macro-cell fats">
                <div class="icon">🥑</div>
                <div class="val" *ngIf="!isEditing">{{ meal.fats | number:'1.1-1' }}g</div>
                <input *ngIf="isEditing" type="number" [(ngModel)]="editMeal.fats" class="input cell-input">
                <div class="label">Fats</div>
              </div>
            </div>
          </div>

          <!-- Ingredients & Breakdown -->
          <div class="info-sections">
            <div class="section glass-card" *ngIf="meal.ingredients">
              <h4 class="h3 mb-3">Detected Ingredients</h4>
              <p class="text-sm text-muted line-relaxed">{{ meal.ingredients }}</p>
            </div>

            <div class="section glass-card">
              <h4 class="h3 mb-3">Meal Notes</h4>
              <p class="text-sm text-muted" *ngIf="!isEditing">{{ meal.notes || 'No extra notes provided.' }}</p>
              <textarea *ngIf="isEditing" [(ngModel)]="editMeal.notes" class="input w-full" rows="3" placeholder="Add additional context..."></textarea>
            </div>
          </div>

          <!-- Bottom Actions -->
          <footer class="detail-actions mt-8">
            <ng-container *ngIf="!isEditing">
              <button class="btn btn-secondary flex-1" (click)="onEdit()" [disabled]="meal.analysisStatus === 'PROCESSING'">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit Records
              </button>
              <button class="btn btn-secondary delete-btn" (click)="onDelete()">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
              </button>
            </ng-container>
            
            <ng-container *ngIf="isEditing">
              <button class="btn btn-primary flex-1" (click)="onSave()" [disabled]="saving">
                {{ saving ? 'Updating...' : 'Commit Changes' }}
              </button>
              <button class="btn btn-secondary" (click)="onCancel()" [disabled]="saving">Discard</button>
            </ng-container>
          </footer>
        </div>

        <div class="loading-state glass-card p-12 text-center" *ngIf="loading">
          <div class="spinner big mb-4"></div>
          <p class="h3 text-muted">Synchronizing with health database...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container { max-width: 750px; padding-top: 40px; padding-bottom: 120px; }
    
    .back-btn { 
      display: inline-flex; align-items: center; gap: 8px; 
      padding: 10px 18px; font-weight: 700; font-size: 14px; color: var(--text-muted);
    }
    .back-btn svg { width: 18px; height: 18px; transition: var(--transition); }
    .back-btn:hover svg { transform: translateX(-4px); }

    .status-pill {
      display: flex; align-items: center; gap: 12px; padding: 16px 24px;
      border-radius: 100px; font-weight: 600; font-size: 14px;
    }
    .status-pill.processing { background: var(--primary-soft); color: var(--primary); }
    .status-pill.processing .spinner { border-top-color: var(--primary); }
    .status-pill.error { 
      background: rgba(239, 68, 68, 0.05); 
      color: #dc2626; 
      border: 1px solid rgba(239, 68, 68, 0.15);
      padding: 12px 20px;
      backdrop-filter: blur(10px);
    }
    .status-pill.error svg { width: 22px; height: 22px; flex-shrink: 0; }

    .hero-box { position: relative; height: 360px; border-radius: 32px; overflow: hidden; }
    .hero-img { width: 100%; height: 100%; object-fit: cover; }
    .hero-overlay {
      position: absolute; bottom: 0; left: 0; right: 0; padding: 24px;
      background: linear-gradient(transparent, rgba(0,0,0,0.4));
    }
    .meal-meta-pills { display: flex; gap: 8px; }
    .meal-meta-pills .pill {
      padding: 6px 14px; background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);
      color: white; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase;
    }
    .meal-meta-pills .pill.primary { background: var(--primary); }

    .detail-card { padding: 32px; border-radius: 32px; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .title-input { font-size: 28px; font-weight: 800; border-color: var(--primary); }

    .badge-ring {
      width: 72px; height: 72px; padding: 4px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .badge-ring .inner {
      width: 100%; height: 100%; background: white; border-radius: 50%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    }
    .badge-ring .score { font-size: 20px; font-weight: 800; color: var(--primary); line-height: 1; }
    .badge-ring .label { font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

    .calories-focus { text-align: center; }
    .cal-main { display: flex; align-items: baseline; justify-content: center; gap: 12px; }
    .cal-main .val { font-size: 72px; font-weight: 800; color: var(--text-main); line-height: 0.9; letter-spacing: -2px; }
    .cal-input-large { font-size: 48px; font-weight: 800; text-align: center; max-width: 200px; height: 80px; }
    .cal-main .unit { font-size: 18px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    
    .confidence-indicator { 
      margin-top: 16px; display: flex; flex-direction: column; align-items: center; gap: 6px; 
    }
    .conf-bar { width: 120px; height: 4px; background: var(--surface-secondary); border-radius: 10px; overflow: hidden; }
    .conf-fill { height: 100%; background: var(--primary); border-radius: 10px; }
    .conf-text { font-size: 11px; font-weight: 700; color: var(--text-muted); }

    .macros-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .macro-cell { 
      padding: 20px; border-radius: 20px; text-align: center; 
      background: var(--surface-secondary); transition: var(--transition);
    }
    .macro-cell:hover { transform: translateY(-4px); background: white; box-shadow: var(--shadow-md); }
    .macro-cell .icon { font-size: 24px; margin-bottom: 8px; }
    .macro-cell .val { font-size: 22px; font-weight: 800; color: var(--text-main); margin-bottom: 2px; }
    .cell-input { text-align: center; height: 40px; font-weight: 700; }
    .macro-cell .label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }

    .protein { border-bottom: 4px solid var(--protein); }
    .carbs { border-bottom: 4px solid var(--carbs); }
    .fats { border-bottom: 4px solid var(--fats); }

    .info-sections { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 24px; }
    .section { padding: 24px; border-radius: 24px; }
    .line-relaxed { line-height: 1.8; }

    .detail-actions { display: flex; gap: 12px; align-items: stretch; margin-top: 40px; }
    .flex-1 { flex: 1; }
    
    .detail-actions .btn { 
      padding: 16px 24px; border-radius: 20px; font-size: 14px; font-weight: 700; 
      border: 1.5px solid var(--border); transition: var(--transition);
      box-shadow: var(--shadow-sm);
    }
    
    .detail-actions .btn-secondary { background: white; color: var(--text-main); }
    .detail-actions .btn-secondary:hover { 
      background: var(--surface-secondary); border-color: var(--primary-light); 
      transform: translateY(-2px); box-shadow: var(--shadow-md);
    }

    .detail-actions .delete-btn { 
      width: 60px; color: var(--danger); border-color: #fed7d7;
      display: flex; align-items: center; justify-content: center;
    }
    .detail-actions .delete-btn:hover { 
      background: #fff5f5; border-color: var(--danger); 
      transform: translateY(-2px); box-shadow: var(--shadow-md);
    }

    .detail-actions .btn-primary { 
      background: var(--primary); color: white; border-color: var(--primary);
    }
    .detail-actions .btn-primary:hover { 
      background: var(--primary-dark); transform: translateY(-2px); 
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2); 
    }

    .error-content { flex: 1; display: flex; flex-direction: column; margin-left: 4px; }
    .error-title { font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.02em; }
    .error-sub { font-size: 12px; opacity: 0.7; font-weight: 500; }
    
    .retry-btn {
      background: #dc2626; color: white; border: none; padding: 8px 18px;
      border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer;
      transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;
      min-width: 110px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
    }
    .retry-btn:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); box-shadow: 0 6px 15px rgba(220, 38, 38, 0.3); }
    .retry-btn:active:not(:disabled) { transform: translateY(0); }
    .retry-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .spinner.sm { width: 14px; height: 14px; border-width: 2px; border-top-color: white; }

    .spinner.big { width: 48px; height: 48px; border-width: 4px; border-top-color: var(--primary); margin: 0 auto; }

    @media (max-width: 600px) {
      .detail-card { padding: 20px; }
      .cal-main .val { font-size: 56px; }
      .macros-grid { gap: 8px; }
      .macro-cell { padding: 12px; }
    }
  `]
})
export class MealDetailComponent implements OnInit, OnDestroy {
  meal: Meal | null = null;
  editMeal: any = {};
  loading = true;
  isEditing = false;
  saving = false;
  retrying = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private mealService: MealService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Initial load
    this.mealService.getMealById(id).subscribe({
      next: m => {
        this.meal = m;
        this.loading = false;
        // Start polling only if AI is still working
        if (m.analysisStatus === 'PENDING' || m.analysisStatus === 'PROCESSING') {
          this.startPolling(id);
        }
      },
      error: () => { this.loading = false; }
    });
  }

  /** Poll every 3 seconds, stop automatically once AI finishes */
  private startPolling(id: number): void {
    interval(3000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.mealService.getMealStatus(id)),
      // `true` keeps the last emission so the final COMPLETED state is applied
      takeWhile(m => m.analysisStatus === 'PENDING' || m.analysisStatus === 'PROCESSING', true)
    ).subscribe({
      next: m => { 
        this.meal = m; 
        if (m.analysisStatus === 'COMPLETED' || m.analysisStatus === 'FAILED') {
          // If we were editing while polling (unlikely but possible), sync if needed
        }
      }
    });
  }

  onEdit(): void {
    if (!this.meal) return;
    this.isEditing = true;
    this.editMeal = { ...this.meal };
  }

  onCancel(): void {
    this.isEditing = false;
    this.editMeal = {};
  }

  onSave(): void {
    if (!this.meal || !this.editMeal) return;
    this.saving = true;
    
    // Construct the update object
    const updates = {
      name: this.editMeal.name,
      notes: this.editMeal.notes,
      calories: this.editMeal.calories,
      protein: this.editMeal.protein,
      carbs: this.editMeal.carbs,
      fats: this.editMeal.fats
    };

    this.mealService.updateMeal(this.meal.id, updates).subscribe({
      next: updated => {
        this.meal = updated;
        this.isEditing = false;
        this.saving = false;
      },
      error: () => {
        alert('Failed to save changes.');
        this.saving = false;
      }
    });
  }

  onDelete(): void {
    if (!this.meal || !confirm('Delete this meal?')) return;
    this.mealService.deleteMeal(this.meal.id).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => alert('Failed to delete meal.')
    });
  }

  onRetry(): void {
    if (!this.meal || this.retrying) return;
    this.retrying = true;
    
    this.mealService.retryAnalysis(this.meal.id).subscribe({
      next: updated => {
        this.meal = updated;
        this.retrying = false;
        // Reinstate polling to watch the new analysis
        this.startPolling(updated.id);
      },
      error: () => {
        alert('Could not restart AI analysis. Please try again later.');
        this.retrying = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Ensures the poll interval is cancelled when the user navigates away
    this.destroy$.next();
    this.destroy$.complete();
  }
}
