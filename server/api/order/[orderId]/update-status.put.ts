import { getDB } from "../../../utils/mongo";
import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  // Require authentication and operator role
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Check if user has operator role
  if (!(session.user as any)?.roles?.includes('operator')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Operator role required'
    })
  }

  const orderId = event.context.params?.orderId;
  const body = await readBody(event);

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing orderId"
    });
  }

  const { status, operatorId } = body;

  if (!status) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing status"
    });
  }

  // Validate status
  const validStatuses = ['queued', 'blending', 'done'];
  if (!validStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid status"
    });
  }

  const db = await getDB();

  const updateDoc: any = {
    status: status,
    updatedAt: Date.now()
  };

  // If transitioning to blending, set the operator
  if (status === 'blending' && operatorId) {
    updateDoc.operatorId = operatorId;
  }

  const result = await db.collection("orders").updateOne(
    { _id: new ObjectId(orderId) },
    { $set: updateDoc }
  );

  if (result.matchedCount === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Order not found"
    });
  }

  const updatedOrder = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });

  return {
    ok: true,
    order: {
      id: updatedOrder._id.toString(),
      ...updatedOrder
    }
  };
});

