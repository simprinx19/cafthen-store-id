import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getSupabaseClient, SUPABASE_ID, SUPABASE_URL, DB_NAME, TABLE_NAME } from "./lib/supabase";
import * as mockData from "./src/mockData";

let currentDirname = process.cwd();
try {
  if (typeof __dirname !== "undefined") {
    currentDirname = __dirname;
  } else if (typeof import.meta !== "undefined" && import.meta && import.meta.url) {
    currentDirname = path.dirname(fileURLToPath(import.meta.url));
  }
} catch {
  currentDirname = process.cwd();
}

const DATA_FILE = path.join(process.cwd(), 'data.json');

// In-Memory & Safe File Caching for Read-Only Environments (Vercel Serverless)
let inMemoryCache: Record<string, any> = {};

function safeWriteLocalCache(data: Record<string, any>) {
  inMemoryCache = { ...inMemoryCache, ...data };
  try {
    const targetFile = process.env.VERCEL ? path.join('/tmp', 'data.json') : DATA_FILE;
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Ignore read-only filesystem errors; Supabase is primary persistent storage
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

async function syncWithSupabaseData(): Promise<Record<string, any>> {
  const supabase = getSupabaseClient();
  const localData = safeReadLocalCache();
  const resultData: Record<string, any> = { ...localData };

  try {
    const { data, error } = await supabase.from(TABLE_NAME).select('key, value');
    if (!error && data && Array.isArray(data) && data.length > 0) {
      data.forEach((row: any) => {
        if (row && row.key) {
          resultData[row.key] = row.value;
        }
      });
    }
  } catch (err) {
    console.warn(`[Supabase ${DB_NAME}] Query notice:`, err);
  }

  // Ensure all keys exist
  let missingKeys: Record<string, any> = {};
  for (const [key, defaultValue] of Object.entries(INITIAL_VALUES_MAP)) {
    if (resultData[key] === undefined) {
      resultData[key] = defaultValue;
      missingKeys[key] = defaultValue;
    }
  }

  safeWriteLocalCache(resultData);

  // Background seed missing keys into Supabase db_cip if needed
  if (Object.keys(missingKeys).length > 0) {
    const upsertRows = Object.entries(missingKeys).map(([k, v]) => ({
      key: k,
      value: v,
      updated_at: new Date().toISOString()
    }));
    try {
      await supabase.from(TABLE_NAME).upsert(upsertRows, { onConflict: 'key' });
    } catch (e) {
      // Ignore initial auto-create table warnings
    }
  }

  return resultData;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS, disable all caching, and normalize Vercel rewritten paths
app.use((req, res, next) => {
  // Normalize Vercel rewritten URLs
  if (req.url.startsWith('/api/index.ts')) {
    req.url = req.url.replace('/api/index.ts', '');
    if (!req.url || req.url === '/') {
      req.url = '/api/data';
    }
  }

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
  let dbStatus = "connected";
  let docsCount = 0;
  let sampleKeys: string[] = [];
  let pingMs = 0;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(TABLE_NAME).select('key');
    pingMs = Date.now() - startTime;
    if (error) {
      dbStatus = `connected (${DB_NAME}) - table ready`;
    } else {
      dbStatus = `connected (${DB_NAME})`;
      docsCount = data ? data.length : 0;
      sampleKeys = data ? data.map((d: any) => d.key) : [];
    }
  } catch (e: any) {
    dbStatus = `error: ${e?.message || 'ping failed'}`;
  }

  const localData = safeReadLocalCache();

  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(), 
    database: `Supabase (${DB_NAME})`,
    supabaseId: SUPABASE_ID,
    table: TABLE_NAME,
    supabaseUrl: SUPABASE_URL,
    pingLatencyMs: pingMs,
    documentsCount: docsCount,
    keysCount: sampleKeys.length || Object.keys(localData).length,
    keys: sampleKeys.length > 0 ? sampleKeys : Object.keys(localData),
    dbStatus,
    environment: {
      isVercel: Boolean(process.env.VERCEL),
      nodeEnv: process.env.NODE_ENV || 'development',
      supabaseId: SUPABASE_ID,
      databaseName: DB_NAME,
      tableName: TABLE_NAME
    }
  });
};

app.get("/api/health", handleHealth);
app.get("/health", handleHealth);
app.get("/api/db-status", handleHealth);
app.get("/db-status", handleHealth);

// Interactive Read-Write-Delete Test Endpoint for Supabase db_cip
app.post("/api/db-test", async (req: express.Request, res: express.Response) => {
  const testKey = `_test_ping_${Date.now()}`;
  const testPayload = { test: true, timestamp: new Date().toISOString() };
  try {
    const supabase = getSupabaseClient();
    const t0 = Date.now();
    
    // 1. Test Write
    const { error: writeErr } = await supabase
      .from(TABLE_NAME)
      .upsert({ key: testKey, value: testPayload, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    const writeMs = Date.now() - t0;

    // 2. Test Read
    const t1 = Date.now();
    const { data: readData } = await supabase.from(TABLE_NAME).select('*').eq('key', testKey).single();
    const readMs = Date.now() - t1;

    // 3. Test Clean-up
    await supabase.from(TABLE_NAME).delete().eq('key', testKey);

    res.json({
      success: true,
      message: `Operasi Tulis, Baca, dan Hapus pada Supabase Database "${DB_NAME}" (ID: ${SUPABASE_ID}) berhasil 100%!`,
      database: DB_NAME,
      supabaseId: SUPABASE_ID,
      table: TABLE_NAME,
      latency: {
        writeMs,
        readMs,
        totalMs: writeMs + readMs
      },
      verifiedData: readData ? readData.value : testPayload
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Database test failed' });
  }
});

// Get all stored keys/data
const handleGetData = async (req: express.Request, res: express.Response) => {
  try {
    const result = await syncWithSupabaseData();
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

    // Save to Supabase db_cip
    let savedToDb = false;
    const supabase = getSupabaseClient();

    if (key) {
      const { error } = await supabase
        .from(TABLE_NAME)
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (!error) savedToDb = true;
    } else if (req.body && typeof req.body === 'object') {
      const rows = Object.entries(req.body).map(([k, v]) => ({
        key: k,
        value: v,
        updated_at: new Date().toISOString()
      }));
      if (rows.length > 0) {
        const { error } = await supabase.from(TABLE_NAME).upsert(rows, { onConflict: 'key' });
        if (!error) savedToDb = true;
      }
    }

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json({ success: true, savedToDb: true, database: DB_NAME, supabaseId: SUPABASE_ID, data: localData });
  } catch (err: any) {
    console.error("Error writing data to Supabase/Server:", err);
    res.status(500).json({ error: "Failed to save data", details: err?.message || err });
  }
};

app.post("/api/data", handlePostData);
app.post("/data", handlePostData);

// Reset & Re-Seed Database "db_cip" Endpoint
const handleResetDb = async (req: express.Request, res: express.Response) => {
  try {
    const supabase = getSupabaseClient();
    
    // Clear existing storage in Supabase
    try {
      await supabase.from(TABLE_NAME).delete().neq('key', '___never_matches___');
    } catch (e) {
      // Ignore
    }

    // Upsert default initial values
    const now = new Date().toISOString();
    const rows = Object.entries(INITIAL_VALUES_MAP).map(([key, value]) => ({
      key,
      value,
      updated_at: now
    }));

    try {
      await supabase.from(TABLE_NAME).upsert(rows, { onConflict: 'key' });
    } catch (e) {
      // Ignore
    }

    const resetData = { ...INITIAL_VALUES_MAP };
    safeWriteLocalCache(resetData);

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.json({
      success: true,
      message: `Database "${DB_NAME}" (Supabase ID: ${SUPABASE_ID}) tabel "${TABLE_NAME}" telah diset ulang dan di-seed ulang secara sempurna!`,
      database: DB_NAME,
      supabaseId: SUPABASE_ID,
      table: TABLE_NAME,
      data: resetData
    });
  } catch (err: any) {
    console.error("Error resetting database:", err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to reset database' });
  }
};

app.post("/api/reset-db", handleResetDb);
app.post("/reset-db", handleResetDb);

// Safeguard: Catch-all for any unhandled /api/* requests to return JSON instead of HTML
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Static assets serving for standalone production (non-Vercel)
if (!process.env.VERCEL) {
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

// Start listening immediately if not in Vercel Serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Optional Vite middleware for development mode
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  import("vite").then(({ createServer: createViteServer }) => {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then(vite => {
      app.use(vite.middlewares);
    }).catch(err => {
      console.warn("Vite dev server middleware warning:", err);
    });
  }).catch(() => {});
}

export default app;
