# Database Seeding Guide

This guide explains how to seed the database so you and your partner can share the same database structure.

## Quick Start

After cloning the repository, run:

```bash
npm install
npm run seed
```

This will seed all collections with default data.

## What Gets Seeded

The seeding script creates data for:

1. **Menu Items** (`menu_items` collection)
   - 8 pre-configured smoothie items
   - Includes images, descriptions, prices, and nutrition info

2. **Smoothie Bases** (`smoothie_bases` collection)
   - 5 base options (Almond Milk, Coconut Water, Oat Milk, etc.)
   - Used for custom smoothie builder

3. **Smoothie Fruits** (`smoothie_fruits` collection)
   - 8 fruit add-ons (Strawberry, Blueberry, Banana, etc.)
   - Each with an extra price

4. **Smoothie Sizes** (`smoothie_sizes` collection)
   - 4 size options (Small, Medium, Large, X-Large)
   - Each with a price multiplier

## Setup Instructions

### Step 1: Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017/smoothie_db
# OR for MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/smoothie_db

# Other environment variables (if needed)
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_OAUTH_GITHUB_CLIENT_ID=your_client_id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your_client_secret
```

### Step 2: Run the Seed Script

```bash
cd backend
npm run seed
```

You should see output like:

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB!

📋 Seeding menu_items collection...
✅ Inserted 8 menu items

🥛 Seeding smoothie_bases collection...
✅ Inserted 5 bases

🍓 Seeding smoothie_fruits collection...
✅ Inserted 8 fruits

📏 Seeding smoothie_sizes collection...
✅ Inserted 4 sizes

✨ Database seeding completed successfully!

📊 Summary:
   - menu_items: 8 items
   - smoothie_bases: 5 bases
   - smoothie_fruits: 8 fruits
   - smoothie_sizes: 4 sizes

💡 Your partner can now run: npm run seed
```

### Step 3: Verify the Data

You can verify the data was seeded correctly by:

1. **Using MongoDB Compass:**
   - Connect to your database
   - Check each collection has the expected number of documents

2. **Using the Application:**
   - Start the server: `npm run dev`
   - Visit `http://localhost:3000/menu` - should show 8 smoothies
   - Visit `http://localhost:3000/customer` - should show bases, sizes, and fruits

## Sharing with Your Partner

### Option 1: Shared Database (Recommended)

Both partners use the same MongoDB database:

1. **Partner 1:** Set up MongoDB (local or Atlas) and run `npm run seed`
2. **Partner 2:** Use the same `MONGO_URL` in their `.env` file
3. Both partners can now work with the same data

### Option 2: Separate Databases

Each partner has their own database:

1. **Partner 1:** Set up their database and run `npm run seed`
2. **Partner 2:** Set up their own database and run `npm run seed`
3. Each partner works independently with their own data

## Re-seeding the Database

If you need to reset the database to the default state:

```bash
npm run seed
```

**Warning:** This will delete all existing data in these collections and replace it with the seed data.

## Customizing Seed Data

To customize the seed data:

1. Edit `seed-database.js`
2. Modify the arrays (`smoothieItems`, `smoothieBases`, `smoothieFruits`, `smoothieSizes`)
3. Run `npm run seed` again

## Troubleshooting

### Error: "MONGO_URL not found"
- Make sure you have a `.env` file in the `backend` directory
- Check that `MONGO_URL` is set correctly

### Error: "Authentication failed"
- Check your MongoDB connection string
- For Atlas, make sure your IP is whitelisted
- Verify username and password are correct

### Error: "Cannot connect to server"
- Check if MongoDB is running (for local)
- For Atlas, verify network access settings
- Check your internet connection

### Data not showing in application
- Make sure you ran `npm run seed` successfully
- Restart your dev server: `npm run dev`
- Check browser console for errors

## Collections Created

After seeding, your database will have:

- `menu_items` - Pre-configured smoothie menu items
- `smoothie_bases` - Base options for custom smoothies
- `smoothie_fruits` - Fruit add-ons
- `smoothie_sizes` - Size options

**Note:** Other collections (`users`, `orders`) are created automatically when the application runs.

