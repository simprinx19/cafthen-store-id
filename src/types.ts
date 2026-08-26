export type UserType = 'Perorangan' | 'Perusahaan';

export type AccountStatus = 'Pending' | 'Verified' | 'Rejected';

export interface UserProfile {
  id: string; // e.g. CIP-USR-2026-0801
  username: string;
  password?: string;
  fullName: string;
  companyName?: string;
  userType: UserType;
  email: string;
  whatsapp: string;
  address: string;
  photoUrl?: string;
  ktpUrl?: string;
  npwpUrl?: string;
  comproUrl?: string;
  nikKtp?: string;
  npwp?: string;
  status: AccountStatus;
  registeredAt: string;
}

export type ProductCategory = 
  | 'Konstruksi Sipil & Material'
  | 'Perdagangan Komoditas & Mineral'
  | 'Pengadaan Alat & Logistik'
  | 'Jasa Kontraktor & Engineering';

export interface PatternPricing {
  priceIDR: number;
  priceUSD?: number;
  description?: string;
  enabled?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  priceIDR: number; // Harga Dasar / Default
  priceUSD: number;
  patternPrices?: {
    Loco?: PatternPricing;
    FOB?: PatternPricing;
    Franco?: PatternPricing;
    CIF?: PatternPricing;
  };
  stock: number;
  unit: string;
  origin: string; // Asal Produk (e.g. Jambi, Palembang, Cilegon, Kalimantan)
  images: string[];
  specs: string[]; // Daftar berpoint keterangan produk
  ecoretaxType: 'Include' | 'Exclude';
  description: string;
  featured?: boolean;
  createdAt?: string;
}

export type PurchasePattern = 'Loco' | 'FOB' | 'Franco' | 'CIF';

export type ShippingMethod = 'Trucking' | 'Tongkang' | 'Mother Vessel';

export type PaymentMethod = 
  | 'Cash'
  | '50:50'
  | '50:40:10'
  | 'QRIS'
  | 'LC USANCE'
  | 'LC AT SIGHT';

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface PaymentMethodConfig {
  id: string;
  code: PaymentMethod;
  name: string;
  description: string;
  enabled: boolean;
  badge?: string;
  downPaymentPercent: number;
  progressPaymentPercent?: number;
  finalPaymentPercent: number;
  minTransactionAmountIDR?: number;
  requiresVerificationDocs?: boolean;
  instructions: string;
  terms: string[];
}

export interface PaymentSettingsState {
  methods: PaymentMethodConfig[];
  bankAccounts: BankAccount[];
  qrisConfig: {
    merchantName: string;
    nmid: string;
    qrisImageUrl: string;
    enabled: boolean;
  };
  globalPaymentTerms: string[];
  duePaymentHours: number;
  allowCustomMilestones?: boolean;
}

export type OrderStatus = 
  | 'Menunggu Verifikasi'
  | 'Menunggu Verifikasi Kontrak & Pembayaran'
  | 'Kontrak Terbit'
  | 'Kontrak Terbit & Disetujui'
  | 'DP Terverifikasi'
  | 'DP Terverifikasi (50%)'
  | 'Pemuatan Barang (Loading)'
  | 'Dalam Pengiriman'
  | 'Dalam Pengiriman (On The Way)'
  | 'Tiba di Lokasi / Pelabuhan'
  | 'Tiba di Lokasi / Pelabuhan Tujuan'
  | 'Selesai'
  | 'Selesai (Pelunasan 100% Lunas)'
  | 'Dibatalkan';

export interface PaymentMilestone {
  id: string;
  name: string;
  percentage: number;
  amountIDR: number;
  isPaid: boolean;
  paidAt?: string;
  proofImageUrl?: string;
}

export interface PaymentProof {
  stage: 'DP (50%)' | 'Progres (40%)' | 'Pelunasan (10%)' | 'Full Payment' | 'QRIS';
  amount: number;
  receiptUrl: string;
  uploadedAt: string;
  bankName: string;
  senderAccount: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  notes?: string;
}

export interface ContractArticle {
  number?: number;
  title: string;
  content: string;
  clauses?: string[];
  legalRef?: string;
}

export interface DigitalContract {
  contractNumber: string; // e.g. CIP/SPJB/2026/VIII/0129
  createdAt: string;
  legalBasis?: string[];
  qrSignatureHash?: string;
  firstParty: {
    company: string;
    director: string;
    owner: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
    qrSignature: string;
  };
  secondParty: {
    userId: string;
    name: string;
    userType: UserType;
    companyName?: string;
    idNumber: string; // KTP / NPWP
    address: string;
    phone: string;
    email: string;
    signatureDataUrl?: string; // Digital signature canvas base64
    signedAt?: string;
  };
  orderDetails: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    unitPriceIDR: number;
    unitPriceUSD: number;
    subtotalIDR: number;
    taxAmountIDR: number;
    taxType: string;
    shippingCostIDR: number;
    totalAmountIDR: number;
    totalAmountUSD: number;
    purchasePattern: PurchasePattern;
    destinationCoordinateLink?: string;
    shippingMethod: ShippingMethod;
    paymentMethod: PaymentMethod;
  };
  articles: ContractArticle[];
  sellerProtectionSummary?: string[];
  buyerProtectionSummary?: string[];
  isSignedByBuyer: boolean;
  totalPages?: number;
}

export interface Order {
  id: string; // e.g. ORD-CIP-2026-9081
  buyerId?: string;
  userId?: string;
  buyerName: string;
  buyerCompany?: string;
  buyerEmail: string;
  buyerPhone: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unit: string;
  currency?: 'IDR' | 'USD';
  unitPrice?: number;
  totalPriceIDR: number;
  totalPriceUSD: number;
  purchasePattern: PurchasePattern;
  francoLocation?: string;
  francoCoordinateMapsUrl?: string;
  destinationCoordinateLink?: string;
  shippingMethod: ShippingMethod;
  taxSystem: {
    type: 'Include' | 'Exclude' | 'Mandatory';
    ppnRate: number; // e.g. 11%
    ppnAmount: number;
    pphAmount: number;
  };
  paymentScheme?: string;
  paymentMethod: PaymentMethod;
  paymentSchedule: PaymentMilestone[];
  paymentDetails?: {
    dpAmount: number;
    progressAmount?: number;
    finalAmount?: number;
    isPaid: boolean;
    proofs: PaymentProof[];
  };
  status: OrderStatus;
  trackingNumber?: string;
  currentLocation?: string;
  contract: DigitalContract;
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  photoUrl: string;
  bio: string;
  socials?: {
    email?: string;
    linkedin?: string;
    whatsapp?: string;
  };
}

export interface ActivityPhoto {
  id: string;
  title: string;
  category: 'Konstruksi Sipil' | 'Pemuatan Kapal & Logistik' | 'Pengadaan & Material' | 'Quality Control';
  imageUrl: string;
  description: string;
  date: string;
  location: string;
}

export interface CompanyProfileData {
  companyName: string;
  storeName: string;
  logoUrl?: string;
  address: string;
  email: string;
  phone: string;
  owner: string;
  director: string;
  youtubeVideoUrl: string;
  youtubeVideoTitle: string;
  mapsUrl: string;
  visi: string;
  misi: string[];
  bankAccounts: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }[];
  qrisImageUrl: string;

  // Identitas & Legalitas Lengkap Perusahaan
  nib?: string;
  ahukemenkumham?: string;
  npwp?: string;
  aktaNotaris?: string;
  izinUsaha?: string;
  sertifikasi?: string;
  postalCode?: string;
  operationalHours?: string;
  tagline?: string;

  // Kustomisasi Teks & Keterangan Halaman Utama (Hero Section)
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaButton1?: string;
  heroCtaButton2?: string;
  taxSystemLabel?: string;

  // Kustomisasi Teks Profil & 3 Layanan Utama
  profileSectionBadge?: string;
  profileSectionTitle?: string;
  profileSectionDescription?: string;
  tradingTitle?: string;
  tradingDesc?: string;
  tradingPoints?: string[];
  procurementTitle?: string;
  procurementDesc?: string;
  procurementPoints?: string[];
  constructionTitle?: string;
  constructionDesc?: string;
  constructionPoints?: string[];

  // Kustomisasi Teks Bagian Bawah / Footer
  footerAbout?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'admin' or userId
  senderName: string;
  recipientId?: string;
  receiverId?: string;
  message?: string;
  text?: string;
  timestamp: string;
  isRead?: boolean;
  isAdmin?: boolean;
  orderId?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'order' | 'contract' | 'payment' | 'account' | 'system';
  link?: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: 'Operasional Proyek' | 'Gaji & Tenaga Ahli' | 'Logistik & Armada' | 'Perpajakan' | 'Peralatan & Maintenance' | 'Lainnya';
  amount: number;
  sourceOfFunds: 'Modal Operasional' | 'Keuntungan Bersih' | 'Kas Proyek';
  date: string;
  description: string;
  receiptNumber?: string;
  recordedBy?: string;
}

export interface FinancialReport {
  initialCapital: number;
  operationalCash: number;
  projectCash: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  taxPaidPPN: number;
  taxPaidPPh: number;
}

export type FinanceSummary = FinancialReport;

export type ThemePreset =
  | 'gold-navy'
  | 'emerald-forest'
  | 'ocean-sapphire'
  | 'ruby-industrial'
  | 'bronze-luxury'
  | 'violet-tech'
  | 'teal-cyan'
  | 'monochrome-slate';

export interface ThemeSettings {
  preset: ThemePreset;
  themeName: string;
  primaryColor: string; // e.g. '#f59e0b' or '#10b981'
  primaryHover: string; // e.g. '#d97706'
  secondaryColor: string; // e.g. '#0f172a' (navy / dark slate)
  accentColor: string; // e.g. '#fbbf24'
  dashboardTheme: 'dark-executive' | 'light-modern' | 'navy-slate';
  borderRadius: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
  fontFamily: 'sans' | 'display' | 'mono';
  enableGlowEffects: boolean;
  updatedAt?: string;
}

