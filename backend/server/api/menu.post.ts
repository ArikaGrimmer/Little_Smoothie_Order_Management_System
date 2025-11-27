import { getDB } from '../utils/mongo';

function getCollectionName(category: string | undefined) {
  switch (category) {
    case 'bases': return 'smoothie_bases';
    case 'fruits': return 'smoothie_fruits';
    case 'sizes': return 'smoothie_sizes';
    default: return null;
  }
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const category = body?.category as string | undefined;
  const item = body?.item as Record<string, any> | undefined;

  if (!category || !item) {
    event.node.res.statusCode = 400;
    return { ok: false, error: 'missing category or item' };
  }

  const colName = getCollectionName(category);
  if (!colName) {
    event.node.res.statusCode = 400;
    return { ok: false, error: 'invalid category' };
  }

  const db = await getDB();
  const col = db.collection(colName);

  const doc = { ...item };
  if (!doc.id) doc.id = genId();

  await col.insertOne(doc);
  return { ok: true, item: doc };
});
