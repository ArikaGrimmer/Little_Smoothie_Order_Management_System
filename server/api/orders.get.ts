import { getDB } from "../utils/mongo";

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

  // Fetch all non-draft orders (for display on public/operator pages)
  const orders = await db.collection("orders")
    .find({ status: { $ne: "draft" } })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return orders.map(order => ({
    id: order._id.toString(),
    ...order
  }));
});

