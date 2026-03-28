import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { MealService } from '../../core/services/meal.service';

@Component({
  selector: 'app-meal-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page">
      <div class="container">

        <h2 class="page-title">Scan Meal</h2>
        <p class="text-muted mb-6">Upload a photo of your meal to get instant nutrition info</p>

        <!-- Upload area -->
        <div class="upload-area card" [class.has-image]="previewUrl" (click)="!previewUrl && fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelect($event)" capture="environment">

          <div *ngIf="!previewUrl" class="upload-placeholder">
            <div class="upload-icon">📸</div>
            <p class="font-semibold">Click or drag to upload meal photo</p>
            <p class="text-muted text-sm">JPG, PNG, WEBP up to 10MB</p>
            <button class="btn btn-secondary mt-3" type="button" (click)="$event.stopPropagation(); fileInput.click()">
              Choose Photo
            </button>
          </div>

          <div *ngIf="previewUrl" class="preview-wrap">
            <img [src]="previewUrl" alt="Meal preview" class="preview-img">
            <button class="btn-remove" (click)="$event.stopPropagation(); clearImage()">✕</button>
          </div>
        </div>

        <!-- Options -->
        <div class="options card mt-4" *ngIf="previewUrl || true">
          <div class="input-group mb-4">
            <label>Meal Type</label>
            <select class="input" [(ngModel)]="mealType">
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
              <option value="SNACK">Snack</option>
            </select>
          </div>
          <div class="input-group">
            <label>Notes (optional)</label>
            <input class="input" type="text" [(ngModel)]="notes" placeholder="e.g. extra sauce, no salt...">
          </div>
        </div>

        <!-- Error -->
        <div class="error-msg mt-4" *ngIf="error">{{ error }}</div>

        <!-- Processing state -->
        <div class="processing-card card mt-4" *ngIf="processing">
          <div class="processing-inner">
            <div class="ai-spinner"></div>
            <div>
              <p class="font-semibold">Analyzing your meal with AI...</p>
              <p class="text-muted text-sm">This usually takes 5-10 seconds</p>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <button class="btn btn-primary btn-lg w-full mt-6" [disabled]="!selectedFile || processing" (click)="onScan()">
          <svg *ngIf="!processing" width="18" height="18" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <div class="spinner" *ngIf="processing" style="width:18px;height:18px;border-width:2px;border-top-color:#fff"></div>
          {{ processing ? 'Analyzing...' : 'Analyze with AI' }}
        </button>

        <!-- Or separator -->
        <div class="separator my-6">
          <span>or log manually</span>
        </div>

        <a class="btn btn-secondary btn-lg w-full" routerLink="/food-database" style="text-align:center;display:flex;justify-content:center">
          🔍 Search Food Database
        </a>

      </div>
    </div>
  `,
  styles: [`
    .page { padding-bottom: 80px; }
    .container { max-width: 600px; margin: 0 auto; padding: 24px 20px; }
    .page-title { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
    .upload-area {
      border: 2px dashed #d1d5db; cursor: pointer; transition: border-color .2s;
      min-height: 220px; display: flex; align-items: center; justify-content: center;
    }
    .upload-area:hover { border-color: #22c55e; }
    .upload-area.has-image { cursor: default; border-style: solid; padding: 0; }
    .upload-placeholder { text-align: center; padding: 40px 20px; }
    .upload-icon { font-size: 48px; margin-bottom: 16px; }
    .preview-wrap { position: relative; width: 100%; border-radius: 10px; overflow: hidden; }
    .preview-img { width: 100%; max-height: 320px; object-fit: cover; display: block; }
    .btn-remove {
      position: absolute; top: 10px; right: 10px;
      background: rgba(0,0,0,.6); color: white;
      border: none; border-radius: 50%; width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; cursor: pointer;
    }
    .options { padding: 20px; }
    .error-msg { background: #fee2e2; color: #dc2626; padding: 12px 16px; border-radius: 8px; font-size: 14px; }
    .processing-card { padding: 20px; background: #f0fdf4; border-color: #bbf7d0; }
    .processing-inner { display: flex; align-items: center; gap: 16px; }
    .ai-spinner {
      width: 36px; height: 36px; flex-shrink: 0;
      border: 3px solid #bbf7d0; border-top-color: #22c55e;
      border-radius: 50%; animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .separator { text-align: center; color: #9ca3af; font-size: 14px; position: relative; }
    .separator::before { content: ''; position: absolute; left: 0; top: 50%; width: 42%; height: 1px; background: #e5e7eb; }
    .separator::after { content: ''; position: absolute; right: 0; top: 50%; width: 42%; height: 1px; background: #e5e7eb; }
  `]
})
export class MealScannerComponent {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  mealType = 'LUNCH';
  notes = '';
  processing = false;
  error = '';

  constructor(private mealService: MealService, private router: Router) {}

  onFileSelect(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.setFile(file);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) this.setFile(file);
  }

  setFile(file: File): void {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onScan(): void {
    if (!this.selectedFile) return;
    this.processing = true; this.error = '';
    this.mealService.scanMeal(this.selectedFile, this.mealType, this.notes).subscribe({
      next: res => {
        this.processing = false;
        this.router.navigate(['/meals', res.meal.id]);
      },
      error: err => {
        this.error = err.error?.message || 'Failed to analyze meal. Please try again.';
        this.processing = false;
      }
    });
  }
}
