export interface DailyStats {
  date: string;
  totalCalories: number;
  calorieGoal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  mealsCount: number;
  remainingCalories: number;
}

export interface ChartPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface WeeklyStats {
  days: ChartPoint[];
  averageCalories: number;
  totalMeals: number;
}

export interface MonthlyStats {
  weeks: ChartPoint[];
  averageCalories: number;
  totalMeals: number;
}
