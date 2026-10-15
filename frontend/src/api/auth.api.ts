import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { AuthResponse, LoginRequest } from '../types/api.types';

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials);
  return data;
}
