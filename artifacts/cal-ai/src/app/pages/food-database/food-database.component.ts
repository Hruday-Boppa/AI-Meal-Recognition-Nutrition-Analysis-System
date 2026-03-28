import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { MealService } from '../../core/services/meal.service';
import { FoodItem } from '../../core/models/meal.model';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-food-database',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page">
      <div class="container">

        <div class="page-header mb-6">
          <h2 class="page-title">Food Database</h2>
          <p class="text-muted">Search and log foods manually</p>
        </div>

        <!-- Search -->
        <div class="search-wrap mb-4">
          <div class="search-input-wrap">
            <svg class="search-icon" width="18" height="18" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="search-input" type="search" [(ngModel)]="query"
                   (ngModelChange)="onSearch($event)"
                   placeholder="Search foods... (e.g. apple, chicken breast)">
          </div>
        </div>

        <!-- Log empty food option -->
        <div class="empty-food-btn mb-4">
          <button class="btn btn-secondary w-full" (click)="showAddManual = !showAddManual">
            ✏️ Log custom food
          </button>
        </div>

        <!-- Add manual form -->
        <div class="card p-5 mb-4" *ngIf="showAddManual">
          <h4 class="font-semibold mb-4" style="margin:0 0 16px">Custom Food Entry</h4>
          <div class="manual-grid">
            <div class="input-group" style="grid-column:1/-1">
              <label>Food name</label>
              <input class="input" [(ngModel)]="manual.name" placeholder="My custom food">
            </div>
            <div class="input-group">
              <label>Calories</label>
              <input class="input" type="number" [(ngModel)]="manual.calories" placeholder="300">
            </div>
            <div class="input-group">
              <label>Protein (g)</label>
              <input class="input" type="number" [(ngModel)]="manual.protein" placeholder="20">
            </div>
            <div class="input-group">
              <label>Carbs (g)</label>
              <input class="input" type="number" [(ngModel)]="manual.carbs" placeholder="30">
            </div>
            <div class="input-group">
              <label>Fats (g)</label>
              <input class="input" type="number" [(ngModel)]="manual.fats" placeholder="10">
            </div>
            <div class="input-group">
              <label>Serving</label>
              <input class="input" [(ngModel)]="manual.servingSize" placeholder="1 cup">
            </div>
            <div class="input-group">
              <label>Meal type</label>
              <select class="input" [(ngModel)]="mealType">
                <option>BREAKFAST</option><option>LUNCH</option><option>DINNER</option><option>SNACK</option>
              </select>
            </div>
          </div>
          <div class="flex gap-2 mt-4">
            <button class="btn btn-primary" (click)="logManual()" [disabled]="logging">
              {{ logging ? 'Logging...' : 'Log Food' }}
            </button>
            <button class="btn btn-secondary" (click)="showAddManual = false">Cancel</button>
          </div>
          <div class="success-msg mt-3" *ngIf="successMsg">✓ {{ successMsg }}</div>
        </div>

        <!-- Search results -->
        <div class="loading-wrap" *ngIf="searching">
          <div class="spinner"></div>
        </div>

        <div class="results" *ngIf="!searching && results.length > 0">
          <div class="results-header text-muted text-sm mb-2">{{ results.length }} results for "{{ lastQuery }}"</div>
          <div class="food-card card" *ngFor="let food of results">
            <div class="food-info">
              <div class="food-name font-semibold">{{ food.name }}</div>
              <div class="food-meta text-muted text-sm">
                🔥 {{ food.calories }} cal · {{ food.servingSize }}
              </div>
              <div class="food-macros text-sm">
                <span class="protein-color">🥩 {{ food.protein }}g</span>
                <span class="carbs-color">🌾 {{ food.carbs }}g</span>
                <span class="fats-color">💧 {{ food.fats }}g</span>
              </div>
            </div>
            <button class="btn-add" (click)="logFood(food)" title="Add to log">+</button>
          </div>
        </div>

        <div class="empty-search text-center p-8" *ngIf="!searching && lastQuery && results.length === 0">
          <div style="font-size:40px;margin-bottom:12px">🔍</div>
          <p class="font-semibold">No results for "{{ lastQuery }}"</p>
          <p class="text-muted text-sm">Try a different search or log a custom food above</p>
        </div>

        <!-- Suggestions when no query -->
        <div *ngIf="!query" class="suggestions">
          <div class="suggestions-title text-muted text-sm font-semibold mb-3">SUGGESTIONS</div>
          <div class="food-card card" *ngFor="let food of suggestions">
            <div class="food-info">
              <div class="food-name font-semibold">{{ food.name }}</div>
              <div class="food-meta text-muted text-sm">🔥 {{ food.calories }} cal · {{ food.servingSize }}</div>
            </div>
            <button class="btn-add" (click)="logFood(food)">+</button>
          </div>
        </div>

        <div class="success-toast" *ngIf="toast">✓ {{ toast }}</div>

      </div>
    </div>
  `,
  styles: [`
    .page { padding-bottom: 80px; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px 20px; }
    .page-title { font-size: 24px; font-weight: 700; margin: 0 0 4px; }
    .search-input-wrap { position: relative; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); }
    .search-input { width: 100%; padding: 12px 14px 12px 44px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 15px; outline: none; }
    .search-input:focus { border-color: #22c55e; }
    .manual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .loading-wrap { text-align: center; padding: 32px; }
    .results { display: flex; flex-direction: column; gap: 8px; }
    .food-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
    .food-info { flex: 1; min-width: 0; }
    .food-macros { display: flex; gap: 8px; margin-top: 4px; }
    .btn-add {
      width: 36px; height: 36px; background: #22c55e; color: white; border: none;
      border-radius: 50%; font-size: 22px; line-height: 1; display: flex; align-items: center;
      justify-content: center; cursor: pointer; flex-shrink: 0; transition: background .2s;
    }
    .btn-add:hover { background: #16a34a; }
    .success-msg { color: #16a34a; font-size: 14px; font-weight: 500; }
    .success-toast {
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
      background: #111827; color: white; padding: 10px 24px; border-radius: 999px;
      font-size: 14px; font-weight: 500; z-index: 100;
      animation: fadeIn .3s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    .suggestions-title { text-transform: uppercase; letter-spacing: .05em; }
    .suggestions { display: flex; flex-direction: column; gap: 8px; }
  `]
})
export class FoodDatabaseComponent {
  query = ''; lastQuery = ''; results: FoodItem[] = [];
  searching = false; showAddManual = false;
  mealType = 'LUNCH'; logging = false;
  successMsg = ''; toast = '';
  manual: FoodItem = { name: '', calories: 0, protein: 0, carbs: 0, fats: 0, servingSize: '1 serving' };
  suggestions: FoodItem[] = [
    { name: 'Peanut Butter', calories: 94, protein: 4, carbs: 3, fats: 8, servingSize: 'tbsp' },
    { name: 'Avocado', calories: 130, protein: 2, carbs: 7, fats: 12, servingSize: 'serving' },
    { name: 'Egg', calories: 74, protein: 6, carbs: 0, fats: 5, servingSize: 'large' },
    { name: 'Banana', calories: 89, protein: 1, carbs: 23, fats: 0, servingSize: 'medium' },
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 4, servingSize: '100g' },
    { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fats: 2, servingSize: 'cup cooked' }
  ];
  private search$ = new Subject<string>();

  constructor(private mealService: MealService) {
    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(q => { this.searching = true; return this.mealService.searchFoods(q); })
    ).subscribe({
      next: r => { this.results = r; this.searching = false; },
      error: () => { this.results = []; this.searching = false; }
    });
  }

  onSearch(q: string): void {
    this.lastQuery = q;
    if (q.trim().length > 1) this.search$.next(q.trim());
    else this.results = [];
  }

  logFood(food: FoodItem): void {
    this.mealService.logFood(food, this.mealType).subscribe({
      next: () => this.showToast(`${food.name} added to log`),
      error: () => this.showToast('Failed to log food')
    });
  }

  logManual(): void {
    if (!this.manual.name) return;
    this.logging = true;
    this.mealService.logFood(this.manual, this.mealType).subscribe({
      next: () => {
        this.successMsg = `${this.manual.name} added successfully`;
        this.logging = false;
        this.manual = { name: '', calories: 0, protein: 0, carbs: 0, fats: 0, servingSize: '1 serving' };
      },
      error: () => { this.successMsg = 'Failed to log food'; this.logging = false; }
    });
  }

  showToast(msg: string): void {
    this.toast = msg;
    setTimeout(() => this.toast = '', 3000);
  }
}
