import { getDB } from "../../../utils/mongo";
import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const customerId = event.context.params?.customerId;

  if (!customerId) {
    throw createError({
      statusCode: 400,
      message: "Missing customerId"
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
