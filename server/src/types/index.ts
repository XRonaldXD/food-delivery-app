export type Role = 'customer' | 'driver' | 'restaurant' | 'admin';

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'ready'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string;
  phone?: string;
  /** For users with role 'restaurant', the id of the restaurant they own. */
  restaurantId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  cuisine: string;
  menu: MenuItem[];
  autoAccept?: boolean;
  /** Password required to register as an owner of this restaurant. */
  restaurantPassword?: string;
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

export interface JwtPayload {
  userId: string;
  role: Role;
  restaurantId?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  message: string;
  createdAt: string;
}

export interface DriverLocation {
  driverId: string;
  orderId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}
