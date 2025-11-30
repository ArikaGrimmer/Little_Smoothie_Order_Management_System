import { getDB } from "../../../../utils/mongo";
import { ObjectId } from "mongodb";
import { requireRole } from "../../../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require operator role
  await requireRole(event, 'operator');

  const orderId = event.context.params?.orderId;

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing orderId"
    });
  }

  const db = await getDB();
  const orders = db.collection("orders");

  // Step 1: Fetch the order
  const order = await orders.findOne({ _id: new ObjectId(orderId) });

  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: "Order not found"
    });
  }

  // Step 2: Ensure order is currently in 'blending'
  if (order.status !== "blending") {
    throw createError({
      statusCode: 400,
      statusMessage: "Order is not in blending state"
    });
  }

  // Step 3: Update to ready
  const now = Date.now();

  await orders.updateOne(
    { _id: order._id },
    {
      $set: {
        status: "ready",
        updatedAt: now,
        finishedAt: now
      }
    }
  );

  // Step 4: Fetch updated document
  const updated = await orders.findOne({ _id: order._id });

  return {
    ok: true,
    order: {
      id: updated!._id.toString(),
      ...updated
    }
  };
});
