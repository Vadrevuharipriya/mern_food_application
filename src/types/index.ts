export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  profile_picture?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  banner_url: string;
  cuisine_types: string[];
  rating: number;
  total_ratings: number;
  delivery_time: string;
  minimum_order: number;
  delivery_fee: number;
  preparation_time: number;
  address_line1?: string;
  city?: string;
  phone?: string;
  is_open: boolean;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  discount_price?: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_bestseller: boolean;
  is_available: boolean;
  calories?: number;
  preparation_time: number;
  spice_level?: 'mild' | 'medium' | 'hot' | 'extra_hot';
}

export interface CartItem {
  id: string;
  cart_id: string;
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
  menu_item: MenuItem;
}

export interface Cart {
  id: string;
  user_id: string;
  restaurant_id: string;
  items: CartItem[];
  restaurant: Restaurant;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  address_id?: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  subtotal: number;
  delivery_fee: number;
  tax: number;
  discount: number;
  total_amount: number;
  payment_method: 'card' | 'upi' | 'wallet' | 'cod';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  delivery_instructions?: string;
  estimated_delivery_time?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  restaurant?: Restaurant;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id?: string;
  item_name: string;
  item_price: number;
  quantity: number;
  special_instructions?: string;
}
