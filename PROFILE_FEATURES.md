# Profile Page Features Guide

## Overview

The ProfilePage has been completely redesigned with a modern, professional layout featuring two separate tabs for managing user profile information and viewing order history.

## Key Features

### 1. Tab Navigation

The profile page includes two main tabs:

#### Profile Info Tab
- **Personal Information Section**
  - Edit full name
  - View email (read-only)
  - Update phone number

- **Delivery Address Section**
  - Address Line 1 (Street address)
  - Address Line 2 (Optional)
  - City, State, Postal Code
  - All fields can be edited when in edit mode

- **Logout Button**
  - Prominently displayed at the bottom
  - Full-width red button for easy access

#### My Orders Tab
- Complete order history
- Expandable order details
- Reorder functionality
- Order tracking

### 2. Profile Section Features

#### Header with Avatar
- Large circular avatar with user icon
- Full name displayed prominently
- Email address shown
- Phone number (if available)
- Gradient background (Orange to Red)

#### Edit Profile Functionality
- **Edit Mode Button**: Toggle between view and edit modes
- Changes saved to database immediately
- All form validation handled
- Visual feedback for disabled fields

#### Sections Organization
1. **Personal Information**
   - Full Name
   - Email
   - Phone Number
   - Each field has appropriate icons

2. **Delivery Address**
   - Complete address form
   - Organized in logical groups
   - Easy-to-fill inputs
   - All address components editable

### 3. Orders Tab Features

#### Order Listing
Each order card displays:
- Order Number (e.g., "Order #ORD1234567890ABC")
- Restaurant Name
- Order Date
- Number of Items
- Total Amount
- Order Status (color-coded)

#### Expandable Order Details
Click any order to expand and view:

**Left Column:**
- **Order Items Section**
  - Item name
  - Quantity
  - Total price per item
  - White cards for each item on gray background

**Right Column:**
- **Delivery Address Section**
  - Complete delivery address
  - Formatted and easy to read
  - White card background

- **Price Summary Section**
  - Subtotal
  - Delivery Fee
  - Tax (5%)
  - Total Amount
  - Clear breakdown of charges

#### Order Actions (When Expanded)
Two action buttons appear:

1. **Reorder Button** (Orange)
   - Icon: Rotate/Reorder icon
   - Functionality:
     - Fetches all items from the previous order
     - Automatically adds them to the cart with same quantities
     - Shows success message
     - Allows user to proceed to checkout
   - Use case: Quick re-ordering of favorite meals

2. **Track Order Button** (Orange Outline)
   - Icon: Truck icon
   - Functionality:
     - Shows real-time order status
     - Tracks delivery progress
     - Displays estimated delivery time
   - Use case: Monitor current or past orders

### 4. Order Status Indicators

Orders display color-coded status badges:

| Status | Color | Meaning |
|--------|-------|---------|
| Pending | Yellow | Order received, awaiting confirmation |
| Confirmed | Blue | Restaurant has confirmed the order |
| Preparing | Purple | Food is being prepared |
| Ready | Indigo | Food is ready for delivery |
| Out for Delivery | Orange | On the way to you |
| Delivered | Green | Order successfully delivered |
| Cancelled | Red | Order was cancelled |

### 5. Responsive Design

The profile page is fully responsive:
- **Mobile**: Single column layout, compact design
- **Tablet**: Two-column grid for sections
- **Desktop**: Full width with optimal spacing

Key breakpoints:
- Personal Information: `md:grid-cols-2` (2 columns on medium+ screens)
- Address: `grid-cols-3` for City/State/Postal Code
- Order Details: `md:grid-cols-2` (2 columns on medium+ screens)

### 6. Visual Hierarchy

- **Headers**: Bold, large font sizes (16px-24px)
- **Labels**: Semibold, with icons
- **Data**: Regular weight, clear spacing
- **Borders**: Subtle gray lines for section separation
- **Spacing**: Consistent 6px base unit (p-6, space-y-6, etc.)

### 7. Interactive Elements

#### Buttons
- **Edit Profile**: Orange background, white text
- **Save Changes**: Orange background when editing
- **Reorder**: Full-width orange, with icon
- **Track Order**: Orange outline variant
- **Logout**: Red background, full-width

#### Inputs
- **Active (Editable)**: Blue ring on focus
- **Disabled (Read-only)**: Gray background
- **Border**: Subtle gray border
- **Icons**: Associated with field types

#### Expandable Cards
- Smooth transitions
- Hover effects (shadow increase)
- ChevronDown icon that rotates when expanded
- Animated background color changes

### 8. Data Management

#### Reorder Functionality
```typescript
// When Reorder button is clicked:
1. Fetch all order items from selected order
2. For each item, fetch current menu item data
3. Add each item to cart with original quantities
4. Show success message
5. User can proceed to checkout
```

#### Profile Updates
```typescript
// When Save Changes is clicked:
1. Validate form data
2. Update profile in Supabase
3. Refresh profile data
4. Exit edit mode
5. Show success feedback
```

#### Orders Fetching
```typescript
// On component mount:
1. Fetch all user orders from database
2. Include restaurant details
3. Include order items
4. Sort by most recent first
5. Display in UI
```

### 9. Empty States

**No Orders**
- Shows package icon
- Friendly message: "No orders yet"
- Subtext: "Start ordering to see your history here"

**Loading State**
- Spinning loader animation
- "Loading your orders..." text
- Appears while fetching data

### 10. Icons Used

From lucide-react:
- `User` - Profile/user icon
- `MapPin` - Location/address
- `Phone` - Phone number
- `Mail` - Email address
- `Package` - Orders/packages
- `IndianRupee` - Currency
- `RotateCcw` - Reorder
- `ChevronDown` - Expandable sections
- `Calendar` - Date
- `Truck` - Order tracking/delivery
- `X` - Close button

### 11. Color Scheme

- **Primary**: Orange (#F97316) - CTAs, active states
- **Secondary**: Red (#EF4444) - Logout button
- **Success**: Green (#22C55E) - Delivered status
- **Warning**: Yellow (#EAB308) - Pending status
- **Info**: Blue (#3B82F6) - Confirmed status
- **Background**: White (#FFFFFF) - Cards, sections
- **Border**: Gray (#E5E7EB) - Subtle lines
- **Text**: Dark Gray (#111827) - Primary text

### 12. Accessibility Features

- Semantic HTML structure
- Proper label associations
- Keyboard navigation support
- Color contrast meets WCAG standards
- Focus indicators on interactive elements
- Clear visual feedback for all actions

## Usage Example

### User Flow

1. **User clicks Profile Icon** in header
   - ProfilePage modal opens
   - Shows "Profile Info" tab by default

2. **Editing Profile**
   - User clicks "Edit Profile" button
   - Fields become editable
   - User updates information
   - User clicks "Save Changes"
   - Data saves to database
   - Edit mode exits

3. **Viewing Orders**
   - User clicks "My Orders" tab
   - List of all orders appears
   - User clicks on an order to expand
   - Detailed information displays
   - User can click "Reorder" to add items to cart
   - Or click "Track Order" to see status

4. **Reordering**
   - User clicks "Reorder" on any past order
   - All items and quantities are added to cart
   - Success message appears
   - User can proceed to checkout
   - Same restaurant's cart is used/created

## Technical Implementation

### State Management
- `activeTab`: Tracks which tab is open ('profile' or 'orders')
- `isEditing`: Toggle edit mode
- `orders`: Stores fetched orders array
- `expandedOrderId`: Tracks which order is expanded
- `formData`: Manages form input values

### Key Functions
- `fetchOrders()`: Retrieves user orders from Supabase
- `handleSave()`: Saves profile updates
- `handleReorder()`: Adds previous order items to cart
- `getStatusColor()`: Returns color for order status

### Database Queries
- Profiles table: Update operations
- Orders table: Select with relations
- Menu items table: Select for reorder validation
- Cart operations: Through CartContext

## Future Enhancements

Potential features to add:
- Order filters (by date, status, restaurant)
- Download order receipt as PDF
- Rate and review orders
- Saved addresses management
- Payment method management
- Wallet/loyalty points display
- Order search functionality
- Estimated delivery time tracking
