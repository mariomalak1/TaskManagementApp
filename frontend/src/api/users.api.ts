import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { CreateUserRequest, PagedResult, UserResponse } from '../types/api.types';

export interface UserListQuery {
  page?: number;
  pageSize?: number;
}

export async function getAllUsers(query: UserListQuery = {}): Promise<PagedResult<UserResponse>> {
  const params: Record<string, number> = {};
  if (query.page) params.page = query.page;
  if (query.pageSize) params.pageSize = query.pageSize;

  const { data } = await apiClient.get<PagedResult<UserResponse>>(API_ENDPOINTS.users.base, {
    params,
  });
  return data;
}

export async function createUser(payload: CreateUserRequest): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>(API_ENDPOINTS.users.base, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.users.byId(id));
}
