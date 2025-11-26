# OpenID Connect (OIDC) Security & Identity Verification

## 🔐 Overview

This application implements **OpenID Connect (OIDC)** for secure, verifiable, and tamper-proof user authentication. OIDC extends OAuth 2.0 to provide identity verification through **ID Tokens**.

## 🎯 Why OIDC?

### Problem: OAuth 2.0 Alone Isn't Enough
- OAuth 2.0 only provides **authorization** (what you can access)
- Doesn't standardize **authentication** (who you are)
- Access tokens are opaque - can't verify user identity

### Solution: OpenID Connect (OIDC)
- Adds **authentication layer** on top of OAuth 2.0
- Issues **ID Tokens** (JWT format) with verified user identity
- Tokens are **signed** and **verifiable**
- **Tamper-proof** - any modification breaks the signature

## 🛡️ Security Features

### 1. **ID Token Structure**

An OIDC ID Token is a JWT (JSON Web Token) with three parts:

```
Header.Payload.Signature
```

**Example ID Token:**
```json
{
  "header": {
    "alg": "RS256",           // Signing algorithm
    "typ": "JWT",
    "kid": "key-id-123"       // Key identifier
  },
  "payload": {
    "iss": "https://accounts.google.com",  // Issuer
    "sub": "110169484474386276334",        // Subject (user ID)
    "aud": "your-client-id",               // Audience (your app)
    "exp": 1701234567,                     // Expiration time
    "iat": 1701230967,                     // Issued at time
    "email": "user@example.com",
    "email_verified": true,
    "name": "John Doe",
    "picture": "https://..."
  },
  "signature": "..." // Cryptographic signature
}
```

### 2. **Signature Verification**

The signature ensures:
- **Authenticity**: Token was issued by the claimed provider
- **Integrity**: Token hasn't been modified
- **Non-repudiation**: Provider can't deny issuing it

**Verification Process:**
```javascript
// 1. Decode token (Base64)
const decoded = decodeJWT(idToken)

// 2. Fetch provider's public keys
const publicKeys = await fetchPublicKeys(decoded.header.kid)

// 3. Verify signature
const isValid = verifySignature(idToken, publicKeys)

// 4. Verify claims
verifyIssuer(decoded.payload.iss)
verifyAudience(decoded.payload.aud)
verifyExpiration(decoded.payload.exp)
```

### 3. **Claims Verification**

OIDC enforces several security checks:

```typescript
// Required claims
{
  "iss": "https://accounts.google.com",  // Must match expected issuer
  "sub": "unique-user-id",               // Unique, stable user identifier
  "aud": "your-client-id",               // Must match your client ID
  "exp": 1701234567,                     // Must not be expired
  "iat": 1701230967,                     // Must not be in future
  "nonce": "random-value"                // Replay attack prevention
}
```

## 🔒 How We Implement OIDC Security

### 1. **Provider-Side Verification**

Each OAuth provider (Google, Microsoft, GitHub, GitLab) handles:
- ✅ User authentication
- ✅ ID token generation
- ✅ Token signing with private key
- ✅ Token issuance to our callback

### 2. **Our Server-Side Verification**

The `nuxt-auth-utils` library automatically:
- ✅ Validates token signature
- ✅ Verifies issuer (iss)
- ✅ Verifies audience (aud)
- ✅ Checks expiration (exp)
- ✅ Validates nonce (if present)

**Example in our code:**

```typescript:1:86:/Users/zhangwei/CS590_WebDev/final_project/Little_Smoothie_Order_Management_System/server/api/auth/google.get.ts
export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['openid', 'profile', 'email'], // OIDC scopes
  },
  async onSuccess(event, { user, tokens }) {
    // At this point, nuxt-auth-utils has already:
    // 1. Validated the ID token signature
    // 2. Verified the issuer
    // 3. Checked expiration
    // 4. Confirmed audience matches our client ID
    
    // 'user' object contains verified claims from ID token
    const email = user.email           // Verified email
    const sub = user.sub               // Unique user ID (tamper-proof)
    const name = user.name             // Verified name
    const picture = user.picture       // Profile picture URL
    
    // Store verified identity in session
    await setUserSession(event, {
      user: {
        id: sub,                       // Use 'sub' - it's stable & unique
        name: name || email,
        email: email,
        avatar: picture,
        provider: 'google',
        roles: determineRoles(...)
      },
      loggedInAt: Date.now()
    })
    
    return sendRedirect(event, '/')
  }
})
```

### 3. **Session Security**

After OIDC verification, we store the verified identity in an **encrypted session**:

```typescript
// Session is encrypted with a secret key
await setUserSession(event, {
  user: {
    id: 'verified-user-id',    // From ID token 'sub' claim
    email: 'verified@email.com', // From ID token 'email' claim
    provider: 'google'
  },
  loggedInAt: Date.now()
})
```

**Session Cookie Security:**
- ✅ **HttpOnly**: JavaScript can't access it
- ✅ **Secure**: Only sent over HTTPS (in production)
- ✅ **SameSite**: CSRF protection
- ✅ **Encrypted**: Using `nuxt-auth-utils` encryption
- ✅ **Time-limited**: 7-day expiration

### 4. **Token Storage Strategy**

We **DO NOT** store the raw ID token or access token in the session. Instead:
- ✅ Extract and verify user identity from ID token
- ✅ Store only necessary user info in encrypted session
- ✅ Tokens are short-lived (provider manages expiration)
- ✅ Session is independent of token lifecycle

## 🔍 Identity Verification Flow

### Complete OIDC Flow Diagram

```
┌─────────┐                                    ┌──────────────┐
│ Browser │                                    │ OIDC Provider│
│  User   │                                    │ (Google, MS) │
└────┬────┘                                    └──────┬───────┘
     │                                                │
     │ 1. Click "Sign in with Google"                │
     ├──────────────────────────────────────────────▶│
     │                                                │
     │ 2. Redirect to provider's login page          │
     │◀───────────────────────────────────────────────┤
     │                                                │
     │ 3. User authenticates (password, 2FA, etc.)   │
     ├──────────────────────────────────────────────▶│
     │                                                │
     │ 4. User consents to sharing profile           │
     ├──────────────────────────────────────────────▶│
     │                                                │
     │                                  ┌─────────────┴──────────┐
     │                                  │ Generate ID Token:     │
     │                                  │ - Sign with private key│
     │                                  │ - Include user claims  │
     │                                  │ - Set expiration       │
     │                                  └─────────────┬──────────┘
     │                                                │
     │ 5. Redirect with authorization code            │
     │◀───────────────────────────────────────────────┤
     │      ?code=abc123&state=xyz                    │
     │                                                │
┌────▼──────────────────────────────────────────┐    │
│ Our Server: /api/auth/google (callback)       │    │
├────────────────────────────────────────────────┤    │
│                                                │    │
│ 6. Exchange code for tokens                   │    │
├───────────────────────────────────────────────────▶│
│                                                │    │
│ 7. Return ID Token + Access Token             │    │
│◀───────────────────────────────────────────────────┤
│    {                                           │    │
│      id_token: "eyJ...",                       │    │
│      access_token: "ya29...",                  │    │
│      token_type: "Bearer"                      │    │
│    }                                           │    │
│                                                │    │
│ 8. Verify ID Token:                           │    │
│    ✓ Fetch provider's public keys             │    │
│    ✓ Verify signature                         │    │
│    ✓ Check issuer (iss)                       │    │
│    ✓ Check audience (aud)                     │    │
│    ✓ Check expiration (exp)                   │    │
│    ✓ Validate nonce                           │    │
│                                                │    │
│ 9. Extract verified user identity:            │    │
│    {                                           │    │
│      sub: "110169484474386276334",            │    │
│      email: "user@example.com",               │    │
│      email_verified: true,                    │    │
│      name: "John Doe"                         │    │
│    }                                           │    │
│                                                │    │
│ 10. Create encrypted session                  │    │
│     Store verified identity                   │    │
│                                                │    │
│ 11. Set secure cookie                         │    │
└────┬───────────────────────────────────────────┘    │
     │                                                │
     │ 12. Redirect to app home page                 │
     │◀──────────────────────────────────────────────┤
     │                                                │
     │ ✅ User is now authenticated                   │
     │    Identity is verified & tamper-proof        │
     └                                                ┘
```

## 🎯 Why This Approach is Secure

### 1. **Cryptographic Signature**
- ID tokens are signed with provider's **private key**
- We verify with provider's **public key**
- Any tampering breaks the signature
- **Result**: Cannot forge or modify identity

### 2. **Provider Trust Chain**
- Google/Microsoft have robust security
- They verify user identity (password, 2FA)
- They issue signed tokens
- **Result**: We trust their verification process

### 3. **Time-Limited Validity**
- ID tokens expire (typically 1 hour)
- Sessions expire (7 days, configurable)
- Forced re-authentication after expiration
- **Result**: Stolen tokens have limited use

### 4. **Nonce for Replay Prevention**
- Random nonce sent with auth request
- Must match in returned ID token
- Prevents replay attacks
- **Result**: Can't reuse captured tokens

### 5. **HTTPS Enforcement**
- All OAuth redirects use HTTPS
- Tokens never sent over HTTP
- **Result**: No man-in-the-middle attacks

## 🔐 Security Best Practices We Follow

### ✅ What We Do

1. **Use OIDC Scopes**
   ```typescript
   scope: ['openid', 'profile', 'email']  // Not just OAuth scopes
   ```

2. **Verify All Claims**
   - Issuer (iss)
   - Audience (aud)
   - Expiration (exp)
   - Issued at (iat)

3. **Use Stable Identifiers**
   ```typescript
   id: user.sub  // NOT user.email (emails can change)
   ```

4. **Store Minimal Data**
   - Only store what's needed
   - Don't store raw tokens
   - Encrypt session data

5. **Secure Cookie Settings**
   ```typescript
   cookie: {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax'
   }
   ```

6. **Validate on Every Request**
   - Check session existence
   - Verify session hasn't expired
   - Re-authenticate if needed

### ❌ What We Avoid

1. **DON'T** trust client-side tokens
2. **DON'T** skip signature verification
3. **DON'T** use access tokens for authentication
4. **DON'T** store tokens in localStorage
5. **DON'T** implement custom JWT verification (use libraries)

## 🔍 Verifying Identity in Our Code

### Example: Check User Identity

```typescript
// In any API endpoint
export default defineEventHandler(async (event) => {
  // Get verified session
  const session = await getUserSession(event)
  
  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  
  // At this point, we have verified:
  // ✓ User authenticated with OIDC provider
  // ✓ ID token was cryptographically verified
  // ✓ Session is valid and not expired
  // ✓ Session data hasn't been tampered with
  
  const userId = session.user.id           // Verified user ID (from 'sub')
  const userEmail = session.user.email     // Verified email
  const provider = session.user.provider   // Which provider verified them
  
  // Use verified identity for business logic
  // ...
})
```

## 📊 Supported OIDC Providers

| Provider | ID Token | Signature | Claims | Groups/Roles |
|----------|----------|-----------|--------|--------------|
| **Google** | ✅ RS256 | ✅ Verified | ✅ Full | ✅ Domain-based |
| **Microsoft** | ✅ RS256 | ✅ Verified | ✅ Full | ✅ Azure AD Groups |
| **GitHub** | ❌ OAuth only | ⚠️ User API | ⚠️ Limited | ✅ Organizations |
| **GitLab** | ❌ OAuth only | ⚠️ User API | ⚠️ Limited | ✅ Groups |

**Note:** GitHub and GitLab use OAuth 2.0 (not full OIDC), so we fetch user info from their APIs instead of verifying ID tokens. Google and Microsoft provide full OIDC compliance.

## 🚀 Production Deployment Checklist

### Security Requirements

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS only (no HTTP)
- [ ] Set secure cookies (`secure: true`)
- [ ] Configure session secret (`NUXT_SESSION_PASSWORD`)
- [ ] Rotate session secrets regularly
- [ ] Set up proper OAuth redirect URLs (HTTPS)
- [ ] Enable rate limiting on auth endpoints
- [ ] Monitor for suspicious auth patterns
- [ ] Implement account lockout after failed attempts
- [ ] Add logging for all auth events
- [ ] Regular security audits
- [ ] Keep dependencies updated

### OAuth Provider Setup

- [ ] Register app with each provider
- [ ] Set authorized redirect URLs
- [ ] Request minimal scopes needed
- [ ] Configure proper consent screens
- [ ] Test with real accounts
- [ ] Monitor OAuth usage/quotas

## 📚 Additional Resources

- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [JWT.io - Token Decoder](https://jwt.io/)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [nuxt-auth-utils Documentation](https://github.com/Atinux/nuxt-auth-utils)

## 🎓 Key Takeaways

1. **OIDC provides identity verification** - Not just authorization
2. **ID tokens are tamper-proof** - Cryptographically signed
3. **Always verify signatures** - Never trust without verification
4. **Use stable identifiers** - 'sub' claim, not email
5. **Secure session storage** - Encrypted, HttpOnly cookies
6. **Time-limited validity** - Tokens and sessions expire
7. **Trust the provider** - They handle user authentication

Your application now implements **industry-standard OIDC security** for verifiable, tamper-proof user identities! 🔒✨

