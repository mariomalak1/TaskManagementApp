import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserResponse,
} from '../types/api.types';

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials);
  return data;
}

export async function register(payload: RegisterRequest): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>(API_ENDPOINTS.auth.register, payload);
  return data;
}
