import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { MongoClient, Db } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(process.cwd(), 'data.json');

if (!fs.existsSync(DATA_FILE)) {
  const initialData = {};
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
}

// MongoDB Atlas Configuration
// Cluster: atlas-lime-horizon (ID: 6a8de2f7929db3cd6d6a609b)
const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = "cafthen_db";
const COLLECTION_NAME = "app_storage";

let cachedDb: Db | null = null;
let mongoClient: MongoClient | null = null;
let mongoFailed = false;

async function getMongoDB(): Promise<Db | null> {
  if (cachedDb) return cachedDb;
  if (mongoFailed) return null;
  if (!MONGODB_URI || (!MONGODB_URI.startsWith("mongodb://") && !MONGODB_URI.startsWith("mongodb+srv://"))) {
    return null; // Not configured or placeholder/invalid URI yet
  }
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 2000,
      });
      await mongoClient.connect();
      console.log("Successfully connected to MongoDB Atlas cluster: atlas-lime-horizon (ID: 6a8de2f7929db3cd6d6a609b)");
    }
    cachedDb = mongoClient.db(DB_NAME);
    return cachedDb;
  } catch (err) {
    mongoFailed = true;
    console.warn("MongoDB Atlas connection unavailable (falling back to local cache):", (err as Error)?.message || err);
    return null;
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// API Routes for Cross-Device Data Synchronization & MongoDB Atlas Persistence
app.get("/api/health", async (req, res) => {
  let dbStatus = "disconnected";
  const db = await getMongoDB();
  if (db) {
    try {
      await db.command({ ping: 1 });
      dbStatus = "connected (atlas-lime-horizon)";
    } catch (e) {
      dbStatus = "ping failed";
    }
  }
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(), 
    database: "MongoDB Atlas (atlas-lime-horizon)",
    dbStatus 
  });
});

// Get all stored keys/data
app.get("/api/data", async (req, res) => {
  try {
    const db = await getMongoDB();
    if (db) {
      const collection = db.collection(COLLECTION_NAME);
      const docs = await collection.find({}).toArray();
      if (docs && docs.length > 0) {
        const result: Record<string, any> = {};
        docs.forEach(doc => {
          if (doc.key) {
            result[doc.key] = doc.value;
          }
        });
        return res.json(result);
      }
    }

    // Fallback to local data.json
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw || '{}');
      return res.json(data);
    }
    res.json({});
  } catch (err) {
    console.error("Error reading data:", err);
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return res.json(JSON.parse(raw || '{}'));
      }
    } catch (e) {}
    res.status(500).json({ error: "Failed to read data" });
  }
});

// Save/Update specific key or full state
app.post("/api/data", async (req, res) => {
  try {
    const { key, value } = req.body;
    let localData: Record<string, any> = {};

    if (fs.existsSync(DATA_FILE)) {
      try {
        localData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8') || '{}');
      } catch (e) {
        localData = {};
      }
    }

    if (key) {
      localData[key] = value;
    } else if (req.body && typeof req.body === 'object') {
      localData = { ...localData, ...req.body };
    }

    // Update local file cache
    fs.writeFileSync(DATA_FILE, JSON.stringify(localData, null, 2), 'utf-8');

    // Save to MongoDB Atlas if connected
    const db = await getMongoDB();
    if (db) {
      const collection = db.collection(COLLECTION_NAME);
      if (key) {
        await collection.updateOne(
          { key },
          { $set: { key, value, updatedAt: new Date() } },
          { upsert: true }
        );
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
        }
      }
    }

    res.json({ success: true, data: localData });
  } catch (err) {
    console.error("Error writing data:", err);
    res.status(500).json({ error: "Failed to save data" });
  }
});

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

// Start listening immediately
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
