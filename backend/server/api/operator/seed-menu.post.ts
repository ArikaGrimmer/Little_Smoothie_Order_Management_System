import { getDB } from "../../utils/mongo";
import { requireRole } from "../../utils/auth";
import { smoothieItems } from "../../utils/seedMenuItems";

export default defineEventHandler(async (event) => {
  // Require operator role
  await requireRole(event, 'operator');

  const db = await getDB();
  const menuItemsCol = db.collection("menu_items");

  // Clear existing items
  await menuItemsCol.deleteMany({});

  // Insert new items
  await menuItemsCol.insertMany(smoothieItems);

  return {
    ok: true,
    message: `Successfully seeded ${smoothieItems.length} menu items`,
    count: smoothieItems.length
  };
});

