import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meal, ScanMealResponse, PagedMeals, FoodItem } from '../models/meal.model';

@Injectable({ providedIn: 'root' })
export class MealService {
  private readonly API = '/api/meals';

  constructor(private http: HttpClient) {}

  scanMeal(file: File, mealType: string, notes?: string): Observable<ScanMealResponse> {
    const form = new FormData();
    form.append('image', file);
    form.append('mealType', mealType);
    if (notes) form.append('notes', notes);
    return this.http.post<ScanMealResponse>(`${this.API}/scan`, form);
  }

  getMeals(page = 0, size = 10, date?: string): Observable<PagedMeals> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (date) params = params.set('date', date);
    return this.http.get<PagedMeals>(this.API, { params });
  }

  getMealById(id: number): Observable<Meal> {
    return this.http.get<Meal>(`${this.API}/${id}`);
  }

  updateMeal(id: number, data: Partial<Meal>): Observable<Meal> {
    return this.http.put<Meal>(`${this.API}/${id}`, data);
  }

  deleteMeal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  logFood(food: FoodItem, mealType: string): Observable<Meal> {
    return this.http.post<Meal>(`${this.API}/log`, { ...food, mealType });
  }

  searchFoods(query: string): Observable<FoodItem[]> {
    return this.http.get<FoodItem[]>(`/api/foods/search`, {
      params: new HttpParams().set('q', query)
    });
  }

  getMealStatus(id: number): Observable<Meal> {
    return this.http.get<Meal>(`${this.API}/${id}/status`);
  }
}
