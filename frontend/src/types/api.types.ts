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

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
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

export interface TaskStatusUpdate {
  taskId: string;
  status: TaskItemStatus;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
}

export interface PagedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const PRIORITY_RANK: Record<TaskPriority, number> = { High: 2, Medium: 1, Low: 0 };
