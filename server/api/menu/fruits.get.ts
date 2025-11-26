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
  
  const fruits = await db.collection("smoothie_fruits").find().toArray();

  return fruits.map(fruit => ({
    id: fruit.id,
    name: fruit.name,
    extraPrice: fruit.extraPrice
  }));
});

