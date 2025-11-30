import { getDB } from "../../utils/mongo";
import { requireAuth } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event);

  const itemId = event.context.params?.itemId;

  if (!itemId) {
    throw createError({
      statusCode: 400,
      message: "Missing itemId"
    });
  }

  const db = await getDB();
  const menuItem = await db.collection("menu_items").findOne({ id: itemId });

  if (!menuItem) {
    throw createError({
      statusCode: 404,
      message: "Menu item not found"
    });
  }

  return {
    ok: true,
    item: menuItem
  };
});

