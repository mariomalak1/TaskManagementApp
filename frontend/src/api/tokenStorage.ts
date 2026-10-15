const ACCESS_TOKEN_KEY = 'taskman.accessToken';
const REFRESH_TOKEN_KEY = 'taskman.refreshToken';

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
  clear: (): void => {
    safeRemove(ACCESS_TOKEN_KEY);
    safeRemove(REFRESH_TOKEN_KEY);
  },
};
