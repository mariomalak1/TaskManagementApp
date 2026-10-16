import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { CreateTaskRequest, TaskItemStatus, TaskResponse } from '../types/api.types';

export async function getAllTasks(): Promise<TaskResponse[]> {
  const { data } = await apiClient.get<TaskResponse[]>(API_ENDPOINTS.tasks.base);
  return data;
}

export async function getTaskById(id: string): Promise<TaskResponse> {
  const { data } = await apiClient.get<TaskResponse>(API_ENDPOINTS.tasks.byId(id));
  return data;
}

export async function createTask(payload: CreateTaskRequest): Promise<TaskResponse> {
  const { data } = await apiClient.post<TaskResponse>(API_ENDPOINTS.tasks.base, payload);
  return data;
}

export async function updateTaskStatus(
  id: string,
  status: TaskItemStatus,
): Promise<TaskResponse> {
  const { data } = await apiClient.patch<TaskResponse>(API_ENDPOINTS.tasks.status(id), {
    status,
  });
  return data;
}
