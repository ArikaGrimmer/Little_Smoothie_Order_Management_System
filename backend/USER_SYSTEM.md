# User System & RBAC Documentation

## Overview

The system now implements **persistent user records** stored in MongoDB with role-based access control (RBAC). All users (customers and operators) are stored in the same `users` collection, and their orders are linked to their user ID.

## Features

### ✅ Persistent User Records
- Users are saved to database on first login
- User data persists across sessions and platforms
- Orders are linked to user IDs (not emails)
- Login history is tracked

### ✅ Role-Based Access Control (RBAC)
- **Customer Role**: Browse smoothies, create orders, view their own orders
- **Operator Role**: See all orders, manage order status, edit menu items

### ✅ Cross-Platform Order History
- Users can log in from any device/platform
- See all their previous orders
- Orders persist even if login method changes

## Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  id: string,          // Unique user ID (GitHub ID or demo ID)
  email: string,       // User's email
  name: string,        // Display name
  avatar: string,      // Profile picture URL
  provider: string,    // 'github' or 'demo'
  roles: string[],     // ['customer'] or ['customer', 'operator']
  githubId: string,    // GitHub user ID (if provider is GitHub)
  organizations: string[], // GitHub orgs (if applicable)
  createdAt: number,   // Timestamp of account creation
  updatedAt: number,   // Last profile update
  lastLoginAt: number  // Last successful login
}
```

### Orders Collection

Orders are linked to users via `customerId` field:

```typescript
{
  _id: ObjectId,
  customerId: string,  // References user.id from users collection
  status: string,      // 'draft', 'queued', 'making', 'ready', 'picked_up'
  baseId: string,
  fruitIds: string[],
  sizeId: string,
  sweetness: number,
  iceLevel: number,
  extraNote: string,
  price: number,
  createdAt: number,
  updatedAt: number,
  submittedAt: number  // When order was submitted (status changed to 'queued')
}
```

## Operator Assignment

### Method 1: Configure Operator Emails (Recommended)

Add operator email(s) to your `.env` file:

```bash
# .env
OPERATOR_EMAILS=your-email@example.com,another-operator@example.com
```

When a user logs in with GitHub (or demo), if their email matches any in `OPERATOR_EMAILS`, they are automatically granted the `operator` role.

**Benefits:**
- Simple configuration
- Works with any GitHub account
- Easy to add/remove operators
- No need for specific GitHub organizations

### Method 2: GitHub Organizations

Users who belong to GitHub organizations with specific keywords are granted operator role:

- Organizations containing "smoothie" (case-insensitive)
- Organizations containing "operator" (case-insensitive)

**Example:**
- User belongs to `smoothie-shop-team` → Gets operator role
- User belongs to `operator-dashboard` → Gets operator role

## API Endpoints

### Customer Endpoints

#### Get My Orders
```http
GET /api/customer/my-orders
```

Returns all orders for the authenticated user (excluding drafts).

**Response:**
```json
{
  "ok": true,
  "orders": [
    {
      "id": "...",
      "customerId": "github-user-123",
      "status": "picked_up",
      "price": 13.48,
      "submittedAt": 1234567890,
      // ... other order fields
    }
  ],
  "count": 5
}
```

#### Get/Update Draft Order
```http
GET /api/customer/{customerId}/draft-order
PUT /api/customer/{customerId}/draft-order
POST /api/customer/{customerId}/submit-draft-order
```

**Note:** `customerId` must match the authenticated user's ID.

### Operator Endpoints

#### Get All Orders
```http
GET /api/operator/orders
```

Returns all queued orders (requires `operator` role).

#### Update Order Status
```http
POST /api/operator/orders/{orderId}/start
POST /api/operator/orders/{orderId}/finish
```

Change order status from queued → making → ready.

#### Menu Management
```http
GET /api/menu-items
POST /api/operator/menu-items
PUT /api/operator/menu-items/{itemId}
DELETE /api/operator/menu-items/{itemId}
```

All require `operator` role.

## User Login Flow

### GitHub OAuth Flow

1. User clicks "Continue with GitHub"
2. GitHub redirects to callback (`/api/auth/github`)
3. System fetches user data and organizations from GitHub
4. System calls `findOrCreateUser()`:
   - If user exists: Update profile and last login
   - If new user: Create user record with roles
5. Roles are determined by:
   - Email match in `OPERATOR_EMAILS` → Add `operator` role
   - GitHub org match → Add `operator` role
   - Otherwise → Only `customer` role
6. User session is created with user data
7. Redirect to homepage

### Demo Login Flow

1. User clicks "Demo Login" (or posts to `/api/auth/demo`)
2. Optional: Can specify role ('customer' or 'operator')
3. System creates/retrieves demo user from database
4. For demo operator, roles are set to `['customer', 'operator']`
5. User session is created
6. Redirect to homepage

## Testing

### Test as Customer

1. **GitHub OAuth:**
   ```bash
   # Use any GitHub account (not in OPERATOR_EMAILS)
   # Click "Continue with GitHub" on /login
   ```

2. **Demo Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/demo \
     -H "Content-Type: application/json" \
     -d '{"role": "customer"}'
   ```

3. **Check User Record:**
   ```bash
   mongosh smoothie_order_system
   db.users.find({ email: "demo-customer@smoothie.local" }).pretty()
   ```

4. **Create & View Orders:**
   ```bash
   # Create an order through the UI
   # Then view your order history
   curl http://localhost:3000/api/customer/my-orders \
     -H "Cookie: YOUR_SESSION_COOKIE"
   ```

### Test as Operator

1. **Configure Operator Email:**
   ```bash
   # Add to .env
   OPERATOR_EMAILS=your-github-email@example.com
   ```

2. **Restart Server:**
   ```bash
   npm run dev
   ```

3. **Login with GitHub:**
   - Use the email configured in `OPERATOR_EMAILS`
   - You'll automatically get operator role

4. **Or Use Demo Operator:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/demo \
     -H "Content-Type: application/json" \
     -d '{"role": "operator"}'
   ```

5. **Access Operator Features:**
   - Visit `/operator` dashboard
   - View all orders
   - Manage menu items

### Verify Roles in Database

```bash
mongosh smoothie_order_system

# Check a user's roles
db.users.findOne({ email: "your-email@example.com" })

# List all operators
db.users.find({ roles: "operator" }).pretty()

# List all users
db.users.find().pretty()
```

## Code Architecture

### User Service (`server/utils/userService.ts`)

Main functions:
- `findOrCreateUser()` - Save or update user in database
- `getUserById()` - Retrieve user by ID
- `updateUserLogin()` - Update last login timestamp
- `determineUserRoles()` - Assign roles based on email/orgs

### Auth Utils (`server/utils/auth.ts`)

Main functions:
- `requireAuth()` - Ensure user is authenticated
- `requireRole()` - Ensure user has specific role
- `getUserId()` - Extract user ID from session

### Auth Endpoints

- `/api/auth/github` - GitHub OAuth callback
- `/api/auth/demo` - Demo login for testing
- `/api/auth/logout` - Clear user session
- `/api/auth/session` - Get current session info

## Security Notes

1. **User ID is Immutable**
   - Once a user is created, their ID never changes
   - Orders are permanently linked to user IDs
   - Email changes don't affect order history

2. **Role Assignment**
   - Roles are determined at login time
   - Stored in both database and session
   - Re-evaluated on every login

3. **Access Control**
   - All endpoints check authentication
   - Sensitive endpoints check roles
   - Users can only access their own data (except operators)

4. **Operator Email Security**
   - Store in `.env` (not in code)
   - Never commit `.env` to version control
   - Case-insensitive email matching
   - Supports multiple operator emails (comma-separated)

## Migration Notes

If you have existing orders with email-based `customerId`:

1. **Backup your data first!**
   ```bash
   mongosh smoothie_order_system --eval "db.orders.find().forEach(printjson)" > orders_backup.json
   ```

2. **Create users for existing orders:**
   ```javascript
   // In MongoDB shell or migration script
   db.orders.distinct("customerId").forEach(email => {
     if (email.includes("@")) {
       db.users.insertOne({
         id: `migrated-${email}`,
         email: email,
         name: email.split("@")[0],
         provider: "migrated",
         roles: ["customer"],
         createdAt: Date.now(),
         updatedAt: Date.now(),
         lastLoginAt: Date.now()
       });
       
       // Update orders to use new user ID
       db.orders.updateMany(
         { customerId: email },
         { $set: { customerId: `migrated-${email}` } }
       );
     }
   });
   ```

## Troubleshooting

### "I can't access operator features"

Check:
1. Is your email in `OPERATOR_EMAILS` in `.env`?
2. Did you restart the server after updating `.env`?
3. Did you log out and log back in?
4. Check your user record: `db.users.findOne({ email: "your-email" })`

### "My orders don't show up"

Check:
1. What is your user ID? `db.users.findOne({ email: "your-email" })`
2. Do orders exist with that `customerId`? `db.orders.find({ customerId: "your-id" })`
3. Are orders in non-draft status?

### "Cannot find module 'userService'"

Make sure you've installed all dependencies:
```bash
npm install
```

## Example: Complete User Flow

1. **User visits site** → Redirected to `/login`
2. **User clicks "Continue with GitHub"** → OAuth flow starts
3. **GitHub callback** → User data fetched, saved to DB
4. **Role assigned** → Based on email/orgs
5. **Session created** → User logged in
6. **User browses menu** → Authenticated access
7. **User creates order** → Linked to user ID
8. **User logs out** → Session cleared
9. **User logs in again (from phone)** → Same user ID retrieved
10. **User sees order history** → All previous orders displayed

## Summary

✅ Users are stored in MongoDB `users` collection  
✅ Orders link to user IDs (not emails)  
✅ Operators assigned via email configuration  
✅ Role-based access control enforced  
✅ Cross-platform order history works  
✅ Both GitHub OAuth and demo login supported  

Your smoothie system now has enterprise-grade user management! 🎉

