import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Camera, 
  Video, 
  Target, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  Eye,
  FileText,
  Download,
  AlertCircle
} from 'lucide-react';
import { CompanyProfileData, TeamMember, ActivityPhoto } from '../../types';
import { StorageService } from '../../storage';
import { LOGO_PRESETS, DEFAULT_CIP_LOGO } from '../../utils/logoPresets';

interface AdminCMSProps {
  company: CompanyProfileData;
  team: TeamMember[];
  activities: ActivityPhoto[];
  onDataUpdated: () => void;
}

export const AdminCMS: React.FC<AdminCMSProps> = ({
  company: initialCompany,
  team: initialTeam,
  activities: initialActivities,
  onDataUpdated
}) => {
  const [subTab, setSubTab] = useState<'logo' | 'profile' | 'team' | 'activities' | 'video' | 'visiMisi'>('logo');

  // Logo States
  const [logoUrl, setLogoUrl] = useState(initialCompany.logoUrl || DEFAULT_CIP_LOGO);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile & Legal Form States
  const [companyName, setCompanyName] = useState(initialCompany.companyName);
  const [storeName, setStoreName] = useState(initialCompany.storeName);
  const [address, setAddress] = useState(initialCompany.address);
  const [email, setEmail] = useState(initialCompany.email);
  const [phone, setPhone] = useState(initialCompany.phone);
  const [owner, setOwner] = useState(initialCompany.owner);
  const [director, setDirector] = useState(initialCompany.director);
  const [mapsUrl, setMapsUrl] = useState(initialCompany.mapsUrl);

  // Legalitas Lengkap
  const [nib, setNib] = useState(initialCompany.nib || '0220202931234');
  const [ahukemenkumham, setAhukemenkumham] = useState(initialCompany.ahukemenkumham || 'AHU-0012345.AH.01.01.TAHUN 2024');
  const [npwp, setNpwp] = useState(initialCompany.npwp || '41.890.123.4-331.000');
  const [aktaNotaris, setAktaNotaris] = useState(initialCompany.aktaNotaris || 'Akta Notaris No. 12 Tanggal 15 Agustus 2024 (Notaris Hj. Faridah, SH., M.Kn)');
  const [izinUsaha, setIzinUsaha] = useState(initialCompany.izinUsaha || 'Izin Usaha PB-UMKU OSS RBA Kementerian Investasi / BKPM RI');
  const [sertifikasi, setSertifikasi] = useState(initialCompany.sertifikasi || 'ISO 9001:2015, ISO 14001:2015, Sertifikat Standar K3 Konstruksi (SMK3)');
  const [postalCode, setPostalCode] = useState(initialCompany.postalCode || '36361');
  const [operationalHours, setOperationalHours] = useState(initialCompany.operationalHours || 'Senin - Sabtu: 08:00 - 17:00 WIB (Layanan Emergency/Pelayaran 24 Jam)');
  const [tagline, setTagline] = useState(initialCompany.tagline || 'Solusi Terpadu Komoditas Perdagangan, Pengadaan & Kontraktor Sipil Terpercaya');

  // Hero Section Custom Texts
  const [heroBadge, setHeroBadge] = useState(initialCompany.heroBadge || 'Kegiatan Ekspor • Produksi Arang Batok • Penjualan Kelapa Tua • Cangkang Sawit • Konstruksi Sipil');
  const [heroTitle, setHeroTitle] = useState(initialCompany.heroTitle || 'Solusi Terpadu Perdagangan Komoditas, Pengadaan & Konstruksi Sipil');
  const [heroSubtitle, setHeroSubtitle] = useState(initialCompany.heroSubtitle || 'Mitra strategis terpercaya di Indonesia dalam pengadaan komoditas batubara curah, besi beton SNI, semen curah, material agregat, serta jasa konstruksi bangunan sipil berstandar nasional didukung digitalisasi kontrak hukum resmi (LOCO, FOB, FRANCO, CIF).');
  const [heroCtaButton1, setHeroCtaButton1] = useState(initialCompany.heroCtaButton1 || 'Buka Katalog Komoditas & Material');
  const [heroCtaButton2, setHeroCtaButton2] = useState(initialCompany.heroCtaButton2 || 'Konsultasi & Penawaran Resmi');
  const [taxSystemLabel, setTaxSystemLabel] = useState(initialCompany.taxSystemLabel || 'ECoretax DJP Integrated');

  // Profil & 3 Layanan Custom Texts
  const [profileSectionBadge, setProfileSectionBadge] = useState(initialCompany.profileSectionBadge || 'PROFIL & KEGIATAN PERUSAHAAN');
  const [profileSectionTitle, setProfileSectionTitle] = useState(initialCompany.profileSectionTitle || 'Dedikasi, Integritas & Rantai Pasok Skala Nasional');
  const [profileSectionDescription, setProfileSectionDescription] = useState(initialCompany.profileSectionDescription || 'PT. CAFTHEN INDO PROJECT adalah badan usaha berbadan hukum yang berkantor pusat di Muaro Jambi, berfokus pada integrasi sektor perdagangan komoditas sumber daya, pengadaan barang & jasa, serta rekayasa konstruksi sipil.');
  
  const [tradingTitle, setTradingTitle] = useState(initialCompany.tradingTitle || 'Perdagangan Komoditas (General Trading)');
  const [tradingDesc, setTradingDesc] = useState(initialCompany.tradingDesc || 'Penyedia pasokan batubara kalori GAR 4200 - 5000 kcal/kg, agregat batu split, pasir silika, dan komoditas industri dengan jaminan legalitas IUP resmi dan sertifikasi surveyor independen (Sucofindo / Carsurin).');
  
  const [procurementTitle, setProcurementTitle] = useState(initialCompany.procurementTitle || 'Pengadaan Barang & Jasa (Procurement)');
  const [procurementDesc, setProcurementDesc] = useState(initialCompany.procurementDesc || 'Pengadaan material besi beton SNI 2052:2017 berbagai diameter, semen curah Portland Composite Cement (PCC), sewa armada alat berat (Excavator PC200/Bulldozer), dan perlengkapan logistik proyek.');
  
  const [constructionTitle, setConstructionTitle] = useState(initialCompany.constructionTitle || 'Konstruksi Bangunan Sipil & Infrastruktur');
  const [constructionDesc, setConstructionDesc] = useState(initialCompany.constructionDesc || 'Pelaksanaan pekerjaan konstruksi bangunan gedung, pergudangan baja struktural, jalan rigid pavement beton, jembatan, penataan lahan (land clearing), dan saluran drainase terpadu.');

  const [footerAbout, setFooterAbout] = useState(initialCompany.footerAbout || 'Perusahaan perdagangan umum komoditas tambang batubara, pengadaan material konstruksi bersertifikasi SNI, serta penyedia jasa konstruksi bangunan sipil dan jalan terintegrasi dengan Surat Kontrak Hukum Digital di Indonesia.');

  const [profileSubSection, setProfileSubSection] = useState<'identitas' | 'legal' | 'hero' | 'layanan' | 'footer'>('identitas');

  // Video Form States
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState(initialCompany.youtubeVideoUrl);
  const [youtubeVideoTitle, setYoutubeVideoTitle] = useState(initialCompany.youtubeVideoTitle);

  // Visi Misi Form States
  const [visi, setVisi] = useState(initialCompany.visi);
  const [misi, setMisi] = useState<string[]>(initialCompany.misi);
  const [newMisiText, setNewMisiText] = useState('');

  // Keep form states synchronized if initialCompany is updated from outside/storage
  useEffect(() => {
    setLogoUrl(initialCompany.logoUrl || DEFAULT_CIP_LOGO);
    setCompanyName(initialCompany.companyName);
    setStoreName(initialCompany.storeName);
    setAddress(initialCompany.address);
    setEmail(initialCompany.email);
    setPhone(initialCompany.phone);
    setOwner(initialCompany.owner);
    setDirector(initialCompany.director);
    setMapsUrl(initialCompany.mapsUrl);

    setNib(initialCompany.nib || '0220202931234');
    setAhukemenkumham(initialCompany.ahukemenkumham || 'AHU-0012345.AH.01.01.TAHUN 2024');
    setNpwp(initialCompany.npwp || '41.890.123.4-331.000');
    setAktaNotaris(initialCompany.aktaNotaris || 'Akta Notaris No. 12 Tanggal 15 Agustus 2024 (Notaris Hj. Faridah, SH., M.Kn)');
    setIzinUsaha(initialCompany.izinUsaha || 'Izin Usaha PB-UMKU OSS RBA Kementerian Investasi / BKPM RI');
    setSertifikasi(initialCompany.sertifikasi || 'ISO 9001:2015, ISO 14001:2015, Sertifikat Standar K3 Konstruksi (SMK3)');
    setPostalCode(initialCompany.postalCode || '36361');
    setOperationalHours(initialCompany.operationalHours || 'Senin - Sabtu: 08:00 - 17:00 WIB (Layanan Emergency/Pelayaran 24 Jam)');
    setTagline(initialCompany.tagline || 'Solusi Terpadu Komoditas Perdagangan, Pengadaan & Kontraktor Sipil Terpercaya');

    setHeroBadge(initialCompany.heroBadge || 'Kegiatan Ekspor • Produksi Arang Batok • Penjualan Kelapa Tua • Cangkang Sawit • Konstruksi Sipil');
    setHeroTitle(initialCompany.heroTitle || 'Solusi Terpadu Perdagangan Komoditas, Pengadaan & Konstruksi Sipil');
    setHeroSubtitle(initialCompany.heroSubtitle || 'Mitra strategis terpercaya di Indonesia dalam pengadaan komoditas batubara curah, besi beton SNI, semen curah, material agregat, serta jasa konstruksi bangunan sipil berstandar nasional didukung digitalisasi kontrak hukum resmi (LOCO, FOB, FRANCO, CIF).');
    setHeroCtaButton1(initialCompany.heroCtaButton1 || 'Buka Katalog Komoditas & Material');
    setHeroCtaButton2(initialCompany.heroCtaButton2 || 'Konsultasi & Penawaran Resmi');
    setTaxSystemLabel(initialCompany.taxSystemLabel || 'ECoretax DJP Integrated');

    setProfileSectionBadge(initialCompany.profileSectionBadge || 'PROFIL & KEGIATAN PERUSAHAAN');
    setProfileSectionTitle(initialCompany.profileSectionTitle || 'Dedikasi, Integritas & Rantai Pasok Skala Nasional');
    setProfileSectionDescription(initialCompany.profileSectionDescription || 'PT. CAFTHEN INDO PROJECT adalah badan usaha berbadan hukum yang berkantor pusat di Muaro Jambi, berfokus pada integrasi sektor perdagangan komoditas sumber daya, pengadaan barang & jasa, serta rekayasa konstruksi sipil.');

    setTradingTitle(initialCompany.tradingTitle || 'Perdagangan Komoditas (General Trading)');
    setTradingDesc(initialCompany.tradingDesc || 'Penyedia pasokan batubara kalori GAR 4200 - 5000 kcal/kg, agregat batu split, pasir silika, dan komoditas industri dengan jaminan legalitas IUP resmi dan sertifikasi surveyor independen (Sucofindo / Carsurin).');

    setProcurementTitle(initialCompany.procurementTitle || 'Pengadaan Barang & Jasa (Procurement)');
    setProcurementDesc(initialCompany.procurementDesc || 'Pengadaan material besi beton SNI 2052:2017 berbagai diameter, semen curah Portland Composite Cement (PCC), sewa armada alat berat (Excavator PC200/Bulldozer), dan perlengkapan logistik proyek.');

    setConstructionTitle(initialCompany.constructionTitle || 'Konstruksi Bangunan Sipil & Infrastruktur');
    setConstructionDesc(initialCompany.constructionDesc || 'Pelaksanaan pekerjaan konstruksi bangunan gedung, pergudangan baja struktural, jalan rigid pavement beton, jembatan, penataan lahan (land clearing), dan saluran drainase terpadu.');

    setFooterAbout(initialCompany.footerAbout || 'Perusahaan perdagangan umum komoditas tambang batubara, pengadaan material konstruksi bersertifikasi SNI, serta penyedia jasa konstruksi bangunan sipil dan jalan terintegrasi dengan Surat Kontrak Hukum Digital di Indonesia.');

    setYoutubeVideoUrl(initialCompany.youtubeVideoUrl);
    setYoutubeVideoTitle(initialCompany.youtubeVideoTitle);
    setVisi(initialCompany.visi);
    setMisi(initialCompany.misi);
  }, [initialCompany]);

  // Team & Activities editing modals
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPosition, setNewMemberPosition] = useState('');
  const [newMemberBio, setNewMemberBio] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80');

  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityPhoto | null>(null);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActCategory, setNewActCategory] = useState<'Konstruksi Sipil' | 'Pemuatan Kapal & Logistik' | 'Pengadaan & Material' | 'Quality Control'>('Konstruksi Sipil');
  const [newActImageUrl, setNewActImageUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80');
  const [newActDescription, setNewActDescription] = useState('');
  const [newActLocation, setNewActLocation] = useState('Muaro Jambi');
  const [newActDate, setNewActDate] = useState('');

  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState('Pengaturan tampilan berhasil diperbarui dan langsung tampil di Halaman Utama!');

  const triggerNotice = (msg?: string) => {
    if (msg) setNoticeMessage(msg);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3500);
  };

  // Handle Logo Upload from Local File
  const handleLogoFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar yang valid (PNG, JPG, JPEG, SVG, atau WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file logo maksimal adalah 5MB.');
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setLogoUrl(result);
        const updatedCompany = { ...initialCompany, logoUrl: result };
        StorageService.saveCompanyProfile(updatedCompany);
        triggerNotice('Logo baru berhasil diunggah dan langsung aktif di seluruh website!');
        onDataUpdated();
      }
      setIsUploadingLogo(false);
    };
    reader.onerror = () => {
      alert('Gagal memproses file gambar logo. Silakan coba lagi.');
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogoUrl = () => {
    if (!logoUrlInput.trim()) {
      alert('Silakan masukkan link URL logo terlebih dahulu.');
      return;
    }
    setLogoUrl(logoUrlInput.trim());
    const updatedCompany = { ...initialCompany, logoUrl: logoUrlInput.trim() };
    StorageService.saveCompanyProfile(updatedCompany);
    setLogoUrlInput('');
    triggerNotice('Logo dari link URL berhasil diterapkan!');
    onDataUpdated();
  };

  const handleSelectPresetLogo = (presetSvg: string, presetName: string) => {
    setLogoUrl(presetSvg);
    const updatedCompany = { ...initialCompany, logoUrl: presetSvg };
    StorageService.saveCompanyProfile(updatedCompany);
    triggerNotice(`Logo preset "${presetName}" berhasil diterapkan!`);
    onDataUpdated();
  };

  const handleResetToDefaultLogo = () => {
    if (confirm('Kembalikan logo ke desain standar resmi PT. CAFTHEN INDO PROJECT?')) {
      setLogoUrl(DEFAULT_CIP_LOGO);
      const updatedCompany = { ...initialCompany, logoUrl: DEFAULT_CIP_LOGO };
      StorageService.saveCompanyProfile(updatedCompany);
      triggerNotice('Logo telah dikembalikan ke logo default resmi!');
      onDataUpdated();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedCompany: CompanyProfileData = {
      ...initialCompany,
      logoUrl: logoUrl || initialCompany.logoUrl,
      companyName,
      storeName,
      address,
      email,
      phone,
      owner,
      director,
      mapsUrl,
      nib,
      ahukemenkumham,
      npwp,
      aktaNotaris,
      izinUsaha,
      sertifikasi,
      postalCode,
      operationalHours,
      tagline,
      heroBadge,
      heroTitle,
      heroSubtitle,
      heroCtaButton1,
      heroCtaButton2,
      taxSystemLabel,
      profileSectionBadge,
      profileSectionTitle,
      profileSectionDescription,
      tradingTitle,
      tradingDesc,
      procurementTitle,
      procurementDesc,
      constructionTitle,
      constructionDesc,
      footerAbout,
      youtubeVideoUrl,
      youtubeVideoTitle,
      visi,
      misi
    };
    await StorageService.saveCompanyProfile(updatedCompany);
    triggerNotice('Data Profil, Legalitas & Seluruh Teks Halaman Utama berhasil diperbarui dan tersimpan ke Database!');
    onDataUpdated();
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberPosition) return;
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: newMemberName,
      position: newMemberPosition,
      photoUrl: newMemberPhoto,
      bio: newMemberBio,
      socials: {
        email: 'info@cafthen.co.id'
      }
    };
    StorageService.saveTeamMember(newMember);
    setIsAddingMember(false);
    setNewMemberName('');
    setNewMemberPosition('');
    setNewMemberBio('');
    triggerNotice('Anggota tim baru berhasil ditambahkan dan tersimpan permanen!');
    onDataUpdated();
  };

  const handleStartEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
  };

  const handleSaveEditedTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamMember) return;
    StorageService.saveTeamMember(editingTeamMember);
    setEditingTeamMember(null);
    triggerNotice(`Data anggota tim "${editingTeamMember.name}" berhasil diperbarui secara permanen!`);
    onDataUpdated();
  };

  const handleDeleteTeamMember = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggota tim ini?')) {
      StorageService.deleteTeamMember(id);
      triggerNotice('Anggota tim berhasil dihapus.');
      onDataUpdated();
    }
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActTitle || !newActDescription) return;
    const newAct: ActivityPhoto = {
      id: `act-${Date.now()}`,
      title: newActTitle,
      category: newActCategory,
      imageUrl: newActImageUrl,
      description: newActDescription,
      date: newActDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      location: newActLocation
    };
    StorageService.saveActivity(newAct);
    setIsAddingActivity(false);
    setNewActTitle('');
    setNewActDescription('');
    triggerNotice('Dokumentasi foto kegiatan berhasil ditambahkan dan tersimpan permanen!');
    onDataUpdated();
  };

  const handleStartEditActivity = (act: ActivityPhoto) => {
    setEditingActivity(act);
  };

  const handleSaveEditedActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingActivity) return;
    StorageService.saveActivity(editingActivity);
    setEditingActivity(null);
    triggerNotice(`Foto kegiatan "${editingActivity.title}" berhasil diperbarui secara permanen!`);
    onDataUpdated();
  };

  const handleDeleteActivity = (id: string) => {
    if (confirm('Hapus foto kegiatan dokumentasi ini?')) {
      StorageService.deleteActivity(id);
      triggerNotice('Foto kegiatan berhasil dihapus.');
      onDataUpdated();
    }
  };

  const handleAddMisiPoint = () => {
    if (!newMisiText.trim()) return;
    const updated = [...misi, newMisiText.trim()];
    setMisi(updated);
    setNewMisiText('');
  };

  const handleDeleteMisiPoint = (idx: number) => {
    setMisi(misi.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'logo', label: 'Upload & Kelola Logo', icon: ImageIcon, isHighlight: true },
          { id: 'profile', label: 'Profil & Legalitas', icon: Building2 },
          { id: 'team', label: 'Struktur Tim & Direksi', icon: Users },
          { id: 'activities', label: 'Dokumentasi Foto Kerja', icon: Camera },
          { id: 'video', label: 'Video Kegiatan (YouTube)', icon: Video },
          { id: 'visiMisi', label: 'Visi & Misi Perusahaan', icon: Target }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-600/30'
                  : tab.isHighlight
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.isHighlight && !isActive ? 'text-amber-600' : ''}`} />
              <span>{tab.label}</span>
              {tab.isHighlight && !isActive && (
                <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-500 text-slate-950 rounded-full">
                  BARU
                </span>
              )}
            </button>
          );
        })}
      </div>

      {saveSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* SUBTAB 1: LOGO UPLOAD & BRANDING */}
      {subTab === 'logo' && (
        <div className="space-y-6">
          {/* Main Upload Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-lg text-slate-900">
                    Upload & Pengaturan Logo Perusahaan
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    Tampil Real-Time
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Logo yang diunggah akan otomatis terpasang pada Navbar, Footer, Banner Profil, Kop Surat Kontrak Digital (SPJB), dan Dashboard.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetToDefaultLogo}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset ke Logo Standar</span>
                </button>
              </div>
            </div>

            {/* Grid 2 Column: Upload Area vs Active Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Drag & Drop File Upload + URL Input */}
              <div className="lg:col-span-7 space-y-5">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingLogo(true);
                  }}
                  onDragLeave={() => setIsDraggingLogo(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingLogo(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleLogoFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    isDraggingLogo
                      ? 'border-blue-600 bg-blue-50/60 scale-[1.01]'
                      : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleLogoFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center mb-3 shadow-inner">
                    <Upload className="w-8 h-8 animate-pulse" />
                  </div>

                  <h5 className="font-bold text-sm text-slate-900 mb-1">
                    {isUploadingLogo ? 'Sedang Memproses Logo...' : 'Klik untuk Pilih File Logo atau Tarik ke Sini'}
                  </h5>
                  <p className="text-xs text-slate-500 max-w-sm mb-3">
                    Mendukung format <strong>PNG, JPG, SVG, atau WEBP</strong> (Disarankan latar belakang transparan / rasio 1:1, maks. 5MB).
                  </p>

                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Gambar dari Komputer / HP</span>
                  </button>
                </div>

                {/* Option 2: Direct Image URL */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Atau Masukkan Tautan / Link URL Gambar Logo:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://domain.com/logo-perusahaan.png"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyLogoUrl}
                      className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-sm"
                    >
                      Terapkan URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Current Active Logo Showcase */}
              <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Logo Aktif Saat Ini
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    Online
                  </span>
                </div>

                <div className="flex items-center justify-center p-6 bg-slate-800/60 rounded-xl border border-slate-700/50">
                  <div className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center shadow-lg backdrop-blur-sm overflow-hidden">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Logo PT. CAFTHEN INDO PROJECT"
                        className="max-w-full max-h-full object-contain drop-shadow"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-900 text-white font-black text-3xl flex items-center justify-center rounded-xl">
                        CIP
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h6 className="font-extrabold text-sm text-white">
                    {companyName || 'PT. CAFTHEN INDO PROJECT'}
                  </h6>
                  <p className="text-xs text-slate-400 font-mono">
                    {storeName || 'CAFTHEN STORE ID'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Corporate Logo Designs */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Pilihan Desain Logo Preset Resmi CIP (Siap Pakai 1-Klik)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih salah satu dari desain logo korporasi resmi vektor resolusi tinggi jika belum memiliki file logo sendiri:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LOGO_PRESETS.map((preset) => {
                const isSelected = logoUrl === preset.svgDataUrl;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPresetLogo(preset.svgDataUrl, preset.name)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-blue-400 bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-center p-3 bg-slate-900 rounded-xl">
                        <img
                          src={preset.svgDataUrl}
                          alt={preset.name}
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-slate-900">{preset.name}</h5>
                          {isSelected && (
                            <span className="p-1 bg-blue-900 text-white rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                          {preset.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-900 text-white'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ Sedang Digunakan' : 'Gunakan Desain Ini'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Platform Live Previews */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                Simulasi Tampilan Logo di Berbagai Halaman & Dokumen
              </h4>
              <p className="text-xs text-slate-500">
                Berikut adalah simulasi visual bagaimana logo akan terlihat oleh konsumen:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Preview 1: Light Header Navbar */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  1. Pada Menu Atas (Navbar Terang)
                </span>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-xs" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-900 text-white font-black rounded-xl flex items-center justify-center text-sm">
                        CIP
                      </div>
                    )}
                    <div>
                      <div className="font-black text-sm text-slate-950 leading-tight">
                        {storeName || 'CAFTHEN STORE ID'}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500">
                        {companyName || 'PT. CAFTHEN INDO PROJECT'}
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full w-full" />
                </div>
              </div>

              {/* Preview 2: Dark Footer / Hero */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  2. Pada Footer & Tema Gelap
                </span>
                <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-xs" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center text-sm">
                        CIP
                      </div>
                    )}
                    <div>
                      <div className="font-extrabold text-xs text-white leading-tight">
                        {companyName || 'PT. CAFTHEN INDO PROJECT'}
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono">
                        {storeName || 'CAFTHEN STORE ID'}
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full w-full" />
                </div>
              </div>

              {/* Preview 3: Formal Contract SPJB Kop Surat */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-900" /> 3. Kop Surat Kontrak Hukum (SPJB)
                </span>
                <div className="p-4 bg-amber-50/40 border-2 border-double border-slate-900 rounded-2xl space-y-2">
                  <div className="flex items-center gap-3 border-b border-slate-900 pb-2">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-900 text-white font-black rounded-lg flex items-center justify-center text-xs">
                        CIP
                      </div>
                    )}
                    <div className="text-left">
                      <div className="font-black text-xs text-slate-950 uppercase">
                        {companyName || 'PT. CAFTHEN INDO PROJECT'}
                      </div>
                      <div className="text-[9px] text-blue-900 font-bold uppercase">
                        GENERAL TRADING & CIVIL CONSTRUCTION
                      </div>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-600 text-center font-mono">
                    SURAT PERJANJIAN JUAL BELI RESMI (SPJB)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PROFIL, LEGALITAS & EDIT SELURUH TEKS HALAMAN UTAMA */}
      {subTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Quick Sub-Navigation for Profile & Landing Page Editor */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'identitas', label: '1. Identitas & Kontak' },
                { id: 'legal', label: '2. Legalitas Resmi (NIB, AHU, NPWP)' },
                { id: 'hero', label: '3. Teks Hero (Halaman Depan)' },
                { id: 'layanan', label: '4. Teks Profil & 3 Layanan' },
                { id: 'footer', label: '5. Teks Footer' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setProfileSubSection(s.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    profileSubSection === s.id
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer ml-auto"
            >
              <Save className="w-4 h-4" /> Simpan Seluruh Teks & Legalitas
            </button>
          </div>

          {/* SECTION 1: IDENTITAS & KONTAK */}
          {profileSubSection === 'identitas' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-base text-slate-900">
                  1. Informasi Identitas & Kontak Perusahaan
                </h4>
                <p className="text-xs text-slate-500">
                  Data ini digunakan pada navigasi, dokumen resmi, invoice, dan kontak CS.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Perusahaan Resmi</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="PT. CAFTHEN INDO PROJECT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Toko / Store ID (Katalog)</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="CAFTHEN STORE ID"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner & Komisaris</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Vian Alfianto"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Direktur Utama</label>
                  <input
                    type="text"
                    value={director}
                    onChange={(e) => setDirector(e.target.value)}
                    placeholder="Amri"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@cafthen.co.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp CS</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 822-4993-9461"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slogan / Tagline Korporasi</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Solusi Terpadu Komoditas Perdagangan, Pengadaan & Kontraktor Sipil Terpercaya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jam Operasional Kantor & Layanan</label>
                <input
                  type="text"
                  value={operationalHours}
                  onChange={(e) => setOperationalHours(e.target.value)}
                  placeholder="Senin - Sabtu: 08:00 - 17:00 WIB (Layanan Emergency/Pelayaran 24 Jam)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap Kantor Pusat</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Lintas Timur Sumatera KM 18, Muaro Jambi, Provinsi Jambi, Indonesia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link Titik Google Maps</label>
                  <input
                    type="url"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Pos</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="36361"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: LEGALITAS LENGKAP */}
          {profileSubSection === 'legal' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    2. Legalitas Resmi, Nomor Izin & Sertifikasi Korporasi
                  </h4>
                  <p className="text-xs text-slate-500">
                    Nomor-nomor hukum ini tampil pada Factsheet Legalitas Halaman Utama dan Surat Perjanjian Kontrak Digital (SPJB).
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  Dokumen Hukum Resmi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Induk Berusaha (NIB OSS RBA)</label>
                  <input
                    type="text"
                    value={nib}
                    onChange={(e) => setNib(e.target.value)}
                    placeholder="0220202931234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SK Pengesahan Kemenkumham RI</label>
                  <input
                    type="text"
                    value={ahukemenkumham}
                    onChange={(e) => setAhukemenkumham(e.target.value)}
                    placeholder="AHU-0012345.AH.01.01.TAHUN 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NPWP Resmi Perusahaan</label>
                  <input
                    type="text"
                    value={npwp}
                    onChange={(e) => setNpwp(e.target.value)}
                    placeholder="41.890.123.4-331.000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Akta Notaris Pendirian</label>
                  <input
                    type="text"
                    value={aktaNotaris}
                    onChange={(e) => setAktaNotaris(e.target.value)}
                    placeholder="Akta Notaris No. 12 Tanggal 15 Agustus 2024"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Izin Usaha Operasional & PB-UMKU</label>
                <input
                  type="text"
                  value={izinUsaha}
                  onChange={(e) => setIzinUsaha(e.target.value)}
                  placeholder="Izin Usaha PB-UMKU OSS RBA Kementerian Investasi / BKPM RI"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sertifikasi Mutu, Standar & K3 Konstruksi</label>
                <input
                  type="text"
                  value={sertifikasi}
                  onChange={(e) => setSertifikasi(e.target.value)}
                  placeholder="ISO 9001:2015, ISO 14001:2015, Sertifikat Standar K3 Konstruksi (SMK3)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* SECTION 3: EDIT TEKS HERO SECTION */}
          {profileSubSection === 'hero' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-base text-slate-900">
                  3. Pengaturan Teks Hero Section (Banner Atas Halaman Depan)
                </h4>
                <p className="text-xs text-slate-500">
                  Ubah teks judul besar, badge pengumuman/ekspor, paragraf deskripsi, dan tombol pada bagian atas halaman depan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge Pengumuman Atas (Ticker Pill)</label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  placeholder="Kegiatan Ekspor • Produksi Arang Batok • Penjualan Kelapa Tua • Cangkang Sawit • Konstruksi Sipil"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Badge ini muncul di bagian paling atas dengan ikon bintang bersinar.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Utama Hero (Heading 1)</label>
                <textarea
                  rows={2}
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Solusi Terpadu Perdagangan Komoditas, Pengadaan & Konstruksi Sipil"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-950 focus:ring-2 focus:ring-blue-600 focus:outline-none leading-snug"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Paragraf Deskripsi Hero</label>
                <textarea
                  rows={3}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Mitra strategis terpercaya di Indonesia dalam pengadaan komoditas batubara curah, besi beton SNI..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teks Tombol Aksi Utama 1</label>
                  <input
                    type="text"
                    value={heroCtaButton1}
                    onChange={(e) => setHeroCtaButton1(e.target.value)}
                    placeholder="Buka Katalog Komoditas & Material"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teks Tombol Aksi 2</label>
                  <input
                    type="text"
                    value={heroCtaButton2}
                    onChange={(e) => setHeroCtaButton2(e.target.value)}
                    placeholder="Konsultasi & Penawaran Resmi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Label Sistem Pajak / Integrasi</label>
                  <input
                    type="text"
                    value={taxSystemLabel}
                    onChange={(e) => setTaxSystemLabel(e.target.value)}
                    placeholder="ECoretax DJP Integrated"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: EDIT TEKS PROFIL & 3 PILAR LAYANAN */}
          {profileSubSection === 'layanan' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-base text-slate-900">
                  4. Pengaturan Teks Bagian Profil & 3 Pilar Layanan
                </h4>
                <p className="text-xs text-slate-500">
                  Kustomisasi judul section profil dan rincian penjelasan 3 kartu layanan bisnis korporasi.
                </p>
              </div>

              {/* Header Section Profil */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-blue-900 uppercase">Header Bagian Profil</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge Kategori</label>
                    <input
                      type="text"
                      value={profileSectionBadge}
                      onChange={(e) => setProfileSectionBadge(e.target.value)}
                      placeholder="PROFIL & KEGIATAN PERUSAHAAN"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Judul Bagian</label>
                    <input
                      type="text"
                      value={profileSectionTitle}
                      onChange={(e) => setProfileSectionTitle(e.target.value)}
                      placeholder="Dedikasi, Integritas & Rantai Pasok Skala Nasional"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Paragraf Deskripsi Profil</label>
                  <textarea
                    rows={2}
                    value={profileSectionDescription}
                    onChange={(e) => setProfileSectionDescription(e.target.value)}
                    placeholder="PT. CAFTHEN INDO PROJECT adalah badan usaha berbadan hukum yang berkantor pusat di Muaro Jambi..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Pilar 1: Trading */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                <span className="text-xs font-bold text-amber-900 uppercase">Pilar 1: Perdagangan Komoditas (General Trading)</span>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Layanan</label>
                  <input
                    type="text"
                    value={tradingTitle}
                    onChange={(e) => setTradingTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Layanan & Pasokan</label>
                  <textarea
                    rows={2}
                    value={tradingDesc}
                    onChange={(e) => setTradingDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pilar 2: Procurement */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
                <span className="text-xs font-bold text-blue-900 uppercase">Pilar 2: Pengadaan Barang & Jasa (Procurement)</span>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Layanan</label>
                  <input
                    type="text"
                    value={procurementTitle}
                    onChange={(e) => setProcurementTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Layanan & Material</label>
                  <textarea
                    rows={2}
                    value={procurementDesc}
                    onChange={(e) => setProcurementDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pilar 3: Konstruksi Sipil */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                <span className="text-xs font-bold text-emerald-900 uppercase">Pilar 3: Konstruksi Bangunan Sipil & Infrastruktur</span>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Layanan</label>
                  <input
                    type="text"
                    value={constructionTitle}
                    onChange={(e) => setConstructionTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Layanan & Proyek</label>
                  <textarea
                    rows={2}
                    value={constructionDesc}
                    onChange={(e) => setConstructionDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: EDIT TEKS FOOTER */}
          {profileSubSection === 'footer' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-base text-slate-900">
                  5. Pengaturan Teks Footer & Informasi Bawah
                </h4>
                <p className="text-xs text-slate-500">
                  Ubah teks pengantar perusahaan yang muncul di bagian bawah website (footer).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Singkat Footer</label>
                <textarea
                  rows={3}
                  value={footerAbout}
                  onChange={(e) => setFooterAbout(e.target.value)}
                  placeholder="Perusahaan perdagangan umum komoditas tambang batubara, pengadaan material konstruksi bersertifikasi SNI..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Bottom Save Action */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-lg">
            <div className="text-xs">
              <p className="font-bold">Simpan Seluruh Pengaturan Profil, Legalitas & Teks</p>
              <p className="text-slate-400 text-[11px]">Perubahan akan langsung sinkron ke Database & Halaman Depan.</p>
            </div>
            <button
              type="submit"
              className="py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" /> Simpan Semua Perubahan
            </button>
          </div>
        </form>
      )}

      {subTab === 'team' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-base text-slate-900">Manajemen Tim & Struktur Perusahaan</h4>
              <p className="text-xs text-slate-500">Kelola jajaran direksi, staf, foto profil, dan deskripsi struktur organisasi</p>
            </div>
            <button
              onClick={() => setIsAddingMember(true)}
              className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" /> Tambah Anggota Tim
            </button>
          </div>

          {/* Edit Team Member Modal */}
          {editingTeamMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <form onSubmit={handleSaveEditedTeamMember} className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-900" /> Edit Data Anggota Tim
                  </h5>
                  <button
                    type="button"
                    onClick={() => setEditingTeamMember(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                    <input
                      type="text"
                      required
                      value={editingTeamMember.name}
                      onChange={(e) => setEditingTeamMember({ ...editingTeamMember, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jabatan / Posisi Resmi</label>
                    <input
                      type="text"
                      required
                      value={editingTeamMember.position}
                      onChange={(e) => setEditingTeamMember({ ...editingTeamMember, position: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Foto Profil Anggota</label>
                    <div className="flex gap-2 mb-1.5">
                      <input
                        type="url"
                        placeholder="Link URL foto..."
                        value={editingTeamMember.photoUrl}
                        onChange={(e) => setEditingTeamMember({ ...editingTeamMember, photoUrl: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono"
                      />
                      <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer flex items-center gap-1 shrink-0">
                        <Upload className="w-3.5 h-3.5" /> Unggah File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setEditingTeamMember({ ...editingTeamMember, photoUrl: ev.target.result as string });
                                }
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {editingTeamMember.photoUrl && (
                      <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border">
                        <img src={editingTeamMember.photoUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                        <span className="text-[10px] text-slate-500">Preview Foto Aktif</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Deskripsi Pengalaman</label>
                    <textarea
                      rows={3}
                      value={editingTeamMember.bio || ''}
                      onChange={(e) => setEditingTeamMember({ ...editingTeamMember, bio: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingTeamMember(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow"
                  >
                    <Save className="w-3.5 h-3.5 inline mr-1" /> Simpan Permanen
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* New Member Form */}
          {isAddingMember && (
            <form onSubmit={handleAddTeamMember} className="p-4 bg-slate-50 border border-blue-200 rounded-xl space-y-3">
              <h5 className="font-bold text-xs text-blue-900 uppercase">Tambah Anggota Tim Baru</h5>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap & Gelar"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Jabatan / Posisi"
                  value={newMemberPosition}
                  onChange={(e) => setNewMemberPosition(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="URL Foto Anggota"
                  value={newMemberPhoto}
                  onChange={(e) => setNewMemberPhoto(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-xs"
                />
                <label className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                  <Upload className="w-3.5 h-3.5" /> File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) setNewMemberPhoto(ev.target.result as string);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              <textarea
                placeholder="Bio / Keterangan Pengalaman"
                rows={2}
                value={newMemberBio}
                onChange={(e) => setNewMemberBio(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white font-bold text-xs rounded-lg"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialTeam.map((member) => (
              <div key={member.id} className="p-4 border rounded-2xl flex items-start gap-3 bg-slate-50 relative group hover:border-blue-400 transition-colors shadow-xs">
                <img src={member.photoUrl} alt={member.name} className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200" />
                <div className="space-y-1 pr-16 flex-1">
                  <h5 className="font-bold text-xs text-slate-900">{member.name}</h5>
                  <p className="text-[11px] font-semibold text-blue-900">{member.position}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{member.bio}</p>
                </div>
                
                {/* Action Buttons: EDIT & DELETE */}
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <button
                    onClick={() => handleStartEditTeamMember(member)}
                    className="p-1.5 bg-blue-100 hover:bg-blue-900 text-blue-900 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Edit Data Anggota Tim"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {member.id !== 'team-1' && member.id !== 'team-2' && (
                    <button
                      onClick={() => handleDeleteTeamMember(member.id)}
                      className="p-1.5 bg-rose-100 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'activities' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-base text-slate-900">Foto & Dokumentasi Kegiatan Kerja</h4>
              <p className="text-xs text-slate-500">Kelola foto kegiatan proyek, lokasi, kategori, dan deskripsi</p>
            </div>
            <button
              onClick={() => setIsAddingActivity(true)}
              className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" /> Tambah Foto Kegiatan
            </button>
          </div>

          {/* Edit Activity Photo Modal */}
          {editingActivity && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <form onSubmit={handleSaveEditedActivity} className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-900" /> Edit Foto Dokumentasi Kegiatan
                  </h5>
                  <button
                    type="button"
                    onClick={() => setEditingActivity(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kegiatan</label>
                      <input
                        type="text"
                        required
                        value={editingActivity.title}
                        onChange={(e) => setEditingActivity({ ...editingActivity, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Proyek</label>
                      <select
                        value={editingActivity.category}
                        onChange={(e) => setEditingActivity({ ...editingActivity, category: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                      >
                        <option value="Konstruksi Sipil">Konstruksi Sipil</option>
                        <option value="Pemuatan Kapal & Logistik">Pemuatan Kapal & Logistik</option>
                        <option value="Pengadaan & Material">Pengadaan & Material</option>
                        <option value="Quality Control">Quality Control</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Foto Dokumentasi</label>
                    <div className="flex gap-2 mb-1.5">
                      <input
                        type="url"
                        value={editingActivity.imageUrl}
                        onChange={(e) => setEditingActivity({ ...editingActivity, imageUrl: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono"
                      />
                      <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer flex items-center gap-1 shrink-0">
                        <Upload className="w-3.5 h-3.5" /> File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                if (ev.target?.result) {
                                  setEditingActivity({ ...editingActivity, imageUrl: ev.target.result as string });
                                }
                              };
                              reader.readAsDataURL(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                    {editingActivity.imageUrl && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 max-h-36">
                        <img src={editingActivity.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Proyek</label>
                      <input
                        type="text"
                        value={editingActivity.location || ''}
                        onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Dokumentasi</label>
                      <input
                        type="text"
                        value={editingActivity.date || ''}
                        onChange={(e) => setEditingActivity({ ...editingActivity, date: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Rinci Kegiatan</label>
                    <textarea
                      rows={3}
                      value={editingActivity.description || ''}
                      onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingActivity(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow"
                  >
                    <Save className="w-3.5 h-3.5 inline mr-1" /> Simpan Perubahan Foto
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* New Activity Form */}
          {isAddingActivity && (
            <form onSubmit={handleAddActivity} className="p-4 bg-slate-50 border border-blue-200 rounded-xl space-y-3">
              <h5 className="font-bold text-xs text-blue-900 uppercase">Tambah Foto Kegiatan Proyek</h5>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Judul Kegiatan"
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-xs"
                />
                <select
                  value={newActCategory}
                  onChange={(e) => setNewActCategory(e.target.value as any)}
                  className="px-3 py-2 border rounded-lg text-xs bg-white"
                >
                  <option value="Konstruksi Sipil">Konstruksi Sipil</option>
                  <option value="Pemuatan Kapal & Logistik">Pemuatan Kapal & Logistik</option>
                  <option value="Pengadaan & Material">Pengadaan & Material</option>
                  <option value="Quality Control">Quality Control</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder="URL Foto Dokumentasi"
                    value={newActImageUrl}
                    onChange={(e) => setNewActImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-xs"
                  />
                  <label className="px-2.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) setNewActImageUrl(ev.target.result as string);
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Lokasi (misal: Pelabuhan Talang Duku)"
                  value={newActLocation}
                  onChange={(e) => setNewActLocation(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-xs"
                />
              </div>
              <textarea
                placeholder="Keterangan Rinci Kegiatan Kerja"
                rows={2}
                value={newActDescription}
                onChange={(e) => setNewActDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingActivity(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-900 text-white font-bold text-xs rounded-lg"
                >
                  Simpan Foto Kegiatan
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialActivities.map((act) => (
              <div key={act.id} className="border rounded-2xl overflow-hidden bg-slate-50 relative group hover:border-blue-400 transition-all shadow-xs">
                <img src={act.imageUrl} alt={act.title} className="w-full h-40 object-cover" />
                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-900 rounded-md uppercase">
                      {act.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.date}</span>
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{act.title}</h5>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{act.description}</p>
                </div>

                {/* Edit & Delete Actions Overlay */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleStartEditActivity(act)}
                    className="p-1.5 bg-white/90 hover:bg-blue-900 text-blue-900 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                    title="Edit Foto Dokumentasi Ini"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(act.id)}
                    className="p-1.5 bg-white/90 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'video' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <h4 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            Pengaturan Video Kegiatan (Link YouTube)
          </h4>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Judul Video</label>
            <input
              type="text"
              value={youtubeVideoTitle}
              onChange={(e) => setYoutubeVideoTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Link / URL YouTube</label>
            <input
              type="url"
              value={youtubeVideoUrl}
              onChange={(e) => setYoutubeVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... atau embed url"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
            />
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer"
            >
              <Save className="w-4 h-4" /> Update Video YouTube
            </button>
          </div>
        </form>
      )}

      {subTab === 'visiMisi' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <h4 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            Kelola Visi & Misi Perusahaan
          </h4>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pernyataan Visi Utama</label>
            <textarea
              rows={3}
              value={visi}
              onChange={(e) => setVisi(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Daftar Butir Misi Perusahaan</label>
            <div className="space-y-2">
              {misi.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const updated = [...misi];
                      updated[idx] = e.target.value;
                      setMisi(updated);
                    }}
                    className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteMisiPoint(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Tambahkan butir misi baru..."
                value={newMisiText}
                onChange={(e) => setNewMisiText(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddMisiPoint}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Tambah
              </button>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="py-2.5 px-6 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan Visi & Misi
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
