import type { UserResponse } from '../types/api.types';

const ACCESS_TOKEN_KEY = 'taskman.accessToken';
const REFRESH_TOKEN_KEY = 'taskman.refreshToken';
const USER_KEY = 'taskman.user';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
}

export const tokenStorage = {
  getAccessToken: (): string | null => safeGet(ACCESS_TOKEN_KEY),
  getRefreshToken: (): string | null => safeGet(REFRESH_TOKEN_KEY),
  setTokens: ({ accessToken, refreshToken }: AuthTokens): void => {
    safeSet(ACCESS_TOKEN_KEY, accessToken);
    safeSet(REFRESH_TOKEN_KEY, refreshToken);
  },
  getUser: (): UserResponse | null => {
    const raw = safeGet(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      return null;
    }
  },
  setUser: (user: UserResponse): void => {
    safeSet(USER_KEY, JSON.stringify(user));
  },
  clear: (): void => {
    safeRemove(ACCESS_TOKEN_KEY);
    safeRemove(REFRESH_TOKEN_KEY);
    safeRemove(USER_KEY);
  },
};
