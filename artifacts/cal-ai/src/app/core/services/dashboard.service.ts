import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyStats, WeeklyStats, MonthlyStats } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly API = '/api/dashboard';

  constructor(private http: HttpClient) {}

  getDaily(date?: string): Observable<DailyStats> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<DailyStats>(`${this.API}/daily`, { params });
  }

  getWeekly(): Observable<WeeklyStats> {
    return this.http.get<WeeklyStats>(`${this.API}/weekly`);
  }

  getMonthly(): Observable<MonthlyStats> {
    return this.http.get<MonthlyStats>(`${this.API}/monthly`);
  }
}
