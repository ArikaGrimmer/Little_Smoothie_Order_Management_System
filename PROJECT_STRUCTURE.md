# Project Structure Overview

This document explains the file organization of the Little Smoothie Order Management System. The project follows the standard **Nuxt full-stack architecture**, where `app/` contains the frontend and `server/` contains the backend, all within a single integrated application.

## 📁 Complete File Tree

```
Little_Smoothie_Order_Management_System/
│
├── app/                              # Frontend application (Vue components, pages)
│   ├── components/                   # Vue components
│   │   ├── AppNavigation.vue        # Main navigation bar
│   │   └── UserProfile.vue          # User profile dropdown
│   │
│   ├── layouts/                      # Page layouts
│   │   └── default.vue              # Default layout with navigation
│   │
│   ├── middleware/                   # Route middleware
│   │   └── auth.global.ts           # Global authentication guard
│   │
│   ├── pages/                        # Application pages (auto-routed)
│   │   ├── index.vue                # Home page (/)
│   │   ├── login.vue                # Login page (/login)
│   │   ├── customer.vue             # Customer dashboard (/customer)
│   │   ├── operator.vue             # Operator dashboard (/operator)
│   │   └── profile.vue              # User profile (/profile)
│   │
│   ├── app.vue                       # Root Vue component
│   └── main.css                      # Global styles (Tailwind)
│
├── server/                           # Backend server
│   ├── api/                          # API endpoints
│   │   │
│   │   ├── auth/                     # Authentication endpoints
│   │   │   ├── demo.post.ts         # Demo login (development)
│   │   │   ├── github.get.ts        # GitHub OAuth callback
│   │   │   ├── gitlab.get.ts        # GitLab OAuth callback
│   │   │   └── logout.post.ts       # Logout endpoint
│   │   │
│   │   ├── customer/                 # Customer endpoints
│   │   │   ├── [customerId]/
│   │   │   │   ├── draft-order.get.ts   # Get draft order
│   │   │   │   └── draft-order.put.ts   # Save/update draft
│   │   │   └── submit-draft.post.ts     # Submit order to queue
│   │   │
│   │   ├── menu/                     # Menu data endpoints
│   │   │   ├── bases.get.ts         # Get smoothie bases
│   │   │   ├── fruits.get.ts        # Get available fruits
│   │   │   └── sizes.get.ts         # Get size options
│   │   │
│   │   ├── order/                    # Order management
│   │   │   └── [orderId]/
│   │   │       └── update-status.put.ts  # Update order status
│   │   │
│   │   ├── customer-orders.get.ts    # Get customer's orders
│   │   ├── orders.get.ts             # Get all orders
│   │   └── db-test.get.ts            # Database connection test
│   │
│   └── utils/                        # Server utilities
│       └── mongo.ts                  # MongoDB connection handler
│
├── scripts/                          # Utility scripts
│   └── seed-database.js             # Database seeding script
│
├── shared/                           # Shared code (frontend + backend)
│   └── types/                        # TypeScript type definitions
│       ├── index.ts                  # Type exports
│       ├── order.ts                  # Order-related types
│       ├── smoothie.ts               # Smoothie component types
│       └── user.ts                   # User types
│
├── public/                           # Static assets
│   ├── favicon.ico                  # Site favicon
│   └── robots.txt                   # Robots file
│
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── nuxt.config.ts                    # Nuxt configuration
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── README.md                         # Main documentation
├── SETUP_GUIDE.md                    # Quick start guide
├── IMPLEMENTATION_SUMMARY.md         # What was built
└── PROJECT_STRUCTURE.md              # This file
```

## 🗂️ Directory Purposes

### `/app/` - Frontend Application
Contains all Vue.js frontend code:
- **Components**: Reusable UI components
- **Layouts**: Page wrapper layouts
- **Middleware**: Route guards and authentication
- **Pages**: Individual page components (auto-routed by file name)

### `/server/` - Backend API
Contains all server-side code:
- **API Routes**: Automatically mapped to HTTP endpoints
- **Utils**: Shared server utilities (MongoDB connection, etc.)

### `/scripts/` - Utility Scripts
Helper scripts for development:
- Database seeding
- Migrations
- Data imports

### `/shared/types/` - Shared Types
TypeScript types used by both frontend and backend for type safety.

### `/public/` - Static Assets
Static files served directly (favicon, robots.txt, etc.)

## 📋 File Purposes

### Configuration Files

| File | Purpose |
|------|---------|
| `nuxt.config.ts` | Nuxt framework configuration |
| `tsconfig.json` | TypeScript compiler settings |
| `package.json` | Dependencies and npm scripts |
| `.env.example` | Environment variables template |
| `.gitignore` | Files to exclude from git |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete project documentation |
| `SETUP_GUIDE.md` | Quick start instructions |
| `IMPLEMENTATION_SUMMARY.md` | Features and architecture |
| `PROJECT_STRUCTURE.md` | File organization (this file) |

## 🔄 Request Flow

### 1. Page Request Flow
```
Browser
  ↓ Request page (e.g., /customer)
Nuxt Router
  ↓ Check route
Middleware (auth.global.ts)
  ↓ Verify authentication
  ├─ Not logged in → Redirect to /login
  └─ Logged in → Continue
Layout (default.vue)
  ↓ Wrap page with navigation
Page Component (customer.vue)
  ↓ Render page
Browser
  ↓ Display to user
```

### 2. API Request Flow
```
Browser (Vue Component)
  ↓ $fetch('/api/orders')
Nuxt Server
  ↓ Route to handler
API Endpoint (orders.get.ts)
  ↓ getUserSession()
  ├─ No session → 401 Unauthorized
  └─ Has session → Continue
  ↓ Check role (if needed)
  ├─ Wrong role → 403 Forbidden
  └─ Correct role → Continue
  ↓ Query database
MongoDB
  ↓ Return data
API Endpoint
  ↓ Format response
Browser
  ↓ Update UI
```

### 3. Authentication Flow
```
Browser
  ↓ Click OAuth button
OAuth Provider (GitHub/GitLab)
  ↓ User authorizes
Callback Endpoint (/api/auth/github)
  ↓ Receive auth code
  ↓ Exchange for access token
  ↓ Fetch user data + orgs/groups
  ↓ Determine roles
  ↓ Create session
setUserSession()
  ↓ Set encrypted cookie
Browser
  ↓ Redirect to home page
  ↓ Cookie sent with all requests
```

## 🎨 Component Hierarchy

```
app.vue                         # Root component
  └── NuxtLayout                # Layout wrapper
      └── layouts/default.vue   # Default layout
          ├── AppNavigation     # Navigation bar
          │   └── UserProfile   # User dropdown (if logged in)
          │
          └── NuxtPage          # Current page content
              ├── index.vue
              ├── login.vue
              ├── customer.vue
              ├── operator.vue
              └── profile.vue
```

## 🛣️ Route Structure

| Path | Component | Auth Required | Role Required |
|------|-----------|---------------|---------------|
| `/` | `pages/index.vue` | No | - |
| `/login` | `pages/login.vue` | No | - |
| `/customer` | `pages/customer.vue` | Yes | Customer (default) |
| `/operator` | `pages/operator.vue` | Yes | Operator |
| `/profile` | `pages/profile.vue` | Yes | Any |

## 💾 Database Collections

### `orders` Collection
```javascript
{
  _id: ObjectId("..."),
  customerId: "user@example.com",
  baseId: "yogurt",
  fruitIds: ["strawberry", "banana"],
  sweetness: "regular",
  iceLevel: "regular",
  sizeId: "medium",
  extraNote: "Extra blended",
  status: "queued",
  price: 6.37,
  createdAt: 1234567890,
  updatedAt: 1234567890,
  operatorId: "operator@example.com"
}
```

### `smoothie_bases` Collection
```javascript
{
  id: "yogurt",
  name: "Greek Yogurt Base",
  price: 4.50
}
```

### `smoothie_fruits` Collection
```javascript
{
  id: "strawberry",
  name: "Strawberry",
  extraPrice: 0.50
}
```

### `smoothie_sizes` Collection
```javascript
{
  id: "medium",
  name: "Medium (16oz)",
  multiplier: 1.3
}
```

## 🔧 Key Technologies

### Frontend
- **Vue 3**: Progressive JavaScript framework
- **Nuxt 4**: Full-stack Vue framework
- **Nuxt UI**: Component library (based on Tailwind)
- **TypeScript**: Type-safe JavaScript

### Backend
- **Nuxt Server**: Built-in server framework
- **MongoDB**: NoSQL database
- **nuxt-auth-utils**: Authentication library

### Development
- **Vite**: Fast build tool
- **HMR**: Hot module replacement
- **TypeScript**: Compile-time type checking

## 📦 Dependencies

### Core
- `nuxt@^4.2.1` - Framework
- `vue@^3.5.25` - UI library
- `mongodb@^7.0.0` - Database driver

### Modules
- `@nuxt/ui@^3.3.7` - UI components
- `nuxt-auth-utils@^0.5.25` - Authentication

### Dev
- `typescript@^5.9.2` - Type system
- `@iconify-json/*` - Icon packs

## 🚀 Build & Run

### Development
```bash
npm run dev
```
Starts dev server at `http://localhost:3000` with hot reload.

### Production Build
```bash
npm run build
```
Generates optimized production build in `.output/`

### Preview Production
```bash
npm run preview
```
Preview the production build locally.

### Seed Database
```bash
npm run seed
```
Populate MongoDB with initial menu data.

## 📊 Data Flow Diagram

```
┌──────────────┐
│   Browser    │
│  (Vue Pages) │
└──────┬───────┘
       │
       ↓ HTTP Request
┌──────────────┐
│  Middleware  │
│   (Auth)     │
└──────┬───────┘
       │
       ↓ Authenticated
┌──────────────┐
│ API Endpoint │
│  (Handler)   │
└──────┬───────┘
       │
       ↓ Query
┌──────────────┐
│   MongoDB    │
│  (Database)  │
└──────────────┘
```

## 🔐 Security Layers

1. **Authentication Middleware** - Checks if user is logged in
2. **Role Verification** - Checks if user has required role
3. **Ownership Validation** - Ensures user owns the resource
4. **Input Validation** - Validates all user inputs
5. **Server-side Calculation** - Prevents price tampering
6. **Session Encryption** - Secure cookie storage

## 📱 User Interface Hierarchy

```
Navigation Bar (Always visible when logged in)
  ├── Logo/Home Link
  ├── "My Orders" (Customer)
  ├── "Operator Dashboard" (Operator only)
  └── User Profile Dropdown
      ├── Email
      ├── Profile Link
      └── Logout

Customer Page
  ├── Welcome Header
  ├── Current Draft Order (if exists)
  ├── Order Creation Form
  │   ├── Base Selection (Required)
  │   ├── Fruit Selection (Multiple)
  │   ├── Size Selection (Required)
  │   ├── Sweetness Level
  │   ├── Ice Level
  │   ├── Special Instructions
  │   ├── Save Draft Button
  │   └── Place Order Button
  └── Order History
      └── Order Cards (Status, Details, Price)

Operator Page
  ├── Statistics Cards (Queued, Blending, Done, Total)
  └── Orders List
      └── Order Cards
          ├── Status Badge
          ├── Customer Info
          ├── Order Details
          ├── Special Instructions
          ├── Assigned Operator
          └── Action Buttons
              ├── "Start Blending" (if queued)
              └── "Mark Done" (if blending)
```

## 🎯 Key Features by File

| Feature | Primary Files |
|---------|---------------|
| **Authentication** | `auth.global.ts`, `auth/*.ts` |
| **Customer Orders** | `customer.vue`, `customer/*.ts` |
| **Operator Management** | `operator.vue`, `order/*.ts` |
| **Menu Data** | `menu/*.ts` |
| **Navigation** | `AppNavigation.vue` |
| **User Profile** | `UserProfile.vue`, `profile.vue` |
| **Database** | `mongo.ts`, `seed-database.js` |

This structure provides a clear separation of concerns, making the codebase easy to navigate and maintain!

