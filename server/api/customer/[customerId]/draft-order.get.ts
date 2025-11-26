import { getDB } from "../../../utils/mongo";

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const customerId = event.context.params?.customerId;

  if (!customerId) {
    throw createError({
      statusCode: 400,
      message: "Missing customerId"
    });
  }

  // Verify the user is requesting their own draft order
  const userEmail = (session.user as any).email || (session.user as any).id
  if (customerId !== userEmail) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Cannot access another user\'s draft order'
    })
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
