import { getDB } from "../../utils/mongo";
import { requireRole } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require operator role
  await requireRole(event, 'operator');
  const db = await getDB();
  const orders = db.collection("orders");

  // Query all active orders (queued, blending, ready)
  // Exclude draft and picked_up orders
  const allOrders = await orders
    .find({ 
      status: { $in: ["queued", "blending", "ready"] }
    })
    .sort({ submittedAt: 1 })  // oldest first
    .toArray();

  // Convert ObjectId to string and return clean objects
  const result = allOrders.map(order => ({
    id: order._id.toString(),
    ...order
  }));

  return {
    ok: true,
    orders: result
  };
});
