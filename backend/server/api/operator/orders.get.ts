import { getDB } from "../../utils/mongo";
import { requireRole } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require operator role
  await requireRole(event, 'operator');
  const db = await getDB();
  const orders = db.collection("orders");

  // Query all queued orders
  const queuedOrders = await orders
    .find({ status: "queued" })
    .sort({ submittedAt: 1 })  // oldest first
    .toArray();

  // Convert ObjectId to string and return clean objects
  const result = queuedOrders.map(order => ({
    id: order._id.toString(),
    ...order
  }));

  return {
    ok: true,
    orders: result
  };
});
