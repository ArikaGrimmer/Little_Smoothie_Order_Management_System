# 🚀 Quick Start Guide

Get the Little Smoothie Order Management System running in 5 minutes!

## Prerequisites Check

Before starting, verify you have these installed:

```bash
# Check Node.js (need v18+)
node --version

# Check npm
npm --version

# Check MongoDB
mongosh --version
```

If any are missing, install them first:
- **Node.js**: https://nodejs.org/
- **MongoDB**: https://www.mongodb.com/try/download/community

## Step-by-Step Setup

### 1️⃣ Install Dependencies (1 minute)

```bash
cd backend
npm install
```

### 2️⃣ Start MongoDB (30 seconds)

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 3️⃣ Seed the Database (30 seconds)

```bash
# Navigate to project root (parent of backend)
cd ..

# Restore database from seed files
mongorestore --db smoothie_order_system ./db-seed/smoothie_order_system/

# Go back to backend
cd backend
```

You should see output like:
```
2025-11-29T10:00:00.000+0000    preparing collections to restore from
...
2025-11-29T10:00:00.000+0000    finished restoring smoothie_order_system
```

### 4️⃣ Create Environment File (30 seconds)

```bash
# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017/smoothie_order_system
REDIS_URL=redis://localhost:6379
SOCKET_PORT=4001
NUXT_DEV_URL=http://localhost:3000
NODE_ENV=development
EOF
```

Or manually create `.env` file with:
```env
MONGO_URL=mongodb://localhost:27017/smoothie_order_system
REDIS_URL=redis://localhost:6379
SOCKET_PORT=4001
NUXT_DEV_URL=http://localhost:3000
NODE_ENV=development
```

### 5️⃣ Start the Application (10 seconds)

```bash
npm run dev
```

Wait for:
```
✔ Nuxt is ready!
Local: http://localhost:3000/
```

## 🎉 You're Ready!

Open your browser and visit:

- **🏠 Home Page**: http://localhost:3000
- **👤 Customer Interface**: http://localhost:3000/customer
- **👨‍🍳 Operator Dashboard**: http://localhost:3000/operator

## 🧪 Test It Out

### Test as Customer:

1. Go to http://localhost:3000/customer
2. Select "Whole Milk" as base
3. Select "Medium" size
4. Add some fruits
5. Click "Submit Order"
6. See status change to "Queued"

### Test as Operator:

1. Go to http://localhost:3000/operator (in a new tab)
2. You should see the order in "Queued Orders"
3. Click "Start Preparation"
4. Order moves to "In Progress"
5. Click "Mark as Ready"
6. Order moves to "Ready for Pickup"

## ⚠️ Troubleshooting

### MongoDB Connection Error

**Problem**: "MongoServerError: connect ECONNREFUSED"

**Quick Fix**:
```bash
# Check if MongoDB is running
brew services list | grep mongodb     # macOS
sudo systemctl status mongod          # Linux

# If not running, start it
brew services start mongodb-community # macOS
sudo systemctl start mongod           # Linux
```

### Port Already in Use

**Problem**: "Port 3000 is already in use"

**Quick Fix**:
```bash
# Use a different port
npm run dev -- --port 3001
```

### Module Not Found

**Problem**: "Cannot find module..."

**Quick Fix**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Empty

**Problem**: No menu items showing

**Quick Fix**:
```bash
# Re-seed the database
cd ..
mongorestore --drop --db smoothie_order_system ./db-seed/smoothie_order_system/
cd backend
```

## 📚 Next Steps

Once everything is working:

1. ✅ Explore the customer and operator interfaces
2. 📖 Read [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed documentation
3. 🗄️ Check [DATABASE_SETUP.md](./DATABASE_SETUP.md) for advanced database configuration
4. 🎨 Customize the UI by editing files in `pages/`
5. 🔧 Add new features by creating API endpoints in `server/api/`

## 💡 Useful Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check database content
mongosh
> use smoothie_order_system
> db.smoothie_bases.find()
> db.orders.find()
> exit

# Clear all orders (fresh start)
mongosh
> use smoothie_order_system
> db.orders.deleteMany({})
> exit
```

## 🆘 Still Having Issues?

Check the detailed troubleshooting section in [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md#troubleshooting)

---

**Happy Coding! 🚀**


