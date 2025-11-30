import { getDB } from '../utils/mongo';

function getCollectionName(category: string | undefined) {
  switch (category) {
    case 'bases': return 'smoothie_bases';
    case 'fruits': return 'smoothie_fruits';
    case 'sizes': return 'smoothie_sizes';
    default: return null;
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const category = body?.category as string | undefined;
  const id = body?.id as string | undefined;
  const updates = body?.updates as Record<string, any> | undefined;
  const expectedVersion = body?.expectedVersion as number | undefined;

  if (!category || !id || !updates) {
    event.node.res.statusCode = 400;
    return { ok: false, error: 'missing category/id/updates' };
  }

  const colName = getCollectionName(category);
  if (!colName) {
    event.node.res.statusCode = 400;
    return { ok: false, error: 'invalid category' };
  }

  const db = await getDB();
  const col = db.collection(colName);

  // Build filter - if client provided an expectedVersion, require it
  const filter: any = { id };
  if (typeof expectedVersion === 'number') filter.version = expectedVersion;

  // Update: set requested fields, bump version, update timestamp
  const updateOps: any = {
    $set: { ...updates, updatedAt: new Date() },
    $inc: { version: 1 }
  };

  const result = await col.findOneAndUpdate(filter, updateOps, { returnDocument: 'after' as any });
  if (!result || !result.value) {
    // If version check was requested, return 409 and include current doc to let client reconcile
    if (typeof expectedVersion === 'number') {
      const current = await col.findOne({ id });
      event.node.res.statusCode = 409;
      return { ok: false, error: 'version_conflict', current };
    }
    // otherwise treat as not found
    event.node.res.statusCode = 404;
    return { ok: false, error: 'not found' };
  }
  return { ok: true, item: result.value };
});
