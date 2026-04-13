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
  register: (body: { email: string; password: string; role: string; name?: string; restaurantId?: string; restaurantPassword?: string }) =>
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

// User profile
export const userApi = {
  updateProfile: (body: {
    name?: string;
    phone?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    newRestaurantId?: string;
    restaurantPassword?: string;
  }) =>
    request<import('../types').User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
};

// Restaurants
export const restaurantApi = {
  list: (params?: { search?: string; cuisine?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.cuisine) qs.set('cuisine', params.cuisine);
    const query = qs.toString();
    return request<import('../types').RestaurantSummary[]>(`/restaurants${query ? `?${query}` : ''}`);
  },
  menu: (id: string) => request<import('../types').Restaurant>(`/restaurants/${id}/menu`),
  getSettings: () => request<{ autoAccept: boolean }>('/restaurants/settings'),
  updateSettings: (body: { autoAccept: boolean }) =>
    request<{ autoAccept: boolean }>('/restaurants/settings', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  getMenu: () => request<import('../types').MenuItem[]>('/restaurants/menu/items'),
  addMenuItem: (body: { name: string; description: string; price: number; imageUrl?: string }) =>
    request<import('../types').MenuItem>('/restaurants/menu', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateMenuItem: (id: string, body: { name?: string; description?: string; price?: number; imageUrl?: string }) =>
    request<import('../types').MenuItem>(`/restaurants/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteMenuItem: (id: string) =>
    request<{ success: boolean }>(`/restaurants/menu/${id}`, { method: 'DELETE' }),
  revenue: (start?: string, end?: string) => {
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);
    const qs = params.toString();
    return request<{ totalRevenue: number; monthlyRevenue: number; totalOrders: number; orders: import('../types').Order[] }>(
      `/restaurants/revenue${qs ? `?${qs}` : ''}`
    );
  },
};

// Admin
export const adminApi = {
  users: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<import('../types').User[]>(`/admin/users${qs}`);
  },
  createUser: (body: { email: string; password: string; role: string; name?: string; phone?: string }) =>
    request<import('../types').User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateUser: (id: string, body: { name?: string; phone?: string; email?: string; role?: string; password?: string }) =>
    request<import('../types').User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteUser: (id: string) =>
    request<{ success: boolean }>(`/admin/users/${id}`, { method: 'DELETE' }),
  orders: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<import('../types').Order[]>(`/admin/orders${qs}`);
  },
  restaurants: () => request<import('../types').Restaurant[]>('/admin/restaurants'),
  revenue: () =>
    request<{
      totalRevenue: number;
      perRestaurant: Array<{ restaurantId: string; restaurantName: string; revenue: number; orderCount: number }>;
      ordersByStatus: Record<string, number>;
      totalOrders: number;
    }>('/admin/revenue'),
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

// Chat
export const chatApi = {
  getMessages: (orderId: string) =>
    request<import('../types').ChatMessage[]>(`/chat/${orderId}`),
  sendMessage: (orderId: string, message: string) =>
    request<import('../types').ChatMessage>(`/chat/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

// Location
export const locationApi = {
  updateDriverLocation: (body: { orderId: string; latitude: number; longitude: number }) =>
    request<import('../types').DriverLocation>('/locations/driver', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getOrderLocation: (orderId: string) =>
    request<import('../types').DriverLocation>(`/locations/order/${orderId}`),
};

// Driver
export const driverApi = {
  earnings: () =>
    request<{
      todayEarnings: number;
      monthlyEarnings: number;
      totalEarnings: number;
      todayDeliveries: number;
      monthlyDeliveries: number;
      totalDeliveries: number;
      recentDeliveries: import('../types').Order[];
    }>('/orders/driver/earnings'),
};

// Addresses
export const addressApi = {
  list: () => request<import('../types').Address[]>('/addresses'),
  add: (body: { label: string; address: string }) =>
    request<import('../types').Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: { label?: string; address?: string }) =>
    request<import('../types').Address>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/addresses/${id}`, { method: 'DELETE' }),
};
