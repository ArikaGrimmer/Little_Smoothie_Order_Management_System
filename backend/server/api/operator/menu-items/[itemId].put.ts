import { getDB } from "../../../utils/mongo";
import { requireRole } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  // Require operator role
  await requireRole(event, 'operator');

  const itemId = event.context.params?.itemId;
  const body = await readBody(event);

  if (!itemId) {
    throw createError({
      statusCode: 400,
      message: "Missing itemId"
    });
  }

  const db = await getDB();
  
  // Build update object (only update provided fields)
  const updateFields: any = {};
  
  if (body.name !== undefined) updateFields.name = body.name;
  if (body.description !== undefined) updateFields.description = body.description;
  if (body.basePrice !== undefined) updateFields.basePrice = parseFloat(body.basePrice);
  if (body.category !== undefined) updateFields.category = body.category;
  if (body.image !== undefined) updateFields.image = body.image;
  if (body.ingredients !== undefined) updateFields.ingredients = body.ingredients;
  if (body.healthBenefits !== undefined) updateFields.healthBenefits = body.healthBenefits;
  if (body.isAvailable !== undefined) updateFields.isAvailable = body.isAvailable;
  if (body.isFeatured !== undefined) updateFields.isFeatured = body.isFeatured;
  if (body.allergens !== undefined) updateFields.allergens = body.allergens;
  if (body.nutritionInfo !== undefined) updateFields.nutritionInfo = body.nutritionInfo;
  
  updateFields.updatedAt = Date.now();

  const result = await db.collection("menu_items").updateOne(
    { id: itemId },
    { $set: updateFields }
  );

  if (result.matchedCount === 0) {
    throw createError({
      statusCode: 404,
      message: "Menu item not found"
    });
  }

  const updatedItem = await db.collection("menu_items").findOne({ id: itemId });

  return {
    ok: true,
    item: updatedItem
  };
});

