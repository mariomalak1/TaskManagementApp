import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { UserResponse } from '../types/api.types';

export async function getAllUsers(): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>(API_ENDPOINTS.users.base);
  return data;
}
