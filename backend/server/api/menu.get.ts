import { getDB } from "../utils/mongo";

export default defineEventHandler(async () => {
  const db = await getDB();

  // Step 1: Access collections
  const basesCol = db.collection("smoothie_bases");
  const fruitsCol = db.collection("smoothie_fruits");
  const sizesCol = db.collection("smoothie_sizes");

  // Step 2: Fetch menu items
  const bases = await basesCol.find({}).toArray();
  const fruits = await fruitsCol.find({}).toArray();
  const sizes = await sizesCol.find({}).toArray();

  // Step 3: Return menu in clean format
  return {
    ok: true,
    bases,
    fruits,
    sizes
  };
});
