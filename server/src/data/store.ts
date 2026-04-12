/**
 * In-memory data store.
 * Replace the arrays/maps below with actual DB calls to swap in a real database.
 */

import bcrypt from 'bcryptjs';
import { User, Restaurant, Order } from '../types';

// Pre-seeded test accounts (password: "password123" for all)
const PASSWORD_HASH = bcrypt.hashSync('password123', 10);

export const users: User[] = [
  {
    id: 'user-customer-1',
    email: 'customer@test.com',
    passwordHash: PASSWORD_HASH,
    role: 'customer',
    name: 'Test Customer',
  },
  {
    id: 'user-driver-1',
    email: 'driver@test.com',
    passwordHash: PASSWORD_HASH,
    role: 'driver',
    name: 'Test Driver',
  },
  {
    id: 'user-restaurant-1',
    email: 'restaurant@test.com',
    passwordHash: PASSWORD_HASH,
    role: 'restaurant',
    name: 'Burger Palace Owner',
    restaurantId: 'rest-1',
  },
  {
    id: 'user-admin-1',
    email: 'admin@test.com',
    passwordHash: PASSWORD_HASH,
    role: 'admin',
    name: 'Admin User',
  },
];

export const orders: Order[] = [];

export const restaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Burger Palace',
    description: 'Juicy burgers made fresh daily',
    cuisine: 'American',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    menu: [
      {
        id: 'item-1',
        name: 'Classic Cheeseburger',
        description: 'Beef patty, cheddar, lettuce, tomato',
        price: 8.99,
        imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300',
      },
      {
        id: 'item-2',
        name: 'Double Smash Burger',
        description: 'Two smashed patties, American cheese, special sauce',
        price: 12.99,
        imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300',
      },
      {
        id: 'item-3',
        name: 'Crispy Chicken Sandwich',
        description: 'Fried chicken, pickles, spicy mayo',
        price: 9.99,
        imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=300',
      },
      {
        id: 'item-4',
        name: 'Loaded Fries',
        description: 'Crispy fries with cheese sauce and bacon bits',
        price: 5.99,
        imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300',
      },
    ],
  },
  {
    id: 'rest-2',
    name: 'Pizza Fiesta',
    description: 'Authentic Neapolitan-style pizza',
    cuisine: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    menu: [
      {
        id: 'item-5',
        name: 'Margherita',
        description: 'San Marzano tomatoes, fresh mozzarella, basil',
        price: 11.99,
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300',
      },
      {
        id: 'item-6',
        name: 'Pepperoni',
        description: 'Classic pepperoni with tomato sauce and mozzarella',
        price: 13.99,
        imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300',
      },
      {
        id: 'item-7',
        name: 'BBQ Chicken',
        description: 'Grilled chicken, BBQ sauce, red onion, cilantro',
        price: 14.99,
        imageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300',
      },
      {
        id: 'item-8',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with espresso and mascarpone',
        price: 6.99,
        imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300',
      },
    ],
  },
  {
    id: 'rest-3',
    name: 'Sushi World',
    description: 'Fresh sushi and Japanese cuisine',
    cuisine: 'Japanese',
    imageUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400',
    menu: [
      {
        id: 'item-9',
        name: 'Salmon Roll (8 pcs)',
        description: 'Fresh Atlantic salmon, cucumber, avocado',
        price: 13.99,
        imageUrl: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=300',
      },
      {
        id: 'item-10',
        name: 'Spicy Tuna Roll (8 pcs)',
        description: 'Spicy tuna, sriracha mayo, sesame seeds',
        price: 14.99,
        imageUrl: 'https://images.unsplash.com/photo-1617196034099-b85d4b77d2c8?w=300',
      },
      {
        id: 'item-11',
        name: 'Miso Soup',
        description: 'Traditional miso broth with tofu and seaweed',
        price: 3.99,
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300',
      },
      {
        id: 'item-12',
        name: 'Edamame',
        description: 'Steamed salted soybeans',
        price: 4.99,
        imageUrl: 'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?w=300',
      },
    ],
  },
];
