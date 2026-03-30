export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  healthScore: number;
  confidence?: number;
}

export interface Ingredient {
  name: string;
  calories: number;
  amount?: string;
}

export interface Meal {
  id: number;
  name: string;
  imageUrl?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  healthScore: number;
  confidence?: number;
  analysisStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  ingredients?: string;
  loggedAt: string;
  notes?: string;
}

export interface ScanMealResponse {
  meal: Meal;
  message: string;
}

export interface PagedMeals {
  content: Meal[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface FoodItem {
  id?: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: string;
}
