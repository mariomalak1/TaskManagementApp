import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  CreateTaskRequest,
  PagedResult,
  TaskItemStatus,
  TaskResponse,
} from '../types/api.types';

export interface TaskListQuery {
  status?: TaskItemStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getAllTasks(query: TaskListQuery = {}): Promise<PagedResult<TaskResponse>> {
  const params: Record<string, string | number> = {};
  if (query.status) params.status = query.status;
  const search = query.search?.trim();
  if (search) params.search = search;
  if (query.page) params.page = query.page;
  if (query.pageSize) params.pageSize = query.pageSize;

  const { data } = await apiClient.get<PagedResult<TaskResponse>>(API_ENDPOINTS.tasks.base, {
    params,
  });
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
