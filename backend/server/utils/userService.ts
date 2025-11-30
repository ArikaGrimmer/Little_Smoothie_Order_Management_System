import { getDB } from "./mongo";

export interface User {
  _id?: any;
  id: string; // GitHub ID or custom ID
  email: string;
  name: string;
  avatar?: string;
  provider: string; // 'github' or 'demo'
  roles: string[];
  githubId?: string;
  organizations?: string[];
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number;
}

/**
 * Find or create a user in the database
 * This ensures we have a persistent user record
 */
export async function findOrCreateUser(userData: {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  githubId?: string;
  organizations?: string[];
}): Promise<User> {
  const db = await getDB();
  const users = db.collection<User>("users");
  
  const now = Date.now();
  
  // Try to find existing user by provider ID or email
  let user = await users.findOne({
    $or: [
      { id: userData.id, provider: userData.provider },
      { email: userData.email }
    ]
  });
  
  if (user) {
    // Re-evaluate roles on every login (in case OPERATOR_EMAILS changed)
    const updatedRoles = determineUserRoles(userData.email, userData.organizations);
    
    // Update existing user (including roles)
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          name: userData.name,
          avatar: userData.avatar,
          organizations: userData.organizations,
          roles: updatedRoles, // Re-evaluate roles on login
          updatedAt: now,
          lastLoginAt: now
        }
      }
    );
    
    // Return updated user
    user = await users.findOne({ _id: user._id });
    return user!;
  } else {
    // Create new user
    const roles = determineUserRoles(userData.email, userData.organizations);
    
    const newUser: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      avatar: userData.avatar,
      provider: userData.provider,
      githubId: userData.githubId,
      organizations: userData.organizations,
      roles,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now
    };
    
    const result = await users.insertOne(newUser as any);
    newUser._id = result.insertedId;
    
    return newUser;
  }
}

/**
 * Determine user roles based on email and organizations
 * Operator role is granted if:
 * 1. Email matches configured operator email, OR
 * 2. User belongs to certain GitHub organizations
 */
function determineUserRoles(email: string, organizations?: string[]): string[] {
  const roles = ['customer']; // Everyone is at least a customer
  
  // Check if email is configured as operator
  const operatorEmails = (process.env.OPERATOR_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  
  if (operatorEmails.includes(email.toLowerCase())) {
    roles.push('operator');
    console.log(`[UserService] Granted operator role to ${email} (matched operator email)`);
    return roles;
  }
  
  // Check GitHub organizations
  if (organizations && organizations.length > 0) {
    if (organizations.some(org => 
      org.toLowerCase().includes('smoothie') || 
      org.toLowerCase().includes('operator')
    )) {
      roles.push('operator');
      console.log(`[UserService] Granted operator role to ${email} (GitHub org match)`);
    }
  }
  
  return roles;
}

/**
 * Get user by ID from database
 */
export async function getUserById(userId: string): Promise<User | null> {
  const db = await getDB();
  const users = db.collection<User>("users");
  
  return await users.findOne({ id: userId });
}

/**
 * Update user's last login time
 */
export async function updateUserLogin(userId: string): Promise<void> {
  const db = await getDB();
  const users = db.collection<User>("users");
  
  await users.updateOne(
    { id: userId },
    { 
      $set: { 
        lastLoginAt: Date.now() 
      } 
    }
  );
}

