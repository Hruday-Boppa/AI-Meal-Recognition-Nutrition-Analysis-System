import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { WeeklyStats } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, NavComponent],
  template: `
    <app-nav></app-nav>
    <div class="page">
      <div class="container">

        <h2 class="page-title">Progress</h2>

        <!-- Period tabs -->
        <div class="tabs mb-6">
          <button class="tab-btn" [class.active]="period === 'weekly'" (click)="period = 'weekly'; loadData()">Weekly</button>
          <button class="tab-btn" [class.active]="period === 'monthly'" (click)="period = 'monthly'; loadData()">Monthly</button>
        </div>

        <!-- Loading -->
        <div class="card p-6 text-center" *ngIf="loading">
          <div class="spinner" style="margin: 0 auto 12px"></div>
          <p class="text-muted">Loading stats...</p>
        </div>

        <!-- Summary cards -->
        <div class="summary-grid mb-6" *ngIf="!loading && weeklyStats">
          <div class="card summary-card">
            <div class="summary-label">Avg. Daily Calories</div>
            <div class="summary-value">{{ weeklyStats.averageCalories | number:'1.0-0' }}</div>
          </div>
          <div class="card summary-card">
            <div class="summary-label">Total Meals</div>
            <div class="summary-value">{{ weeklyStats.totalMeals }}</div>
          </div>
          <div class="card summary-card">
            <div class="summary-label">Days Logged</div>
            <div class="summary-value">{{ weeklyStats.days.length }}</div>
          </div>
        </div>

        <!-- Chart -->
        <div class="card chart-card mb-6" *ngIf="!loading && weeklyStats">
          <div class="chart-header">
            <div class="chart-title font-semibold">Calorie Intake</div>
            <div class="chart-legend">
              <span class="legend-dot" style="background:#22c55e"></span><span class="text-sm text-muted">Calories</span>
            </div>
          </div>
          <canvas #chartCanvas class="chart-canvas"></canvas>
        </div>

        <!-- Macro breakdown -->
        <div class="card p-5 mb-4" *ngIf="!loading && weeklyStats">
          <div class="font-semibold mb-4">Average Daily Macros</div>
          <div class="macros-breakdown">
            <div class="macro-row" *ngFor="let m of avgMacros">
              <span class="macro-name text-sm">{{ m.name }}</span>
              <div class="macro-bar-wrap">
                <div class="macro-bar-fill" [style.width.%]="m.pct" [style.background]="m.color"></div>
              </div>
              <span class="macro-amount text-sm font-semibold" [style.color]="m.color">{{ m.val }}g</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page { padding-bottom: 80px; }
    .container { max-width: 700px; margin: 0 auto; padding: 24px 20px; }
    .page-title { font-size: 24px; font-weight: 700; margin: 0 0 20px; }
    .tabs { display: flex; gap: 4px; background: #f3f4f6; border-radius: 10px; padding: 4px; width: fit-content; }
    .tab-btn { padding: 8px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; background: transparent; color: #6b7280; transition: all .2s; }
    .tab-btn.active { background: white; color: #111827; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .summary-card { padding: 18px; text-align: center; }
    .summary-label { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
    .summary-value { font-size: 28px; font-weight: 700; color: #111827; }
    .chart-card { padding: 20px; }
    .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .chart-legend { display: flex; align-items: center; gap: 6px; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .chart-canvas { width: 100% !important; max-height: 220px; }
    .macros-breakdown { display: flex; flex-direction: column; gap: 14px; }
    .macro-row { display: flex; align-items: center; gap: 12px; }
    .macro-name { width: 60px; color: #6b7280; }
    .macro-bar-wrap { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
    .macro-bar-fill { height: 100%; border-radius: 4px; transition: width .5s ease; }
    .macro-amount { width: 48px; text-align: right; }
    @media (max-width: 600px) { .summary-grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class ProgressComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  weeklyStats: WeeklyStats | null = null;
  loading = true;
  period = 'weekly';
  chart: any = null;

  constructor(private dashService: DashboardService) {}

  get avgMacros() {
    if (!this.weeklyStats?.days?.length) return [];
    const n = this.weeklyStats.days.length;
    const p = Math.round(this.weeklyStats.days.reduce((s, d) => s + d.protein, 0) / n);
    const c = Math.round(this.weeklyStats.days.reduce((s, d) => s + d.carbs, 0) / n);
    const f = Math.round(this.weeklyStats.days.reduce((s, d) => s + d.fats, 0) / n);
    const total = p * 4 + c * 4 + f * 9 || 1;
    return [
      { name: 'Protein', val: p, pct: (p * 4 / total * 100), color: '#ec4899' },
      { name: 'Carbs', val: c, pct: (c * 4 / total * 100), color: '#f97316' },
      { name: 'Fats', val: f, pct: (f * 9 / total * 100), color: '#3b82f6' }
    ];
  }

  ngOnInit(): void { this.loadData(); }
  ngAfterViewInit(): void {}

  loadData(): void {
    this.loading = true;
    this.dashService.getWeekly().subscribe({
      next: s => {
        this.weeklyStats = s;
        this.loading = false;
        setTimeout(() => this.drawChart(), 100);
      },
      error: () => this.loading = false
    });
  }

  drawChart(): void {
    if (!this.chartCanvas || !this.weeklyStats) return;
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const days = this.weeklyStats.days;
    const labels = days.map(d => {
      const dt = new Date(d.date);
      return dt.toLocaleDateString('en-US', { weekday: 'short' });
    });
    const data = days.map(d => d.calories);
    const maxVal = Math.max(...data, 1);
    const w = canvas.offsetWidth; const h = 200;
    canvas.width = w * window.devicePixelRatio; canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, w, h);
    const pad = { top: 20, right: 20, bottom: 36, left: 40 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;
    // Grid lines
    ctx.strokeStyle = '#f3f4f6'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + chartH - (i / 4) * chartH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + chartW, y); ctx.stroke();
      ctx.fillStyle = '#9ca3af'; ctx.font = '11px Inter,sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(Math.round(maxVal * i / 4).toString(), pad.left - 6, y + 4);
    }
    // Bars
    if (data.length > 0) {
      const bw = Math.min(36, chartW / data.length - 10);
      const gap = chartW / data.length;
      data.forEach((val, i) => {
        const bh = (val / maxVal) * chartH;
        const x = pad.left + gap * i + (gap - bw) / 2;
        const y = pad.top + chartH - bh;
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        const r = 4;
        ctx.moveTo(x + r, y); ctx.lineTo(x + bw - r, y);
        ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
        ctx.lineTo(x + bw, pad.top + chartH); ctx.lineTo(x, pad.top + chartH);
        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.fill();
        ctx.fillStyle = '#6b7280'; ctx.font = '11px Inter,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + bw / 2, pad.top + chartH + 18);
        if (val > 0) {
          ctx.fillStyle = '#111827'; ctx.font = '11px Inter,sans-serif';
          ctx.fillText(val.toString(), x + bw / 2, y - 6);
        }
      });
    }
  }
}
