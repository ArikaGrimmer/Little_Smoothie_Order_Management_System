import { getDB } from "../../../utils/mongo";
import { ObjectId } from "mongodb";
import { requireAuth, getUserId } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const customerId = getUserId(session);
  const requestedCustomerId = event.context.params?.customerId;

  // Users can only access their own draft orders
  if (customerId !== requestedCustomerId) {
    throw createError({
      statusCode: 403,
      message: "Access denied"
    });
  }

  const db = await getDB();


  const draftOrder = await db.collection("orders").findOne({
    customerId: customerId,
    status: "draft"
  });

  if (!draftOrder) {
    return { order: null };
  }


  return {
    order: {
      id: draftOrder._id.toString(),
      ...draftOrder
    }
  };
});
