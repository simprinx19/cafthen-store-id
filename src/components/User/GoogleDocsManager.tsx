import React, { useState, useEffect } from 'react';
import { 
  initGoogleAuth, 
  googleSignIn, 
  getAccessToken, 
  googleSignOut, 
  listGoogleDocs, 
  createGoogleDoc, 
  getGoogleDocContent,
  GoogleDriveFile 
} from '../../lib/googleDocsService';
import { FileText, ExternalLink, Plus, RefreshCw, LogOut, CheckCircle2, AlertCircle, Loader2, Sparkles, FolderOpen, ShieldCheck } from 'lucide-react';
import { Order, UserProfile } from '../../types';

interface GoogleDocsManagerProps {
  currentUser: UserProfile;
  orders: Order[];
  showToast: (msg: string) => void;
}

export const GoogleDocsManager: React.FC<GoogleDocsManagerProps> = ({ currentUser, orders, showToast }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [docs, setDocs] = useState<GoogleDriveFile[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docContent, setDocContent] = useState<any>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  // New Doc Form States
  const [newDocTitle, setNewDocTitle] = useState('Kontrak Konstruksi PT. Cafthen - ' + currentUser.fullName);
  const [newDocText, setNewDocText] = useState('SURAT PERJANJIAN KERJASAMA PROYEK & KONTROL MATERIAL\n\nPihak Pertama: PT. CAFTHEN INDO PROJECT\nPihak Kedua: ' + currentUser.fullName + '\n\nKetentuan & Jadwal Pelaksanaan Proyek: Sesuai dengan spesifikasi teknis dan pesanan digital terverifikasi.');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      async (user, token) => {
        setIsAuthenticated(true);
        setGoogleUserEmail(user.email);
        setIsInitializing(false);
        fetchDocs(token);
      },
      () => {
        setIsAuthenticated(false);
        setGoogleUserEmail(null);
        setIsInitializing(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const res = await googleSignIn();
      if (res) {
        setIsAuthenticated(true);
        setGoogleUserEmail(res.user.email);
        showToast('Berhasil terhubung dengan akun Google Workspace.');
        fetchDocs(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('Gagal terhubung dengan Google: ' + (err.message || 'Error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await googleSignOut();
    setIsAuthenticated(false);
    setGoogleUserEmail(null);
    setDocs([]);
    setSelectedDocId(null);
    setDocContent(null);
    showToast('Keluar dari sesi Google Workspace.');
  };

  const fetchDocs = async (token?: string) => {
    try {
      setIsLoading(true);
      const accessToken = token || await getAccessToken();
      if (!accessToken) return;
      const fileList = await listGoogleDocs(accessToken);
      setDocs(fileList);
    } catch (err: any) {
      console.error('Fetch docs error:', err);
      showToast('Gagal memuat daftar Google Docs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDocContent = async (docId: string) => {
    try {
      setSelectedDocId(docId);
      setLoadingContent(true);
      const accessToken = await getAccessToken();
      if (!accessToken) return;
      const content = await getGoogleDocContent(accessToken, docId);
      setDocContent(content);
    } catch (err) {
      console.error('Error viewing doc:', err);
      showToast('Gagal membaca isi dokumen Google Docs.');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = window.confirm(`Buat dokumen Google Docs baru dengan judul "${newDocTitle}" di akun Google Drive Anda?`);
    if (!confirmed) return;

    try {
      setIsCreating(true);
      const accessToken = await getAccessToken();
      if (!accessToken) {
        showToast('Sesi Google kadaluarsa. Silakan masuk kembali.');
        return;
      }

      const created = await createGoogleDoc(accessToken, newDocTitle, newDocText);
      showToast(`Dokumen Google Docs "${created.title}" berhasil dibuat!`);
      fetchDocs(accessToken);
      if (created.documentId) {
        handleViewDocContent(created.documentId);
      }
    } catch (err: any) {
      console.error('Create doc error:', err);
      showToast('Gagal membuat Google Doc: ' + (err.message || 'Error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportOrderToDoc = async (order: Order) => {
    const title = `Kontrak Pesanan #${order.id} - ${order.productName} (${currentUser.fullName})`;
    const text = `SURAT KONTRAK PEMESANAN & LAYANAN\n\nID Pesanan: #${order.id}\nPelanggan: ${order.buyerName} (${order.buyerEmail})\nProduk/Layanan: ${order.productName}\nJumlah: ${order.quantity}\nTotal Harga: IDR ${order.totalPriceIDR.toLocaleString('id-ID')}\nStatus: ${order.status}\nTanggal: ${order.createdAt}\n\nKetentuan PT. Cafthen Indo Project:\n1. Seluruh pekerjaan konstruksi dan pengiriman material tunduk pada syarat dan ketentuan yang berlaku.\n2. QR Seal verifikasi digital sah diterbitkan oleh sistem resmi PT. Cafthen Indo Project.\n\nDisetujui secara digital oleh ${currentUser.fullName}.`;

    const confirmed = window.confirm(`Ekspor Pesanan #${order.id} ke Google Docs baru di Google Drive Anda?`);
    if (!confirmed) return;

    try {
      setIsCreating(true);
      const accessToken = await getAccessToken();
      if (!accessToken) {
        showToast('Sesi Google kadaluarsa.');
        return;
      }
      const created = await createGoogleDoc(accessToken, title, text);
      showToast(`Pesanan #${order.id} berhasil diexport ke Google Docs!`);
      fetchDocs(accessToken);
      handleViewDocContent(created.documentId);
    } catch (err: any) {
      console.error('Export error:', err);
      showToast('Gagal mengexport pesanan ke Google Docs.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Google Workspace Integration
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Google Docs & Drive Manager</h2>
          <p className="text-sm text-slate-600 mt-1">
            Kelola dokumen kontrak konstruksi, buat proposal proyek otomatis, dan sinkronkan pesanan langsung ke Google Docs Anda.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <p className="text-slate-500 font-medium">Terhubung sebagai:</p>
              <p className="font-bold text-slate-800 truncate max-w-[200px]">{googleUserEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-2"
              title="Keluar Google"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-300 rounded-2xl shadow-sm hover:bg-slate-50 transition-all font-medium text-slate-700 text-sm group"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>Hubungkan Google Workspace</span>
          </button>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Hubungkan Akun Google Anda untuk Mengakses Google Docs</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Fitur integrasi Google Docs memungkinkan Anda membuat dokumen kontrak proyek otomatis, membaca dokumen spesifikasi teknis, dan mengexport data pesanan langsung ke Google Drive Anda.
          </p>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 text-sm inline-flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Hubungkan dengan Google Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Create Docs & Orders Export */}
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3>Buat Google Doc Baru</h3>
              </div>
              <form onSubmit={handleCreateDocument} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Dokumen</label>
                  <input
                    type="text"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Isi / Teks Awal Dokumen</label>
                  <textarea
                    rows={4}
                    value={newDocText}
                    onChange={(e) => setNewDocText(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm flex items-center justify-center gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Buat di Google Drive
                </button>
              </form>
            </div>

            {/* Export Orders to Google Docs */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <FolderOpen className="w-5 h-5 text-amber-500" />
                  <h3>Ekspor Pesanan ke Docs</h3>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">{orders.length} Pesanan</span>
              </div>
              {orders.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Belum ada pesanan yang dibuat.</p>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">#{order.id} - {order.productName}</p>
                        <p className="text-[11px] text-slate-500">IDR {order.totalPriceIDR.toLocaleString('id-ID')}</p>
                      </div>
                      <button
                        onClick={() => handleExportOrderToDoc(order)}
                        disabled={isCreating}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ekspor
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: List of Google Docs & Viewer */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Google Docs Anda ({docs.length})
                </h3>
                <button
                  onClick={() => fetchDocs()}
                  disabled={isLoading}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl transition-colors border border-slate-200 shadow-xs"
                  title="Refresh Daftar Dokumen"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {docs.length === 0 ? (
                <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Belum ada file Google Docs ditemukan di akun Anda.</p>
                  <p className="text-xs text-slate-400 mt-1">Buat dokumen baru di atas atau pastikan akun memiliki Google Docs.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-4 bg-white border rounded-2xl transition-all flex flex-col justify-between gap-3 ${
                        selectedDocId === doc.id ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{doc.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">ID: {doc.id.substring(0, 12)}...</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleViewDocContent(doc.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          Lihat Isi
                        </button>
                        {doc.webViewLink && (
                          <a
                            href={doc.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg"
                          >
                            Buka di Docs <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Document Content Previewer */}
            {selectedDocId && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" /> Pratinjau Isi Dokumen
                  </h4>
                  <button
                    onClick={() => { setSelectedDocId(null); setDocContent(null); }}
                    className="text-xs text-slate-400 hover:text-slate-700 font-medium"
                  >
                    Tutup
                  </button>
                </div>

                {loadingContent ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : docContent ? (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-80 overflow-y-auto">
                    <h5 className="font-bold text-slate-900 text-base">{docContent.title}</h5>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-mono bg-white p-4 rounded-xl border border-slate-200">
                      {docContent.body?.content ? (
                        docContent.body.content
                          .map((el: any) => el.paragraph?.elements?.map((e: any) => e.textRun?.content).join('') || '')
                          .join('\n')
                      ) : (
                        'Dokumen kosong atau struktur teks tidak terbaca.'
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">Gagal memuat isi dokumen.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
