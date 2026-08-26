import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { Db } from "mongodb";
import client, { getDb, MONGODB_URI, DB_NAME, COLLECTION_NAME } from "./lib/mongodb.ts";
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

let cachedDb: Db | null = null;

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
  try {
    const db = await getDb();
    cachedDb = db;
    
    // Seed initial keys in background if needed
    migrateLocalDataToMongoDB(db).catch(err => {
      console.warn("[MongoDB] Initial sync background task:", err);
    });

    return cachedDb;
  } catch (err: any) {
    console.error("[MongoDB] Connection failed:", err?.message || err);
    cachedDb = null;
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

// Health & Detailed Database Status Endpoint
const handleHealth = async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  let dbStatus = "disconnected";
  let docsCount = 0;
  let sampleKeys: string[] = [];
  let pingMs = 0;

  try {
    const db = await getMongoDB();
    if (db) {
      await db.command({ ping: 1 });
      pingMs = Date.now() - startTime;
      dbStatus = `connected (${DB_NAME})`;
      const col = db.collection(COLLECTION_NAME);
      docsCount = await col.countDocuments();
      const docs = await col.find({}, { projection: { key: 1, _id: 0 } }).toArray();
      sampleKeys = docs.map((d: any) => d.key);
    }
  } catch (e: any) {
    dbStatus = `error: ${e?.message || 'ping failed'}`;
  }

  // Safely mask connection string password for security
  const maskedUri = MONGODB_URI.replace(/\/\/(.*?):(.*?)@/, '//***:***@');

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(), 
    database: `MongoDB Atlas (${DB_NAME})`,
    collection: COLLECTION_NAME,
    cluster: "db-compro.orkvkuj.mongodb.net",
    pingLatencyMs: pingMs,
    documentsCount: docsCount,
    keysCount: sampleKeys.length,
    keys: sampleKeys,
    dbStatus,
    environment: {
      isVercel: Boolean(process.env.VERCEL),
      nodeEnv: process.env.NODE_ENV || 'development',
      mongodbUriConfigured: Boolean(process.env.MONGODB_URI),
      databaseName: DB_NAME,
      collectionName: COLLECTION_NAME,
      maskedConnectionUri: maskedUri
    }
  });
};

app.get("/api/health", handleHealth);
app.get("/health", handleHealth);
app.get("/api/db-status", handleHealth);
app.get("/db-status", handleHealth);

// Interactive Read-Write-Delete Test Endpoint for Vercel/MongoDB
app.post("/api/db-test", async (req: express.Request, res: express.Response) => {
  const testKey = `_test_ping_${Date.now()}`;
  const testPayload = { test: true, timestamp: new Date().toISOString() };
  try {
    const db = await getMongoDB();
    if (!db) {
      return res.status(503).json({ success: false, error: "MongoDB not connected" });
    }
    const collection = db.collection(COLLECTION_NAME);
    
    // 1. Test Write
    const t0 = Date.now();
    await collection.updateOne({ key: testKey }, { $set: { key: testKey, value: testPayload } }, { upsert: true });
    const writeMs = Date.now() - t0;

    // 2. Test Read
    const t1 = Date.now();
    const doc = await collection.findOne({ key: testKey });
    const readMs = Date.now() - t1;

    // 3. Test Clean-up
    await collection.deleteOne({ key: testKey });

    res.json({
      success: true,
      message: "Operasi Tulis, Baca, dan Hapus pada MongoDB Atlas berhasil 100%!",
      database: DB_NAME,
      collection: COLLECTION_NAME,
      latency: {
        writeMs,
        readMs,
        totalMs: writeMs + readMs
      },
      verifiedData: doc?.value
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Database test failed' });
  }
});

// Get all stored keys/data
const handleGetData = async (req: express.Request, res: express.Response) => {
  try {
    let result: Record<string, any> = { ...safeReadLocalCache() };

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

