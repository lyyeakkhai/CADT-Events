import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
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
      // @ts-expect-error: Clerk is injected globally
      const clerk = window.Clerk || (window as any).__clerk;
      if (clerk && clerk.session) {
        try {
          // @ts-expect-error
          token = await clerk.session.getToken({ skipCache: i > 0 });
        } catch (e) {}
      }
      if (!token) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
  } catch (error) {
    console.error('Error fetching Clerk token in interceptor', error);
  }

  if (token) {
    // @ts-expect-error - headers can be object
    config.headers = config.headers || {};
    // Only set if not already provided (e.g. explicit token from component)
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } else if (!config.headers?.Authorization) {
    console.warn('No Clerk token available for request to', config.url);
  }

  // For multipart/form-data (image uploads), remove the default JSON content-type
  // so the browser can set the correct boundary.
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      // Also delete common-case variants
      // @ts-ignore
      delete config.headers['content-type'];
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
        console.error(`Unauthorized (401) on – "${error.config.url}" – "Response:"\n`, JSON.stringify(error.response.data, null, 2));
      }
      // Handle unauthorized errors globally
      console.warn('Unauthorized request - check Clerk login and ADMIN role in publicMetadata');
      // Optional: window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
