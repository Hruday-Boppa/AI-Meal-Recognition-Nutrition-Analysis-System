import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { Observable } from 'rxjs';
import { WeeklyStats } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page animate-in">
      <div class="container progress-container">
        
        <header class="page-header mb-8">
          <div class="header-left">
            <h1 class="h1">Health Insights</h1>
            <p class="text-muted font-medium">Tracking your vitals and nutritional trends.</p>
          </div>
          
          <div class="period-picker glass-card">
            <button [class.active]="period === 'weekly'" (click)="setPeriod('weekly')">Week</button>
            <button [class.active]="period === 'monthly'" (click)="setPeriod('monthly')">Month</button>
          </div>
        </header>

        <div *ngIf="loading" class="loading-state">
          <div class="skel-card glass-card animate-pulse" *ngFor="let i of [1,2,3]"></div>
        </div>

        <div *ngIf="!loading && stats" class="content-area">
          <!-- Summary Row -->
          <div class="summary-shelf mb-8">
            <div class="sum-card glass-card">
              <span class="label">Avg Calories</span>
              <span class="val">{{ stats.averageCalories | number:'1.0-0' }}</span>
              <span class="unit">{{ period === 'monthly' ? 'kcal / week' : 'kcal / day' }}</span>
            </div>
            <div class="sum-card glass-card">
              <span class="label">Log Consistency</span>
              <span class="val">{{ logConsistency }}%</span>
              <span class="unit">{{ stats.totalMeals }} meals found</span>
            </div>
            <div class="sum-card glass-card">
              <span class="label">Top Goal</span>
              <span class="val">{{ topMacro.name }}</span>
              <span class="unit">{{ topMacro.val }}g avg</span>
            </div>
          </div>

          <!-- Main Chart Card -->
          <div class="chart-box glass-card mb-8">
            <div class="chart-header">
              <h3 class="h3">{{ period === 'weekly' ? 'Daily Calorie Trend' : 'Weekly Calorie Average' }}</h3>
              <div class="chart-legend">
                <span class="dot"></span>
                <span class="text-xs font-bold text-muted uppercase">Target Met</span>
              </div>
            </div>
            <div class="canvas-wrapper">
              <canvas #chartCanvas></canvas>
            </div>
          </div>

          <!-- Macro Distribution -->
          <div class="macros-hub glass-card">
            <div class="hub-header mb-8">
              <h3 class="h3">Macro Distribution</h3>
              <p class="text-xs text-muted uppercase font-bold tracking-wider">Averages for this period</p>
            </div>
            
            <div class="macro-bars">
              <div class="macro-item" *ngFor="let m of avgMacros">
                <div class="item-info">
                  <span class="name">{{ m.name }}</span>
                  <span class="target">{{ m.label }}: {{ m.goal }}g</span>
                  <span class="val" [style.color]="m.color">{{ m.val }}g</span>
                </div>
                <div class="bar-bg">
                  <div class="bar-fill" [style.width.%]="m.pct" [style.background]="m.color"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-container { max-width: 800px; padding-top: 40px; padding-bottom: 120px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
    
    .period-picker { 
      display: flex; gap: 4px; padding: 4px; border-radius: 12px;
      background: var(--surface-secondary);
    }
    .period-picker button {
      padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 700;
      color: var(--text-muted); transition: var(--transition);
    }
    .period-picker button.active { background: white; color: var(--primary); box-shadow: var(--shadow-sm); }

    .summary-shelf { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px; }
    .sum-card { padding: 32px; text-align: center; display: flex; flex-direction: column; }
    .sum-card .label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; }
    .sum-card .val { font-size: 32px; font-weight: 800; color: var(--text-main); line-height: 1; }
    .sum-card .unit { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 6px; }

    .chart-box { padding: 40px; margin-bottom: 48px; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .chart-legend { display: flex; align-items: center; gap: 8px; }
    .chart-legend .dot { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; }
    
    .canvas-wrapper { width: 100%; height: 280px; position: relative; }
    canvas { width: 100% !important; height: 100% !important; }

    .macros-hub { padding: 40px; }
    .macro-item { margin-bottom: 24px; }
    .macro-item:last-child { margin-bottom: 0; }
    .item-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: 700; font-size: 15px; align-items: baseline; }
    .item-info .name { color: var(--text-main); }
    .item-info .target { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-left: auto; margin-right: 12px; }
    
    .bar-bg { height: 10px; background: var(--surface-secondary); border-radius: 10px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 10px; transition: width 1s ease-out; }

    .loading-state { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .skel-card { height: 140px; border-radius: 24px; }

    @media (max-width: 650px) {
      .summary-shelf { grid-template-columns: 1fr; gap: 16px; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 24px; }
    }
  `]
})
export class ProgressComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  stats: any = null;
  loading = true;
  period = 'weekly';

  constructor(private dashService: DashboardService) {}

  get dataPoints(): any[] {
    if (!this.stats) return [];
    // The backend DTO always uses the 'days' field name even for monthly stats
    return this.stats.days || [];
  }

  get logConsistency(): number {
    const data = this.dataPoints;
    if (!this.stats || !data.length) return 0;
    const active = data.filter((d: any) => d.calories > 0).length;
    return Math.round((active / data.length) * 100);
  }

  get topMacro(): { name: string, val: number } {
    const macros = this.avgMacros;
    if (!macros.length) return { name: 'N/A', val: 0 };
    return macros.reduce((prev, current) => (prev.val > current.val) ? prev : current);
  }

  get avgMacros() {
    const data = this.dataPoints;
    if (!this.stats || !data.length) return [];
    
    const activeCount = data.filter((d: any) => d.calories > 0).length || 1;
    const isMonthly = this.period === 'monthly';
    const mult = isMonthly ? 7 : 1;
    
    // Calculate raw average per data point (Day or Week)
    const p = Math.round(data.reduce((s, d) => s + (d.protein || 0), 0) / activeCount);
    const c = Math.round(data.reduce((s, d) => s + (d.carbs || 0), 0) / activeCount);
    const f = Math.round(data.reduce((s, d) => s + (d.fats || 0), 0) / activeCount);
    
    return [
      { name: 'Protein', label: isMonthly ? 'Weekly Goal' : 'Daily Goal', val: p, goal: 150 * mult, pct: Math.min(100, (p / (150 * mult)) * 100), color: '#ec4899' },
      { name: 'Carbs', label: isMonthly ? 'Weekly Goal' : 'Daily Goal', val: c, goal: 250 * mult, pct: Math.min(100, (c / (250 * mult)) * 100), color: '#f97316' },
      { name: 'Fats', label: isMonthly ? 'Weekly Goal' : 'Daily Goal', val: f, goal: 70 * mult, pct: Math.min(100, (f / (70 * mult)) * 100), color: '#3b82f6' }
    ];
  }

  ngOnInit(): void { this.loadData(); }
  ngAfterViewInit(): void {}

  setPeriod(p: string): void {
    if (this.period === p) return;
    this.period = p;
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const obs = this.period === 'weekly' ? this.dashService.getWeekly() : this.dashService.getMonthly();
    (obs as Observable<any>).subscribe({
      next: (s: any) => {
        this.stats = s;
        this.loading = false;
        setTimeout(() => this.drawChart(), 100);
      },
      error: () => this.loading = false
    });
  }

  drawChart(): void {
    if (!this.chartCanvas || !this.stats) return;
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = this.dataPoints.map((d: any) => d.calories);
    const labels = this.dataPoints.map((d: any, i: number) => {
      if (this.period === 'weekly') {
        return new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' });
      }
      return d.date; // "Week 1", "Week 2", etc.
    });

    const maxVal = Math.max(...data, 2000);
    const w = canvas.parentElement?.offsetWidth || 600;
    const h = 260;
    
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, w, h);

    const pad = { top: 30, right: 10, bottom: 40, left: 40 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    // Grid lines
    ctx.strokeStyle = '#e2e8f0'; 
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH - (i / 4) * chartH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '700 10px Outfit,sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal * i / 4).toString(), pad.left - 10, y + 4);
    }
    ctx.setLineDash([]);

    // Bars
    if (data.length > 0) {
      const gap = chartW / data.length;
      const bw = Math.min(32, gap * 0.7);
      
      data.forEach((val, i) => {
        const bh = (val / maxVal) * chartH;
        const x = pad.left + gap * i + (gap - bw) / 2;
        const y = pad.top + chartH - bh;

        // Gradient for bars
        const grad = ctx.createLinearGradient(x, y, x, pad.top + chartH);
        grad.addColorStop(0, '#10b981');
        grad.addColorStop(1, '#34d399');
        ctx.fillStyle = grad;

        // Rounded rect
        const r = 8;
        ctx.beginPath();
        if (bh > r) {
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + bw - r, y);
          ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
          ctx.lineTo(x + bw, pad.top + chartH);
          ctx.lineTo(x, pad.top + chartH);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
        } else {
          ctx.rect(x, y, bw, Math.max(2, bh));
        }
        ctx.fill();

        // Label
        ctx.fillStyle = '#64748b'; ctx.font = '700 11px Outfit,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + bw / 2, pad.top + chartH + 20);
      });
    }
  }
}
