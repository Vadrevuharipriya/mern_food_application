# FoodExpress - Food Ordering App

A modern, full-featured food ordering application similar to Swiggy, built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Sign up, login, and profile management
- **Restaurant Browsing**: Search and filter restaurants by categories and cuisine
- **Menu Management**: Browse menu items with detailed information
- **Shopping Cart**: Add items, update quantities, and manage cart
- **Order Placement**: Complete checkout with multiple payment options
- **Order History**: Track past orders and their status
- **Responsive Design**: Beautiful UI that works on all devices

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite

## Project Structure

```
project/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── CategoryFilter.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── MenuItemCard.tsx
│   │   ├── RestaurantCard.tsx
│   │   └── SearchBar.tsx
│   │
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx  # Authentication state management
│   │   └── CartContext.tsx  # Shopping cart state management
│   │
│   ├── lib/                 # Library configurations
│   │   └── supabase.ts      # Supabase client setup
│   │
│   ├── pages/               # Page components
│   │   ├── AuthPage.tsx     # Login/Register modal
│   │   ├── CartPage.tsx     # Shopping cart modal
│   │   ├── CheckoutPage.tsx # Checkout flow
│   │   ├── HomePage.tsx     # Restaurant listing
│   │   ├── ProfilePage.tsx  # User profile & order history
│   │   └── RestaurantPage.tsx # Restaurant menu details
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
│
├── public/                  # Static assets
├── .env                     # Environment variables
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Database Schema

### Tables

1. **profiles** - User profile information
2. **restaurants** - Restaurant details
3. **categories** - Food categories
4. **menu_items** - Menu items for restaurants
5. **carts** - User shopping carts
6. **cart_items** - Items in shopping carts
7. **orders** - Completed orders
8. **order_items** - Line items for orders
9. **addresses** - Saved delivery addresses
10. **reviews** - Restaurant reviews and ratings

## Setup Instructions

### 1. Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### 2. Clone and Install

```bash
# Install dependencies
npm install
```

### 3. Configure Environment Variables

The `.env` file should contain your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

The database schema and sample data are already created. The migration includes:
- All necessary tables with Row Level Security (RLS)
- 8 restaurants with different cuisines
- 50+ menu items across various categories
- Pre-populated food categories

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

### 6. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Key Features Explained

### Authentication
- Email/password authentication via Supabase
- Automatic profile creation on signup
- Protected routes and actions

### Restaurant Browsing
- Search restaurants by name, description, or cuisine
- Filter by food categories
- View ratings, delivery time, and minimum order

### Menu & Cart
- Add items to cart with quantity controls
- Cart persists in database
- Real-time cart updates
- Cart restricted to single restaurant

### Checkout
- Delivery address management
- Multiple payment options (Card, UPI, Wallet, COD)
- Order summary with itemized costs
- Tax and delivery fee calculation

### Profile & Orders
- Edit profile information
- View complete order history
- Track order status
- See order details

## Color Scheme

- Primary: Orange (#F97316)
- Secondary: Red (#EF4444)
- Background: Gray (#F9FAFB)
- Text: Gray (#111827)

## Component Architecture

### Contexts
- **AuthContext**: Manages user authentication state and profile
- **CartContext**: Manages shopping cart and cart operations

### Pages
- **HomePage**: Main landing page with restaurant listings
- **RestaurantPage**: Detailed restaurant view with menu
- **AuthPage**: Login/Register modal
- **CartPage**: Shopping cart modal
- **CheckoutPage**: Order placement flow
- **ProfilePage**: User profile and order history

### Components
- **Header**: Navigation bar with cart, profile, and auth buttons
- **Footer**: Footer with company info and links
- **SearchBar**: Reusable search input
- **CategoryFilter**: Category selection buttons
- **RestaurantCard**: Restaurant display card
- **MenuItemCard**: Menu item with add to cart functionality

## API Integration

All data is managed through Supabase:
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL via Supabase
- **Real-time**: Automatic updates for cart changes

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure authentication with Supabase
- Protected routes and actions

## Performance

- Code splitting with Vite
- Optimized images from Pexels
- Efficient database queries
- Lazy loading for better performance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a demonstration project. Feel free to fork and modify for your needs.

## License

MIT License - feel free to use for personal or commercial projects.
