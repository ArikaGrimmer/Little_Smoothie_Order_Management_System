import { getDB } from "../../../utils/mongo";
import { requireAuth, getUserId } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const customerId = getUserId(session);
  const requestedCustomerId = event.context.params?.customerId;

  // Users can only submit their own draft orders
  if (customerId !== requestedCustomerId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied"
    });
  }

  const db = await getDB();
  const orders = db.collection("orders");

  // Step 1: Find the draft order for this customer
  const draft = await orders.findOne({
    customerId,
    status: "draft"
  });

  // If no draft exists, cannot submit
  if (!draft) {
    throw createError({
      statusCode: 400,
      statusMessage: "No draft order found for this customer"
    });
  }

  // Step 2: Validate basic required fields
  if (!draft.baseId || !draft.sizeId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Draft order is incomplete"
    });
  }

  if (!draft.price || draft.price <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Price not calculated for draft order"
    });
  }

  // Step 3: Update the draft to queued
  const now = Date.now();

  await orders.updateOne(
    { _id: draft._id },
    {
      $set: {
        status: "queued",
        updatedAt: now,
        submittedAt: now  // optional but useful
      }
    }
  );

  // Step 4: Fetch updated order
  const queuedOrder = await orders.findOne({ _id: draft._id });

  return {
    ok: true,
    order: {
      id: queuedOrder!._id.toString(),
      ...queuedOrder
    }
  };
});
