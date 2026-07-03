// Placeholder for a future API service layer.
// When you add a backend, configure your base URL and interceptors here.

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
