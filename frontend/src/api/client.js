// Dev: Vite proxies /api -> http://localhost:8080 (see vite.config.js).
// Prod: nginx proxies /api -> backend, or set VITE_API_URL to an absolute URL.
let rawBase = (import.meta.env.VITE_API_URL || '/api').trim();
if (rawBase && !rawBase.startsWith('/') && !rawBase.startsWith('http')) {
  rawBase = `https://${rawBase}`;
}
if (rawBase.startsWith('http')) {
  rawBase = rawBase.replace(/\/+$/, '');
  if (!rawBase.endsWith('/api')) {
    rawBase += '/api';
  }
}
const BASE = rawBase;
const TOKEN_KEY = 'cems_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, fieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors || {};
  }
}

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

async function request(path, { method = 'GET', body, query } = {}) {
  const headers = { Accept: 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let url = `${BASE}${path}`;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.set(k, v);
    });
    url += `?${params.toString()}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the CEMS server. Is the backend running on port 8080?', 0);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // An expired/invalid token on an authenticated call -> drop the session.
    if (res.status === 401 && token && onUnauthorized) onUnauthorized();
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data?.fieldErrors);
  }
  return data;
}

export const api = {
  // auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (form) => request('/auth/register', { method: 'POST', body: form }),
  me: () => request('/auth/me'),

  // read models
  getEvents: () => request('/events'),
  getVenues: () => request('/venues'),
  getRegistrations: () => request('/registrations'),
  getAnalytics: () => request('/analytics'),
  getAuditLogs: () => request('/audit-logs'),

  // organizer
  proposeEvent: (data) => request('/events', { method: 'POST', body: data }),
  checkConflict: (query) => request('/events/conflicts', { query }),

  // admin
  approveEvent: (id) => request(`/events/${id}/approve`, { method: 'POST' }),
  rejectEvent: (id) => request(`/events/${id}/reject`, { method: 'POST' }),
  addVenue: (data) => request('/venues', { method: 'POST', body: data }),

  // student
  registerForEvent: (eventId) => request(`/events/${eventId}/register`, { method: 'POST' }),
  cancelRegistration: (id) => request(`/registrations/${id}`, { method: 'DELETE' }),

  // gate
  checkIn: (token) => request('/checkin', { method: 'POST', body: { token } }),
};
