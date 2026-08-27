import React, { useState } from 'react';
import { 
  Terminal, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Code, 
  Activity, 
  Server, 
  Database, 
  Layers,
  ChevronDown,
  ChevronRight,
  Sliders
} from 'lucide-react';

export interface DiagnosticLogEntry {
  id: string;
  timestamp: string;
  type: 'READ' | 'WRITE' | 'ROUNDTRIP' | 'BENCHMARK' | 'CUSTOM';
  title: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requestHeaders?: Record<string, string>;
  requestPayload?: any;
  status: number;
  statusText: string;
  latencyMs: number;
  responseHeaders: Record<string, string>;
  responsePayload: any;
  success: boolean;
}

interface MongoDiagnosticConsoleProps {
  onDataUpdated?: () => void;
}

export const MongoDiagnosticConsole: React.FC<MongoDiagnosticConsoleProps> = ({ onDataUpdated }) => {
  const [logs, setLogs] = useState<DiagnosticLogEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'READ' | 'WRITE' | 'BENCHMARK'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Test Inputs
  const [customKey, setCustomKey] = useState<string>('_diag_test_company_update');
  const [customPayload, setCustomPayload] = useState<string>(
    JSON.stringify({
      companyName: 'PT. CAFTHEN INDO PROJECT (DIAGNOSTIC TEST)',
      updatedAt: new Date().toISOString(),
      testStatus: 'SUCCESS_VERIFIED'
    }, null, 2)
  );

  const addLog = (entry: Omit<DiagnosticLogEntry, 'id' | 'timestamp'>) => {
    const newLog: DiagnosticLogEntry = {
      ...entry,
      id: `diag_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })
    };
    setLogs(prev => [newLog, ...prev]);
    setExpandedLogId(newLog.id);
  };

  const copyLogJson = (log: DiagnosticLogEntry) => {
    const text = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Test GET /api/data (Read Operation)
  const runReadTest = async () => {
    setIsExecuting(true);
    const startTime = performance.now();
    const url = `/api/data?_t=${Date.now()}`;
    const reqHeaders = {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    };

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: reqHeaders,
        cache: 'no-store'
      });

      const latencyMs = Math.round(performance.now() - startTime);
      
      // Extract Response Headers
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      let resPayload: any = null;
      try {
        resPayload = await res.json();
      } catch (err) {
        resPayload = { parseError: 'Failed to parse JSON response' };
      }

      const keyCount = resPayload ? Object.keys(resPayload).length : 0;

      addLog({
        type: 'READ',
        title: `Pemeriksaan Baca /api/data (${keyCount} Kunci Ditemukan)`,
        url,
        method: 'GET',
        requestHeaders: reqHeaders,
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
        latencyMs,
        responseHeaders: resHeaders,
        responsePayload: resPayload,
        success: res.ok
      });
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      addLog({
        type: 'READ',
        title: 'Gagal Menghubungi Server (GET /api/data)',
        url,
        method: 'GET',
        requestHeaders: reqHeaders,
        status: 0,
        statusText: 'Network Error',
        latencyMs,
        responseHeaders: {},
        responsePayload: { error: err?.message || 'Network request failed' },
        success: false
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // 2. Test POST /api/data (Write Diagnostic Entry)
  const runWriteTest = async () => {
    setIsExecuting(true);
    const startTime = performance.now();
    const url = '/api/data';
    const reqHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    const payload = {
      key: '_diag_supabase_ping',
      value: {
        testedAt: new Date().toISOString(),
        status: 'SUPABASE_WRITE_VERIFIED',
        clientUserAgent: navigator.userAgent,
        testId: Math.random().toString(36).substring(2, 9)
      }
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify(payload)
      });

      const latencyMs = Math.round(performance.now() - startTime);
      
      const resHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      let resPayload: any = null;
      try {
        resPayload = await res.json();
      } catch (err) {
        resPayload = { text: 'Non-JSON response' };
      }

      addLog({
        type: 'WRITE',
        title: `Pemeriksaan Tulis Supabase (_diag_supabase_ping)`,
        url,
        method: 'POST',
        requestHeaders: reqHeaders,
        requestPayload: payload,
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
        latencyMs,
        responseHeaders: resHeaders,
        responsePayload: resPayload,
        success: res.ok && resPayload?.success !== false
      });

      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      addLog({
        type: 'WRITE',
        title: 'Gagal Menulis ke Supabase db_cip (POST /api/data)',
        url,
        method: 'POST',
        requestHeaders: reqHeaders,
        requestPayload: payload,
        status: 0,
        statusText: 'Network Error',
        latencyMs,
        responseHeaders: {},
        responsePayload: { error: err?.message || 'Network request failed' },
        success: false
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // 3. Test Full Roundtrip Write & Immediate Read Verification
  const runRoundtripTest = async () => {
    setIsExecuting(true);
    const testNonce = `nonce_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const testKey = '_diag_roundtrip_test';
    const writePayload = {
      key: testKey,
      value: {
        nonce: testNonce,
        verifiedTimestamp: new Date().toISOString(),
        message: 'Pengujian Tulis & Baca Instan Supabase Database db_cip'
      }
    };

    const startTime = performance.now();
    try {
      // Step A: WRITE
      const writeRes = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(writePayload)
      });
      const writeJson = await writeRes.json();

      // Step B: READ BACK
      const readRes = await fetch(`/api/data?_t=${Date.now()}`, { cache: 'no-store' });
      const readJson = await readRes.json();
      const readDoc = readJson[testKey];

      const latencyMs = Math.round(performance.now() - startTime);

      const isVerified = readDoc && readDoc.nonce === testNonce;

      const resHeaders: Record<string, string> = {};
      readRes.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      addLog({
        type: 'ROUNDTRIP',
        title: isVerified 
          ? `Verifikasi Bolak-Balik Tulis & Baca: 100% Sesuai (${testNonce})`
          : `Verifikasi Bolak-Balik Gagal (Nonce tidak cocok)`,
        url: '/api/data (POST -> GET)',
        method: 'POST',
        requestHeaders: { 'Content-Type': 'application/json' },
        requestPayload: writePayload,
        status: readRes.status,
        statusText: readRes.statusText || 'OK',
        latencyMs,
        responseHeaders: resHeaders,
        responsePayload: {
          writeResponse: writeJson,
          verifiedInDatabase: isVerified,
          readBackData: readDoc,
          fullKeysCount: Object.keys(readJson).length
        },
        success: isVerified
      });

      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      addLog({
        type: 'ROUNDTRIP',
        title: 'Pemeriksaan Roundtrip Gagal dengan Exception',
        url: '/api/data',
        method: 'POST',
        status: 500,
        statusText: 'Internal Error',
        latencyMs,
        responseHeaders: {},
        responsePayload: { error: err?.message || 'Roundtrip failure' },
        success: false
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // 4. Test Supabase Database Low-Level Benchmark (/api/db-test)
  const runBenchmarkTest = async () => {
    setIsExecuting(true);
    const startTime = performance.now();
    const url = '/api/db-test';
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const latencyMs = Math.round(performance.now() - startTime);

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      const resPayload = await res.json();

      addLog({
        type: 'BENCHMARK',
        title: `Benchmark Latensi Supabase: Write ${resPayload.latency?.writeMs || 0}ms, Read ${resPayload.latency?.readMs || 0}ms`,
        url,
        method: 'POST',
        requestHeaders: { 'Content-Type': 'application/json' },
        status: res.status,
        statusText: res.statusText || 'OK',
        latencyMs,
        responseHeaders: resHeaders,
        responsePayload: resPayload,
        success: res.ok && resPayload.success
      });
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      addLog({
        type: 'BENCHMARK',
        title: 'Gagal Menjalankan Benchmark Supabase',
        url,
        method: 'POST',
        status: 0,
        statusText: 'Error',
        latencyMs,
        responseHeaders: {},
        responsePayload: { error: err?.message },
        success: false
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // 5. Test Custom Key Payload POST
  const runCustomPayloadTest = async () => {
    if (!customKey.trim()) {
      alert('Masukkan kunci data yang valid.');
      return;
    }
    let parsedValue: any;
    try {
      parsedValue = JSON.parse(customPayload);
    } catch (err: any) {
      alert('Format JSON pada Custom Payload tidak valid: ' + err?.message);
      return;
    }

    setIsExecuting(true);
    const startTime = performance.now();
    const url = '/api/data';
    const payload = { key: customKey.trim(), value: parsedValue };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const latencyMs = Math.round(performance.now() - startTime);

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      const resPayload = await res.json();

      addLog({
        type: 'CUSTOM',
        title: `Kustom POST [${customKey}] ke Supabase`,
        url,
        method: 'POST',
        requestHeaders: { 'Content-Type': 'application/json' },
        requestPayload: payload,
        status: res.status,
        statusText: res.statusText || 'OK',
        latencyMs,
        responseHeaders: resHeaders,
        responsePayload: resPayload,
        success: res.ok && resPayload.success !== false
      });

      if (onDataUpdated) onDataUpdated();
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      addLog({
        type: 'CUSTOM',
        title: `Gagal Kustom POST [${customKey}]`,
        url,
        method: 'POST',
        requestPayload: payload,
        status: 0,
        statusText: 'Error',
        latencyMs,
        responseHeaders: {},
        responsePayload: { error: err?.message },
        success: false
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'READ') return log.type === 'READ';
    if (activeFilter === 'WRITE') return log.type === 'WRITE' || log.type === 'CUSTOM';
    if (activeFilter === 'BENCHMARK') return log.type === 'BENCHMARK' || log.type === 'ROUNDTRIP';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Utility Header Banner */}
      <div className="p-6 bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Terminal className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
                <Terminal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Konsol Diagnostik Supabase Database (db_cip)
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Inspector
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Uji langsung operasi Tulis & Baca ke Supabase Database db_cip, pantau HTTP Status Code, Header Respon, serta isi Payload.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogs([])}
                disabled={logs.length === 0}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Log</span>
              </button>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={runReadTest}
              disabled={isExecuting}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <ArrowDownLeft className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>1. Uji GET /api/data (Baca)</span>
            </button>

            <button
              onClick={runWriteTest}
              disabled={isExecuting}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <ArrowUpRight className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>2. Uji POST /api/data (Tulis)</span>
            </button>

            <button
              onClick={runRoundtripTest}
              disabled={isExecuting}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>3. Uji Bolak-Balik Tulis + Verifikasi Baca</span>
            </button>

            <button
              onClick={runBenchmarkTest}
              disabled={isExecuting}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Activity className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>4. Benchmark Latensi Supabase</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Request Tester Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Pengujian Tulis Kunci & Payload Kustom</h4>
              <p className="text-xs text-slate-500">Kirim data kustom langsung ke backend server Supabase db_cip untuk memverifikasi respon</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Endpoint: POST /api/data</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-xs font-bold text-slate-700 block">Kunci Target (Key):</label>
            <input
              type="text"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="_diag_test_company_update"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
            <div className="pt-1 flex flex-wrap gap-1">
              {['_diag_test_key', 'cafthen_company_profile', 'cafthen_products'].map(k => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setCustomKey(k)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-mono"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block">Body Payload (JSON):</label>
            <textarea
              rows={3}
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={runCustomPayloadTest}
            disabled={isExecuting}
            className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Jalankan Pengujian Tulis Kustom</span>
          </button>
        </div>
      </div>

      {/* Logs Terminal Stream & Detailed Payload Viewer */}
      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        {/* Logs Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Riwayat Log Respons Server &amp; Atlas ({logs.length})
            </h4>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['ALL', 'READ', 'WRITE', 'BENCHMARK'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Log Entries Container */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Terminal className="w-12 h-12 mx-auto text-slate-700" />
            <p className="text-xs font-mono">Belum ada log diagnostik.</p>
            <p className="text-[11px] text-slate-600">
              Klik salah satu tombol uji di atas untuk mengirim permintaan ke server backend Supabase db_cip.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div 
                  key={log.id} 
                  className={`rounded-2xl border transition-all ${
                    log.success
                      ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                      : 'bg-rose-950/30 border-rose-900/50 hover:border-rose-500/50'
                  }`}
                >
                  {/* Log Card Summary Bar */}
                  <div 
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0">
                      <button className="text-slate-500 pt-0.5 md:pt-0">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        log.method === 'GET' 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {log.method}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        log.status >= 200 && log.status < 300
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/40'
                          : 'bg-rose-950 text-rose-400 border border-rose-600/40'
                      }`}>
                        {log.status} {log.statusText}
                      </span>

                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-100 block truncate">
                          {log.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate block">
                          {log.url}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono shrink-0 pl-7 md:pl-0">
                      <span className="text-amber-400 font-bold">
                        {log.latencyMs} ms
                      </span>
                      <span className="text-slate-500">
                        {log.timestamp}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyLogJson(log);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                        title="Salin Detail JSON Log"
                      >
                        {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Log Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-4 text-xs font-mono">
                      {/* Section 1: Response Headers & Status */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-sky-400" /> Response Headers (Server &amp; Network)
                        </span>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-[11px] text-slate-300 max-h-40 overflow-y-auto">
                          {Object.keys(log.responseHeaders).length === 0 ? (
                            <span className="text-slate-600 font-sans italic">Tidak ada header yang tercatat</span>
                          ) : (
                            Object.entries(log.responseHeaders).map(([k, v]) => (
                              <div key={k} className="flex items-start justify-between gap-4">
                                <span className="text-indigo-400 font-bold shrink-0">{k}:</span>
                                <span className="text-slate-200 text-right break-all">{v}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Section 2: Request Payload (if any) */}
                      {log.requestPayload && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Request Payload Dikirim Oleh Klien:
                          </span>
                          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
                            {JSON.stringify(log.requestPayload, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Section 3: Response Payload */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-amber-400" /> Response Body Payload Diterima Dari Server:
                        </span>
                        <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-amber-200 overflow-x-auto max-h-96">
                          {JSON.stringify(log.responsePayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
