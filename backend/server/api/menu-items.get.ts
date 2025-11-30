import { getDB } from "../utils/mongo";
import { requireAuth } from "../utils/auth";

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event);

  const db = await getDB();
  const query = getQuery(event);
  
  const filter: any = {};
  
  // Filter by availability if requested
  if (query.available === 'true') {
    filter.isAvailable = true;
  }
  
  // Filter by category if provided
  if (query.category) {
    filter.category = query.category;
  }
  
  // Filter by featured if requested
  if (query.featured === 'true') {
    filter.isFeatured = true;
  }

  const menuItems = await db.collection("menu_items")
    .find(filter)
    .toArray();

  return {
    ok: true,
    items: menuItems
  };
});

