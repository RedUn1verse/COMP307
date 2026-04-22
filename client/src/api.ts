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
  getAll: () => apiCall('/booking', { method: 'GET' }),
  getById: (id: string) => apiCall(`/booking/${id}`, { method: 'GET' }),
  getMyBookings: () => {
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('No user ID found');
    return apiCall(`/booking/${userId}`, { method: 'GET' });
  },
  create: (data: any) =>
    apiCall('/booking', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  book: (slotId: string) =>
    apiCall('/booking/book', {
      method: 'POST',
      body: JSON.stringify({ slotId }),
    }),
  update: (id: string, data: any) =>
    apiCall(`/booking/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall(`/booking/${id}`, { method: 'DELETE' }),
  cancelBooking: (bookingId: string) =>
    apiCall(`/booking/${bookingId}`, { method: 'DELETE' }),
  emailBookedUser: (bookingId: string) =>
    apiCall(`/booking/${bookingId}/email`, { method: 'POST' }),
};

// Slot Endpoints
export const slots = {
  getOwned: () => apiCall('/slot/owned', { method: 'GET' }),
  getAvailableByOwner: (ownerId: string) => apiCall(`/slot/${ownerId}`, { method: 'GET' }),
  create: (data: any) =>
    apiCall('/slot/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  activate: (slotId: string) =>
    apiCall('/slot/activate', {
      method: 'PUT',
      body: JSON.stringify({ slotId }),
    }),
  deleteSlot: (slotId: string) =>
    apiCall(`/slot/${slotId}`, { method: 'DELETE' }),
  book: (slotId: string) =>
    apiCall(`/slot/${slotId}/book`, { method: 'POST' }),
  emailOwner: (slotId: string) =>
    apiCall(`/slot/${slotId}/email`, { method: 'POST' }),
};

// Meeting Endpoints
export const meetings = {
  create: (data: any) =>
    apiCall('/meeting/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => apiCall('/meeting/me', { method: 'GET' }),
  accept: (meetingId: string) => apiCall(`/meeting/${meetingId}/accept`, { method: 'POST' }),
  decline: (meetingId: string) => apiCall(`/meeting/${meetingId}/decline`, { method: 'POST' }),
};
