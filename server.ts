import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { MongoClient, Db } from "mongodb";
import * as mockData from "./src/mockData.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(process.cwd(), 'data.json');

// In-Memory & Safe File Caching for Read-Only Environments (Vercel Serverless)
let inMemoryCache: Record<string, any> = {};

function safeWriteLocalCache(data: Record<string, any>) {
  inMemoryCache = { ...inMemoryCache, ...data };
  try {
    const targetFile = process.env.VERCEL ? path.join('/tmp', 'data.json') : DATA_FILE;
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Ignore read-only filesystem errors; MongoDB is primary persistent storage
  }
}

function safeReadLocalCache(): Record<string, any> {
  try {
    const targetFile = process.env.VERCEL ? path.join('/tmp', 'data.json') : DATA_FILE;
    if (fs.existsSync(targetFile)) {
      const raw = fs.readFileSync(targetFile, 'utf-8');
      return JSON.parse(raw || '{}');
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw || '{}');
    }
  } catch (err) {
    // Fallback to in-memory cache
  }
  return inMemoryCache;
}

// MongoDB Atlas Configuration
let MONGODB_URI = "mongodb+srv://Vercel-Admin-db_compro:A4UTfZd22cX8a9l7@db-compro.orkvkuj.mongodb.net/?retryWrites=true&w=majority";
if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("atlas-lime-horizon")) {
  MONGODB_URI = process.env.MONGODB_URI;
}
const DB_NAME = "db-compro";
const COLLECTION_NAME = "app_storage";

let cachedDb: Db | null = null;
let mongoClientPromise: Promise<MongoClient> | null = null;

// Complete map of all expected application keys with their default mock data fallbacks
const INITIAL_VALUES_MAP: Record<string, any> = {
  cafthen_company_profile: mockData.INITIAL_COMPANY_PROFILE,
  cafthen_products: mockData.INITIAL_PRODUCTS,
  cafthen_team_members: mockData.INITIAL_TEAM_MEMBERS,
  cafthen_activities: mockData.INITIAL_ACTIVITY_PHOTOS,
  cafthen_users: mockData.INITIAL_USERS,
  cafthen_orders: mockData.INITIAL_ORDERS,
  cafthen_expenses: mockData.INITIAL_EXPENSES,
  cafthen_messages: mockData.INITIAL_MESSAGES,
  cafthen_notifications: mockData.INITIAL_NOTIFICATIONS,
  cafthen_payment_settings: mockData.INITIAL_PAYMENT_SETTINGS,
  cafthen_theme_settings: mockData.INITIAL_THEME_SETTINGS,
  cafthen_exchange_rate: 17685,
};

async function migrateLocalDataToMongoDB(db: Db) {
  try {
    const collection = db.collection(COLLECTION_NAME);
    const localData = safeReadLocalCache();

    console.log(`[MongoDB] Verifying database "${DB_NAME}" collection "${COLLECTION_NAME}" records...`);
    let seedCount = 0;

    for (const [key, defaultValue] of Object.entries(INITIAL_VALUES_MAP)) {
      const existsInDb = await collection.findOne({ key });
      
      if (!existsInDb) {
        // Key is missing from MongoDB - seed it immediately
        const valueToSave = localData[key] !== undefined ? localData[key] : defaultValue;
        
        await collection.updateOne(
          { key },
          { $set: { key, value: valueToSave, updatedAt: new Date() } },
          { upsert: true }
        );
        
        localData[key] = valueToSave;
        seedCount++;
      } else {
        localData[key] = existsInDb.value;
      }
    }

    safeWriteLocalCache(localData);

    if (seedCount > 0) {
      console.log(`[MongoDB] Initialized & seeded ${seedCount} missing keys into MongoDB Atlas "${DB_NAME}".`);
    } else {
      console.log(`[MongoDB] All data keys are fully populated in MongoDB Atlas "${DB_NAME}".`);
    }
  } catch (error) {
    console.error("[MongoDB] Seeding notice:", error);
  }
}

async function getMongoDB(): Promise<Db | null> {
  if (cachedDb) return cachedDb;
  if (!MONGODB_URI || (!MONGODB_URI.startsWith("mongodb://") && !MONGODB_URI.startsWith("mongodb+srv://"))) {
    console.warn("[MongoDB] MONGODB_URI is not configured or is invalid.");
    return null;
  }
  try {
    if (!mongoClientPromise) {
      console.log(`[MongoDB] Connecting to MongoDB Atlas cluster (Database: ${DB_NAME})...`);
      const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
      });
      mongoClientPromise = client.connect().catch(err => {
        mongoClientPromise = null;
        cachedDb = null;
        throw err;
      });
    }
    
    const client = await mongoClientPromise;
    const db = client.db(DB_NAME);
    cachedDb = db;
    
    // Seed initial keys in background if needed
    migrateLocalDataToMongoDB(db).catch(err => {
      console.warn("[MongoDB] Initial sync background task:", err);
    });

    return cachedDb;
  } catch (err: any) {
    console.error("[MongoDB] Connection failed:", err?.message || err);
    cachedDb = null;
    mongoClientPromise = null;
    return null;
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS and disable all caching for real-time synchronization
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires");
  res.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  res.header("Surrogate-Control", "no-store");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Health check endpoint
const handleHealth = async (req: express.Request, res: express.Response) => {
  let dbStatus = "disconnected";
  let docsCount = 0;
  let sampleKeys: string[] = [];
  try {
    const db = await getMongoDB();
    if (db) {
      await db.command({ ping: 1 });
      dbStatus = `connected (${DB_NAME})`;
      const col = db.collection(COLLECTION_NAME);
      docsCount = await col.countDocuments();
      const docs = await col.find({}, { projection: { key: 1, _id: 0 } }).toArray();
      sampleKeys = docs.map((d: any) => d.key);
    }
  } catch (e: any) {
    dbStatus = `error: ${e?.message || 'ping failed'}`;
  }

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(), 
    database: `MongoDB Atlas (${DB_NAME})`,
    collection: COLLECTION_NAME,
    documentsCount: docsCount,
    keys: sampleKeys,
    dbStatus 
  });
};

app.get("/api/health", handleHealth);
app.get("/health", handleHealth);

// Get all stored keys/data
const handleGetData = async (req: express.Request, res: express.Response) => {
  try {
    let result: Record<string, any> = {};

    // 1. Fetch all keys from MongoDB Atlas
    const db = await getMongoDB();
    if (db) {
      const collection = db.collection(COLLECTION_NAME);
      const docs = await collection.find({}).toArray();
      if (docs && docs.length > 0) {
        docs.forEach((doc: any) => {
          if (doc.key) {
            result[doc.key] = doc.value;
          }
        });
      }
    } else {
      // Fallback to local/in-memory cache only if MongoDB is offline
      result = safeReadLocalCache();
    }

    // 2. Ensure all expected application keys are present by filling in any missing keys with defaults
    let missingKeysToSeed: Record<string, any> = {};
    for (const [key, defaultValue] of Object.entries(INITIAL_VALUES_MAP)) {
      if (result[key] === undefined) {
        result[key] = defaultValue;
        missingKeysToSeed[key] = defaultValue;
      }
    }

    // 3. If missing keys were found, seed them to MongoDB in background
    if (db && Object.keys(missingKeysToSeed).length > 0) {
      const collection = db.collection(COLLECTION_NAME);
      const bulkOps = Object.entries(missingKeysToSeed).map(([k, v]) => ({
        updateOne: {
          filter: { key: k },
          update: { $set: { key: k, value: v, updatedAt: new Date() } },
          upsert: true
        }
      }));
      collection.bulkWrite(bulkOps).catch(err => {
        console.warn("[MongoDB] Background seeding error:", err);
      });
    }

    // 4. Update local safe cache
    safeWriteLocalCache(result);

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.json(result);
  } catch (err: any) {
    console.error("Error reading data:", err);
    const fallback = safeReadLocalCache();
    res.json(fallback);
  }
};

app.get("/api/data", handleGetData);
app.get("/data", handleGetData);

// Save/Update specific key or full state
const handlePostData = async (req: express.Request, res: express.Response) => {
  try {
    const { key, value } = req.body;
    let localData = safeReadLocalCache();

    if (key) {
      localData[key] = value;
    } else if (req.body && typeof req.body === 'object') {
      localData = { ...localData, ...req.body };
    }

    // Save to local safe cache immediately
    safeWriteLocalCache(localData);

    // Save to MongoDB Atlas collection
    let savedToDb = false;
    const db = await getMongoDB();
    if (db) {
      const collection = db.collection(COLLECTION_NAME);
      if (key) {
        await collection.updateOne(
          { key },
          { $set: { key, value, updatedAt: new Date() } },
          { upsert: true }
        );
        savedToDb = true;
      } else if (req.body && typeof req.body === 'object') {
        const bulkOps = Object.entries(req.body).map(([k, v]) => ({
          updateOne: {
            filter: { key: k },
            update: { $set: { key: k, value: v, updatedAt: new Date() } },
            upsert: true
          }
        }));
        if (bulkOps.length > 0) {
          await collection.bulkWrite(bulkOps);
          savedToDb = true;
        }
      }
    }

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json({ success: true, savedToDb, database: DB_NAME, data: localData });
  } catch (err: any) {
    console.error("Error writing data to MongoDB/Server:", err);
    res.status(500).json({ error: "Failed to save data", details: err?.message || err });
  }
};

app.post("/api/data", handlePostData);
app.post("/data", handlePostData);

// Safeguard: Catch-all for any unhandled /api/* requests to return JSON instead of HTML
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Static assets serving for production
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start listening immediately if not in Vercel Serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Optional Vite middleware for development mode
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then(vite => {
    app.use(vite.middlewares);
  }).catch(err => {
    console.warn("Vite dev server middleware warning:", err);
  });
}

export default app;

