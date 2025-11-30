import { getDB } from "../../utils/mongo";
import { requireRole } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require operator role
  await requireRole(event, 'operator');

  const body = await readBody(event);
  
  // Validate required fields
  if (!body.name || !body.description || !body.basePrice) {
    throw createError({
      statusCode: 400,
      message: "Missing required fields: name, description, basePrice"
    });
  }

  const db = await getDB();
  
  // Generate unique ID
  const id = `smoothie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newItem = {
    id,
    name: body.name,
    description: body.description,
    basePrice: parseFloat(body.basePrice),
    category: body.category || "custom",
    image: body.image || "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop",
    ingredients: body.ingredients || [],
    healthBenefits: body.healthBenefits || [],
    isAvailable: body.isAvailable !== false,
    isFeatured: body.isFeatured || false,
    allergens: body.allergens || [],
    nutritionInfo: body.nutritionInfo || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    createdAt: Date.now()
  };

  await db.collection("menu_items").insertOne(newItem);

  return {
    ok: true,
    item: newItem
  };
});

