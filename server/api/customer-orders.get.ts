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

  const customerId = (session.user as any).email || (session.user as any).id

  const db = await getDB();

  // Fetch all orders for this customer (excluding drafts)
  const orders = await db.collection("orders")
    .find({ 
      customerId: customerId,
      status: { $ne: "draft" }
    })
    .sort({ createdAt: -1 })
    .toArray();

  return orders.map(order => ({
    id: order._id.toString(),
    ...order
  }));
});

