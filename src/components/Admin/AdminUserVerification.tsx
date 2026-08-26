import React, { useState } from 'react';
import { DigitalSignatureSeal } from '../Common/DigitalSignatureSeal';
import { 
  ShieldCheck, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  Check, 
  X, 
  Search,
  Eye,
  Edit3,
  Printer,
  QrCode,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserProfile, AccountStatus, UserType } from '../../types';
import { StorageService } from '../../storage';
import { DEFAULT_CIP_LOGO } from '../../utils/logoPresets';

interface AdminUserVerificationProps {
  users: UserProfile[];
  onDataUpdated: () => void;
}

export const AdminUserVerification: React.FC<AdminUserVerificationProps> = ({
  users,
  onDataUpdated
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserProfile | null>(null);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});
  const [selectedUserToPrint, setSelectedUserToPrint] = useState<UserProfile | null>(null);

  const companyProfile = StorageService.getCompanyProfile();
  const effectiveLogo = companyProfile.logoUrl || DEFAULT_CIP_LOGO;

  const filteredUsers = users.filter((u) => {
    const matchStatus = filterStatus === 'All' || u.status === filterStatus;
    const matchSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.npwp && u.npwp.includes(searchQuery)) ||
      (u.nikKtp && u.nikKtp.includes(searchQuery));
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = (userId: string, newStatus: AccountStatus) => {
    StorageService.updateUserStatus(userId, newStatus);
    onDataUpdated();
    if (selectedUserDetail && selectedUserDetail.id === userId) {
      setSelectedUserDetail({ ...selectedUserDetail, status: newStatus });
    }
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setSelectedUserToEdit(user);
    setEditFormData({ ...user });
  };

  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;

    const updatedUser: UserProfile = {
      ...selectedUserToEdit,
      fullName: editFormData.fullName || selectedUserToEdit.fullName,
      username: editFormData.username || selectedUserToEdit.username,
      companyName: editFormData.companyName,
      userType: (editFormData.userType as UserType) || selectedUserToEdit.userType,
      email: editFormData.email || selectedUserToEdit.email,
      whatsapp: editFormData.whatsapp || selectedUserToEdit.whatsapp,
      nikKtp: editFormData.nikKtp,
      npwp: editFormData.npwp,
      address: editFormData.address || selectedUserToEdit.address,
      status: (editFormData.status as AccountStatus) || selectedUserToEdit.status,
      photoUrl: editFormData.photoUrl,
      ktpUrl: editFormData.ktpUrl,
      npwpUrl: editFormData.npwpUrl,
      comproUrl: editFormData.comproUrl
    };

    StorageService.saveUser(updatedUser);
    onDataUpdated();
    setSelectedUserToEdit(null);
    if (selectedUserDetail && selectedUserDetail.id === updatedUser.id) {
      setSelectedUserDetail(updatedUser);
    }
  };

  const handlePrintProfile = (user: UserProfile) => {
    setSelectedUserToPrint(user);
  };

  const triggerWindowPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Verifikasi Pendaftaran Akun Konsumen</h3>
          <p className="text-xs text-slate-500">
            Validasi, kelola data profil, verifikasi legalitas KTP/NPWP, dan cetak dokumen resmi konsumen B2B/B2C
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            {['All', 'Pending', 'Verified', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status === 'All' ? 'Semua' : status === 'Pending' ? 'Menunggu' : status === 'Verified' ? 'Terverifikasi' : 'Ditolak'}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari user / PT / KTP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Lengkap & ID</th>
                <th className="py-3 px-4">Tipe Akun</th>
                <th className="py-3 px-4">Kontak / Email</th>
                <th className="py-3 px-4">Dokumen Legalitas</th>
                <th className="py-3 px-4">Status Verifikasi</th>
                <th className="py-3 px-4 text-center">Aksi Manajemen & Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada data konsumen yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{user.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{user.id}</div>
                      {user.companyName && (
                        <div className="text-[11px] text-blue-800 font-semibold">{user.companyName}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                          user.userType === 'Perusahaan'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {user.userType === 'Perusahaan' ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {user.userType}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="font-mono text-slate-800">{user.email}</div>
                      <div className="text-[11px] text-slate-500">{user.whatsapp}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        {user.nikKtp && <div>KTP: <span className="font-mono text-slate-800">{user.nikKtp}</span></div>}
                        {user.npwp && <div>NPWP: <span className="font-mono text-slate-800">{user.npwp}</span></div>}
                        {user.comproUrl && (
                          <span className="text-[10px] text-blue-600 font-medium">Compro Terlampir</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          user.status === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : user.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {user.status === 'Verified' ? 'Terverifikasi' : user.status === 'Pending' ? 'Menunggu' : 'Ditolak'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Detail View */}
                        <button
                          onClick={() => setSelectedUserDetail(user)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-all"
                          title="Lihat Detail Profil & Berkas"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Action */}
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 cursor-pointer transition-all"
                          title="Edit Data Profile Konsumen"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Print Profile Action */}
                        <button
                          onClick={() => handlePrintProfile(user)}
                          className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer transition-all"
                          title="Cetak Profile Dokumen Resmi (PDF)"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Approve Action */}
                        {user.status !== 'Verified' && (
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'Verified')}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs transition-all"
                            title="Setujui / Verifikasi Akun"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Reject Action */}
                        {user.status !== 'Rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'Rejected')}
                            className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs transition-all"
                            title="Tolak Akun"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DETAIL KONSUMEN & DOKUMEN                                        */}
      {/* ========================================================================= */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl lg:max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-auto max-h-[94vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                Detail Profile Konsumen
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const u = selectedUserDetail;
                    setSelectedUserDetail(null);
                    handleOpenEditModal(u);
                  }}
                  className="px-2.5 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    const u = selectedUserDetail;
                    setSelectedUserDetail(null);
                    handlePrintProfile(u);
                  }}
                  className="px-2.5 py-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak
                </button>
                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
                  {selectedUserDetail.photoUrl ? (
                    <img
                      src={selectedUserDetail.photoUrl}
                      alt={selectedUserDetail.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-base">
                      {selectedUserDetail.fullName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">{selectedUserDetail.fullName}</h5>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {selectedUserDetail.id} | Username: {selectedUserDetail.username || selectedUserDetail.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tipe Pendaftaran:</span>
                    <span className="font-semibold text-blue-900">{selectedUserDetail.userType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Akun:</span>
                    <span className={`font-bold ${selectedUserDetail.status === 'Verified' ? 'text-emerald-700' : selectedUserDetail.status === 'Pending' ? 'text-amber-700' : 'text-rose-700'}`}>
                      {selectedUserDetail.status}
                    </span>
                  </div>
                  {selectedUserDetail.companyName && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Nama Perusahaan / B2B Entitas:</span>
                      <span className="font-bold text-slate-900">{selectedUserDetail.companyName}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email:</span>
                    <span className="font-mono text-slate-800">{selectedUserDetail.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor WhatsApp:</span>
                    <span className="font-mono text-slate-800">{selectedUserDetail.whatsapp}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NIK KTP:</span>
                    <span className="font-mono text-slate-800">{selectedUserDetail.nikKtp || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">NPWP:</span>
                    <span className="font-mono text-slate-800">{selectedUserDetail.npwp || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Alamat Domisili / Kantor:</span>
                    <span className="text-slate-800 font-medium">{selectedUserDetail.address}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Grid */}
              <div className="space-y-2 pt-1">
                <span className="font-bold text-slate-800 text-[11px] block">
                  Dokumen Legalitas & Berkas Terunggah:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {/* Foto Profil */}
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Foto Profil</span>
                    {selectedUserDetail.photoUrl ? (
                      <a href={selectedUserDetail.photoUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={selectedUserDetail.photoUrl}
                          alt="Foto Profil"
                          className="w-full h-16 object-cover rounded-lg border border-slate-300 hover:opacity-80"
                        />
                      </a>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic bg-white rounded-lg border">
                        Belum Diunggah
                      </div>
                    )}
                  </div>

                  {/* KTP */}
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Foto KTP Asli</span>
                    {selectedUserDetail.ktpUrl ? (
                      <a href={selectedUserDetail.ktpUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={selectedUserDetail.ktpUrl}
                          alt="KTP Asli"
                          className="w-full h-16 object-cover rounded-lg border border-slate-300 hover:opacity-80"
                        />
                      </a>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic bg-white rounded-lg border">
                        Belum Diunggah
                      </div>
                    )}
                  </div>

                  {/* NPWP */}
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Foto NPWP</span>
                    {selectedUserDetail.npwpUrl ? (
                      <a href={selectedUserDetail.npwpUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={selectedUserDetail.npwpUrl}
                          alt="NPWP"
                          className="w-full h-16 object-cover rounded-lg border border-slate-300 hover:opacity-80"
                        />
                      </a>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic bg-white rounded-lg border">
                        Belum Diunggah
                      </div>
                    )}
                  </div>

                  {/* Compro */}
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Company Profile (PDF)</span>
                    {selectedUserDetail.comproUrl ? (
                      <a
                        href={selectedUserDetail.comproUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-16 flex flex-col items-center justify-center bg-rose-50 text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 p-1"
                      >
                        <span className="font-bold text-xs">PDF</span>
                        <span className="text-[9px] truncate max-w-full">Lihat Berkas</span>
                      </a>
                    ) : (
                      <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic bg-white rounded-lg border">
                        Tidak Terlampir
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status change actions */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => handleUpdateStatus(selectedUserDetail.id, 'Rejected')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Tolak Akun
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedUserDetail.id, 'Verified')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Verifikasi Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT DATA PROFILE KONSUMEN                                      */}
      {/* ========================================================================= */}
      {selectedUserToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl lg:max-w-5xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-auto max-h-[94vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-700" />
                Edit Data Profile Konsumen ({selectedUserToEdit.id})
              </h4>
              <button
                onClick={() => setSelectedUserToEdit(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama Lengkap Konsumen *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Username Akun
                  </label>
                  <input
                    type="text"
                    value={editFormData.username || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tipe Akun Konsumen
                  </label>
                  <select
                    value={editFormData.userType || 'Perorangan'}
                    onChange={(e) => setEditFormData({ ...editFormData, userType: e.target.value as UserType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-blue-900"
                  >
                    <option value="Perorangan">Perorangan (B2C)</option>
                    <option value="Perusahaan">Perusahaan (B2B)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama Perusahaan / PT (B2B)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT. Karya Bersama"
                    value={editFormData.companyName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Email Resmi *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.whatsapp || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor NIK KTP
                  </label>
                  <input
                    type="text"
                    placeholder="16 Digit NIK"
                    value={editFormData.nikKtp || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, nikKtp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor NPWP
                  </label>
                  <input
                    type="text"
                    placeholder="Format: XX.XXX.XXX.X-XXX.XXX"
                    value={editFormData.npwp || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, npwp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Alamat Lengkap Domisili / Operasional Kantor *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editFormData.address || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Status Verifikasi Akun
                  </label>
                  <select
                    value={editFormData.status || 'Pending'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as AccountStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold text-slate-900"
                  >
                    <option value="Pending">Menunggu Verifikasi (Pending)</option>
                    <option value="Verified">Terverifikasi (Verified)</option>
                    <option value="Rejected">Ditolak (Rejected)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    URL Foto Profil (Opsional)
                  </label>
                  <input
                    type="text"
                    value={editFormData.photoUrl || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, photoUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    URL Foto KTP (Opsional)
                  </label>
                  <input
                    type="text"
                    value={editFormData.ktpUrl || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, ktpUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    URL Foto NPWP (Opsional)
                  </label>
                  <input
                    type="text"
                    value={editFormData.npwpUrl || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, npwpUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedUserToEdit(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save className="w-4 h-4" /> Simpan Perubahan Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CETAK PROFILE DOKUMEN RESMI (PROFESSIONAL DOSSIER CERTIFICATE)   */}
      {/* ========================================================================= */}
      {selectedUserToPrint && (
        <div className="print-user-profile-wrapper fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
          <div className="relative w-full max-w-6xl xl:max-w-7xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-auto max-h-[95vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:m-0 print:rounded-none">
            
            {/* Top Action Header (Hidden on Print) */}
            <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-sm sm:text-base">Gaya & Format Cetak Profil Konsumen Resmi</h4>
                  <p className="text-[11px] text-slate-300">Format Lembar Dossier Verifikasi & Legitimasi Akun A4 Professional</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={triggerWindowPrint}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Dokumen Profil (PDF)
                </button>
                <button
                  onClick={() => setSelectedUserToPrint(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PRINT SHEET CONTENT (A4 Clean Layout) */}
            <div className="p-6 sm:p-10 md:p-12 text-slate-900 text-xs sm:text-sm leading-relaxed space-y-5 bg-white print:p-6 print:m-0">
              
              {/* KOP SURAT RESMI */}
              <div className="border-b-4 border-double border-slate-950 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="w-20 h-20 rounded-xl border border-slate-300 p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0 bg-white">
                    <img
                      src={effectiveLogo}
                      alt={companyProfile.companyName}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-center flex-1">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                      {companyProfile.companyName || 'PT. CAFTHEN INDO PROJECT'}
                    </h1>
                    <p className="text-[10px] sm:text-[11px] font-extrabold text-blue-900 tracking-wider mt-0.5 uppercase">
                      DIVISI KEPATUHAN HUKUM & VERIFIKASI AKUN KONSUMEN
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-600 mt-0.5 leading-snug">
                      {companyProfile.address || 'Jl. Lintas Jambi Bulian Kota Kampus III, Mendalo Indah, Muaro Jambi'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[9px] sm:text-[10px] text-slate-700 font-medium mt-1">
                      <span>NIB: <strong>0220108891823</strong></span>
                      <span>•</span>
                      <span>NPWP: <strong>42.890.112.4-331.000</strong></span>
                      <span>•</span>
                      <span>Telp/WA: <strong>{companyProfile.phone || '+62831-49090950'}</strong></span>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-center justify-center p-2 border border-blue-900/30 rounded-xl bg-blue-50/50 text-[9px] font-mono text-blue-950 font-bold w-24 text-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-blue-900 mb-0.5" />
                    <span>DOKUMEN DOSSIER RESMI</span>
                  </div>
                </div>
              </div>

              {/* JUDUL DOKUMEN & REGISTER */}
              <div className="text-center my-2">
                <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-wide underline decoration-2 underline-offset-4">
                  SERTIFIKAT DOSSIER VERIFIKASI PROFIL KONSUMEN
                </h2>
                <p className="text-xs text-slate-700 font-mono font-bold mt-1">
                  NOMOR REGISTRASI AKUN: <span className="text-blue-950 font-extrabold">{selectedUserToPrint.id}</span>
                </p>
              </div>

              {/* STATEMEN PEMBUKA */}
              <p className="text-justify text-xs text-slate-800 leading-relaxed">
                Menerangkan secara resmi bahwa profil pengguna terdaftar di bawah ini telah tercatat pada basis data sistem portal perdagangan & pengadaan <strong>{companyProfile.companyName || 'PT. CAFTHEN INDO PROJECT'}</strong> serta telah melalui proses pemeriksaan administrasi identitas dan legalitas badan usaha/perorangan:
              </p>

              {/* TABEL PROFIL LENGKAP */}
              <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3">Nama Lengkap Konsumen</td>
                      <td className="py-2.5 px-4 font-black text-slate-950 text-sm">{selectedUserToPrint.fullName}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-700">Username / ID Sistem</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{selectedUserToPrint.username || selectedUserToPrint.email}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-700">Kategori & Tipe Pendaftaran</td>
                      <td className="py-2.5 px-4 font-bold text-blue-900">{selectedUserToPrint.userType} ({selectedUserToPrint.userType === 'Perusahaan' ? 'B2B Enterprise Client' : 'B2C Individual Client'})</td>
                    </tr>
                    {selectedUserToPrint.companyName && (
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-700">Nama Perusahaan / Entitas Hukum</td>
                        <td className="py-2.5 px-4 font-black text-slate-900">{selectedUserToPrint.companyName}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-700">Alamat Email Terdaftar</td>
                      <td className="py-2.5 px-4 font-mono text-slate-800">{selectedUserToPrint.email}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-700">Nomor Telepon / WhatsApp</td>
                      <td className="py-2.5 px-4 font-mono text-slate-800">{selectedUserToPrint.whatsapp}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-700">Nomor NIK KTP Terverifikasi</td>
                      <td className="py-2.5 px-4 font-mono text-slate-800">{selectedUserToPrint.nikKtp || 'Terlampir dalam Berkas KTP'}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-700">Nomor NPWP Perusahaan/Pribadi</td>
                      <td className="py-2.5 px-4 font-mono text-slate-800">{selectedUserToPrint.npwp || 'Terlampir dalam Berkas NPWP'}</td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-700">Alamat Domisili / Kantor Utama</td>
                      <td className="py-2.5 px-4 text-slate-900 font-medium">{selectedUserToPrint.address}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-700">Status Legalitas Akun</td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${selectedUserToPrint.status === 'Verified' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : selectedUserToPrint.status === 'Pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-rose-100 text-rose-900 border border-rose-300'}`}>
                          {selectedUserToPrint.status === 'Verified' ? 'TERVERIFIKASI & SAH (VERIFIED)' : selectedUserToPrint.status === 'Pending' ? 'MENUNGGU VALIDASI (PENDING)' : 'DITOLAK (REJECTED)'}
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-700">Waktu Registrasi Akun</td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">{selectedUserToPrint.registeredAt || new Date().toLocaleDateString('id-ID')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SUMMARY KELENGKAPAN DOKUMEN */}
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
                <h5 className="font-bold text-xs uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-800" /> STATUS BERKAS LAMPIRAN LEGALITAS:
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-bold">KTP ASLI</span>
                    <span className={`font-bold ${selectedUserToPrint.ktpUrl ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {selectedUserToPrint.ktpUrl ? 'Terlampir' : 'Tidak Ada'}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-bold">NPWP RESMI</span>
                    <span className={`font-bold ${selectedUserToPrint.npwpUrl ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {selectedUserToPrint.npwpUrl ? 'Terlampir' : 'Tidak Ada'}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-bold">COMPANY PROFILE</span>
                    <span className={`font-bold ${selectedUserToPrint.comproUrl ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {selectedUserToPrint.comproUrl ? 'Terlampir' : 'Tidak Ada'}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-bold">FOTO PROFIL</span>
                    <span className={`font-bold ${selectedUserToPrint.photoUrl ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {selectedUserToPrint.photoUrl ? 'Terlampir' : 'Tidak Ada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* PERNYATAAN LEGISLASI */}
              <p className="text-justify text-[11px] text-slate-700 leading-normal border-t border-slate-200 pt-3">
                Dokumen dossier ini dicetak secara otomatis dari Sistem Manajemen Keanggotaan & Legalitas PT. Cafthen Indo Project. Segala bentuk transaksi komoditas ekspor, perdagangan lokal, serta pengadaan barang/jasa yang dilakukan oleh akun konsumen yang bersangkutan wajib mengacu pada Surat Perjanjian Jual Beli (SPJB) resmi dan regulasi hukum yang berlaku di Negara Republik Indonesia.
              </p>

              {/* TANDA TANGAN & STEMPEL LEGAL INTERAKSIF + QRIS DIGISEAL */}
              <div className="pt-4 grid grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center">
                  <DigitalSignatureSeal
                    documentData={{
                      documentId: `VERIFY-DOSSIER-${selectedUserToPrint.id}`,
                      documentTitle: `DOSSIER PROFIL KONSUMEN & TERVERIFIKASI LEGAL`,
                      documentType: 'Sertifikat Verifikasi Akun Pengguna',
                      partyFirst: companyProfile.companyName || 'PT. CAFTHEN INDO PROJECT',
                      partySecond: selectedUserToPrint.companyName || selectedUserToPrint.name,
                      issueDate: selectedUserToPrint.registeredAt,
                      status: selectedUserToPrint.status === 'Verified' ? 'TERVERIFIKASI RESMI (VALID)' : 'PROSES DOKUMEN',
                      hashSha256: `CIP-USER-${selectedUserToPrint.id}-${selectedUserToPrint.nikNpwp}`
                    }}
                    size="md"
                  />
                </div>

                <div className="text-center font-sans space-y-1 border border-slate-200 p-3 bg-slate-50/50 rounded-2xl">
                  <p className="text-[11px] text-slate-600">
                    Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="font-extrabold text-xs text-slate-950 uppercase">
                    TIM LEGAL & KEPATUHAN KONSUMEN <br />
                    {companyProfile.companyName || 'PT. CAFTHEN INDO PROJECT'}
                  </p>
                  <div className="py-1">
                    <p className="font-black text-xs text-slate-950 underline underline-offset-2 uppercase">
                      MASITHA, S.H.
                    </p>
                    <p className="text-[10px] text-slate-600 font-medium">Kepala Divisi Legalitas & Verifikasi</p>
                  </div>
                </div>
              </div>

              {/* FOOTER BANYAK DOKUMEN */}
              <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span>{companyProfile.companyName || 'PT. CAFTHEN INDO PROJECT'} • DOKUMEN RESMI VERIFIKASI AKUN</span>
                <span>Halaman 1 dari 1 (Dokumen Lengkap)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
