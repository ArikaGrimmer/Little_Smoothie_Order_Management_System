import { getDB } from "../../../utils/mongo";
import { requireRole } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require operator role
  await requireRole(event, 'operator');

  const itemId = event.context.params?.itemId;

  if (!itemId) {
    throw createError({
      statusCode: 400,
      message: "Missing itemId"
    });
  }

  const db = await getDB();
  
  const result = await db.collection("menu_items").deleteOne({ id: itemId });

  if (result.deletedCount === 0) {
    throw createError({
      statusCode: 404,
      message: "Menu item not found"
    });
  }

  return {
    ok: true,
    message: "Menu item deleted successfully"
  };
});

