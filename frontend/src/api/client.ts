import axios from 'axios';
import { tokenStorage } from './tokenStorage';

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
