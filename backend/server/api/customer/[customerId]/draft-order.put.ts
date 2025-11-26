import { getDB } from "../../../utils/mongo";

export default defineEventHandler(async (event) => {
  const customerId = event.context.params?.customerId;
  const body = await readBody(event);

  if (!customerId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing customerId",
    });
  }

  // Extract fields from client request
  const {
    baseId,
    fruitIds = [],
    sweetness,
    iceLevel,
    sizeId,
    extraNote = ""
  } = body;

  // Basic validation
  if (!baseId || !sizeId) {
    throw createError({
      statusCode: 400,
      statusMessage: "baseId and sizeId are required"
    });
  }

  const db = await getDB();

  // Fetch menu data to calculate price
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

  // Calculate price
  const fruitCost = fruits.reduce((sum, f) => sum + (f.extraPrice || 0), 0);
  const price = Number(((base.price + fruitCost) * size.multiplier).toFixed(2));

  // Prepare upsert data
  const now = Date.now();

  const updateDoc = {
    $set: {
      customerId,
      baseId,
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
