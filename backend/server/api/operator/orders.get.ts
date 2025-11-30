import { getDB } from "../../utils/mongo";
import { requireRole } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require operator role
  await requireRole(event, 'operator');
  const db = await getDB();
  const orders = db.collection("orders");
  const users = db.collection("users");

  // Query all active orders (queued, blending, ready)
  // Exclude draft and picked_up orders
  const allOrders = await orders
    .find({ 
      status: { $in: ["queued", "blending", "ready"] }
    })
    .sort({ submittedAt: 1 })  // oldest first
    .toArray();

  // Helper function to get base name (fallback if menu item not available)
  const getBaseName = (baseId: string | undefined): string => {
    if (!baseId) return 'Custom';
    // This is a fallback - in practice, you might want to fetch from menu
    return 'Custom Base';
  };

  // Fetch customer information for each order
  const result = await Promise.all(
    allOrders.map(async (order) => {
      let customerName = 'Unknown Customer';
      
      // Try to get customer name from users collection
      if (order.customerId) {
        const customer = await users.findOne({ id: order.customerId });
        if (customer) {
          customerName = customer.name || customer.email || 'Unknown Customer';
        }
      }

      return {
        id: order._id.toString(),
        ...order,
        customerName,
        // menuItemName is already in the order if it was ordered from menu
        drinkName: order.menuItemName || (order.baseId ? `${getBaseName(order.baseId)} Smoothie` : 'Custom Smoothie')
      };
    })
  );

  return {
    ok: true,
    orders: result
  };
});
