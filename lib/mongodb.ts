import mongodb from 'mongodb';
import type { MongoClientOptions, Db, MongoClient } from 'mongodb';
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
  maxIdleTimeMS: 5000
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
    _mongoClient?: MongoClient;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new mongodb.MongoClient(uri, options);
    try {
      attachDatabasePool(client);
    } catch {
      // ignore if not running in vercel runtime
    }
    globalWithMongo._mongoClient = client;
    globalWithMongo._mongoClientPromise = client.connect();
  }
  client = globalWithMongo._mongoClient!;
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new mongodb.MongoClient(uri, options);
  try {
    attachDatabasePool(client);
  } catch {
    // ignore if not running in vercel runtime
  }
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(DB_NAME);
}

export { client, clientPromise };
export default client;
