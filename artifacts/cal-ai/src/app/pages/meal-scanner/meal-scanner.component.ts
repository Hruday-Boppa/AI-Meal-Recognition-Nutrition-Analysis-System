import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { MealService } from '../../core/services/meal.service';

@Component({
  selector: 'app-meal-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page animate-in">
      <div class="container scanner-container">
        
        <header class="page-header mb-8">
          <h1 class="h1">AI Visual Scan</h1>
          <p class="text-muted">Point your camera or upload a photo to identify nutrients.</p>
        </header>

        <!-- Upload Zone -->
        <div class="upload-zone glass-card" 
             [class.active]="previewUrl" 
             [class.processing]="processing"
             (click)="onZoneClick(fileInput)" 
             (dragover)="$event.preventDefault()" 
             (drop)="onDrop($event)">
          
          <!-- Native input hidden -->
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelect($event)" capture="environment">

          <div *ngIf="!previewUrl" class="placeholder">
            <div class="icon-ring">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <h3 class="h2 mt-6">Snap your meal</h3>
            <p class="text-muted font-medium">Drag and drop or scan with camera</p>
          </div>

          <div *ngIf="previewUrl" class="preview-stage">
            <img [src]="previewUrl" alt="Meal preview" class="preview-img">
            <div class="scan-line" *ngIf="processing"></div>
            <div class="preview-overlay">
              <button class="btn-clear" (click)="$event.stopPropagation(); clearImage()" title="Remove image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              <div class="ai-badge" *ngIf="!processing">
                <div class="pulse-dot"></div>
                Ready to Analyze
              </div>
            </div>
          </div>
        </div>

        <!-- Meta Controls -->
        <div class="controls-grid mt-6">
          <div class="settings-box glass-card">
            <div class="input-group">
              <label>Meal Occasion</label>
              <div class="select-wrapper">
                <select class="input" [(ngModel)]="mealType">
                  <option value="BREAKFAST">🍳 Breakfast</option>
                  <option value="LUNCH">🥪 Lunch</option>
                  <option value="DINNER">🍽️ Dinner</option>
                  <option value="SNACK">🍎 Snack</option>
                </select>
              </div>
            </div>
          </div>

          <div class="settings-box glass-card">
            <div class="input-group">
              <label>Contextual Notes</label>
              <input class="input" type="text" [(ngModel)]="notes" placeholder="e.g. half portion, side salad...">
            </div>
          </div>
        </div>

        <!-- Feedback & Action -->
        <div class="action-feedback mt-8">
          <div class="error-pill glass-card animate-in" *ngIf="error">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>
            {{ error }}
          </div>

          <button class="btn btn-primary scan-submit-btn" 
                  [disabled]="!selectedFile || processing" 
                  (click)="onScan()"
                  [class.loading]="processing">
            <span class="btn-content" *ngIf="!processing">
              Start AI Analysis
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
            </span>
            <div class="flex items-center gap-2" *ngIf="processing">
              <div class="spinner"></div>
              <span>Processing...</span>
            </div>
          </button>
        </div>

        <div class="separator mt-8 mb-6">
          <span class="glass-card">OR</span>
        </div>

        <a routerLink="/food-database" class="btn btn-secondary manual-btn glass-card">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          Search Food Library
        </a>
      </div>
    </div>
  `,
  styles: [`
    .scanner-container { max-width: 650px; padding-top: 60px; padding-bottom: 120px; }
    
    .upload-zone {
      min-height: 440px; border: 2.5px dashed var(--border);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; position: relative; overflow: hidden;
      transition: var(--transition); border-radius: 36px;
      margin-bottom: 40px;
    }
    .upload-zone:hover { border-color: var(--primary); background: var(--primary-soft); }
    .upload-zone.active { border-style: solid; border-color: transparent; padding: 0; min-height: auto; }
    .upload-zone.processing { cursor: wait; pointer-events: none; }

    .placeholder { text-align: center; padding: 60px 40px; }
    .icon-ring { 
      width: 110px; height: 110px; background: white;
      border-radius: 34px; display: flex; align-items: center; justify-content: center;
      margin: 0 auto; color: var(--primary); box-shadow: var(--shadow-md);
      transition: var(--transition);
    }
    .upload-zone:hover .icon-ring { transform: scale(1.05) rotate(3deg); box-shadow: var(--shadow-lg); }
    .icon-ring svg { width: 52px; height: 52px; }

    .preview-stage { position: relative; width: 100%; display: flex; align-items: center; justify-content: center; background: #000; }
    .preview-img { width: 100%; max-height: 550px; object-fit: contain; display: block; }
    
    .preview-overlay {
      position: absolute; inset: 0; padding: 32px;
      display: flex; flex-direction: column; justify-content: space-between;
      background: linear-gradient(rgba(0,0,0,0.2), transparent, rgba(0,0,0,0.3));
    }

    .scan-line {
      position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: var(--primary); box-shadow: 0 0 20px var(--primary);
      z-index: 10; animation: scanAnim 3s ease-in-out infinite;
    }
    @keyframes scanAnim { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }

    .btn-clear {
      align-self: flex-end; width: 44px; height: 44px;
      background: rgba(255,255,255,0.25); color: white; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      cursor: pointer; transition: var(--transition); border: 1.5px solid rgba(255,255,255,0.3);
    }
    .btn-clear:hover { background: var(--danger); border-color: var(--danger); transform: scale(1.1); }
    .btn-clear svg { width: 22px; height: 22px; }

    .ai-badge {
      align-self: center; display: flex; align-items: center; gap: 10px;
      padding: 12px 24px; background: white; color: var(--text-main);
      border-radius: 100px; font-size: 14px; font-weight: 800;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .pulse-dot { width: 10px; height: 10px; background: var(--primary); border-radius: 50%; animation: pulse-ring 1.5s infinite; }
    @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(0.8); opacity: 0.5; } }

    .controls-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; }
    .settings-box { padding: 32px; border-radius: 28px; display: flex; flex-direction: column; justify-content: center; }
    .input-group label { display: block; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 14px; letter-spacing: 0.8px; }

    .scan-submit-btn { 
      width: 100%; height: 72px; border-radius: 24px; font-size: 18px; font-weight: 800; border: none;
      background: var(--primary); color: white; transition: var(--transition);
      margin-bottom: 12px;
    }
    .scan-submit-btn:not(:disabled) { box-shadow: 0 15px 35px var(--primary-soft); }
    .scan-submit-btn:not(:disabled):hover { background: var(--primary-dark); transform: translateY(-4px); box-shadow: 0 20px 50px rgba(16, 185, 129, 0.4); }
    .scan-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .btn-content { display: flex; align-items: center; justify-content: center; gap: 14px; }

    .error-pill { 
      margin-bottom: 32px; padding: 18px 28px; background: #fff5f5; 
      color: var(--danger); display: flex; align-items: center; gap: 14px;
      font-size: 15px; font-weight: 700; border-radius: 20px; border: 1.5px solid #fed7d7;
    }

    .separator { text-align: center; position: relative; color: var(--text-muted); margin: 48px 0; }
    .separator::before { content: ''; position: absolute; left: 0; top: 50%; width: 100%; height: 2px; background: var(--border); z-index: 1; }
    .separator span { position: relative; z-index: 2; padding: 10px 24px; font-size: 12px; font-weight: 800; border-radius: 100px; background: var(--background); }

    .manual-btn { width: 100%; height: 68px; border-radius: 26px; font-weight: 700; background: white; border: 1.5px solid var(--border); color: var(--text-main); }
    .manual-btn:hover { border-color: var(--primary-light); background: var(--surface-secondary); transform: translateY(-2px); }

    @media (max-width: 600px) {
      .controls-grid { grid-template-columns: 1fr; gap: 16px; }
      .upload-zone { min-height: 340px; margin-bottom: 32px; }
      .settings-box { padding: 24px; }
    }
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

  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

  onFileSelect(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.setFile(file);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file) this.setFile(file);
  }

  setFile(file: File): void {
    // Client-side type check — only jpg/png
    if (!this.ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      this.error = 'Only JPG and PNG images are supported.';
      return;
    }
    // 10MB size guard
    if (file.size > 10 * 1024 * 1024) {
      this.error = 'Image must be smaller than 10MB.';
      return;
    }
    this.error = '';
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  onZoneClick(input: HTMLInputElement): void {
    if (this.previewUrl || this.processing) return;
    input.click();
  }

  clearImage(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.error = '';
  }

  onScan(): void {
    if (!this.selectedFile) return;
    this.processing = true; this.error = '';
    this.mealService.scanMeal(this.selectedFile, this.mealType, this.notes).subscribe({
      next: (res: any) => {
        this.processing = false;
        this.router.navigate(['/meals', res.meal.id]);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to analyze meal. Please try again.';
        this.processing = false;
      }
    });
  }
}
