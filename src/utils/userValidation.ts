import { UserProfile } from '../types';

export interface ProfileValidationItem {
  id: string;
  label: string;
  isDocument?: boolean;
  format?: string;
  isCompleted: boolean;
  required: boolean;
}

export interface ProfileValidationResult {
  isComplete: boolean;
  completionPercentage: number;
  completedCount: number;
  totalRequiredCount: number;
  items: ProfileValidationItem[];
  missingRequiredLabels: string[];
}

export const validateUserProfile = (user: UserProfile | null): ProfileValidationResult => {
  if (!user) {
    return {
      isComplete: false,
      completionPercentage: 0,
      completedCount: 0,
      totalRequiredCount: 8,
      items: [],
      missingRequiredLabels: ['Akun belum masuk']
    };
  }

  const isCompany = user.userType === 'Perusahaan';

  const items: ProfileValidationItem[] = [
    {
      id: 'fullName',
      label: 'Nama Lengkap Penanggung Jawab',
      isCompleted: Boolean(user.fullName && user.fullName.trim().length >= 3),
      required: true
    },
    {
      id: 'whatsapp',
      label: 'Nomor WhatsApp Aktif',
      isCompleted: Boolean(user.whatsapp && user.whatsapp.trim().length >= 8),
      required: true
    },
    {
      id: 'address',
      label: 'Alamat Lengkap Kantor / Domisili',
      isCompleted: Boolean(user.address && user.address.trim().length >= 6 && user.address !== 'Alamat Belum Diatur'),
      required: true
    },
    {
      id: 'nikKtp',
      label: 'Nomor NIK KTP (16 Digit)',
      isCompleted: Boolean(user.nikKtp && user.nikKtp.trim().length >= 10),
      required: true
    },
    {
      id: 'npwp',
      label: 'Nomor NPWP Perpajakan',
      isCompleted: Boolean(user.npwp && user.npwp.trim().length >= 10),
      required: true
    },
    {
      id: 'photoUrl',
      label: 'Upload Foto Profil Diri',
      isDocument: true,
      format: 'Gambar (JPG / PNG / WebP)',
      isCompleted: Boolean(user.photoUrl && user.photoUrl.trim().length > 0),
      required: true
    },
    {
      id: 'ktpUrl',
      label: 'Upload Foto KTP Asli',
      isDocument: true,
      format: 'Gambar (JPG / PNG / WebP)',
      isCompleted: Boolean(user.ktpUrl && user.ktpUrl.trim().length > 0),
      required: true
    },
    {
      id: 'npwpUrl',
      label: 'Upload Foto Kartu NPWP',
      isDocument: true,
      format: 'Gambar (JPG / PNG / WebP)',
      isCompleted: Boolean(user.npwpUrl && user.npwpUrl.trim().length > 0),
      required: true
    }
  ];

  if (isCompany) {
    items.splice(3, 0, {
      id: 'companyName',
      label: 'Nama Resmi Perusahaan (B2B)',
      isCompleted: Boolean(user.companyName && user.companyName.trim().length >= 3),
      required: true
    });

    items.push({
      id: 'comproUrl',
      label: 'Upload Company Profile Perusahaan',
      isDocument: true,
      format: 'Dokumen PDF (.pdf)',
      isCompleted: Boolean(user.comproUrl && user.comproUrl.trim().length > 0),
      required: false
    });
  }

  const requiredItems = items.filter((i) => i.required);
  const completedRequired = requiredItems.filter((i) => i.isCompleted);
  const completionPercentage = Math.round((completedRequired.length / requiredItems.length) * 100);
  const missingRequiredLabels = requiredItems.filter((i) => !i.isCompleted).map((i) => i.label);

  return {
    isComplete: missingRequiredLabels.length === 0,
    completionPercentage,
    completedCount: completedRequired.length,
    totalRequiredCount: requiredItems.length,
    items,
    missingRequiredLabels
  };
};
