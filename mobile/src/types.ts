export type Role = 'customer' | 'driver';

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface RestaurantSummary {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  imageUrl?: string;
}

export interface Restaurant extends RestaurantSummary {
  menu: MenuItem[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  driverId?: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}
