# Little Smoothie Order Management System - Quick Start Guide

This guide will help you get the application up and running quickly.

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd Little_Smoothie_Order_Management_System
npm install
```

### Step 2: Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update the MongoDB URL:

```env
MONGO_URL=mongodb://localhost:27017/smoothie_orders
```

### Step 3: Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Seed the Database

```bash
npm run seed
```

This will populate your database with:
- 4 smoothie bases (Yogurt, Almond Milk, Orange Juice, Coconut Water)
- 8 fruits (Strawberry, Banana, Blueberry, Mango, etc.)
- 4 sizes (Small, Medium, Large, X-Large)

### Step 5: Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser!

### Step 6: Login with Demo Account

1. Go to the login page
2. Click "Demo Login (Customer & Operator)"
3. You're now logged in with both customer and operator access!

## 📱 Testing the Application

### As a Customer:

1. Click "My Orders" in the navigation
2. Create a new smoothie order:
   - Select "Greek Yogurt Base"
   - Choose some fruits (Strawberry, Banana)
   - Select "Medium" size
   - Set sweetness to "Regular"
   - Set ice level to "Regular"
   - Add a note: "Extra blended please!"
3. Click "Save Draft"
4. Click "Place Order"
5. Your order is now in the queue!

### As an Operator:

1. Click "Operator Dashboard" in the navigation
2. See your submitted order in the "Queued" status
3. Click "Start Blending" on the order
4. Watch the status change to "Blending"
5. Click "Mark Done" to complete the order
6. The order now shows as "Done"!

## 🔐 Setting Up OAuth

### Google OAuth Setup (Recommended - Full OIDC)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** or **Google Identity Services**
4. Go to "APIs & Services" → "Credentials"
5. Click "Create Credentials" → "OAuth client ID"
6. Configure consent screen if prompted:
   - User Type: External
   - App name: Little Smoothie
   - User support email: your email
   - Authorized domains: localhost (for dev)
7. Choose "Web application"
8. Fill in the details:
   - **Name**: Little Smoothie Dev
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/google`
9. Click "Create"
10. Copy the Client ID and Client Secret
11. Add to your `.env`:

```env
NUXT_OAUTH_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=your_client_secret_here
```

12. Restart your dev server
13. Now you can use "Continue with Google" on the login page! ✅

### Microsoft OAuth Setup (Recommended - Full OIDC)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Fill in the details:
   - **Name**: Little Smoothie Order Management
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: Web → `http://localhost:3000/api/auth/microsoft`
5. Click "Register"
6. Copy the "Application (client) ID"
7. Go to "Certificates & secrets" → "New client secret"
8. Add description and expiration, click "Add"
9. Copy the secret **Value** (not Secret ID)
10. Go to "API permissions":
    - Add "Microsoft Graph" → "Delegated permissions"
    - Add: `openid`, `profile`, `email`, `User.Read`
11. Add to your `.env`:

```env
NUXT_OAUTH_MICROSOFT_CLIENT_ID=your_application_client_id_here
NUXT_OAUTH_MICROSOFT_CLIENT_SECRET=your_client_secret_value_here
```

12. Restart your dev server
13. Now you can use "Continue with Microsoft" on the login page! ✅

### GitHub OAuth Setup

1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Little Smoothie Dev
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github`
4. Click "Register application"
5. Copy the Client ID and generate a new Client Secret
6. Add to your `.env`:

```env
NUXT_OAUTH_GITHUB_CLIENT_ID=your_client_id_here
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your_client_secret_here
```

7. Restart your dev server
8. Now you can use "Continue with GitHub" on the login page!

### GitLab OAuth Setup

1. Go to GitLab Settings → Applications
2. Click "Add new application"
3. Fill in the details:
   - **Name**: Little Smoothie Dev
   - **Redirect URI**: `http://localhost:3000/api/auth/gitlab`
   - **Scopes**: Check `read_user` and `read_api`
4. Click "Save application"
5. Copy the Application ID and Secret
6. Add to your `.env`:

```env
NUXT_OAUTH_GITLAB_CLIENT_ID=your_application_id_here
NUXT_OAUTH_GITLAB_CLIENT_SECRET=your_secret_here
NUXT_OAUTH_GITLAB_REDIRECT_URL=http://localhost:3000/api/auth/gitlab
```

7. Restart your dev server
8. Now you can use "Continue with GitLab" on the login page!

## 🎭 Role Assignment

### Demo Login
- Gets both **customer** and **operator** roles automatically
- Perfect for testing all features

### Google OAuth
- **Default**: Everyone gets the **customer** role
- **Operator Role**: Granted based on email domain or patterns
  - Customize in `server/api/auth/google.get.ts`
  - Example: `@yourdomain.com`, emails containing "operator", "admin", "staff"

### Microsoft OAuth
- **Default**: Everyone gets the **customer** role
- **Operator Role**: Granted if user is in Azure AD groups containing:
  - "smoothie", "operator", or "admin"
  - Or customize based on email domain

### GitHub/GitLab OAuth
- **Default**: Everyone gets the **customer** role
- **Operator Role**: Granted if user is in an organization/group containing:
  - "smoothie" (case-insensitive)
  - "operator" (case-insensitive)

Example: If you're in a GitHub org called "smoothie-stand" or Azure AD group "Smoothie-Operators", you'll get operator access!

## 🗂️ Database Structure

After seeding, your MongoDB will have these collections:

### `smoothie_bases`
```javascript
{
  id: "yogurt",
  name: "Greek Yogurt Base",
  price: 4.50
}
```

### `smoothie_fruits`
```javascript
{
  id: "strawberry",
  name: "Strawberry",
  extraPrice: 0.50
}
```

### `smoothie_sizes`
```javascript
{
  id: "medium",
  name: "Medium (16oz)",
  multiplier: 1.3
}
```

### `orders`
```javascript
{
  _id: ObjectId("..."),
  customerId: "demo@smoothie.local",
  baseId: "yogurt",
  fruitIds: ["strawberry", "banana"],
  sweetness: "regular",
  iceLevel: "regular",
  sizeId: "medium",
  extraNote: "Extra blended please!",
  status: "queued", // or "draft", "blending", "done"
  price: 6.37,
  createdAt: 1234567890,
  updatedAt: 1234567890,
  operatorId: "operator@smoothie.local" // set when blending starts
}
```

## 🐛 Troubleshooting

### Can't connect to MongoDB
```bash
# Check if MongoDB is running
mongosh
# If it connects, MongoDB is running!

# If not, start it:
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

### OAuth not working
- Make sure callback URLs match exactly (no trailing slashes!)
- Check that your OAuth app is active
- Verify Client ID and Secret in `.env`
- Restart the dev server after changing `.env`

### Database seeding fails
```bash
# Make sure MongoDB is running
# Then try running the seed script directly:
MONGO_URL=mongodb://localhost:27017/smoothie_orders node scripts/seed-database.js
```

### Build errors
```bash
# Clear Nuxt cache
rm -rf .nuxt

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

## 📚 Next Steps

1. **Customize the menu**: Edit the seed script to add your own bases, fruits, and sizes
2. **Add more features**: Real-time updates, notifications, payment integration
3. **Deploy to production**: See the main README for deployment instructions
4. **Add tests**: Write unit and integration tests for your API endpoints

## 💡 Tips

- Use the **Demo Login** for quick testing
- The customer dashboard lets you create and track orders
- The operator dashboard shows all orders and lets you process them
- Check the browser console for debugging information
- All prices are calculated on the server (security!)
- Orders go through this flow: **draft** → **queued** → **blending** → **done**

## 🎉 You're All Set!

Enjoy building with Little Smoothie Order Management System!

Need help? Check the full README.md or open an issue on GitHub.

