# MongoDB Atlas Setup Guide

## 📍 Your Database Setup

You're using **MongoDB Atlas** (cloud database) instead of a local MongoDB instance.

## ✅ Step-by-Step Setup

### Step 1: Verify Your `.env` File

Your `.env` file should look like this:

```bash
# MongoDB Atlas Connection
MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/smoothie_db?retryWrites=true&w=majority

# Other variables
REDIS_URL=your-redis-url
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
NUXT_SESSION_PASSWORD=your-session-password
```

**Important Notes:**
- Replace `username:password` with your Atlas username and password
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster address
- The database name (`smoothie_db`) comes at the end of the connection string
- Make sure to URL-encode special characters in your password (e.g., `@` becomes `%40`)

### Step 2: Find Your Atlas Connection String

If you don't have your connection string:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign in to your account
3. Click on your cluster
4. Click **"Connect"** button
5. Choose **"Connect your application"**
6. Copy the connection string (looks like the example above)
7. Replace `<password>` with your actual database user password
8. Add your database name at the end (e.g., `/smoothie_db`)

### Step 3: Seed the Database

Run this command to seed your Atlas database with menu items:

```bash
cd /Users/zhangwei/CS590_WebDev/FinalProject_update2/Little_Smoothie_Order_Management_System/backend

# Run the seeding script
node seed-atlas.js
```

You should see output like:
```
🔌 Connecting to MongoDB Atlas...
✅ Connected to MongoDB Atlas!
🗑️  Deleted 0 existing menu items
✅ Successfully inserted 8 menu items!
📊 Total menu items in database: 8
✨ Database seeded successfully!
```

### Step 4: Verify in MongoDB Compass

1. Open **MongoDB Compass**
2. Click **"New Connection"**
3. Paste your `MONGO_URL` connection string
4. Click **"Connect"**
5. You should see:
   - Database: `smoothie_db` (or whatever name you used)
   - Collection: `menu_items`
   - Documents: 8 menu items

### Step 5: Start Your Application

```bash
npm run dev
```

The server should now connect to your Atlas database and you'll see menu items when you visit `/menu`!

## 🔍 Troubleshooting

### Error: "MONGO_URL not found"
- Check that your `.env` file exists in the `backend` folder
- Make sure it contains the `MONGO_URL` variable
- Restart your server after adding it

### Error: "Authentication failed"
- Check your username and password are correct
- Make sure special characters in password are URL-encoded
- Verify the database user has read/write permissions

### Error: "Could not connect to server"
- Check your IP address is whitelisted in Atlas (Network Access)
- Go to Atlas → Security → Network Access
- Add your IP or use `0.0.0.0/0` (allow all) for development

### Can't see database in Compass
- Make sure you're using the same connection string as in `.env`
- The database won't appear until data is inserted
- Run `node seed-atlas.js` first
- Refresh Compass after seeding

## 📊 Your Menu Database Structure

Once seeded, your `menu_items` collection will have 8 documents:

1. **Tropical Paradise** - $8.99 (Fruit, Featured)
2. **Berry Blast** - $9.49 (Berry, Featured)
3. **Green Power** - $9.99 (Green)
4. **Chocolate Peanut Butter** - $10.49 (Protein, Featured)
5. **Mango Lassi** - $8.49 (Fruit)
6. **Matcha Energizer** - $9.99 (Green)
7. **Strawberry Banana Classic** - $7.99 (Berry, Featured)
8. **Avocado Dream** - $10.99 (Green, Sold Out)

## 🎯 Quick Test

After seeding, test your setup:

```bash
# Start the server
npm run dev

# Visit these URLs:
# http://localhost:3000 - Homepage
# http://localhost:3000/menu - Menu page (should show 8 smoothies)
```

## 🔄 Re-seed Database Anytime

If you need to reset the menu items:

```bash
# Option 1: Using the seed script
node seed-atlas.js

# Option 2: Using the API (requires operator role)
curl -X POST http://localhost:3000/api/operator/seed-menu \
  -H "Cookie: YOUR_OPERATOR_SESSION_COOKIE"
```

## 💡 Atlas vs Local MongoDB

**You're using Atlas (cloud)**, which is great for:
- ✅ No local MongoDB installation needed
- ✅ Accessible from anywhere
- ✅ Automatic backups
- ✅ Free tier available (512MB)

The only difference is the connection string format:
- **Local**: `mongodb://localhost:27017/smoothie_db`
- **Atlas**: `mongodb+srv://user:pass@cluster.mongodb.net/smoothie_db`

Everything else works exactly the same!

