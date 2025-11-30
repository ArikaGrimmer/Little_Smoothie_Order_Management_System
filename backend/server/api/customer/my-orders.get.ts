import { getDB } from "../../utils/mongo";
import { requireAuth, getUserId } from "../../utils/auth";

/**
 * Get all orders for the authenticated user
 * Customers can view their own order history
 */
export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const userId = getUserId(session);

  const db = await getDB();
  const orders = db.collection("orders");

  // Get all orders for this user (excluding draft)
  const userOrders = await orders
    .find({ 
      customerId: userId,
      status: { $ne: "draft" } // Exclude draft orders
    })
    .sort({ submittedAt: -1 }) // Newest first
    .toArray();

  // Convert ObjectId to string
  const result = userOrders.map(order => ({
    id: order._id.toString(),
    ...order
  }));

  return {
    ok: true,
    orders: result,
    count: result.length
  };
});

