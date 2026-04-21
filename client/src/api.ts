/**
 * API utility for communicating with the backend server
 * Backend runs on http://127.0.0.1:3000
 * Vite dev server proxies requests to /auth, /bookings, /users to the backend
 */

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname !== '127.0.0.1' 
  ? 'https://winter2026-comp307-group09.cs.mcgill.ca'
  : '';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function apiCall(
  endpoint: string,
  options: FetchOptions = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if it exists
  const token = localStorage.getItem('accessToken');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Auth Endpoints
export const auth = {
  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// User Endpoints
export const users = {
  getAll: () => apiCall('/users', { method: 'GET' }),
  getById: (id: string) => apiCall(`/users/${id}`, { method: 'GET' }),
  create: (data: any) =>
    apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/users/${id}`, { method: 'DELETE' }),
};

// Booking Endpoints
export const bookings = {
  getAll: () => apiCall('/bookings', { method: 'GET' }),
  getById: (id: string) => apiCall(`/bookings/${id}`, { method: 'GET' }),
  getMyBookings: () => apiCall('/bookings/me', { method: 'GET' }),
  create: (data: any) =>
    apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  book: (slotId: string) =>
    apiCall('/bookings/book', {
      method: 'POST',
      body: JSON.stringify({ slotId }),
    }),
  update: (id: string, data: any) =>
    apiCall(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/bookings/${id}`, { method: 'DELETE' }),
};
