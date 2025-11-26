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

  const customerId = (session.user as any).email || (session.user as any).id

  const db = await getDB();

  // Find the customer's draft order
  const draftOrder = await db.collection("orders").findOne({
    customerId: customerId,
    status: "draft"
  });

  if (!draftOrder) {
    throw createError({
      statusCode: 404,
      statusMessage: "No draft order found"
    });
  }

  // Update the order status to queued
  const result = await db.collection("orders").updateOne(
    { _id: draftOrder._id },
    { 
      $set: { 
        status: "queued",
        updatedAt: Date.now()
      } 
    }
  );

  if (result.modifiedCount === 0) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to submit order"
    });
  }

  const submittedOrder = await db.collection("orders").findOne({ _id: draftOrder._id });

  return {
    ok: true,
    order: {
      id: submittedOrder._id.toString(),
      ...submittedOrder
    }
  };
});

