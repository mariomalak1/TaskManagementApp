// Centralized API endpoint paths, relative to the axios baseURL (which includes /api).
// Paths with a resource id are builder functions.
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  tasks: {
    base: '/tasks',
    byId: (id: string) => `/tasks/${id}`,
    status: (id: string) => `/tasks/${id}/status`,
    stream: '/tasks/stream',
  },
  users: {
    base: '/users',
    byId: (id: string) => `/users/${id}`,
  },
} as const;
