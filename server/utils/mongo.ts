import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoClient() {
  if (client) return client;

  const config = useRuntimeConfig();
  const mongoUrl = config.mongoUrl;

  if (!mongoUrl) {
    throw new Error("Missing MONGO_URL in runtimeConfig");
  }

  client = new MongoClient(mongoUrl);
  await client.connect();
  console.log("[MongoDB] Connected:", mongoUrl);

  return client;
}

export async function getDB() {
  if (db) return db;

  const client = await getMongoClient();

  // default database is the one in your connection string
  db = client.db();
  return db;
}
