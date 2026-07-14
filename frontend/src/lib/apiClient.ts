import axios from 'axios';

/**
 * API base URL. Production builds must set VITE_API_URL at build time (Vercel).
 * Never fall back to localhost outside DEV.
 */
function resolveApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (raw) return raw.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:4000/api';
  return 'https://cadt-events.onrender.com/api';
}

const apiClient = axios.create({
  baseURL: resolveApiBase(),
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    // @ts-expect-error: Clerk is injected globally
    if (window.Clerk && window.Clerk.session) {
      // @ts-expect-error: Clerk is injected globally
      const token = await window.Clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('Error fetching Clerk token', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request, redirecting to sign-in...');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
