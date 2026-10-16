import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';
import { API_ENDPOINTS } from './endpoints';
import type { AuthResponse } from '../types/api.types';

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error(
    'VITE_API_URL is not defined. Copy .env.example to .env and set the API base URL.',
  );
}

export const apiClient = axios.create({
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the stored access token to every request.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Registered by the app so a failed refresh can clear the session and redirect to login.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Only one refresh runs at a time; concurrent 401s wait for it. Refresh tokens
// rotate on the backend, so a single refresh must use the current token.
let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function flushPending(token: string | null): void {
  pendingRequests.forEach((resume) => resume(token));
  pendingRequests = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<AuthResponse>(
      `${apiUrl}${API_ENDPOINTS.auth.refresh}`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    );
    tokenStorage.setTokens(data);
    tokenStorage.setUser(data.user);
    return data.accessToken;
  } catch {
    return null;
  }
}

function forceLogout(): void {
  tokenStorage.clear();
  onUnauthorized?.();
}

// On a 401 for an authenticated request, try the refresh token once; on success -> retry the original request transparently -> otherwise force logout.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const original = error.config as RetriableConfig | undefined;
    const url = original?.url ?? '';
    const isAuthCall =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh');

    // if retry to login and the error from login, so no need to refresh as no session begin before
    if (!original || isAuthCall || original._retry || !tokenStorage.getAccessToken()) {
      return Promise.reject(error);
    }

    original._retry = true;

    // A refresh is already in flight: queue this request until it resolves.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (token) resolve(apiClient(original));
          else reject(error);
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
    flushPending(newToken);

    if (newToken) {
      return apiClient(original);
    }

    forceLogout();
    return Promise.reject(error);
  },
);

export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { title?: string; errors?: Record<string, string[]> }
      | undefined;

    if (data?.errors) {
      const messages = Object.values(data.errors).flat();
      if (messages.length > 0) return messages.join(' ');
    }
    if (data?.title) return data.title;
    if (!error.response) {
      return 'Cannot reach the server. Make sure the API is running and CORS is enabled.';
    }
    return `Request failed with status ${error.response.status}.`;
  }
  return 'Something went wrong. Please try again.';
}
