# Authentication System Documentation

## Overview

I've successfully implemented a comprehensive OIDC-based authentication system with multi-role support and real-time chat identity verification for your Little Smoothie Order Management System.

## Features Implemented

### 1. **OIDC Authentication with nuxt-auth-utils**
- Session-based authentication using encrypted cookies
- Support for GitHub OAuth and demo login
- Automatic session management with 7-day expiration
- Secure cookie settings (httpOnly, secure in production)

### 2. **Multi-Role Support**
- **Customer Role**: Default role for all users
- **Operator Role**: Granted based on GitHub organization membership or demo selection
- Role-based access control (RBAC) for API routes and pages

### 3. **Login System**
Located at `/login`, provides two authentication methods:

#### GitHub OAuth
- Authenticates users via GitHub
- Fetches user's organizations
- Automatically assigns operator role if user belongs to organizations containing "smoothie" or "operator"
- Requires GitHub OAuth app configuration (see setup below)

#### Demo Login
- For development and testing
- Creates temporary user accounts
- Can simulate both customer and operator roles

### 4. **Protected Routes**
- All routes require authentication by default
- Login page is excluded from authentication requirement
- Middleware automatically redirects unauthenticated users to `/login`
- Authenticated users on `/login` are redirected to homepage

### 5. **User Profile Component**
- Displays user avatar, name, email
- Shows assigned roles with color-coded badges
- Sign out functionality
- Integrated into all main pages (home, customer, operator)

### 6. **API Route Protection**
All API routes are now protected with authentication:

#### Menu Routes
- `GET /api/menu` - Requires authentication

#### Customer Routes
- `GET /api/customer/:customerId/draft-order` - User can only access their own drafts
- `PUT /api/customer/:customerId/draft-order` - User can only update their own drafts
- `POST /api/customer/:customerId/submit-draft-order` - User can only submit their own orders

#### Operator Routes (Require Operator Role)
- `GET /api/operator/orders` - List all orders
- `POST /api/operator/orders/:orderId/start` - Start order preparation
- `POST /api/operator/orders/:orderId/finish` - Mark order as complete

### 7. **Socket.IO Identity Verification**
- Socket connections require authenticated user data
- User identity is passed during socket connection
- All socket messages include verified user information
- Prevents identity spoofing in real-time chat

### 8. **Customer ID from Session**
- Customer page now uses authenticated user's email as customer ID
- No more random customer IDs
- Orders are properly associated with authenticated users

## File Structure

```
backend/
├── middleware/
│   └── auth.global.ts              # Global authentication middleware
├── pages/
│   └── login.vue                   # Login page with OAuth and demo options
├── components/
│   └── UserProfile.vue             # User profile dropdown component
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── github.get.ts       # GitHub OAuth handler
│   │   │   ├── demo.post.ts        # Demo login handler
│   │   │   ├── logout.post.ts      # Logout handler
│   │   │   └── session.get.ts      # Get current session
│   │   ├── menu.get.ts             # Protected menu endpoint
│   │   ├── customer/               # Protected customer endpoints
│   │   └── operator/               # Protected operator endpoints (role-required)
│   ├── plugins/
│   │   └── socket.server.ts        # Socket.IO with user verification
│   └── utils/
│       └── auth.ts                 # Authentication helper functions
├── composables/
│   └── useSocket.ts                # Socket client with user auth
├── nuxt.config.ts                  # Updated with auth module and session config
└── package.json                    # Updated with nuxt-auth-utils
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

The `nuxt-auth-utils` package has been added to your `package.json`.

### 2. Environment Variables

Create a `.env` file in the backend directory:

```bash
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017/smoothie_db

# Redis Configuration (optional, for Socket.IO scaling)
REDIS_URL=redis://localhost:6379

# Socket.IO Server Port
SOCKET_PORT=4001

# Nuxt Public URL
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# GitHub OAuth (Required for GitHub login)
# Get these from: https://github.com/settings/developers
# Create a new OAuth App with:
# - Homepage URL: http://localhost:3000
# - Authorization callback URL: http://localhost:3000/api/auth/github
NUXT_OAUTH_GITHUB_CLIENT_ID=your_github_client_id
NUXT_OAUTH_GITHUB_CLIENT_SECRET=your_github_client_secret

# Session Secret (optional, auto-generated in development)
# In production, set a strong 32+ character secret:
# NUXT_SESSION_PASSWORD=your_32_character_secret_key_here
```

### 3. GitHub OAuth Setup (Optional but Recommended)

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Little Smoothie (or your choice)
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github`
4. Copy the Client ID and Client Secret
5. Add them to your `.env` file

### 4. Start the Application

```bash
npm run dev
```

The application will:
1. Start on `http://localhost:3000`
2. Redirect unauthenticated users to `/login`
3. Socket.IO server will start on port 4001

## Usage

### Demo Login (For Testing)

1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Click "Demo Login"
4. You'll be logged in as a demo customer
5. To test operator features, modify the demo login to use role: 'operator'

### GitHub Login (Production)

1. Navigate to `http://localhost:3000/login`
2. Click "Continue with GitHub"
3. Authorize the application
4. You'll be authenticated and roles assigned based on organizations

### Accessing User Information

In any Vue component:
```vue
<script setup>
const { user, loggedIn } = useUserSession()

// user.value contains:
// - id: unique user identifier
// - name: user's display name
// - email: user's email
// - avatar: user's avatar URL
// - provider: 'github' or 'demo'
// - roles: array of roles ['customer', 'operator']
</script>
```

In API routes:
```typescript
import { requireAuth, requireRole, getUserId } from '../utils/auth'

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await requireAuth(event)
  
  // Or require specific role
  const session = await requireRole(event, 'operator')
  
  // Get user ID (email)
  const userId = getUserId(session)
})
```

### Socket.IO with Authentication

When connecting to socket:
```typescript
const { user } = useUserSession()
const { connect } = useSocket()

// Pass user data for authentication
connect(user.value)
```

The socket server will verify the user identity and include it in all messages.

## Security Features

1. **Session Encryption**: Sessions are encrypted using secure cookies
2. **CSRF Protection**: Built into nuxt-auth-utils
3. **Role-Based Access**: API routes check user roles before allowing access
4. **User Isolation**: Users can only access their own data
5. **Socket Authentication**: Real-time connections require verified user identity
6. **ID Token Verification**: OIDC tokens ensure tamper-proof user identity

## Testing the Authentication

### Test Customer Flow
1. Login with demo
2. Navigate to `/customer`
3. Build a smoothie order
4. Verify your email is used as customer ID

### Test Operator Flow
1. Logout (click user profile → Sign out)
2. Login with demo (or modify to use operator role)
3. Navigate to `/operator`
4. Should see operator dashboard if role is assigned
5. Try to access operator routes

### Test Protection
1. Logout
2. Try to navigate to `/customer` directly
3. Should redirect to `/login`
4. Login and it should work

## Customization

### Adding More OAuth Providers

The `nuxt-auth-utils` module supports many providers:
- Google
- Microsoft
- GitLab
- And many more

See: https://github.com/Atinux/nuxt-auth-utils#oauth-providers

### Customizing Roles

Edit `/server/api/auth/github.get.ts`:
```typescript
function determineRoles(organizations: string[]): string[] {
  const roles = ['customer'] // Default role
  
  // Your custom logic here
  if (organizations.includes('your-org-name')) {
    roles.push('operator')
  }
  
  return roles
}
```

### Adding More Roles

1. Update the `determineRoles()` function
2. Add role checks in API routes using `requireRole()`
3. Update UI to show/hide features based on roles

## Troubleshooting

### Session Issues
- Clear browser cookies
- Restart the dev server
- Check `.env` configuration

### GitHub OAuth Errors
- Verify Client ID and Secret
- Check callback URL matches exactly
- Ensure OAuth app is not suspended

### Socket Connection Fails
- Verify user is authenticated before connecting
- Check socket server is running on port 4001
- Look for authentication errors in server logs

## Next Steps

- Set up GitHub OAuth for production
- Configure production session secrets
- Add email verification (if needed)
- Implement password recovery (if using email/password)
- Add user profile management pages
- Implement audit logging for sensitive operations

## Support

For issues or questions:
1. Check server logs for authentication errors
2. Verify environment variables are set correctly
3. Test with demo login first before debugging OAuth
4. Review the nuxt-auth-utils documentation: https://github.com/Atinux/nuxt-auth-utils

