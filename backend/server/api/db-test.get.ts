import { getDB } from "../utils/mongo";

export default defineEventHandler(async () => {
  const db = await getDB();
  const collections = await db.listCollections().toArray();

  return {
    ok: true,
    collections: collections.map(c => c.name)
  };
});
