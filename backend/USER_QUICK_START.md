# User System - Quick Start

## 🎯 What's New

You now have **persistent user records** with database storage! Here's what changed:

### ✅ User Records in Database
- All users are saved to MongoDB `users` collection
- User data persists across sessions and devices
- Orders are linked to user IDs (not just emails)

### ✅ Operator Assignment by Email
- Configure operator emails in `.env`
- Automatic operator role assignment
- No need for specific GitHub organizations

### ✅ Order History
- Customers can see all their previous orders
- New API endpoint: `/api/customer/my-orders`
- Works across any device/platform

## 🚀 Quick Setup

### Step 1: Configure Operator Emails

Add this to your `.env` file:

```bash
# Add your email(s) that should have operator access
OPERATOR_EMAILS=your-email@example.com,teammate@example.com
```

**Important:** Restart the server after adding this!

### Step 2: Test Customer Login

```bash
# Test as customer
curl -X POST http://localhost:3000/api/auth/demo \
  -H "Content-Type: application/json" \
  -d '{"role": "customer"}' \
  -c /tmp/customer-cookie.txt

# Check user was created in database
mongosh smoothie_order_system
db.users.findOne({ email: "demo-customer@smoothie.local" })
```

### Step 3: Test Operator Login

**Option A: Use Demo Operator**
```bash
curl -X POST http://localhost:3000/api/auth/demo \
  -H "Content-Type: application/json" \
  -d '{"role": "operator"}' \
  -c /tmp/operator-cookie.txt
```

**Option B: Use GitHub with Configured Email**
1. Add your GitHub email to `OPERATOR_EMAILS` in `.env`
2. Restart server
3. Login with GitHub
4. You'll automatically get operator role!

### Step 4: Test Order History

```bash
# As customer, view your orders
curl http://localhost:3000/api/customer/my-orders \
  -H "Cookie: $(cat /tmp/customer-cookie.txt | grep nuxt-session | awk '{print $7}')"
```

## 📊 Database Collections

### users Collection
```javascript
{
  id: "demo-customer",
  email: "demo-customer@smoothie.local",
  name: "Demo Customer",
  avatar: "https://...",
  provider: "demo",
  roles: ["customer"],
  createdAt: 1234567890,
  updatedAt: 1234567890,
  lastLoginAt: 1234567890
}
```

### orders Collection (Now Linked to Users!)
```javascript
{
  customerId: "demo-customer",  // ← Links to user.id
  status: "queued",
  price: 13.48,
  // ... other order fields
}
```

## 🔍 Verify Everything Works

### Check Users in Database
```bash
mongosh smoothie_order_system
db.users.find().pretty()
db.users.countDocuments()
```

### Check User Has Correct Roles
```bash
db.users.findOne({ email: "your-email@example.com" })
# Should see: roles: ["customer", "operator"]
```

### Check Orders Are Linked
```bash
# Find a user
const user = db.users.findOne({ email: "demo-customer@smoothie.local" })

# Find their orders
db.orders.find({ customerId: user.id }).pretty()
```

## 🎭 Test Complete Flow

### As Customer:
1. Visit http://localhost:3000/login
2. Click "Demo Login"
3. Go to `/menu` and select a smoothie
4. Customize and submit order
5. Visit `/customer` to see order status
6. **New!** Orders are saved to your user account

### As Operator:
1. Add your email to `OPERATOR_EMAILS` in `.env`
2. Restart server
3. Login with GitHub (using that email)
4. Visit `/operator` dashboard
5. View all pending orders
6. Visit `/operator/menu` to manage menu

## 📝 Key Changes

| Before | After |
|--------|-------|
| Users only in session | Users in database |
| Email = Customer ID | Persistent user ID |
| No order history | Full order history |
| Org-based operator | Email-based operator |
| Lose data on logout | Keep data forever |

## 🔧 Troubleshooting

### "I don't have operator access"
1. Check `.env` has `OPERATOR_EMAILS=your-email@example.com`
2. Restart the server: `npm run dev`
3. Log out and log back in
4. Verify: `db.users.findOne({ email: "your-email" })`

### "My orders don't show up"
1. Orders are linked to user ID
2. Check: `db.users.findOne({ email: "your-email" })`
3. Then: `db.orders.find({ customerId: user.id })`
4. Status must not be "draft" to appear in history

### "getUserSession is not defined"
1. Run: `npx nuxi prepare`
2. Restart server
3. Clear `.nuxt` folder if needed

## 📚 Full Documentation

See `USER_SYSTEM.md` for complete documentation including:
- Detailed architecture
- All API endpoints
- Security notes
- Migration guide
- Advanced configurations

## 🎉 Summary

✅ Users stored in MongoDB  
✅ Orders linked to user IDs  
✅ Operator role via email config  
✅ Order history API  
✅ Cross-platform support  
✅ GitHub OAuth integration  

Your RBAC system is now fully implemented! 🚀

