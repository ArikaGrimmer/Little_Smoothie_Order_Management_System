import { getDB, getMongoClient } from '../utils/mongo';
import { requireAuth } from "../utils/auth";

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event);
  const db = await getDB();

  // Step 1: Access collections
  const basesCol = db.collection("smoothie_bases");
  const fruitsCol = db.collection("smoothie_fruits");
  const sizesCol = db.collection("smoothie_sizes");

  // Step 2: Fetch menu items
  // Try to read all three collections inside a transaction (snapshot) so the client
  // receives a consistent view across collections. If transactions are not
  // available (single-node/local) or the transaction fails, fall back to
  // independent reads for compatibility.
  const client = await getMongoClient();
  const session = client.startSession();
  let bases: any[] = [];
  let fruits: any[] = [];
  let sizes: any[] = [];
  try {
    try {
      session.startTransaction({ readConcern: { level: 'snapshot' } as any });
      bases = await basesCol.find({}, { session }).toArray();
      fruits = await fruitsCol.find({}, { session }).toArray();
      sizes = await sizesCol.find({}, { session }).toArray();
      await session.commitTransaction();
    } catch (txErr) {
      // Transaction failed - abort and fallback
      try { await session.abortTransaction(); } catch (e) { /* ignore */ }
      console.warn('[menu.get] transaction failed or not supported, falling back to independent reads', txErr);
      bases = await basesCol.find({}).toArray();
      fruits = await fruitsCol.find({}).toArray();
      sizes = await sizesCol.find({}).toArray();
    }
  } finally {
    session.endSession();
  }

  // Step 3: Return menu in clean format
  return {
    ok: true,
    bases,
    fruits,
    sizes
  };
});
