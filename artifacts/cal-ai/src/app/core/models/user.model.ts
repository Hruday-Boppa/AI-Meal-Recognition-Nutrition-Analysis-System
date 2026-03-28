export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  calorieGoal: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  calorieGoal?: number;
}
