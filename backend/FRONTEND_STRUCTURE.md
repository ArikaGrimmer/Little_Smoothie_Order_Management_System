# Frontend Structure Documentation

This document explains the frontend structure created for the Little Smoothie Order Management System.

## 📂 Directory Structure

```
backend/
├── app/
│   └── app.vue                    # Root application component
├── assets/
│   └── css/
│       └── main.css              # Global CSS styles and variables
├── composables/
│   └── useSocket.ts              # Socket.IO composable for real-time features
├── pages/
│   ├── index.vue                 # Home page with role selection
│   ├── customer.vue              # Customer ordering interface
│   └── operator.vue              # Operator dashboard
├── public/                        # Static assets
├── server/                        # Backend API (already existed)
└── nuxt.config.ts                # Nuxt configuration (updated)
```

## 🎨 Pages Overview

### 1. Home Page (`pages/index.vue`)

**Purpose**: Landing page where users select their role (Customer or Operator)

**Features**:
- Beautiful gradient background
- Two role cards with hover animations
- Navigation to customer or operator interfaces
- Responsive design

**Routes**:
- URL: `/`
- Links to: `/customer` and `/operator`

**Tech Details**:
- Uses `NuxtLink` for client-side navigation
- Scoped CSS with gradient backgrounds
- Mobile-responsive grid layout

---

### 2. Customer Interface (`pages/customer.vue`)

**Purpose**: Allow customers to build and order custom smoothies

**Features**:

#### Menu Selection
- **Base Selection**: Choose smoothie base (milk, yogurt, etc.)
- **Size Selection**: Small, Medium, Large with price multipliers
- **Fruit Selection**: Multiple fruits with extra pricing
- **Customization**: Sweetness and ice level sliders (0-100%)
- **Notes**: Custom text area for special requests

#### Order Management
- **Save Draft**: Save order without submitting
- **Submit Order**: Submit order to queue
- **Order Status**: Real-time status display (draft, queued, blending, ready)
- **Price Calculator**: Live price calculation based on selections

#### UI Components
- Grid layout for menu items
- Visual selection feedback (highlighted borders)
- Status badges with color coding
- Responsive design for mobile/tablet

**State Management**:
```typescript
order: {
  baseId: string
  fruitIds: string[]
  sizeId: string
  sweetness: number (0-100)
  iceLevel: number (0-100)
  extraNote: string
}
```

**API Calls**:
- `GET /api/menu` - Load menu items
- `GET /api/customer/:customerId/draft-order` - Load existing draft
- `PUT /api/customer/:customerId/draft-order` - Save draft
- `POST /api/customer/:customerId/submit-draft-order` - Submit order

**Customer ID**: Auto-generated on load (in production, use proper authentication)

---

### 3. Operator Dashboard (`pages/operator.vue`)

**Purpose**: Allow operators to manage and fulfill orders

**Features**:

#### Order Queues
- **Queued Orders**: Orders waiting to be prepared (sorted by submission time)
- **In Progress**: Orders currently being prepared
- **Ready for Pickup**: Completed orders

#### Order Actions
- **Start Preparation**: Move order from queue to in-progress
- **Mark as Ready**: Complete order and mark for pickup
- **Auto-refresh**: Orders refresh every 5 seconds

#### Order Display
- Order ID (last 6 characters)
- Price
- Base and size
- Fruit selections
- Sweetness and ice levels
- Special notes
- Color-coded cards by status

**State Management**:
```typescript
orders: Order[]  // All orders
queuedOrders: computed  // Filtered queued orders
blendingOrders: computed  // Filtered in-progress orders
readyOrders: computed  // Filtered ready orders
```

**API Calls**:
- `GET /api/menu` - Load menu for display names
- `GET /api/operator/orders` - Load all orders
- `POST /api/operator/orders/:orderId/start` - Start order
- `POST /api/operator/orders/:orderId/finish` - Complete order

**Auto-refresh**: Uses `setInterval` to refresh every 5 seconds

---

## 🔧 Composables

### `useSocket.ts`

**Purpose**: Provide Socket.IO functionality for real-time updates

**Features**:
- Connection management
- Room joining/leaving
- Message sending/receiving
- Presence notifications
- Auto-cleanup on component unmount

**Usage Example**:
```typescript
const { 
  socket, 
  connected, 
  connect, 
  joinRoom, 
  onMessage 
} = useSocket()

onMounted(() => {
  connect('user-token')
  joinRoom('order:123')
  onMessage((msg) => {
    console.log('New message:', msg)
  })
})
```

**Methods**:
- `connect(token?)` - Connect to Socket.IO server
- `disconnect()` - Disconnect from server
- `joinRoom(room)` - Join a room
- `leaveRoom(room)` - Leave a room
- `sendMessage(room, text, meta?)` - Send message
- `onMessage(callback)` - Listen for messages
- `onPresence(callback)` - Listen for presence events

**Configuration**:
- Development: `http://localhost:4001`
- Production: Set in environment variables
- Auto-reconnection with exponential backoff

---

## 🎨 Styling System

### Global Styles (`assets/css/main.css`)

**CSS Variables**:
```css
--primary-color: #667eea
--primary-dark: #764ba2
--secondary-color: #4facfe
--secondary-dark: #00f2fe
--success-color: #28a745
--warning-color: #ffc107
--danger-color: #dc3545
```

**Utility Classes**:
- Spacing: `.mt-1` to `.mt-4`, `.mb-1` to `.mb-4`, `.p-1` to `.p-4`
- Text: `.text-center`
- Animations: `.fade-in`, `.spinner`

**Global Styles**:
- Consistent font family (system fonts)
- Custom scrollbar styling
- Focus styles for accessibility
- Responsive typography

**Animations**:
- `fadeIn` - Fade in with upward movement
- `spin` - Rotating animation for loaders

---

## 🏗️ Architecture Patterns

### 1. Component Composition

- **Pages**: Top-level route components
- **Composables**: Reusable logic (Socket.IO)
- **Scoped Styles**: Component-specific styles
- **Global Styles**: Shared design system

### 2. State Management

- **Reactive Data**: Vue 3 `ref()` and `reactive()`
- **Computed Properties**: Derived state (filtered lists, calculated prices)
- **Watchers**: Side effects (auto-save drafts)

### 3. API Integration

- **Fetch API**: Standard HTTP requests
- **Error Handling**: Try-catch with user-friendly alerts
- **Loading States**: Loading indicators during API calls

### 4. Real-time Updates

- **Socket.IO**: Prepared for real-time order updates
- **Composable Pattern**: Reusable Socket.IO logic
- **Room-based**: Orders can have dedicated rooms

---

## 🔄 Data Flow

### Customer Order Flow

```
1. Customer loads page
   ↓
2. Fetch menu from API
   ↓
3. Load existing draft (if any)
   ↓
4. User builds order
   ↓
5. Save draft (PUT request)
   ↓
6. Submit order (POST request)
   ↓
7. Order appears in operator dashboard
```

### Operator Order Flow

```
1. Operator loads dashboard
   ↓
2. Fetch menu and orders from API
   ↓
3. Display orders in three sections
   ↓
4. Operator clicks "Start Preparation"
   ↓
5. Order moves to "In Progress"
   ↓
6. Operator clicks "Mark as Ready"
   ↓
7. Order moves to "Ready for Pickup"
   ↓
8. Customer sees updated status
```

---

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 968px
- **Desktop**: > 968px

### Mobile Adaptations

**Home Page**:
- Single column card layout
- Reduced font sizes
- Full-width buttons

**Customer Page**:
- Stacked menu/status panels
- Full-width menu items
- Touch-optimized controls

**Operator Page**:
- Single column order grid
- Stacked stats in header
- Full-width order cards

---

## ♿ Accessibility

### Features Implemented

1. **Semantic HTML**: Proper heading hierarchy
2. **Focus Indicators**: Visible focus outlines
3. **Color Contrast**: WCAG AA compliant
4. **Keyboard Navigation**: All interactive elements accessible
5. **ARIA Labels**: (Can be enhanced further)

### Future Enhancements

- Add ARIA labels to interactive elements
- Implement skip navigation links
- Add screen reader announcements
- Support keyboard shortcuts

---

## 🚀 Performance Optimizations

### Implemented

1. **Auto-prefetch**: Nuxt automatically prefetches routes
2. **Code Splitting**: Automatic per-route code splitting
3. **Computed Properties**: Efficient derived state
4. **Debouncing**: (Can be added to auto-save)

### Future Enhancements

- Add virtual scrolling for large order lists
- Implement request caching
- Add service worker for offline support
- Optimize images and assets

---

## 🔐 Security Considerations

### Current Implementation

- Basic customer ID generation
- No authentication/authorization
- Client-side only validation

### Production Recommendations

1. **Authentication**: Implement JWT or session-based auth
2. **Authorization**: Role-based access control
3. **Input Validation**: Server-side validation
4. **CSRF Protection**: Add CSRF tokens
5. **Rate Limiting**: Prevent API abuse
6. **HTTPS**: Always use SSL/TLS

---

## 🧪 Testing Recommendations

### Unit Tests

```typescript
// Test composables
describe('useSocket', () => {
  it('should connect to socket server', () => {
    // Test implementation
  })
})

// Test computed properties
describe('Customer Page', () => {
  it('should calculate price correctly', () => {
    // Test implementation
  })
})
```

### E2E Tests (Playwright)

```typescript
test('customer can create order', async ({ page }) => {
  await page.goto('/customer')
  await page.click('[data-base-id="base-1"]')
  await page.click('[data-size-id="size-medium"]')
  await page.click('button:has-text("Submit Order")')
  await expect(page.locator('.status-badge')).toContainText('queued')
})
```

---

## 📚 Dependencies

### Frontend Dependencies

- **nuxt**: `^4.2.1` - Framework
- **vue**: `^3.5.25` - UI framework
- **vue-router**: `^4.6.3` - Routing
- **socket.io-client**: `^4.8.0` - Real-time communication

### Backend Dependencies

- **mongodb**: `^7.0.0` - Database driver
- **socket.io**: `^4.8.0` - Real-time server
- **@socket.io/redis-adapter**: `^7.0.0` - Redis scaling
- **ioredis**: `^5.0.0` - Redis client

---

## 🎯 Best Practices Used

1. **TypeScript**: Type safety throughout
2. **Composition API**: Modern Vue 3 patterns
3. **Single Responsibility**: Each component has clear purpose
4. **DRY Principle**: Reusable composables
5. **Error Handling**: Comprehensive try-catch blocks
6. **Loading States**: User feedback during operations
7. **Responsive Design**: Mobile-first approach
8. **Semantic HTML**: Proper element usage

---

## 🔮 Future Enhancements

### Short Term
- [ ] Add Socket.IO integration for live updates
- [ ] Implement customer authentication
- [ ] Add order history page
- [ ] Add menu management UI for admin

### Medium Term
- [ ] Payment integration
- [ ] Email/SMS notifications
- [ ] Order tracking with map
- [ ] Customer ratings and reviews

### Long Term
- [ ] Mobile app (React Native/Flutter)
- [ ] Loyalty program
- [ ] Analytics dashboard
- [ ] Multi-location support

---

## 📖 Related Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Get started in 5 minutes
- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration
- [README.md](./README.md) - Project overview

---

**Built with ❤️ using Nuxt 3, Vue 3, and MongoDB**


