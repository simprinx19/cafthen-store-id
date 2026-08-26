import React, { useState } from 'react';
import { 
  FileCheck2, 
  Receipt, 
  Truck, 
  Ship, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  Send,
  ExternalLink,
  ChevronDown,
  X
} from 'lucide-react';
import { Order, OrderStatus, DigitalContract } from '../../types';
import { StorageService } from '../../storage';
import { formatIDR, formatUSD, getStatusBadgeClass } from '../../utils/formatters';
import { DigitalContractModal } from '../Marketplace/DigitalContractModal';

interface AdminOrderVerificationProps {
  orders: Order[];
  onDataUpdated: () => void;
}

export const AdminOrderVerification: React.FC<AdminOrderVerificationProps> = ({
  orders,
  onDataUpdated
}) => {
  const [selectedContract, setSelectedContract] = useState<DigitalContract | null>(null);
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<Order | null>(null);
  const [trackingNote, setTrackingNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<OrderStatus>('DP Terverifikasi');

  const statusOptions: OrderStatus[] = [
    'Menunggu Verifikasi Kontrak & Pembayaran',
    'Kontrak Terbit & Disetujui',
    'DP Terverifikasi (50%)',
    'Pemuatan Barang (Loading)',
    'Dalam Pengiriman (On The Way)',
    'Tiba di Lokasi / Pelabuhan Tujuan',
    'Selesai (Pelunasan 100% Lunas)',
    'Dibatalkan'
  ];

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    StorageService.updateOrderStatus(orderId, status, note);
    onDataUpdated();
    setSelectedOrderTracking(null);
  };

  const handleVerifyPaymentProof = (orderId: string, milestoneIdx: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const updatedMilestones = [...order.paymentSchedule];
    if (updatedMilestones[milestoneIdx]) {
      updatedMilestones[milestoneIdx].isPaid = true;
      updatedMilestones[milestoneIdx].paidAt = new Date().toISOString();
    }

    const updatedOrder: Order = {
      ...order,
      paymentSchedule: updatedMilestones,
      status: milestoneIdx === 0 ? 'DP Terverifikasi (50%)' : order.status
    };

    StorageService.saveOrder(updatedOrder);
    onDataUpdated();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Verifikasi Pembelian Produk & Kontrak Digital</h3>
        <p className="text-xs text-slate-500">
          Kelola validasi pesanan masuk, tinjau tanda tangan kontrak hukum sah, dan perbarui tahapan logistik kapal/truk
        </p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border text-slate-500 text-xs">
            Belum ada pesanan yang masuk.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Top Row: Order ID, Date, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-900 rounded-xl font-bold font-mono text-xs">
                    {order.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {order.productName} ({order.quantity.toLocaleString('id-ID')} {order.unit})
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Pembeli: <strong className="text-slate-800">{order.buyerName}</strong> ({order.buyerEmail}) • {new Date(order.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Middle Row: Specs, Pricing, Tax, Logistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Rincian Finansial & ECoretax</span>
                  <div className="font-bold text-slate-900 font-mono text-sm">{formatIDR(order.totalPriceIDR)}</div>
                  <div className="text-slate-500">
                    DPP: {formatIDR(order.taxSystem.dppAmount)}
                  </div>
                  <div className="text-emerald-700 font-semibold">
                    PPN 11%: {formatIDR(order.taxSystem.ppnAmount)} ({order.taxSystem.type})
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Pola Pembelian & Logistik</span>
                  <div className="font-bold text-blue-900">
                    {order.purchasePattern} • Armada: {order.shippingMethod}
                  </div>
                  <div className="text-slate-600 truncate">
                    Asal: {order.origin}
                  </div>
                  {order.francoLocation && (
                    <div className="text-blue-700 truncate">
                      Franco Tujuan: {order.francoLocation}
                    </div>
                  )}
                  {order.francoCoordinateMapsUrl && (
                    <a
                      href={order.francoCoordinateMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 underline font-mono text-[10px] flex items-center gap-1 mt-0.5"
                    >
                      <MapPin className="w-3 h-3" /> Buka Koordinat Franco
                    </a>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Skema Pembayaran</span>
                  <div className="font-bold text-slate-900">{order.paymentScheme}</div>
                  <div className="text-slate-500">Metode: {order.paymentMethod}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-600">Jadwal Tahapan:</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                      {order.paymentSchedule.filter((p) => p.isPaid).length}/{order.paymentSchedule.length} Lunas
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Schedule Milestones Verification */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Verifikasi Pembayaran Termin & Bukti Transfer / LC:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {order.paymentSchedule.map((milestone, mIdx) => (
                    <div
                      key={milestone.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        milestone.isPaid
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{milestone.name} ({milestone.percentage}%)</span>
                          {milestone.isPaid ? (
                            <span className="text-emerald-600 flex items-center gap-1 text-[10px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                            </span>
                          ) : (
                            <span className="text-amber-600 text-[10px]">Belum Lunas</span>
                          )}
                        </div>
                        <div className="font-mono text-xs font-bold text-slate-900 mt-1">
                          {formatIDR(milestone.amountIDR)}
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                        {milestone.proofImageUrl ? (
                          <a
                            href={milestone.proofImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-700 underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Bukti Struk
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">Bukti: Otomatis/Transfer</span>
                        )}

                        {!milestone.isPaid && (
                          <button
                            onClick={() => handleVerifyPaymentProof(order.id, mIdx)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow cursor-pointer"
                          >
                            Setujui Lunas
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: View Contract, Update Logistics */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedContract(order.contract)}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4 text-amber-400" />
                  Lihat Surat Perjanjian Kontrak Digital (Tanda Tangan & QR)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrderTracking(order);
                      setTargetStatus(order.status);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    Update Status & Logistik
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Contract Viewer Modal */}
      {selectedContract && (
        <DigitalContractModal
          isOpen={Boolean(selectedContract)}
          onClose={() => setSelectedContract(null)}
          contract={selectedContract}
          isReadOnly={true}
        />
      )}

      {/* Status & Logistics Tracking Update Modal */}
      {selectedOrderTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-900" />
                Update Status Pengiriman & Logistik
              </h4>
              <button
                onClick={() => setSelectedOrderTracking(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="font-bold text-slate-900">{selectedOrderTracking.productName}</div>
                <div className="text-slate-500 font-mono text-[11px]">{selectedOrderTracking.id}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Tahapan Status Baru:
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Progres / Nomor Lambung Tongkang / No Polisi Truk:
                </label>
                <textarea
                  rows={3}
                  value={trackingNote}
                  onChange={(e) => setTrackingNote(e.target.value)}
                  placeholder="Contoh: Muatan 5.000 MT batubara sedang dimuat di Pelabuhan Talang Duku ke Tongkang TB. CAIRAN 01..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderTracking(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateOrderStatus(selectedOrderTracking.id, targetStatus, trackingNote)
                  }
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Simpan & Notifikasi Pembeli
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
