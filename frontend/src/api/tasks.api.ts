import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { TaskResponse } from '../types/api.types';

export async function getAllTasks(): Promise<TaskResponse[]> {
  const { data } = await apiClient.get<TaskResponse[]>(API_ENDPOINTS.tasks.base);
  return data;
}
