import axios from 'axios';

/**
 * API base URL. Production builds must set VITE_API_URL at build time (Vercel).
 * Never fall back to localhost outside DEV — that makes admin look "disconnected".
 */
function resolveApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (raw) return raw.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:4000/api';
  // Safe production default (same host as Render API)
  return 'https://cadt-events.onrender.com/api';
}

const apiClient = axios.create({
  baseURL: resolveApiBase(),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  // Try multiple ways to get Clerk token for maximum compatibility
  let token: string | null = null;

  try {
    // Wait for Clerk to be available on window (it loads async)
    for (let i = 0; i < 30 && !token; i++) {
      const clerk = (window as unknown as { Clerk?: { session?: { getToken: (o?: { skipCache?: boolean }) => Promise<string | null> } }; __clerk?: unknown }).Clerk
        || (window as unknown as { __clerk?: { session?: { getToken: (o?: { skipCache?: boolean }) => Promise<string | null> } } }).__clerk;
      if (clerk && clerk.session) {
        try {
          token = await clerk.session.getToken({ skipCache: i > 0 });
        } catch {
          /* retry */
        }
      }
      if (!token) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }
  } catch (error) {
    console.error('Error fetching Clerk token in interceptor', error);
  }

  if (token) {
    // Only set if not already provided (e.g. explicit token from component)
    if (!config.headers?.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else if (!config.headers?.Authorization) {
    console.warn('No Clerk token available for request to', config.url);
  }

  // For multipart/form-data (image uploads), remove the default JSON content-type
  // so the browser can set the correct boundary.
  if (config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    } else if (config.headers) {
      delete (config.headers as Record<string, unknown>)['Content-Type'];
      delete (config.headers as Record<string, unknown>)['content-type'];
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (error.response) {
        console.error(
          `Unauthorized (401) on – "${error.config?.url}" – Response:`,
          JSON.stringify(error.response.data, null, 2),
        );
      }
      console.warn('Unauthorized request - check Clerk login and ADMIN role in publicMetadata');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
