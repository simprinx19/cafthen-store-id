import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';

// Support db_MONGODB_URI (Vercel MongoDB integration), MONGODB_URI, and DATABASE_URL
const DEFAULT_MONGODB_URI = "mongodb+srv://Vercel-Admin-db_compro:A4UTfZd22cX8a9l7@db-compro.orkvkuj.mongodb.net/?retryWrites=true&w=majority";

let uri = process.env.db_MONGODB_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || DEFAULT_MONGODB_URI;

if (!uri || uri.includes("atlas-lime-horizon") || (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))) {
  uri = DEFAULT_MONGODB_URI;
}

export const MONGODB_URI = uri;
export const DB_NAME = process.env.MONGODB_DB_NAME || process.env.DB_NAME || "db-compro";
export const COLLECTION_NAME = process.env.MONGODB_COLLECTION || process.env.COLLECTION_NAME || "app_storage";

const options: MongoClientOptions = {
  appName: "devrel.vercel.integration",
  maxIdleTimeMS: 5000,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoClient?: MongoClient;
};

function getClientPromise(): Promise<MongoClient> {
  if (globalWithMongo._mongoClientPromise) {
    return globalWithMongo._mongoClientPromise;
  }

  const client = new MongoClient(uri, options);
  try {
    if (typeof attachDatabasePool === 'function') {
      attachDatabasePool(client);
    }
  } catch {
    // ignore if not running in vercel runtime
  }

  globalWithMongo._mongoClient = client;
  globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
    // Clear cached promise on failure so subsequent invocations can retry fresh
    globalWithMongo._mongoClientPromise = undefined;
    throw err;
  });

  return globalWithMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const connectedClient = await getClientPromise();
  return connectedClient.db(DB_NAME);
}

export const clientPromise = getClientPromise();
export default globalWithMongo._mongoClient || new MongoClient(uri, options);

