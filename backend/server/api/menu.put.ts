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

  const result = await col.findOneAndUpdate({ id }, { $set: updates }, { returnDocument: 'after' as any });
  if (!result || !result.value) {
    event.node.res.statusCode = 404;
    return { ok: false, error: 'not found' };
  }
  return { ok: true, item: result.value };
});
