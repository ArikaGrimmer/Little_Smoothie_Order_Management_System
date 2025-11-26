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
  
  const bases = await db.collection("smoothie_bases").find().toArray();

  return bases.map(base => ({
    id: base.id,
    name: base.name,
    price: base.price
  }));
});

