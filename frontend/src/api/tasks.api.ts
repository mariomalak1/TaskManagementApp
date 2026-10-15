import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { CreateTaskRequest, TaskResponse } from '../types/api.types';

export async function getAllTasks(): Promise<TaskResponse[]> {
  const { data } = await apiClient.get<TaskResponse[]>(API_ENDPOINTS.tasks.base);
  return data;
}

export async function createTask(payload: CreateTaskRequest): Promise<TaskResponse> {
  const { data } = await apiClient.post<TaskResponse>(API_ENDPOINTS.tasks.base, payload);
  return data;
}
