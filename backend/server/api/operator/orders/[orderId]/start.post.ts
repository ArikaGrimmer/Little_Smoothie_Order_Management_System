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

  // Step 2: Ensure the order is in 'queued' state
  if (order.status !== "queued") {
    throw createError({
      statusCode: 400,
      statusMessage: "Order is not in queued state"
    });
  }

  // Step 3: Update status to blending
  const now = Date.now();

  await orders.updateOne(
    { _id: order._id },
    {
      $set: {
        status: "blending",
        updatedAt: now,
        startedAt: now
      }
    }
  );

  // Step 4: Fetch updated order
  const updated = await orders.findOne({ _id: order._id });

  return {
    ok: true,
    order: {
      id: updated!._id.toString(),
      ...updated
    }
  };
});
