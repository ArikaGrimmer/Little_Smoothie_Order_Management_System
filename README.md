# Little Smoothie Order Management System

A complete full-stack smoothie ordering and management system built with Nuxt 4, Vue 3, MongoDB, and OAuth authentication.

## Features

### 🔐 Authentication
- **OAuth Integration**: GitHub and GitLab OAuth for secure authentication
- **Demo Login**: Quick access for development and testing
- **Role-Based Access**: Customer and Operator roles with different permissions
- **Session Management**: Secure 7-day session with cookie-based authentication

### 👥 Customer Portal
- Browse smoothie menu (bases, fruits, sizes)
- Customize smoothie orders with:
  - Choice of base (yogurt, milk, juice)
  - Multiple fruit selections
  - Sweetness level (none, low, regular, extra)
  - Ice level (none, less, regular, extra)
  - Size options with price multipliers
  - Special instructions
- Save draft orders
- Submit orders to queue
- View order history and status

### 👨‍💼 Operator Dashboard
- View all orders in real-time
- Statistics dashboard (queued, blending, done counts)
- Update order status (queued → blending → done)
- Assign operators to orders
- Track order details and special instructions

### 💰 Pricing System
- Automatic price calculation based on:
  - Base smoothie price
  - Additional fruit costs
  - Size multiplier
- Server-side price validation (prevents client manipulation)

## Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Framework**: Nuxt 4
- **UI Library**: Nuxt UI (built on Tailwind CSS)
- **Database**: MongoDB
- **Authentication**: nuxt-auth-utils with OAuth
- **TypeScript**: Full type safety with shared types
- **State Management**: Vue Composition API with useUserSession

## Project Structure

```
Little_Smoothie_Order_Management_System/
├── app/                           # Frontend Vue application
│   ├── components/
│   │   ├── AppNavigation.vue     # Main navigation bar
│   │   └── UserProfile.vue       # User profile dropdown
│   ├── layouts/
│   │   └── default.vue           # Default layout wrapper
│   ├── middleware/
│   │   └── auth.global.ts        # Global authentication middleware
│   ├── pages/
│   │   ├── index.vue             # Home page
│   │   ├── login.vue             # Login page
│   │   ├── customer.vue          # Customer dashboard
│   │   ├── operator.vue          # Operator dashboard
│   │   └── profile.vue           # User profile page
│   ├── app.vue                   # Root component
│   └── main.css                  # Global styles
├── server/                        # Backend API
│   ├── api/
│   │   ├── auth/
│   │   │   ├── demo.post.ts      # Demo login endpoint
│   │   │   ├── github.get.ts     # GitHub OAuth callback
│   │   │   ├── gitlab.get.ts     # GitLab OAuth callback
│   │   │   └── logout.post.ts    # Logout endpoint
│   │   ├── customer/
│   │   │   ├── [customerId]/
│   │   │   │   ├── draft-order.get.ts   # Get draft order
│   │   │   │   └── draft-order.put.ts   # Save/update draft
│   │   │   └── submit-draft.post.ts     # Submit order
│   │   ├── menu/
│   │   │   ├── bases.get.ts      # Get smoothie bases
│   │   │   ├── fruits.get.ts     # Get available fruits
│   │   │   └── sizes.get.ts      # Get size options
│   │   ├── order/
│   │   │   └── [orderId]/
│   │   │       └── update-status.put.ts  # Update order status
│   │   ├── customer-orders.get.ts # Get customer's orders
│   │   ├── orders.get.ts         # Get all orders
│   │   └── db-test.get.ts        # Database connection test
│   └── utils/
│       └── mongo.ts              # MongoDB connection utility
├── scripts/                       # Utility scripts
│   └── seed-database.js          # Database seeding
├── shared/                        # Shared TypeScript types
│   └── types/
│       ├── index.ts              # Type exports
│       ├── order.ts              # Order types
│       ├── smoothie.ts           # Smoothie component types
│       └── user.ts               # User types
├── public/                        # Static assets
├── nuxt.config.ts                # Nuxt configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript configuration
```

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud instance)
- GitHub OAuth App (optional, for GitHub login)
- GitLab OAuth App (optional, for GitLab login)

### 2. Install Dependencies

```bash
cd Little_Smoothie_Order_Management_System
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Required
MONGO_URL=mongodb://localhost:27017/smoothie_orders

# Optional (for OAuth)
NUXT_OAUTH_GITHUB_CLIENT_ID=your_github_client_id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret

NUXT_OAUTH_GITLAB_CLIENT_ID=your_gitlab_client_id
NUXT_OAUTH_GITLAB_CLIENT_SECRET=your_gitlab_client_secret
```

### 4. Database Setup

The application requires the following MongoDB collections:
- `orders` - Customer orders
- `smoothie_bases` - Available smoothie bases
- `smoothie_fruits` - Available fruits
- `smoothie_sizes` - Size options

You can seed the database with sample data using MongoDB shell or a script.

**Sample data:**

```javascript
// smoothie_bases
db.smoothie_bases.insertMany([
  { id: 'yogurt', name: 'Yogurt Base', price: 4.50 },
  { id: 'milk', name: 'Milk Base', price: 4.00 },
  { id: 'juice', name: 'Juice Base', price: 4.25 }
])

// smoothie_fruits
db.smoothie_fruits.insertMany([
  { id: 'strawberry', name: 'Strawberry', extraPrice: 0.50 },
  { id: 'banana', name: 'Banana', extraPrice: 0.30 },
  { id: 'blueberry', name: 'Blueberry', extraPrice: 0.75 },
  { id: 'mango', name: 'Mango', extraPrice: 0.60 },
  { id: 'pineapple', name: 'Pineapple', extraPrice: 0.55 }
])

// smoothie_sizes
db.smoothie_sizes.insertMany([
  { id: 'small', name: 'Small (12oz)', multiplier: 1.0 },
  { id: 'medium', name: 'Medium (16oz)', multiplier: 1.3 },
  { id: 'large', name: 'Large (20oz)', multiplier: 1.6 }
])
```

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 6. OAuth Setup (Optional)

#### GitHub OAuth:
1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `http://localhost:3000/api/auth/github`
4. Copy Client ID and Client Secret to `.env`

#### GitLab OAuth:
1. Go to GitLab Settings → Applications
2. Create a new application
3. Add scopes: `read_user`, `read_api`
4. Set Redirect URI to: `http://localhost:3000/api/auth/gitlab`
5. Copy Application ID and Secret to `.env`

## Usage

### Demo Login (Development)
1. Go to `http://localhost:3000/login`
2. Click "Demo Login"
3. You'll be logged in with both customer and operator roles

### Customer Flow
1. Log in to the application
2. Navigate to "My Orders" (customer dashboard)
3. Create a new smoothie order:
   - Select a base
   - Choose fruits (optional)
   - Select size
   - Choose sweetness and ice levels
   - Add special instructions (optional)
4. Click "Save Draft" to save your order
5. Click "Place Order" to submit to the queue
6. View your order history below

### Operator Flow
1. Log in with an account that has operator role
2. Navigate to "Operator Dashboard"
3. View all pending orders
4. Click "Start Blending" on queued orders
5. Click "Mark Done" when finished

## Authentication & Authorization

### Session Management
- Sessions last 7 days
- Stored securely in encrypted cookies
- Automatically cleared on logout

### Role Assignment
- **Demo Login**: Gets both customer and operator roles
- **GitHub OAuth**: 
  - Default: customer role
  - Operator role granted if user belongs to organization containing "smoothie" or "operator"
- **GitLab OAuth**:
  - Default: customer role
  - Operator role granted if user belongs to group containing "smoothie" or "operator"

### Protected Routes
- Most pages require authentication (redirects to login)
- Login page redirects authenticated users to home
- Operator dashboard requires operator role

## API Endpoints

### Authentication
- `POST /api/auth/demo` - Demo login (dev only)
- `GET /api/auth/github` - GitHub OAuth callback
- `GET /api/auth/gitlab` - GitLab OAuth callback
- `POST /api/auth/logout` - Logout

### Customer
- `GET /api/customer/:customerId/draft-order` - Get draft order
- `PUT /api/customer/:customerId/draft-order` - Save/update draft
- `POST /api/customer/submit-draft` - Submit draft to queue
- `GET /api/customer-orders` - Get customer's order history

### Operator
- `GET /api/orders` - Get all orders (excluding drafts)
- `PUT /api/order/:orderId/update-status` - Update order status

### Menu
- `GET /api/menu/bases` - Get smoothie bases
- `GET /api/menu/fruits` - Get available fruits
- `GET /api/menu/sizes` - Get size options

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Type System

The project uses shared TypeScript types between frontend and backend:

```typescript
// Order Status Flow
type OrderStatus = "draft" | "queued" | "blending" | "done"

// Smoothie Order
interface SmoothieOrder {
  id: string
  customerId: string
  baseId: string
  fruitIds: string[]
  sweetness: SweetnessLevel
  iceLevel: IceLevel
  sizeId: string
  extraNote?: string
  status: OrderStatus
  price: number
  createdAt: number
  updatedAt: number
  operatorId?: string
}
```

## Security Features

- Server-side price calculation (prevents tampering)
- User can only access their own draft orders
- Operator role required for status updates
- Session encryption with secure cookies
- CSRF protection via nuxt-auth-utils
- Input validation on all endpoints

## Future Enhancements

- Real-time order updates with WebSockets
- Email notifications
- Payment integration
- Order ratings and reviews
- Analytics dashboard
- Mobile app
- Print order receipts

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify database permissions

### OAuth Not Working
- Verify callback URLs match exactly
- Check client ID and secret in `.env`
- Ensure OAuth app is active

### Build Errors
- Clear `.nuxt` directory: `rm -rf .nuxt`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
