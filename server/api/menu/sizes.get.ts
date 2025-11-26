import { getDB } from "../../utils/mongo";

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const db = await getDB();
  
  const sizes = await db.collection("smoothie_sizes").find().toArray();

  return sizes.map(size => ({
    id: size.id,
    name: size.name,
    multiplier: size.multiplier
  }));
});

