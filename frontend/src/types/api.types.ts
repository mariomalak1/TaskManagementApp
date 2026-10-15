// Shared API types. Extended as more endpoints are integrated.

export type UserRole = 'User' | 'Admin';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export type TaskItemStatus = 'Pending' | 'InProgress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  status: TaskItemStatus;
  priority: TaskPriority;
  createdAt: string;
  userId: string;
}
