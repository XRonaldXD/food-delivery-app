import * as SecureStore from 'expo-secure-store';

// In development, point at your local machine's IP.
// For Expo Go on a physical device, replace with your computer's LAN IP.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const TOKEN_KEY = 'auth_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

// Auth
export const authApi = {
  register: (body: { email: string; password: string; role: string; name?: string }) =>
    request<{ token: string; user: import('../types').User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: import('../types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

// Restaurants
export const restaurantApi = {
  list: () => request<import('../types').RestaurantSummary[]>('/restaurants'),
  menu: (id: string) => request<import('../types').Restaurant>(`/restaurants/${id}/menu`),
  getSettings: () => request<{ autoAccept: boolean }>('/restaurants/settings'),
  updateSettings: (body: { autoAccept: boolean }) =>
    request<{ autoAccept: boolean }>('/restaurants/settings', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};

// Admin
export const adminApi = {
  users: () => request<import('../types').User[]>('/admin/users'),
  orders: () => request<import('../types').Order[]>('/admin/orders'),
  restaurants: () => request<import('../types').Restaurant[]>('/admin/restaurants'),
};

// Orders
export const orderApi = {
  create: (body: {
    restaurantId: string;
    items: Array<{ menuItemId: string; quantity: number }>;
    deliveryAddress: string;
  }) =>
    request<import('../types').Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  mine: () => request<import('../types').Order[]>('/orders/mine'),
  available: () => request<import('../types').Order[]>('/orders/available'),
  get: (id: string) => request<import('../types').Order>(`/orders/${id}`),
  accept: (id: string) =>
    request<import('../types').Order>(`/orders/${id}/accept`, { method: 'POST' }),
  updateStatus: (id: string, status: import('../types').OrderStatus) =>
    request<import('../types').Order>(`/orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
};
