# Menu System Documentation

## Overview

A comprehensive menu browsing and management system has been added to the Little Smoothie Order Management System. Customers can browse smoothies, view details, and select items to order. Operators can add, edit, mark items as sold out, and delete menu items.

## Features Implemented

### 1. **Customer Menu Browsing** (`/menu`)
- ✅ Grid view of all available smoothies with high-quality images
- ✅ Category filtering (All, Fruity, Berry, Green, Protein)
- ✅ Featured item badges
- ✅ Sold out overlays
- ✅ Health benefits tags
- ✅ Ingredient lists
- ✅ Price display
- ✅ Responsive design (mobile-friendly)

### 2. **Enhanced Order Page** (`/customer`)
- ✅ Displays selected menu item at the top (name, description, image, health benefits)
- ✅ Base price from menu item
- ✅ Price calculation with size multipliers
- ✅ "Change Item" button to return to menu
- ✅ Existing customization options (base, size, fruits, sweetness, ice)

### 3. **Operator Menu Management** (`/operator/menu`)
- ✅ View all menu items in a list
- ✅ Add new smoothie items
- ✅ Edit existing items (name, description, price, category, image, ingredients, etc.)
- ✅ Mark items as sold out / available
- ✅ Delete menu items
- ✅ Featured item toggle
- ✅ Role-based access control (operator role required)

### 4. **Database Schema**
- ✅ New `menu_items` MongoDB collection with 8 pre-seeded smoothies
- ✅ Includes: name, description, basePrice, category, image URL, ingredients, health benefits, allergens, availability status, featured status, nutrition info

### 5. **API Routes**
- ✅ `GET /api/menu-items` - Get all menu items (authenticated users)
- ✅ `GET /api/menu-items/:itemId` - Get single menu item
- ✅ `POST /api/operator/menu-items` - Add new item (operator role)
- ✅ `PUT /api/operator/menu-items/:itemId` - Update item (operator role)
- ✅ `DELETE /api/operator/menu-items/:itemId` - Delete item (operator role)
- ✅ `POST /api/operator/seed-menu` - Seed database with sample items (operator role)

## Testing the Menu System

### Step 1: Start the Application

1. Make sure MongoDB is running
2. Start the dev server:
   ```bash
   cd /Users/zhangwei/CS590_WebDev/FinalProject_update2/Little_Smoothie_Order_Management_System/backend
   npm run dev
   ```
3. Navigate to `http://localhost:3000`

### Step 2: Login

Use the demo login to get started:
- Click "Demo Login" on the login page
- OR use the API directly:
  ```bash
  curl -X POST http://localhost:3000/api/auth/demo
  ```

### Step 3: Browse Menu

1. From the homepage, click **"Browse Menu"**
2. You'll see 8 smoothie items with images
3. Test the category filters (All, Fruity, Berry, Green, Protein)
4. Notice:
   - **Featured badges** on items like "Tropical Paradise"
   - **"Sold Out"** overlay on "Avocado Dream"
   - **Health benefit tags** (e.g., "Vitamin C", "Antioxidants")

### Step 4: Select a Menu Item

1. Click **"Order Now"** on any available smoothie
2. You'll be redirected to `/customer?item=smoothie-X`
3. The selected item appears at the top with:
   - Image
   - Name and description
   - Health benefits
   - Base price
4. Select a **size** (Small, Medium, Large) to see the price update:
   - Small: 1x base price
   - Medium: 1.2x base price
   - Large: 1.5x base price
5. Add optional fruits for extra cost
6. Adjust sweetness and ice level
7. Submit your order

### Step 5: Test Operator Menu Management (Requires Operator Role)

**Note:** The demo user has `customer` role by default. To test operator features, you need to grant operator privileges.

#### Option A: Update Demo Login (Quick Test)

Edit `server/api/auth/demo.post.ts` and change:
```typescript
roles: ['customer']  // Change to ['customer', 'operator']
```

Then restart the server and log in again.

#### Option B: Create a Separate Operator Account

Use GitHub OAuth and ensure your GitHub organization is in the `determineRoles` function in `server/api/auth/github.get.ts`.

#### Option C: Manually Update Database

```bash
# Connect to MongoDB
mongosh

# Use your database
use smoothie_db

# Update a user's session to have operator role
# (You'll need to find the session in your sessions collection)
```

### Step 6: Operator Menu Management Features

Once you have operator role:

1. Go to `/operator` dashboard
2. Click **"Menu Management"**
3. Test the following features:

#### Add New Item
1. Click **"+ Add New Item"**
2. Fill in the form:
   - Name (required)
   - Description (required)
   - Base Price (required)
   - Category (dropdown)
   - Image URL (use Unsplash for free images)
   - Ingredients (comma-separated)
   - Health Benefits (comma-separated)
   - Allergens (comma-separated)
   - Featured Item checkbox
3. Click **"Add Item"**

#### Edit Item
1. Click **"Edit"** on any menu item
2. Modify any fields
3. Click **"Update Item"**

#### Mark as Sold Out / Available
1. Click **"Mark Sold Out"** on an available item
2. The item will show a sold out overlay on the menu page
3. Click **"Mark Available"** to make it available again

#### Delete Item
1. Click **"Delete"** on any menu item
2. Confirm the deletion
3. The item will be removed from the menu

## Database Structure

### Menu Item Schema

```typescript
{
  id: string                    // Unique identifier (e.g., "smoothie-1")
  name: string                  // Display name
  description: string           // Full description
  basePrice: number             // Base price before size multiplier
  category: string              // "fruit", "berry", "green", "protein", "custom"
  image: string                 // URL to smoothie image
  ingredients: string[]         // List of ingredients
  healthBenefits: string[]      // Health benefit tags
  isAvailable: boolean          // Sold out status
  isFeatured: boolean           // Show featured badge
  allergens: string[]           // Allergen warnings
  nutritionInfo: {              // Optional nutrition data
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}
```

### Pre-seeded Items

The database is pre-seeded with 8 smoothies:
1. **Tropical Paradise** (Fruity, Featured) - $8.99
2. **Berry Blast** (Berry, Featured) - $9.49
3. **Green Power** (Green) - $9.99
4. **Chocolate Peanut Butter** (Protein, Featured) - $10.49
5. **Mango Lassi** (Fruity) - $8.49
6. **Matcha Energizer** (Green) - $9.99
7. **Strawberry Banana Classic** (Berry, Featured) - $7.99
8. **Avocado Dream** (Green, **Sold Out**) - $10.99

## Image Sources

All smoothie images are from Unsplash (free to use):
- High quality food photography
- 400x400px optimized
- Can be replaced with your own images or other sources

Example image URLs used:
```
https://images.unsplash.com/photo-XXXXXXXXX?w=400&h=400&fit=crop
```

## Navigation Flow

```
Homepage (/)
├── Browse Menu (/menu)
│   └── Click "Order Now" → Order Page (/customer?item=X)
│       └── "Change Item" → Back to Menu
├── Quick Order (/customer)
│   └── Build custom smoothie without pre-selection
└── Operator Dashboard (/operator)
    └── Menu Management (/operator/menu)
        ├── Add New Item
        ├── Edit Item
        ├── Toggle Availability
        └── Delete Item
```

## API Testing

### Test Menu Endpoints

```bash
# Get all menu items (requires authentication)
curl http://localhost:3000/api/menu-items \
  -H "Cookie: YOUR_SESSION_COOKIE"

# Get single item
curl http://localhost:3000/api/menu-items/smoothie-1 \
  -H "Cookie: YOUR_SESSION_COOKIE"

# Filter by category
curl "http://localhost:3000/api/menu-items?category=fruit" \
  -H "Cookie: YOUR_SESSION_COOKIE"

# Filter available only
curl "http://localhost:3000/api/menu-items?available=true" \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

### Test Operator Endpoints (Requires Operator Role)

```bash
# Add new item
curl -X POST http://localhost:3000/api/operator/menu-items \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_OPERATOR_SESSION_COOKIE" \
  -d '{
    "name": "Mango Tango",
    "description": "Sweet mango smoothie",
    "basePrice": 9.99,
    "category": "fruit",
    "image": "https://images.unsplash.com/photo-1234",
    "ingredients": ["Mango", "Banana", "Yogurt"],
    "healthBenefits": ["Vitamin C", "Energy"]
  }'

# Update item
curl -X PUT http://localhost:3000/api/operator/menu-items/smoothie-1 \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_OPERATOR_SESSION_COOKIE" \
  -d '{"isAvailable": false}'

# Delete item
curl -X DELETE http://localhost:3000/api/operator/menu-items/smoothie-1 \
  -H "Cookie: YOUR_OPERATOR_SESSION_COOKIE"

# Re-seed menu (useful for development)
curl -X POST http://localhost:3000/api/operator/seed-menu \
  -H "Cookie: YOUR_OPERATOR_SESSION_COOKIE"
```

## Styling & Design

The menu system uses a modern, clean design inspired by real smoothie websites:
- **Color Scheme**: Purple gradient header, clean white cards
- **Typography**: Clear hierarchy with bold headings
- **Cards**: Shadow effects with hover animations
- **Badges**: Featured items have gold badges, health benefits have green tags
- **Sold Out Overlay**: Semi-transparent dark overlay with "Sold Out" text
- **Responsive**: Mobile-first design that adapts to all screen sizes

## Integration with Existing System

The menu system integrates seamlessly with your existing order system:

1. **Price Calculation**: The `basePrice` from menu items is used as the starting point for order calculations
2. **Authentication**: All menu routes require authentication
3. **Authorization**: Operator features require the `operator` role
4. **User Profile**: The `UserProfile` component appears on all pages
5. **Navigation**: All pages have consistent back buttons and navigation

## Troubleshooting

### Menu Items Not Loading
- Check MongoDB is running
- Check the database has the `menu_items` collection
- Re-seed the database: `curl -X POST http://localhost:3000/api/operator/seed-menu`

### 403 Errors on Operator Pages
- The user doesn't have the `operator` role
- Update the demo login or GitHub OAuth role determination

### Images Not Displaying
- Ensure image URLs are valid and accessible
- Check browser console for CORS errors
- Use direct Unsplash URLs or host images locally

### Price Not Updating
- Ensure a size is selected (Small/Medium/Large)
- Check the browser console for JavaScript errors
- Verify the menu item has a valid `basePrice`

## Future Enhancements

Potential additions to the menu system:
- Image upload functionality (instead of URLs)
- Bulk import/export of menu items
- Menu item analytics (most popular, revenue by item)
- Seasonal menu rotations
- Customer reviews and ratings
- Nutritional information filtering
- Allergen warnings in checkout
- Menu item search functionality
- Price history and discount system

## Files Modified/Created

### New Files
- `pages/menu.vue` - Menu browsing page
- `pages/operator/menu.vue` - Menu management page
- `server/api/menu-items.get.ts` - Get all items
- `server/api/menu-items/[itemId].get.ts` - Get single item
- `server/api/operator/menu-items.post.ts` - Add item
- `server/api/operator/menu-items/[itemId].put.ts` - Update item
- `server/api/operator/menu-items/[itemId].delete.ts` - Delete item
- `server/api/operator/seed-menu.post.ts` - Seed database
- `server/utils/seedMenuItems.ts` - Menu items data

### Modified Files
- `pages/index.vue` - Added "Browse Menu" card
- `pages/customer.vue` - Added selected item display at top
- `pages/operator.vue` - Added "Menu Management" link
- `package.json` - Added `tsx` dev dependency and `seed:menu` script

## Summary

You now have a complete menu system with:
- ✅ Customer menu browsing with filters and beautiful UI
- ✅ Selected item display on order page
- ✅ Dynamic price calculation based on menu item base price
- ✅ Operator menu management (CRUD operations)
- ✅ Role-based access control
- ✅ 8 pre-seeded smoothie items with images
- ✅ Responsive design for all devices

The system is production-ready and can be extended with additional features as needed!

