CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  profile_picture text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'India',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- 3. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  image_url text,
  banner_url text,
  cuisine_types text[] DEFAULT '{}',
  rating numeric(2,1) DEFAULT 0.0,
  total_ratings integer DEFAULT 0,
  delivery_time text DEFAULT '30-40 mins',
  minimum_order numeric(10,2) DEFAULT 0,
  delivery_fee numeric(10,2) DEFAULT 0,
  preparation_time integer DEFAULT 30,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  latitude numeric(10,8),
  longitude numeric(11,8),
  phone text,
  email text,
  opening_time time,
  closing_time time,
  is_open boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active restaurants"
  ON restaurants FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- 4. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  image_url text,
  price numeric(10,2) NOT NULL,
  discount_price numeric(10,2),
  is_vegetarian boolean DEFAULT false,
  is_vegan boolean DEFAULT false,
  is_bestseller boolean DEFAULT false,
  is_available boolean DEFAULT true,
  calories integer,
  preparation_time integer DEFAULT 15,
  spice_level text CHECK (spice_level IN ('mild', 'medium', 'hot', 'extra_hot')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  TO authenticated, anon
  USING (is_available = true);

-- 5. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text DEFAULT 'India',
  latitude numeric(10,8),
  longitude numeric(11,8),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. CARTS TABLE
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart"
  ON carts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart"
  ON carts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON carts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart"
  ON carts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(cart_id, menu_item_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM carts
      WHERE carts.id = cart_items.cart_id
      AND carts.user_id = auth.uid()
    )
  );

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE SET NULL NOT NULL,
  address_id uuid REFERENCES addresses(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')
  ),
  subtotal numeric(10,2) NOT NULL,
  delivery_fee numeric(10,2) DEFAULT 0,
  tax numeric(10,2) DEFAULT 0,
  discount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('card', 'upi', 'wallet', 'cod')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'completed', 'failed', 'refunded')
  ),
  delivery_instructions text,
  estimated_delivery_time timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 9. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  item_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- 10. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  restaurant_id uuid REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, order_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert Categories
INSERT INTO categories (name, description, icon, display_order) VALUES
  ('Breakfast', 'Start your day right', '🍳', 1),
  ('Lunch', 'Midday meals', '🍱', 2),
  ('Dinner', 'Evening delights', '🍽️', 3),
  ('Appetizers', 'Starters and snacks', '🥟', 4),
  ('Main Course', 'Hearty meals', '🍛', 5),
  ('Desserts', 'Sweet treats', '🍰', 6),
  ('Beverages', 'Drinks and refreshments', '🥤', 7),
  ('Pizza', 'Italian favorites', '🍕', 8),
  ('Burgers', 'Classic burgers', '🍔', 9),
  ('Chinese', 'Asian cuisine', '🥡', 10),
  ('Indian', 'Traditional Indian', '🍛', 11),
  ('Healthy', 'Nutritious options', '🥗', 12)
ON CONFLICT (name) DO NOTHING;

-- Insert Sample Restaurants
INSERT INTO restaurants (
  name, description, image_url, banner_url, cuisine_types, rating, total_ratings,
  delivery_time, minimum_order, delivery_fee, address_line1, city, state, phone, is_open
) VALUES
  (
    'The Pizza Hub',
    'Authentic Italian pizzas with fresh ingredients',
    'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg',
    'https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg',
    ARRAY['Italian', 'Pizza', 'Fast Food'],
    4.5, 2500, '25-35 mins', 150.00, 40.00,
    '123 Main Street', 'Mumbai', 'Maharashtra', '+91-9876543210', true
  ),
  (
    'Burger Barn',
    'Juicy burgers and crispy fries',
    'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
    'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
    ARRAY['American', 'Burgers', 'Fast Food'],
    4.3, 1800, '20-30 mins', 100.00, 30.00,
    '456 Oak Avenue', 'Delhi', 'Delhi', '+91-9876543211', true
  ),
  (
    'Spice Route',
    'Traditional Indian cuisine with authentic flavors',
    'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg',
    'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg',
    ARRAY['Indian', 'North Indian', 'Biryani'],
    4.7, 3200, '35-45 mins', 200.00, 50.00,
    '789 Heritage Lane', 'Bangalore', 'Karnataka', '+91-9876543212', true
  ),
  (
    'Wok & Roll',
    'Delicious Chinese and Asian fusion',
    'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg',
    'https://images.pexels.com/photos/1907244/pexels-photo-1907244.jpeg',
    ARRAY['Chinese', 'Asian', 'Thai'],
    4.4, 2100, '30-40 mins', 180.00, 45.00,
    '321 Dragon Street', 'Pune', 'Maharashtra', '+91-9876543213', true
  ),
  (
    'Green Bowl',
    'Healthy salads, smoothies and organic food',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg',
    ARRAY['Healthy', 'Salads', 'Vegan'],
    4.6, 1500, '20-25 mins', 120.00, 35.00,
    '555 Wellness Road', 'Hyderabad', 'Telangana', '+91-9876543214', true
  ),
  (
    'Sweet Tooth Bakery',
    'Freshly baked cakes, pastries and desserts',
    'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg',
    ARRAY['Desserts', 'Bakery', 'Cakes'],
    4.8, 2800, '25-30 mins', 100.00, 40.00,
    '777 Sugar Lane', 'Chennai', 'Tamil Nadu', '+91-9876543215', true
  ),
  (
    'Breakfast Club',
    'All-day breakfast and brunch favorites',
    'https://images.pexels.com/photos/704569/pexels-photo-704569.jpeg',
    'https://images.pexels.com/photos/101533/pexels-photo-101533.jpeg',
    ARRAY['Breakfast', 'Cafe', 'Continental'],
    4.5, 1900, '20-30 mins', 150.00, 35.00,
    '999 Morning Drive', 'Kolkata', 'West Bengal', '+91-9876543216', true
  ),
  (
    'Coastal Kitchen',
    'Fresh seafood and coastal delicacies',
    'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg',
    ARRAY['Seafood', 'Coastal', 'Indian'],
    4.6, 2200, '40-50 mins', 250.00, 55.00,
    '888 Beach Road', 'Goa', 'Goa', '+91-9876543217', true
  )
ON CONFLICT DO NOTHING;

-- Get category IDs for menu items
DO $$
DECLARE
  cat_pizza uuid;
  cat_burger uuid;
  cat_indian uuid;
  cat_chinese uuid;
  cat_dessert uuid;
  cat_beverage uuid;
  cat_appetizer uuid;
  cat_main uuid;
  cat_healthy uuid;
  cat_breakfast uuid;
  
  rest_pizza uuid;
  rest_burger uuid;
  rest_spice uuid;
  rest_wok uuid;
  rest_green uuid;
  rest_sweet uuid;
  rest_breakfast uuid;
  rest_coastal uuid;
BEGIN
  SELECT id INTO cat_pizza FROM categories WHERE name = 'Pizza';
  SELECT id INTO cat_burger FROM categories WHERE name = 'Burgers';
  SELECT id INTO cat_indian FROM categories WHERE name = 'Indian';
  SELECT id INTO cat_chinese FROM categories WHERE name = 'Chinese';
  SELECT id INTO cat_dessert FROM categories WHERE name = 'Desserts';
  SELECT id INTO cat_beverage FROM categories WHERE name = 'Beverages';
  SELECT id INTO cat_appetizer FROM categories WHERE name = 'Appetizers';
  SELECT id INTO cat_main FROM categories WHERE name = 'Main Course';
  SELECT id INTO cat_healthy FROM categories WHERE name = 'Healthy';
  SELECT id INTO cat_breakfast FROM categories WHERE name = 'Breakfast';
  
  SELECT id INTO rest_pizza FROM restaurants WHERE name = 'The Pizza Hub';
  SELECT id INTO rest_burger FROM restaurants WHERE name = 'Burger Barn';
  SELECT id INTO rest_spice FROM restaurants WHERE name = 'Spice Route';
  SELECT id INTO rest_wok FROM restaurants WHERE name = 'Wok & Roll';
  SELECT id INTO rest_green FROM restaurants WHERE name = 'Green Bowl';
  SELECT id INTO rest_sweet FROM restaurants WHERE name = 'Sweet Tooth Bakery';
  SELECT id INTO rest_breakfast FROM restaurants WHERE name = 'Breakfast Club';
  SELECT id INTO rest_coastal FROM restaurants WHERE name = 'Coastal Kitchen';

  -- Pizza Hub Menu
  INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, price, is_vegetarian, is_bestseller) VALUES
    (rest_pizza, cat_pizza, 'Margherita Pizza', 'Classic pizza with fresh mozzarella, basil and tomato sauce', 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg', 299.00, true, true),
    (rest_pizza, cat_pizza, 'Pepperoni Delight', 'Loaded with pepperoni and cheese', 'https://images.pexels.com/photos/1653877/pexels-photo-1653877.jpeg', 399.00, false, true),
    (rest_pizza, cat_pizza, 'Veggie Supreme', 'Colorful veggies with olives and bell peppers', 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg', 349.00, true, false),
    (rest_pizza, cat_appetizer, 'Garlic Bread', 'Crispy bread with butter and garlic', 'https://images.pexels.com/photos/4109998/pexels-photo-4109998.jpeg', 149.00, true, false),
    (rest_pizza, cat_beverage, 'Cold Coffee', 'Refreshing iced coffee', 'https://images.pexels.com/photos/2625122/pexels-photo-2625122.jpeg', 99.00, true, false);

  -- Burger Barn Menu
  INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, price, is_vegetarian, is_bestseller) VALUES
    (rest_burger, cat_burger, 'Classic Beef Burger', 'Juicy beef patty with lettuce, tomato and special sauce', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', 249.00, false, true),
    (rest_burger, cat_burger, 'Veggie Burger', 'Plant-based patty with fresh vegetables', 'https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg', 199.00, true, false),
    (rest_burger, cat_burger, 'Chicken Burger', 'Grilled chicken with mayo and pickles', 'https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg', 229.00, false, true),
    (rest_burger, cat_appetizer, 'French Fries', 'Crispy golden fries', 'https://images.pexels.com/photos/1893555/pexels-photo-1893555.jpeg', 99.00, true, false),
    (rest_burger, cat_beverage, 'Milkshake', 'Thick and creamy milkshake', 'https://images.pexels.com/photos/1841521/pexels-photo-1841521.jpeg', 149.00, true, false);

  -- Spice Route Menu
  INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, price, is_vegetarian, is_bestseller, spice_level) VALUES
    (rest_spice, cat_indian, 'Chicken Biryani', 'Fragrant basmati rice with tender chicken', 'https://images.pexels.com/photos/2456435/pexels-photo-2456435.jpeg', 349.00, false, true, 'medium'),
    (rest_spice, cat_indian, 'Paneer Butter Masala', 'Creamy tomato curry with cottage cheese', 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg', 299.00, true, true, 'mild'),
    (rest_spice, cat_indian, 'Dal Makhani', 'Rich black lentils with butter', 'https://images.pexels.com/photos/5409015/pexels-photo-5409015.jpeg', 249.00, true, false, 'mild'),
    (rest_spice, cat_appetizer, 'Samosa (2 pcs)', 'Crispy pastry with spiced potato filling', 'https://images.pexels.com/photos/14477865/pexels-photo-14477865.jpeg', 60.00, true, false, 'medium'),
    (rest_spice, cat_beverage, 'Mango Lassi', 'Sweet yogurt drink with mango', 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg', 99.00, true, false, 'mild');

  -- Wok & Roll Menu
  INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, price, is_vegetarian, is_bestseller, spice_level) VALUES
    (rest_wok, cat_chinese, 'Hakka Noodles', 'Stir-fried noodles with vegetables', 'https://images.pexels.com/photos/1907244/pexels-photo-1907244.jpeg', 199.00, true, true, 'medium'),
    (rest_wok, cat_chinese, 'Manchurian Dry', 'Crispy vegetable balls in spicy sauce', 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg', 249.00, true, true, 'hot'),
    (rest_wok, cat_chinese, 'Fried Rice', 'Classic fried rice with eggs and veggies', 'https://images.pexels.com/photos/1907244/pexels-photo-1907244.jpeg', 179.00, false, false, 'mild'),
    (rest_wok, cat_appetizer, 'Spring Rolls (4 pcs)', 'Crispy rolls with vegetable filling', 'https://images.pexels.com/photos/2119660/pexels-photo-2119660.jpeg', 149.00, true, false, 'mild'),
    (rest_wok, cat_beverage, 'Green Tea', 'Healthy and refreshing', 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg', 79.00, true, false, 'mild');

  -- Green Bowl Menu
  INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, price, is_vegetarian, is_bestseller, calories) VALUES
    (rest_green, cat_healthy, 'Caesar Salad', 'Fresh romaine with parmesan and croutons', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 249.00, true, true, 350),
    (rest_green, cat_healthy, 'Greek Salad', 'Mediterranean salad with feta cheese', 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg', 279.00, true, true, 280),
    (rest_green, cat_healthy, 'Quinoa Bowl', 'Protein-rich quinoa with roasted vegetables', 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg', 329.00, true, false, 420),
    (rest_green, cat_beverage, 'Green Smoothie', 'Spinach, banana and almond milk', 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg', 199.00, true, false, 180),
    (rest_green, cat_beverage, 'Detox Juice', 'Fresh pressed vegetables and fruits', 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', 179.00, true, false, 120);

  -- Sweet Tooth Bakery Menu
  INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, price, is_vegetarian, is_bestseller, calories) VALUES
    (rest_sweet, cat_dessert, 'Chocolate Cake', 'Rich and moist chocolate cake', 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg', 499.00, true, true, 450),
    (rest_sweet, cat_dessert, 'Red Velvet Cake', 'Classic red velvet with cream cheese frosting', 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg', 549.00, true, true, 480),
    (rest_sweet, cat_dessert, 'Cheesecake', 'Creamy New York style cheesecake', 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', 399.00, true, false, 420),
    (rest_sweet, cat_dessert, 'Brownie', 'Fudgy chocolate brownie', 'https://images.pexels.com/photos/3026805/pexels-photo-3026805.jpeg', 149.00, true, false, 350),
    (rest_sweet, cat_beverage, 'Hot Chocolate', 'Rich and creamy hot chocolate', 'https://images.pexels.com/photos/982612/pexels-photo-982612.jpeg', 129.00, true, false, 280);

  -- Breakfast Club Menu
  INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, price, is_vegetarian, is_bestseller, calories) VALUES
    (rest_breakfast, cat_breakfast, 'Pancakes Stack', 'Fluffy pancakes with maple syrup', 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg', 249.00, true, true, 520),
    (rest_breakfast, cat_breakfast, 'English Breakfast', 'Eggs, bacon, sausage, beans and toast', 'https://images.pexels.com/photos/101533/pexels-photo-101533.jpeg', 399.00, false, true, 680),
    (rest_breakfast, cat_breakfast, 'Avocado Toast', 'Sourdough with smashed avocado and poached egg', 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg', 299.00, true, false, 380),
    (rest_breakfast, cat_breakfast, 'Omelette', 'Three-egg omelette with cheese and vegetables', 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg', 199.00, true, false, 340),
    (rest_breakfast, cat_beverage, 'Fresh Orange Juice', 'Freshly squeezed orange juice', 'https://images.pexels.com/photos/1435740/pexels-photo-1435740.jpeg', 99.00, true, false, 110);

  -- Coastal Kitchen Menu
  INSERT INTO menu_items (restaurant_id, category_id, name, description, image_url, price, is_vegetarian, is_bestseller, spice_level) VALUES
    (rest_coastal, cat_main, 'Fish Curry', 'Traditional coastal fish curry', 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg', 349.00, false, true, 'medium'),
    (rest_coastal, cat_main, 'Prawn Masala', 'Spicy prawns in rich gravy', 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg', 449.00, false, true, 'hot'),
    (rest_coastal, cat_main, 'Fish Fry', 'Crispy fried fish marinated in spices', 'https://images.pexels.com/photos/566345/pexels-photo-566345.jpeg', 299.00, false, false, 'medium'),
    (rest_coastal, cat_appetizer, 'Calamari Rings', 'Deep fried squid rings', 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg', 299.00, false, false, 'mild'),
    (rest_coastal, cat_beverage, 'Coconut Water', 'Fresh tender coconut water', 'https://images.pexels.com/photos/2894807/pexels-photo-2894807.jpeg', 60.00, true, false, 'mild');

END $$;