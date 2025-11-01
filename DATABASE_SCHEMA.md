# Database Schema Documentation

## Overview

The FoodExpress database uses PostgreSQL (via Supabase) with Row Level Security (RLS) enabled for all tables.

## Tables

### 1. profiles

Stores user profile information linked to authentication.

**Columns:**
- `id` (uuid, PK) - Unique profile identifier
- `user_id` (uuid, FK -> auth.users) - Links to Supabase auth user
- `full_name` (text) - User's full name
- `email` (text) - User's email address
- `phone` (text, nullable) - Contact number
- `profile_picture` (text, nullable) - Profile image URL
- `address_line1` (text, nullable) - Primary address
- `address_line2` (text, nullable) - Secondary address
- `city` (text, nullable) - City name
- `state` (text, nullable) - State name
- `postal_code` (text, nullable) - Postal/ZIP code
- `country` (text, default: 'India') - Country name
- `created_at` (timestamptz) - Record creation time
- `updated_at` (timestamptz) - Last update time

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile

---

### 2. restaurants

Stores restaurant/store information.

**Columns:**
- `id` (uuid, PK) - Unique restaurant identifier
- `name` (text) - Restaurant name
- `description` (text, nullable) - Restaurant description
- `image_url` (text, nullable) - Restaurant logo/image
- `banner_url` (text, nullable) - Banner image
- `cuisine_types` (text[]) - Array of cuisine types
- `rating` (numeric(2,1)) - Average rating (0.0-5.0)
- `total_ratings` (integer) - Number of ratings
- `delivery_time` (text) - Estimated delivery time
- `minimum_order` (numeric(10,2)) - Minimum order amount
- `delivery_fee` (numeric(10,2)) - Delivery charge
- `preparation_time` (integer) - Food preparation time in minutes
- `address_line1` (text, nullable) - Restaurant address
- `address_line2` (text, nullable) - Additional address info
- `city` (text, nullable) - City
- `state` (text, nullable) - State
- `postal_code` (text, nullable) - Postal code
- `latitude` (numeric(10,8), nullable) - GPS latitude
- `longitude` (numeric(11,8), nullable) - GPS longitude
- `phone` (text, nullable) - Contact number
- `email` (text, nullable) - Contact email
- `opening_time` (time, nullable) - Opening time
- `closing_time` (time, nullable) - Closing time
- `is_open` (boolean, default: true) - Currently accepting orders
- `is_active` (boolean, default: true) - Restaurant is active
- `created_at` (timestamptz) - Record creation time
- `updated_at` (timestamptz) - Last update time

**RLS Policies:**
- Anyone (authenticated or anonymous) can view active restaurants

---

### 3. categories

Food categories for organizing menu items.

**Columns:**
- `id` (uuid, PK) - Unique category identifier
- `name` (text, unique) - Category name
- `description` (text, nullable) - Category description
- `icon` (text, nullable) - Emoji or icon
- `image_url` (text, nullable) - Category image
- `display_order` (integer, default: 0) - Sort order
- `is_active` (boolean, default: true) - Category is active
- `created_at` (timestamptz) - Record creation time

**RLS Policies:**
- Anyone can view active categories

**Pre-populated Categories:**
- Breakfast, Lunch, Dinner
- Appetizers, Main Course, Desserts
- Beverages, Pizza, Burgers
- Chinese, Indian, Healthy

---

### 4. menu_items

Individual food items available at restaurants.

**Columns:**
- `id` (uuid, PK) - Unique menu item identifier
- `restaurant_id` (uuid, FK -> restaurants) - Parent restaurant
- `category_id` (uuid, FK -> categories) - Food category
- `name` (text) - Item name
- `description` (text, nullable) - Item description
- `image_url` (text, nullable) - Item image
- `price` (numeric(10,2)) - Base price
- `discount_price` (numeric(10,2), nullable) - Discounted price
- `is_vegetarian` (boolean, default: false) - Vegetarian flag
- `is_vegan` (boolean, default: false) - Vegan flag
- `is_bestseller` (boolean, default: false) - Bestseller flag
- `is_available` (boolean, default: true) - Currently available
- `calories` (integer, nullable) - Calorie count
- `preparation_time` (integer, default: 15) - Prep time in minutes
- `spice_level` (text, nullable) - Spice level (mild/medium/hot/extra_hot)
- `created_at` (timestamptz) - Record creation time
- `updated_at` (timestamptz) - Last update time

**RLS Policies:**
- Anyone can view available menu items

---

### 5. addresses

Saved delivery addresses for users.

**Columns:**
- `id` (uuid, PK) - Unique address identifier
- `user_id` (uuid, FK -> auth.users) - Owner user
- `label` (text) - Address label (Home, Work, etc.)
- `address_line1` (text) - Primary address
- `address_line2` (text, nullable) - Secondary address
- `city` (text) - City name
- `state` (text) - State name
- `postal_code` (text) - Postal code
- `country` (text, default: 'India') - Country
- `latitude` (numeric(10,8), nullable) - GPS latitude
- `longitude` (numeric(11,8), nullable) - GPS longitude
- `is_default` (boolean, default: false) - Default address flag
- `created_at` (timestamptz) - Record creation time

**RLS Policies:**
- Users can view their own addresses
- Users can insert their own addresses
- Users can update their own addresses
- Users can delete their own addresses

---

### 6. carts

Active shopping carts for users.

**Columns:**
- `id` (uuid, PK) - Unique cart identifier
- `user_id` (uuid, FK -> auth.users) - Cart owner
- `restaurant_id` (uuid, FK -> restaurants) - Restaurant for this cart
- `created_at` (timestamptz) - Record creation time
- `updated_at` (timestamptz) - Last update time

**Constraints:**
- Unique constraint on (user_id, restaurant_id)

**RLS Policies:**
- Users can view their own cart
- Users can insert their own cart
- Users can update their own cart
- Users can delete their own cart

---

### 7. cart_items

Individual items in shopping carts.

**Columns:**
- `id` (uuid, PK) - Unique cart item identifier
- `cart_id` (uuid, FK -> carts) - Parent cart
- `menu_item_id` (uuid, FK -> menu_items) - Menu item reference
- `quantity` (integer, CHECK > 0) - Item quantity
- `special_instructions` (text, nullable) - Custom instructions
- `created_at` (timestamptz) - Record creation time
- `updated_at` (timestamptz) - Last update time

**Constraints:**
- Unique constraint on (cart_id, menu_item_id)

**RLS Policies:**
- Users can view items in their own cart
- Users can insert items in their own cart
- Users can update items in their own cart
- Users can delete items from their own cart

---

### 8. orders

Completed orders with full details.

**Columns:**
- `id` (uuid, PK) - Unique order identifier
- `user_id` (uuid, FK -> auth.users) - Order owner
- `restaurant_id` (uuid, FK -> restaurants) - Restaurant
- `address_id` (uuid, FK -> addresses) - Delivery address
- `order_number` (text, unique) - Human-readable order number
- `status` (text) - Order status (pending/confirmed/preparing/ready/out_for_delivery/delivered/cancelled)
- `subtotal` (numeric(10,2)) - Items subtotal
- `delivery_fee` (numeric(10,2)) - Delivery charge
- `tax` (numeric(10,2)) - Tax amount
- `discount` (numeric(10,2)) - Discount amount
- `total_amount` (numeric(10,2)) - Final total
- `payment_method` (text) - Payment method (card/upi/wallet/cod)
- `payment_status` (text) - Payment status (pending/completed/failed/refunded)
- `delivery_instructions` (text, nullable) - Special delivery instructions
- `estimated_delivery_time` (timestamptz, nullable) - Expected delivery time
- `delivered_at` (timestamptz, nullable) - Actual delivery time
- `created_at` (timestamptz) - Order placed time
- `updated_at` (timestamptz) - Last update time

**RLS Policies:**
- Users can view their own orders
- Users can insert their own orders

---

### 9. order_items

Line items for each order.

**Columns:**
- `id` (uuid, PK) - Unique order item identifier
- `order_id` (uuid, FK -> orders) - Parent order
- `menu_item_id` (uuid, FK -> menu_items) - Menu item reference
- `item_name` (text) - Item name (snapshot)
- `item_price` (numeric(10,2)) - Price at time of order
- `quantity` (integer, CHECK > 0) - Item quantity
- `special_instructions` (text, nullable) - Custom instructions
- `created_at` (timestamptz) - Record creation time

**RLS Policies:**
- Users can view items in their own orders
- Users can insert items in their own orders

---

### 10. reviews

Restaurant and order reviews/ratings.

**Columns:**
- `id` (uuid, PK) - Unique review identifier
- `user_id` (uuid, FK -> auth.users) - Reviewer
- `restaurant_id` (uuid, FK -> restaurants) - Reviewed restaurant
- `order_id` (uuid, FK -> orders) - Related order
- `rating` (integer, CHECK 1-5) - Rating value
- `comment` (text, nullable) - Review comment
- `created_at` (timestamptz) - Review creation time
- `updated_at` (timestamptz) - Last update time

**Constraints:**
- Unique constraint on (user_id, order_id)

**RLS Policies:**
- Anyone can view reviews
- Users can insert their own reviews
- Users can update their own reviews

---

## Relationships

```
auth.users (Supabase Auth)
    ├── profiles (1:1)
    ├── carts (1:N)
    ├── addresses (1:N)
    ├── orders (1:N)
    └── reviews (1:N)

restaurants
    ├── menu_items (1:N)
    ├── carts (1:N)
    ├── orders (1:N)
    └── reviews (1:N)

categories
    └── menu_items (1:N)

carts
    └── cart_items (1:N)

menu_items
    ├── cart_items (1:N)
    └── order_items (1:N)

orders
    ├── order_items (1:N)
    └── reviews (1:1)

addresses
    └── orders (1:N)
```

## Sample Data

The database includes:
- 8 restaurants across different cuisines
- 50+ menu items with real images from Pexels
- 12 food categories
- Realistic pricing, ratings, and delivery times

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. Users can only access their own data (profiles, carts, orders, etc.)
3. Public data (restaurants, menu items, categories) is readable by everyone
4. All write operations are restricted to authenticated users
5. No user can modify another user's data

## Migration File

The complete schema is available in:
```
Database Migration: create_food_ordering_schema
```

Run this migration through Supabase to set up the entire database structure and sample data.
