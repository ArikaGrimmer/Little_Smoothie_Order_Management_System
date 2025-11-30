import { getDB } from "../../utils/mongo";
import { requireAuth, requireRole } from "../../utils/auth";

/**
 * Admin endpoint to manually update a user's role
 * Useful for fixing users who were created before OPERATOR_EMAILS was configured
 * 
 * Usage:
 * POST /api/admin/update-user-role
 * Body: { email: "user@example.com", roles: ["customer", "operator"] }
 */
export default defineEventHandler(async (event) => {
  // Require operator role to use this endpoint
  await requireRole(event, 'operator');
  
  const body = await readBody(event);
  const { email, roles } = body;
  
  if (!email || !Array.isArray(roles)) {
    throw createError({
      statusCode: 400,
      message: "Missing email or roles array"
    });
  }
  
  const db = await getDB();
  const users = db.collection("users");
  
  const result = await users.updateOne(
    { email: email.toLowerCase() },
    {
      $set: {
        roles: roles,
        updatedAt: Date.now()
      }
    }
  );
  
  if (result.matchedCount === 0) {
    throw createError({
      statusCode: 404,
      message: `User with email ${email} not found`
    });
  }
  
  const updatedUser = await users.findOne({ email: email.toLowerCase() });
  
  return {
    ok: true,
    message: `Updated roles for ${email}`,
    user: {
      email: updatedUser!.email,
      roles: updatedUser!.roles
    }
  };
});

