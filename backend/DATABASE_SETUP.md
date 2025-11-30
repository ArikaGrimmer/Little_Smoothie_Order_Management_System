# Database Setup Guide

This guide will help you set up MongoDB for the Little Smoothie Order Management System.

## Prerequisites

- MongoDB installed locally or access to MongoDB Atlas
- `mongorestore` utility (comes with MongoDB installation)
- Basic understanding of MongoDB

## Option 1: Local MongoDB Setup

### Step 1: Install MongoDB

#### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
```

#### Ubuntu/Debian
```bash
sudo apt-get install -y mongodb-org
```

#### Windows
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### Step 2: Start MongoDB Service

#### macOS
```bash
brew services start mongodb-community
```

#### Ubuntu/Debian
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows
MongoDB should start automatically, or use:
```bash
net start MongoDB
```

### Step 3: Verify MongoDB is Running

```bash
mongosh
```

You should see the MongoDB shell prompt. Type `exit` to leave.

## Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier available)
4. Wait for cluster to be created (3-5 minutes)
5. Click "Connect" and get your connection string
6. Whitelist your IP address in Network Access
7. Create a database user in Database Access

## Database Seeding

### Step 1: Navigate to Project Root

```bash
cd /Users/zhangwei/CS590_WebDev/FinalProject_update2/Little_Smoothie_Order_Management_System
```

### Step 2: Restore Database from Seed Files

The seed files are located in the `db-seed/smoothie_order_system/` directory.

#### For Local MongoDB:

```bash
mongorestore --db smoothie_order_system ./db-seed/smoothie_order_system/
```

This will create a database named `smoothie_order_system` and restore all collections:
- `customers` - Customer information
- `operators` - Operator/staff information
- `orders` - Order records
- `smoothie_bases` - Base ingredients (milk, yogurt, etc.)
- `smoothie_fruits` - Available fruits
- `smoothie_sizes` - Size options and price multipliers

#### For MongoDB Atlas:

```bash
mongorestore --uri="mongodb+srv://weinorazhangmongo:juzhenweifen@cluster0.vmrl8zr.mongodb.net/smoothie_order_system" ./db-seed/smoothie_order_system/
```

Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials.

### Step 3: Verify Data Import

Connect to MongoDB:

```bash
mongosh
```

Or for Atlas:

```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/smoothie_order_system"
```

Verify collections:

```javascript
use smoothie_order_system
show collections
```

You should see:
- customers
- operators
- orders
- smoothie_bases
- smoothie_fruits
- smoothie_sizes

Check data in a collection:

```javascript
db.smoothie_bases.find().pretty()
db.smoothie_fruits.find().pretty()
db.smoothie_sizes.find().pretty()
```

## Environment Configuration

### Step 1: Create `.env` File

In the `backend` directory, create a `.env` file:

```bash
cd backend
touch .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file with your database credentials:

#### For Local MongoDB:
```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017/smoothie_order_system

# Redis Configuration (Optional - for Socket.IO scaling)
REDIS_URL=redis://localhost:6379

# Socket.IO Port
SOCKET_PORT=4001

# Nuxt Dev URL (for CORS)
NUXT_DEV_URL=http://localhost:3000
```

#### For MongoDB Atlas:
```env
# MongoDB Configuration
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/smoothie_order_system?retryWrites=true&w=majority

# Redis Configuration (Optional)
REDIS_URL=redis://your-redis-host:6379

# Socket.IO Port
SOCKET_PORT=4001

# Nuxt Dev URL (for CORS)
NUXT_DEV_URL=http://localhost:3000
```

**Important:** Never commit the `.env` file to version control. Add it to `.gitignore`.

## Redis Setup (Optional but Recommended for Production)

Redis is used for Socket.IO horizontal scaling across multiple server instances.

### Install Redis

#### macOS:
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian:
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

#### Windows:
Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)

### Verify Redis:
```bash
redis-cli ping
```

Should respond with `PONG`.

## Database Schema

### Collections Structure

#### 1. smoothie_bases
```javascript
{
  "_id": ObjectId,
  "id": "base-1",
  "name": "Whole Milk",
  "price": 3.99
}
```

#### 2. smoothie_fruits
```javascript
{
  "_id": ObjectId,
  "id": "fruit-1",
  "name": "Strawberry",
  "extraPrice": 0.50
}
```

#### 3. smoothie_sizes
```javascript
{
  "_id": ObjectId,
  "id": "size-small",
  "name": "Small",
  "multiplier": 1.0
}
```

#### 4. orders
```javascript
{
  "_id": ObjectId,
  "customerId": "customer-abc123",
  "baseId": "base-1",
  "fruitIds": ["fruit-1", "fruit-2"],
  "sizeId": "size-medium",
  "sweetness": 100,
  "iceLevel": 100,
  "extraNote": "Extra ice please",
  "price": 5.99,
  "status": "draft", // draft, queued, blending, ready
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "submittedAt": 1234567890,
  "startedAt": 1234567890,
  "finishedAt": 1234567890
}
```

## Troubleshooting

### Connection Issues

**Problem:** "MongoServerError: Authentication failed"
**Solution:** Check your username/password in MONGO_URL

**Problem:** "MongoNetworkError: failed to connect"
**Solution:** 
- Verify MongoDB is running: `brew services list` (macOS) or `sudo systemctl status mongod` (Linux)
- Check if port 27017 is available
- For Atlas, verify IP whitelist and credentials

### Import Issues

**Problem:** "error restoring"
**Solution:** Make sure you're in the correct directory and the path to seed files is correct

**Problem:** "namespace already exists"
**Solution:** This is fine - it means data was already imported. To reimport, drop the database first:
```javascript
use smoothie_order_system
db.dropDatabase()
```

Then run `mongorestore` again.

## Testing the Database Connection

After setup, you can test the database connection using the test endpoint:

```bash
# Start the server
npm run dev

# In another terminal, test the connection
curl http://localhost:3000/api/db-test
```

You should see a success message with database information.

## Next Steps

1. Install project dependencies: `npm install`
2. Start the development server: `npm run dev`
3. Access the application at `http://localhost:3000`
4. Test customer interface at `http://localhost:3000/customer`
5. Test operator dashboard at `http://localhost:3000/operator`

## Production Considerations

### Indexes

For production, consider adding indexes:

```javascript
// Connect to your database
use smoothie_order_system

// Create indexes for better query performance
db.orders.createIndex({ customerId: 1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ submittedAt: 1 })
db.smoothie_bases.createIndex({ id: 1 })
db.smoothie_fruits.createIndex({ id: 1 })
db.smoothie_sizes.createIndex({ id: 1 })
```

### Backup

Regular backups are essential:

```bash
# Create backup
mongodump --db smoothie_order_system --out ./backup-$(date +%Y%m%d)

# Restore from backup
mongorestore --db smoothie_order_system ./backup-20250101/smoothie_order_system/
```

### Security

1. Enable authentication in production
2. Use strong passwords
3. Limit network access
4. Use SSL/TLS connections
5. Keep MongoDB updated

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Nuxt MongoDB Integration](https://nuxt.com/modules/mongodb)
- [Redis Documentation](https://redis.io/documentation)


