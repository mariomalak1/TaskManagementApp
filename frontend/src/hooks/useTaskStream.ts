import { useEffect, useRef } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { apiClient, refreshAccessToken } from '../api/client';
import { tokenStorage } from '../api/tokenStorage';
import { API_ENDPOINTS } from '../api/endpoints';
import type { TaskStatusUpdate } from '../types/api.types';

// Thrown to tell fetch-event-source to stop (not retry).
class FatalStreamError extends Error {}

// Keeps an SSE connection to /tasks/stream open while the component is mounted, and update ui 
export function useTaskStream(onUpdate: (update: TaskStatusUpdate) => void) {
  const handlerRef = useRef(onUpdate);
  useEffect(() => {
    handlerRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const controller = new AbortController();
    const url = `${apiClient.defaults.baseURL ?? ''}${API_ENDPOINTS.tasks.stream}`;

    void fetchEventSource(url, {
      signal: controller.signal,
      openWhenHidden: true,

      fetch: (input, init) => {
        const token = tokenStorage.getAccessToken();
        const headers = new Headers(init?.headers);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },

      async onopen(response) {
        const contentType = response.headers.get('content-type') ?? '';
        
        if (response.ok && contentType.includes('text/event-stream')) {
          // connected
          return;
        }

        if (response.status === 401) {
          // Token expired, need to refresh, then let it reconnect with the new token.
          const newToken = await refreshAccessToken();
          if (newToken) throw new Error('retry after refresh');
          throw new FatalStreamError('unauthorized');
        }

        throw new FatalStreamError(`unexpected status ${response.status}`);
      },
      
      onmessage(event) {
        if (event.event === 'task-updated' && event.data) {
          try {
            const update = JSON.parse(event.data) as TaskStatusUpdate;
            handlerRef.current(update);
          } catch {
            // ignore malformed payloads
          }
        }
      },
      onerror(err) {
        if (err instanceof FatalStreamError) {
          // stop retrying
          throw err;
        }
        // retry happen in 3 sec
        return 3000;
      },
    }).catch(() => {
      // aborted on unmount or stopped suddenly
    });

    return () => controller.abort();
  }, []);
}
