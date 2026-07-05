import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  // Try to get token from window.Clerk
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
      // Handle unauthorized errors globally
      console.warn('Unauthorized request, redirecting to sign-in...');
      // Optional: window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
