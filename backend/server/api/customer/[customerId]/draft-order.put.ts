import { getDB } from "../../../utils/mongo";
import { requireAuth, getUserId } from "../../../utils/auth";

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const customerId = getUserId(session);
  const requestedCustomerId = event.context.params?.customerId;
  const body = await readBody(event);

  // Users can only update their own draft orders
  if (customerId !== requestedCustomerId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied",
    });
  }

  // Extract fields from client request
  const {
    baseId,
    fruitIds = [],
    sweetness,
    iceLevel,
    sizeId,
    extraNote = "",
    menuItemId,
    menuItemName,
    basePrice,
    calculatedPrice
  } = body;

  // Basic validation
  if (!sizeId) {
    throw createError({
      statusCode: 400,
      statusMessage: "sizeId is required"
    });
  }

  // If menu item is selected, baseId is optional
  if (!menuItemId && !baseId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Either menuItemId or baseId is required"
    });
  }

  const db = await getDB();

  let price = 0;
  let finalBasePrice = 0;

  // If menu item is selected, use its basePrice
  if (menuItemId && basePrice) {
    finalBasePrice = basePrice;
    
    // Fetch size and fruits to calculate total price
    const sizesCol = db.collection("smoothie_sizes");
    const fruitsCol = db.collection("smoothie_fruits");
    
    const size = await sizesCol.findOne({ id: sizeId });
    if (!size) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid sizeId"
      });
    }

    const fruits = await fruitsCol
      .find({ id: { $in: fruitIds } })
      .toArray();

    const fruitCost = fruits.reduce((sum, f) => sum + (f.extraPrice || 0), 0);
    price = Number(((finalBasePrice + fruitCost) * size.multiplier).toFixed(2));
  } else {
    // Use old menu system (bases)
    const basesCol = db.collection("smoothie_bases");
    const fruitsCol = db.collection("smoothie_fruits");
    const sizesCol = db.collection("smoothie_sizes");

    const base = await basesCol.findOne({ id: baseId });
    if (!base) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid baseId"
      });
    }

    const size = await sizesCol.findOne({ id: sizeId });
    if (!size) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid sizeId"
      });
    }

    const fruits = await fruitsCol
      .find({ id: { $in: fruitIds } })
      .toArray();

    finalBasePrice = base.price;
    const fruitCost = fruits.reduce((sum, f) => sum + (f.extraPrice || 0), 0);
    price = Number(((finalBasePrice + fruitCost) * size.multiplier).toFixed(2));
  }

  // Use calculated price from client if provided (more accurate)
  if (calculatedPrice && calculatedPrice > 0) {
    price = Number(calculatedPrice.toFixed(2));
  }

  // Prepare upsert data
  const now = Date.now();

  const updateDoc: any = {
    $set: {
      customerId,
      fruitIds,
      sweetness,
      iceLevel,
      sizeId,
      extraNote,
      price,
      updatedAt: now,
      status: "draft"
    },
    $setOnInsert: {
      createdAt: now
    }
  };

  // Add menu item info if available
  if (menuItemId) {
    updateDoc.$set.menuItemId = menuItemId;
    updateDoc.$set.menuItemName = menuItemName || null;
    updateDoc.$set.basePrice = basePrice || finalBasePrice;
  } else {
    updateDoc.$set.baseId = baseId;
  }

  // Perform atomic upsert
  await db.collection("orders").updateOne(
  { customerId, status: "draft" },
  updateDoc,
  { upsert: true }
);

  const updatedOrder = await db.collection("orders").findOne({
  customerId,
  status: "draft"
});

  return {
  ok: true,
  order: {
    id: updatedOrder._id.toString(),
    ...updatedOrder
  }
};
});
