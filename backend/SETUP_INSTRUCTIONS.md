# Little Smoothie Order Management System - Setup Instructions

This guide provides complete setup instructions for the Little Smoothie Order Management System.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Running the Application](#running-the-application)
5. [Project Structure](#project-structure)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **pnpm** (comes with Node.js)
- **MongoDB** (v5.0 or higher) - [Installation Guide](./DATABASE_SETUP.md)
- **Git** (optional but recommended)

## Quick Start

If you're familiar with Node.js and MongoDB, here's the quick setup:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Set up MongoDB and seed the database
mongorestore --db smoothie_order_system ../db-seed/smoothie_order_system/

# 4. Create .env file
echo "MONGO_URL=mongodb://localhost:27017/smoothie_order_system" > .env
echo "REDIS_URL=redis://localhost:6379" >> .env
echo "SOCKET_PORT=4001" >> .env

# 5. Start the development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Detailed Setup

### Step 1: Clone/Navigate to Project

```bash
cd /Users/zhangwei/CS590_WebDev/FinalProject_update2/Little_Smoothie_Order_Management_System/backend
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

This will install all required packages including:
- Nuxt 4.x
- Vue 3.x
- MongoDB driver
- Socket.IO
- Redis adapter (for Socket.IO scaling)

**Expected output:** Installation should complete without errors. You'll see a package tree.

### Step 3: Set Up Database

Follow the comprehensive [Database Setup Guide](./DATABASE_SETUP.md) for detailed instructions.

**Quick MongoDB Setup:**

1. **Start MongoDB:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

2. **Seed the Database:**
   ```bash
   # From the backend directory
   cd ..
   mongorestore --db smoothie_order_system ./db-seed/smoothie_order_system/
   cd backend
   ```

3. **Verify Database:**
   ```bash
   mongosh
   > use smoothie_order_system
   > show collections
   > db.smoothie_bases.find()
   > exit
   ```

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Add the following configuration:

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017/smoothie_order_system

# Redis Connection (Optional - for Socket.IO scaling)
REDIS_URL=redis://localhost:6379

# Socket.IO Configuration
SOCKET_PORT=4001

# Development URL (for CORS)
NUXT_DEV_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**For MongoDB Atlas (cloud database):**

```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/smoothie_order_system?retryWrites=true&w=majority
REDIS_URL=redis://your-redis-url:6379
SOCKET_PORT=4001
NUXT_DEV_URL=http://localhost:3000
NODE_ENV=development
```

### Step 5: Optional - Set Up Redis

Redis is optional but recommended for production deployments with multiple server instances.

**Install Redis:**

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# Verify
redis-cli ping  # Should return "PONG"
```

**Note:** The application will work without Redis in development mode.

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at:
- **Main App:** http://localhost:3000
- **Customer Interface:** http://localhost:3000/customer
- **Operator Dashboard:** http://localhost:3000/operator
- **Socket.IO Server:** http://localhost:4001

### Production Build

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
backend/
├── app/
│   └── app.vue              # Root Vue component
├── assets/
│   └── css/
│       └── main.css         # Global styles
├── composables/
│   └── useSocket.ts         # Socket.IO composable
├── pages/
│   ├── index.vue            # Home page (role selection)
│   ├── customer.vue         # Customer ordering interface
│   └── operator.vue         # Operator dashboard
├── public/
│   └── robots.txt           # SEO configuration
├── server/
│   ├── api/
│   │   ├── menu.get.ts      # Get menu items
│   │   ├── menu.post.ts     # Add menu item
│   │   ├── menu.put.ts      # Update menu item
│   │   ├── menu.delete.ts   # Delete menu item
│   │   ├── db-test.get.ts   # Test database connection
│   │   ├── customer/
│   │   │   └── [customerId]/
│   │   │       ├── draft-order.get.ts    # Get draft order
│   │   │       ├── draft-order.put.ts    # Save draft order
│   │   │       └── submit-draft-order.post.ts  # Submit order
│   │   └── operator/
│   │       └── orders/
│   │           ├── orders.get.ts         # Get all orders
│   │           └── [orderId]/
│   │               ├── start.post.ts     # Start order
│   │               └── finish.post.ts    # Complete order
│   ├── plugins/
│   │   └── socket.server.ts  # Socket.IO server plugin
│   └── utils/
│       └── mongo.ts          # MongoDB connection utility
├── .env                      # Environment variables (create this)
├── nuxt.config.ts           # Nuxt configuration
├── package.json             # Node.js dependencies
├── tsconfig.json            # TypeScript configuration
├── DATABASE_SETUP.md        # Database setup guide
└── SETUP_INSTRUCTIONS.md    # This file
```

## API Endpoints

### Menu Management

- `GET /api/menu` - Get all menu items (bases, fruits, sizes)
- `POST /api/menu` - Add new menu item
- `PUT /api/menu` - Update menu item
- `DELETE /api/menu` - Delete menu item

### Customer Operations

- `GET /api/customer/:customerId/draft-order` - Get customer's draft order
- `PUT /api/customer/:customerId/draft-order` - Save/update draft order
- `POST /api/customer/:customerId/submit-draft-order` - Submit draft order to queue

### Operator Operations

- `GET /api/operator/orders` - Get all queued orders
- `POST /api/operator/orders/:orderId/start` - Start preparing an order
- `POST /api/operator/orders/:orderId/finish` - Mark order as ready

### Utility

- `GET /api/db-test` - Test database connection
- `GET /api/test-redis` - Test Redis connection

## Features

### Customer Interface (`/customer`)

- Browse menu items (bases, fruits, sizes)
- Build custom smoothie orders
- Select sweetness and ice levels
- Add special notes
- Save draft orders
- Submit orders to queue
- View order status in real-time

### Operator Dashboard (`/operator`)

- View all queued orders
- See orders in preparation
- Start preparing orders
- Mark orders as ready
- Auto-refresh order list
- Detailed order information

### Real-time Updates (Socket.IO)

- Real-time order status updates
- Presence notifications
- Message broadcasting
- Room-based communication

## Testing the Application

### 1. Test Database Connection

```bash
curl http://localhost:3000/api/db-test
```

Expected response:
```json
{
  "ok": true,
  "message": "Database connection successful"
}
```

### 2. Test Menu API

```bash
curl http://localhost:3000/api/menu
```

Expected response: JSON with bases, fruits, and sizes.

### 3. Test Customer Flow

1. Open http://localhost:3000/customer
2. Select a base (e.g., Whole Milk)
3. Select a size (e.g., Medium)
4. Add fruits (optional)
5. Adjust sweetness/ice levels
6. Click "Submit Order"
7. Order should appear in operator dashboard

### 4. Test Operator Flow

1. Open http://localhost:3000/operator
2. You should see the submitted order in "Queued Orders"
3. Click "Start Preparation"
4. Order moves to "In Progress"
5. Click "Mark as Ready"
6. Order moves to "Ready for Pickup"

## Troubleshooting

### Port Already in Use

If port 3000 or 4001 is already in use:

```bash
# Change Nuxt port (add to package.json script)
npm run dev -- --port 3001

# Change Socket.IO port (modify .env)
SOCKET_PORT=4002
```

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
1. Verify MongoDB is running: `brew services list` (macOS) or `sudo systemctl status mongod` (Linux)
2. Check your MONGO_URL in `.env`
3. Try connecting manually: `mongosh`

### Module Not Found Errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Socket.IO Connection Issues

**Error:** Socket connection fails or disconnects frequently

**Solution:**
1. Check if Socket.IO server is running (you should see a log message on startup)
2. Verify SOCKET_PORT in `.env`
3. Check browser console for errors
4. Ensure no firewall is blocking the port

### TypeScript Errors

**Solution:**
```bash
npm run postinstall  # Regenerates Nuxt types
```

### Hot Reload Not Working

**Solution:**
1. Restart the dev server
2. Clear browser cache
3. Check if file watcher limit is reached (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

## Development Tips

### Using Nuxt DevTools

Nuxt DevTools is enabled by default. Access it by clicking the Nuxt icon in the bottom-right corner of your browser.

### Hot Module Replacement

The dev server supports HMR. Changes to Vue components and most server files will reload automatically.

### Database Reset

To reset the database to initial state:

```bash
mongosh
> use smoothie_order_system
> db.orders.deleteMany({})  # Clear all orders
> exit
```

Or completely reset:

```bash
mongosh
> use smoothie_order_system
> db.dropDatabase()
> exit
mongorestore --db smoothie_order_system ../db-seed/smoothie_order_system/
```

## Next Steps

1. ✅ Complete the setup following this guide
2. ✅ Test the application with sample orders
3. 📚 Read the [Database Setup Guide](./DATABASE_SETUP.md) for advanced database configuration
4. 🎨 Customize the UI in `pages/` and `app/app.vue`
5. 🔧 Add new API endpoints in `server/api/`
6. 🚀 Deploy to production (see deployment guide)

## Support

If you encounter issues:

1. Check this troubleshooting section
2. Review the [Database Setup Guide](./DATABASE_SETUP.md)
3. Check Nuxt documentation: https://nuxt.com
4. Check MongoDB documentation: https://docs.mongodb.com

## Additional Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)


