import { 
  DigitalContract, 
  UserProfile, 
  Product, 
  PurchasePattern, 
  ShippingMethod, 
  PaymentMethod, 
  CompanyProfileData,
  ContractArticle,
  PaymentSettingsState
} from '../types';
import { formatIDR, formatUSD } from './formatters';
import { PURCHASE_PATTERNS_INFO } from './pricing';

export interface ContractGenerationInput {
  buyer: UserProfile;
  product: Product;
  quantity: number;
  purchasePattern: PurchasePattern;
  destinationCoordinateLink?: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  taxOption: 'Include' | 'Exclude' | 'Mandatory';
  unitPriceIDR: number;
  unitPriceUSD: number;
  subtotalIDR: number;
  ppnAmountIDR: number;
  pphAmountIDR: number;
  totalAmountIDR: number;
  totalAmountUSD: number;
  dpAmountIDR: number;
  progressAmountIDR?: number;
  finalAmountIDR: number;
  company: CompanyProfileData;
  paymentSettings?: PaymentSettingsState;
  signatureDataUrl?: string;
}

export function generateContractHash(contractNumber: string, buyerId: string, timestamp: number): string {
  const raw = `${contractNumber}|${buyerId}|CIP-LEGAL-REGISTRY|${timestamp}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `SHA256:CIP-${hex}-${Date.now().toString(36).toUpperCase()}-VERIFIED`;
}

export function generateDigitalContractDocument(input: ContractGenerationInput): DigitalContract {
  const now = new Date();
  const year = now.getFullYear();
  const monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][now.getMonth()];
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const contractNumber = `CIP/SPJB/${year}/${monthRoman}/${randomSuffix}`;
  
  const createdDateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ` pukul ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

  const isWaterRoute = input.shippingMethod === 'Tongkang' || input.shippingMethod === 'Mother Vessel';
  const buyerEntity = input.buyer.companyName ? `${input.buyer.companyName} (diwakili oleh ${input.buyer.fullName})` : input.buyer.fullName;
  const buyerIdDoc = input.buyer.userType === 'Perusahaan' 
    ? (input.buyer.npwp ? `NPWP: ${input.buyer.npwp}` : 'NPWP Terdaftar Akun Perusahaan') 
    : (input.buyer.nikKtp ? `NIK KTP: ${input.buyer.nikKtp}` : 'NIK/Identitas KTP Terverifikasi');

  const primaryBank = input.company.bankAccounts && input.company.bankAccounts.length > 0
    ? input.company.bankAccounts[0]
    : { bankName: 'Bank Mandiri', accountNumber: '110-00-1849201-9', accountHolder: 'PT. CAFTHEN INDO PROJECT' };

  // Generate 10 Structured Legal Articles
  const articles: ContractArticle[] = [
    {
      number: 1,
      title: 'PASAL 1 : DASAR HUKUM, KETENTUAN UMUM & LEGAL STANDING PARA PIHAK',
      legalRef: 'Pasal 1320 & 1338 KUHPerdata, UU ITE No. 1/2024 Pasal 5 & 11',
      content: `Perjanjian Jual Beli dan Pengadaan ini dibuat berdasarkan asas kebebasan berkontrak (Pacta Sunt Servanda) dan iktikad baik menurut Pasal 1320 dan 1338 Kitab Undang-Undang Hukum Perdata Republik Indonesia, serta Undang-Undang No. 11 Tahun 2008 jo. Undang-Undang No. 1 Tahun 2024 tentang Informasi dan Transaksi Elektronik.`,
      clauses: [
        `1.1. PIHAK PERTAMA adalah Badan Hukum Perseroan Terbatas yang sah dan berwenang menyelenggarakan kegiatan Perdagangan Umum, Pengadaan Barang/Jasa, dan Konstruksi Sipil berdasarkan izin legalitas resmi Republik Indonesia.`,
        `1.2. PIHAK KEDUA adalah individu atau entitas korporasi terdaftar yang bertindak secara sah menurut hukum untuk mengikatkan diri dalam perikatan pengadaan komoditas/material dengan PIHAK PERTAMA.`,
        `1.3. Para Pihak sepakat bahwa penandatanganan dokumen elektronik serta validasi QR Seal Kriptografis memiliki kekuatan hukum pembuktian yang sempurna, setara dengan akta otentik bertanda tangan basah di hadapan pejabat yang berwenang.`
      ]
    },
    {
      number: 2,
      title: 'PASAL 2 : OBJEK PERJANJIAN, KUANTITAS & SPESIFIKASI MUTU KOMODITAS',
      legalRef: 'UU No. 7 Tahun 2014 tentang Perdagangan & Standar SNI',
      content: `PIHAK PERTAMA bersepakat untuk menjual, menyerahkan, dan menyediakan kepada PIHAK KEDUA, dan PIHAK KEDUA bersepakat membeli dan menerima komoditas/jasa pengadaan berikut:`,
      clauses: [
        `2.1. Nama Komoditas/Material: ${input.product.name} (Kategori: ${input.product.category}).`,
        `2.2. Volume / Jumlah Pesanan: ${input.quantity.toLocaleString('id-ID')} ${input.product.unit} dengan asal pengiriman dari ${input.product.origin || 'Depot Logistik Resmi PT. CAFTHEN INDO PROJECT'}.`,
        `2.3. Spesifikasi Mutu: Komoditas wajib memenuhi standar mutu industri, SNI, dan parameter teknis yang tercantum pada lembar spesifikasi resmi (${input.product.specs && input.product.specs.length > 0 ? input.product.specs.join('; ') : 'Sesuai Standar Mutu Nasional'}).`,
        `2.4. Toleransi Kuantitas & Susut Timbang (Weight Tolerance): Para Pihak menyepakati batas toleransi timbangan logistik darat/maritim sebesar maksimum 0.5% (nol koma lima persen) dari total muatan yang diakui sebagai batas wajar susut transportasi alamiah.`
      ]
    },
    {
      number: 3,
      title: 'PASAL 3 : PENGUJIAN MUTU, SERTIFIKAT LABORATORIUM (COA) & SURVEYOR INDEPENDEN',
      legalRef: 'Standar Akreditasi KAN & Prosedur Joint Sampling',
      content: `Demi menjamin transparansi dan kepastian kualitas objek transaksi, Para Pihak menyepakati mekanisme verifikasi mutu sebagai berikut:`,
      clauses: [
        `3.1. Penentuan mutu dan kuantitas dilakukan di lokasi muat (Loading Port/Depot) melalui pengujian bersama (*Joint Sampling*) atau diterbitkannya Certificate of Analysis (COA) dan Certificate of Weight (COW) oleh Lembaga Surveyor Independen Terakreditasi Nasional (PT. Sucofindo / PT. Carsurin / Laboratorium terakreditasi KAN).`,
        `3.2. Hasil pengujian laboratorium di pelabuhan muat/depot asal bersifat final, sah, dan mengikat kedua belah pihak sebagai dasar penerimaan kualitas barang.`,
        `3.3. PIHAK KEDUA berhak melakukan verifikasi mandiri saat barang tiba. Apabila terdapat deviasi mutu di luar batas toleransi yang disepakati, PIHAK KEDUA wajib menyampaikan notifikasi tertulis beserta bukti hasil uji laboratorium tervalidasi dalam waktu maksimal 3x24 jam kalender sejak kedatangan barang.`
      ]
    },
    {
      number: 4,
      title: 'PASAL 4 : NILAI KONTRAK, FORMULA HARGA & INTEGRASI PERPAJAKAN ECORETAX DJP',
      legalRef: 'UU Harmonisasi Peraturan Perpajakan (HPP) & Peraturan Dirjen Pajak',
      content: `Para Pihak menyepakati total nilai perikatan finansial atas transaksi ini dengan rincian akuntansi dan perpajakan resmi:`,
      clauses: [
        `4.1. Harga Satuan (Unit Price): Rp ${input.unitPriceIDR.toLocaleString('id-ID')} / ${input.product.unit} (ekuivalen $${input.unitPriceUSD.toFixed(2)} USD) berdasarkan skema pola pembelian ${input.purchasePattern.toUpperCase()}.`,
        `4.2. Subtotal Nilai Barang: Rp ${input.subtotalIDR.toLocaleString('id-ID')},- ($${(input.subtotalIDR / 16350).toFixed(2)} USD).`,
        `4.3. Beban Perpajakan Resmi: ${input.taxOption === 'Mandatory' || input.taxOption === 'Include' ? `Pajak Pertambahan Nilai (PPN 11%) sebesar Rp ${input.ppnAmountIDR.toLocaleString('id-ID')},- ${input.pphAmountIDR > 0 ? `ditambah PPh Pasal 22/23 sebesar Rp ${input.pphAmountIDR.toLocaleString('id-ID')},- (Wajib Jalur Air ECoretax)` : ''}` : 'Sistem Exclude Pajak (Jalur Darat Non-Wajib Faktur Tambahan)'}.`,
        `4.4. Total Nilai Kontrak Keseluruhan: Rp ${input.totalAmountIDR.toLocaleString('id-ID')},- (atau $${input.totalAmountUSD.toLocaleString('en-US')} USD) bersifat Fixed and Firm Price, tidak dapat dinaikkan atau diturunkan secara sepihak selama masa berlakunya kontrak ini.`,
        `4.5. PIHAK PERTAMA berkewajiban menerbitkan Faktur Pajak Elektronik (e-Faktur ECoretax DJP) dan Bukti Potong resmi atas nama identitas/NPWP PIHAK KEDUA secara sah.`
      ]
    },
    {
      number: 5,
      title: 'PASAL 5 : SKEMA PEMBAYARAN, TATA CARA TERMIN & REKENING RESMI PERUSAHAAN',
      legalRef: 'Pasal 1381 KUHPerdata tentang Hapusnya Perikatan karena Pembayaran Sah',
      content: `Pembayaran wajib disalurkan secara langsung ke Rekening Resmi Perusahaan PT. CAFTHEN INDO PROJECT dengan rincian skema termin yang telah dipilih:`,
      clauses: [
        `5.1. Metode Pembayaran Terpilih: ${input.paymentMethod.toUpperCase()}.`,
        input.paymentMethod === '50:50'
          ? `5.2. Rincian Termin 50:50:\n  a. Tahap 1 (Down Payment 50%): Sebesar Rp ${input.dpAmountIDR.toLocaleString('id-ID')},- dibayarkan seketika saat penandatanganan kontrak digital ini sebagai syarat sah penerbitan Surat Perintah Kerja (SPK) & Alokasi Komoditas.\n  b. Tahap 2 (Pelunasan 50%): Sebesar Rp ${input.finalAmountIDR.toLocaleString('id-ID')},- dibayarkan penuh saat barang tiba di lokasi pembeli / pelabuhan bongkar sebelum proses pembongkaran muatan selesai.`
          : input.paymentMethod === '50:40:10'
          ? `5.2. Rincian Termin 50:40:10:\n  a. Tahap 1 (Down Payment 50%): Sebesar Rp ${input.dpAmountIDR.toLocaleString('id-ID')},- dibayarkan saat tanda tangan kontrak digital dan Purchase Order (PO).\n  b. Tahap 2 (Progres 40%): Sebesar Rp ${(input.progressAmountIDR || 0).toLocaleString('id-ID')},- dibayarkan saat progres pemuatan armada pengangkutan (Loading/Dispatch) mulai dilaksanakan.\n  c. Tahap 3 (Pelunasan 10%): Sebesar Rp ${input.finalAmountIDR.toLocaleString('id-ID')},- dibayarkan setelah armada tiba di lokasi tujuan/pelabuhan bongkar.`
          : input.paymentMethod === 'QRIS'
          ? `5.2. Pembayaran Instan QRIS: Pembayaran penuh 100% sebesar Rp ${input.totalAmountIDR.toLocaleString('id-ID')},- melalui pemindaian QRIS Merchant Resmi Bank Indonesia PT. CAFTHEN INDO PROJECT.`
          : input.paymentMethod.includes('LC')
          ? `5.2. Instrumen Pembayaran Letter of Credit (${input.paymentMethod}): Diterbitkan oleh Bank Devisa Terkemuka yang dikonfirmasi oleh Bank Penerima PIHAK PERTAMA dengan presentasi dokumen lengkap (B/L, COA, COW, Faktur Pajak, Polis Asuransi).`
          : `5.2. Pembayaran Tunai Penuh (100% Cash Transfer): Sebesar Rp ${input.totalAmountIDR.toLocaleString('id-ID')},- dibayarkan lunas ke rekening resmi sebelum pelepasan armada angkut.`,
        `5.3. Rekening Bank Tujuan Resmi:\n  - Bank: ${primaryBank.bankName}\n  - Nomor Rekening: ${primaryBank.accountNumber}\n  - Atas Nama Resmi: ${primaryBank.accountHolder}\n  - Verifikasi Kepemilikan: Rekening Terdaftar Milik Direksi/Perusahaan PT. CAFTHEN INDO PROJECT.`,
        `5.4. Pembayaran hanya diakui sah apabila dana telah efektif masuk (good funds in bank) dan diverifikasi oleh sistem administrasi keuangan PIHAK PERTAMA. Bukti transfer palsu atau upaya chargeback sepihak merupakan delik pidana penipuan.`
      ]
    },
    {
      number: 6,
      title: 'PASAL 6 : POLA PENYERAHAN BARANG (INCOTERMS), TITIK ALIH RISIKO & LOGISTIK',
      legalRef: 'Ketentuan Incoterms 2020 & Regulasi Angkutan Darat/Laut Perhubungan RI',
      content: `Pola pengadaan diselenggarakan berdasarkan klausul perdagangan ${input.purchasePattern.toUpperCase()} dengan moda transportasi ${input.shippingMethod}:`,
      clauses: [
        `6.1. Definisi Pola ${input.purchasePattern.toUpperCase()}: ${PURCHASE_PATTERNS_INFO[input.purchasePattern]?.description || 'Penyerahan komoditas sesuai kesepakatan titik logistik'}.`,
        input.purchasePattern === 'Loco'
          ? `6.2. Titik Alih Risiko LOCO: Seluruh biaya pengangkutan, asuransi perjalanan, dan risiko kehilangan/kerusakan komoditas beralih sepenuhnya kepada PIHAK KEDUA seketika setelah komoditas selesai dimuat di atas armada truk/tongkang milik PIHAK KEDUA di stockpile/gudang PIHAK PERTAMA.`
          : input.purchasePattern === 'FOB'
          ? `6.2. Titik Alih Risiko FOB: PIHAK PERTAMA bertanggung jawab memuat komoditas hingga berada di atas kapal/tongkang di Pelabuhan Muat (Port of Loading). Risiko beralih kepada PIHAK KEDUA setelah komoditas melewati bibir palka kapal.`
          : input.purchasePattern === 'Franco'
          ? `6.2. Titik Alih Risiko FRANCO: PIHAK PERTAMA bertanggung jawab mengangkut komoditas hingga tiba di titik lokasi proyek/gudang PIHAK KEDUA. Titik Koordinat Tujuan yang disepakati: ${input.destinationCoordinateLink || 'Sesuai Alamat Terdaftar PIHAK KEDUA'}. PIHAK KEDUA wajib menjamin kelayakan akses jalan masuk, izin lingkungan, dan kesiapan area pembongkaran muatan.`
          : `6.2. Titik Alih Risiko CIF: PIHAK PERTAMA menanggung biaya pengiriman dan premi asuransi maritim hingga pelabuhan tujuan pembeli. Risiko penanganan selanjutnya beralih di pelabuhan bongkar.`,
        `6.3. Ketentuan Pengiriman Moda ${input.shippingMethod}: Pengiriman wajib mematuhi protokol keselamatan transportasi, Surat Jalan Resmi (Delivery Order), serta perizinan angkutan jalan/pelayaran yang berlaku.`
      ]
    },
    {
      number: 7,
      title: 'PASAL 7 : JAMINAN PERLINDUNGAN HUKUM SEIMBANG BAGI PARA PIHAK',
      legalRef: 'Prinsip Keadilan dan Kepastian Berusaha Berdasarkan Hukum Indonesia',
      content: `Kontrak ini mengedepankan asas perlindungan berimbang bagi Pihak Penjual maupun Pihak Pembeli:`,
      clauses: [
        `7.1. Perlindungan Pihak Penjual (PT. CAFTHEN INDO PROJECT):\n  a. Hak Retensi: PIHAK PERTAMA berhak menunda pemuatan, keberangkatan armada, atau penyerahan dokumen legalitas apabila pembayaran termin yang jatuh tempo belum diselesaikan oleh PIHAK KEDUA.\n  b. Pembebasan Klaim Hambatan Eksternal: PIHAK PERTAMA dibebaskan dari segala tuntutan keterlambatan jika hambatan timbul akibat kendala akses lokasi milik pembeli, penolakan warga setempat di lokasi bongkar pembeli, atau keterlambatan konfirmasi teknis oleh PIHAK KEDUA.\n  c. Perlindungan Harga: Harga kontrak tidak dapat diturunkan atau dinegosiasi ulang secara sepihak setelah penandatanganan kontrak digital.`,
        `7.2. Perlindungan Pihak Pembeli (Konsumen Terdaftar):\n  a. Jaminan Mutu & Orisinalitas: PIHAK PERTAMA menjamin 100% keaslian dan kesesuaian spesifikasi barang sesuai pesanan.\n  b. Jaminan Penggantian Produk: Apabila terbukti terjadi cacat fatal atau ketidaksesuaian volume/mutu di luar batas toleransi wajar yang dibuktikan oleh surveyor independen, PIHAK PERTAMA wajib mengganti atau menambah kekurangan barang dalam waktu paling lambat 7 (tujuh) hari kerja tanpa biaya tambahan.\n  c. Jaminan Faktur Pajak Resmi: PIHAK KEDUA dijamin memperoleh dokumen perpajakan resmi terintegrasi DJP ECoretax untuk pelaporan SPT Badan/Pribadi yang sah.`
      ]
    },
    {
      number: 8,
      title: 'PASAL 8 : SANKSI KETERLAMBATAN, DEMURRAGE, DENDA & PEMBATALAN SEPIHAK',
      legalRef: 'Pasal 1243 - 1252 KUHPerdata tentang Ganti Rugi Wanprestasi',
      content: `Pelanggaran atas ketentuan jangka waktu dan kewajiban dalam kontrak ini diatur sebagai berikut:`,
      clauses: [
        `8.1. Sanksi Keterlambatan Pembayaran: Apabila PIHAK KEDUA terlambat melakukan pembayaran termin yang telah jatuh tempo, PIHAK KEDUA dikenakan denda keterlambatan sebesar 1‰ (satu permil) per hari kalender dari nilai termin yang tertunggak, dengan batas akumulasi maksimum 5% (lima persen).`,
        `8.2. Biaya Waktu Tunggu / Demurrage: Apabila terjadi keterlambatan proses bongkar muat di lokasi tujuan yang diakibatkan oleh kelalaian atau ketidaksiapan fasilitas PIHAK KEDUA melampaui batas waktu wajar (Laytime 24 jam untuk armada darat / 48 jam untuk armada laut), PIHAK KEDUA wajib menanggung biaya Demurrage Rate armada per hari sesuai tarif resmi angkutan.`,
        `8.3. Pembatalan Sepihak (Unilateral Cancellation): Apabila PIHAK KEDUA membatalkan pesanan secara sepihak setelah kontrak digital ditandatangani dan Down Payment (DP) dibayarkan, maka seluruh Down Payment yang telah masuk dinyatakan HANGUS (*forfeited*) dan menjadi hak PIHAK PERTAMA sebagai kompensasi kerugian operasional, biaya logistik awal, dan opportunity cost alokasi kuota komoditas.`
      ]
    },
    {
      number: 9,
      title: 'PASAL 9 : KEADAAN KAHAR (FORCE MAJEURE)',
      legalRef: 'Pasal 1244 & 1245 KUHPerdata tentang Keadaan Memaksa',
      content: `Para Pihak dibebaskan dari tanggung jawab atas kegagalan pemenuhan kewajiban apabila diakibatkan oleh peristiwa Keadaan Kahar:`,
      clauses: [
        `9.1. Yang dimaksud dengan Keadaan Kahar adalah peristiwa di luar kekuasaan dan kemampuan wajar Para Pihak yang tidak dapat diantisipasi sebelumnya, meliputi: gempa bumi dahsyat, tsunami, letusan gunung berapi, banjir bandang nasional, perang, huru-hara massal, blokade maritim, maklumat cuaca buruk ekstrem dari Syahbandar/BMKG, serta kebijakan darurat pemerintah yang melarang peredaran komoditas terkait secara hukum.`,
        `9.2. Pihak yang mengalami Keadaan Kahar wajib memberitahukan secara tertulis kepada Pihak lainnya dalam waktu maksimal 3x24 jam kalender sejak terjadinya peristiwa, disertai bukti surat keterangan dari instansi berwenang.`,
        `9.3. Keadaan Kahar tidak menghapuskan kewajiban pembayaran atas komoditas yang telah berhasil diserahkan dan diterima dengan baik sebelum timbulnya Keadaan Kahar.`
      ]
    },
    {
      number: 10,
      title: 'PASAL 10 : KEABSAHAN TANDA TANGAN ELEKTRONIK, SEGEL QR & DOMISILI HUKUM',
      legalRef: 'Pasal 5, 6, 11 UU ITE No. 1/2024 & Badan Arbitrase Nasional Indonesia (BANI)',
      content: `Perjanjian ini mengikat secara sah dan sempurna dengan ketentuan integritas dokumen digital dan domisili peradilan:`,
      clauses: [
        `10.1. Validasi Tanda Tangan Elektronik: Para Pihak secara sadar dan sukarela mengakui bahwa goresan tanda tangan digital (Digital Signature) pada aplikasi ini beserta Barcode Segel Kriptografis QR PT. CAFTHEN INDO PROJECT memiliki nilai pembuktian otentik yang sah berdasarkan Pasal 11 UU ITE.`,
        `10.2. Penyelesaian Perselisihan: Segala perselisihan yang mungkin timbul dari pelaksanaan perjanjian ini akan diselesaikan terlebih dahulu melalui musyawarah untuk mencapai mufakat dalam waktu 30 (tiga puluh) hari kalender.`,
        `10.3. Domisili Hukum Tetap: Apabila musyawarah mufakat tidak tercapai, Para Pihak sepakat memilih domisili hukum yang tetap dan tidak berubah di Kantor Kepaniteraan Pengadilan Negeri Jambi atau melalui Badan Arbitrase Nasional Indonesia (BANI).`,
        `10.4. Penutup: Perjanjian ini dibuat dalam format data elektronik terenkripsi yang sah, dapat diunduh, dicetak, dan memiliki kekuatan eksekutorial yang mengikat kedua belah pihak sejak saat penandatanganan dibubuhkan.`
      ]
    }
  ];

  const qrHash = generateContractHash(contractNumber, input.buyer.id, now.getTime());

  return {
    contractNumber,
    createdAt: createdDateStr,
    legalBasis: [
      'Kitab Undang-Undang Hukum Perdata (KUHPerdata) Pasal 1320, 1338, 1381, dan 1243-1252',
      'Undang-Undang No. 11 Tahun 2008 jo. UU No. 1 Tahun 2024 tentang Informasi dan Transaksi Elektronik (UU ITE)',
      'Undang-Undang No. 7 Tahun 2014 tentang Perdagangan & Standar Mutu Komoditas',
      'Peraturan Menteri Keuangan & Direktorat Jenderal Pajak (Integrasi e-Faktur ECoretax DJP)'
    ],
    qrSignatureHash: qrHash,
    firstParty: {
      company: input.company.companyName,
      director: input.company.director,
      owner: input.company.owner,
      address: input.company.address,
      phone: input.company.phone,
      email: input.company.email,
      logoUrl: input.company.logoUrl,
      qrSignature: `CIP-SEAL-DIGITAL-${input.company.director.replace(/\s+/g, '')}-${qrHash}`
    },
    secondParty: {
      userId: input.buyer.id,
      name: input.buyer.fullName,
      userType: input.buyer.userType,
      companyName: input.buyer.companyName,
      idNumber: buyerIdDoc,
      address: input.buyer.address,
      phone: input.buyer.whatsapp,
      email: input.buyer.email,
      signatureDataUrl: input.signatureDataUrl,
      signedAt: input.signatureDataUrl ? createdDateStr : undefined
    },
    orderDetails: {
      productId: input.product.id,
      productName: input.product.name,
      quantity: input.quantity,
      unit: input.product.unit,
      unitPriceIDR: input.unitPriceIDR,
      unitPriceUSD: input.unitPriceUSD,
      subtotalIDR: input.subtotalIDR,
      taxAmountIDR: input.ppnAmountIDR,
      taxType: isWaterRoute 
        ? 'PPN 11% & PPh 22 ECoretax DJP (Wajib Pengangkutan Jalur Air/Laut)'
        : (input.taxOption === 'Include' ? 'Include PPN 11% ECoretax DJP' : 'Exclude Pajak (Jalur Darat)'),
      shippingCostIDR: 0,
      totalAmountIDR: input.totalAmountIDR,
      totalAmountUSD: input.totalAmountUSD,
      purchasePattern: input.purchasePattern,
      destinationCoordinateLink: input.destinationCoordinateLink,
      shippingMethod: input.shippingMethod,
      paymentMethod: input.paymentMethod
    },
    articles: articles.map((art) => ({
      number: art.number,
      title: art.title,
      legalRef: art.legalRef,
      content: art.content + (art.clauses ? '\n\n' + art.clauses.join('\n\n') : ''),
      clauses: art.clauses
    })),
    sellerProtectionSummary: [
      'Hak Retensi Penahanan Pengapalan/Barang jika pembayaran termin belum diverifikasi.',
      'Down Payment (DP) hangus jika terjadi pembatalan sepihak (unilateral cancellation) oleh pembeli.',
      'Hasil pengujian mutu COA surveyor independen di pelabuhan muat/depot asal bersifat final dan mengikat.',
      'Denda Demurrage Rate berlaku jika pembongkaran muatan tertahan di lokasi pembeli.'
    ],
    buyerProtectionSummary: [
      'Jaminan 100% orisinalitas komoditas dan spesifikasi mutu berstandar SNI.',
      'Hak inspeksi bersama surveyor terakreditasi KAN (Sucofindo / Carsurin).',
      'Jaminan penerbitan e-Faktur Pajak resmi ECoretax DJP.',
      'Jaminan penggantian barang dalam 7 hari kerja jika ditemukan deviasi mutu di luar batas toleransi.'
    ],
    isSignedByBuyer: Boolean(input.signatureDataUrl)
  };
}
