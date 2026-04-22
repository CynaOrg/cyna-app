export type LicenseStatus = 'active' | 'revoked' | 'expired' | 'pending';

export interface LicenseProductSnapshot {
  nameFr: string;
  nameEn: string;
  slug: string;
}

export interface License {
  id: string;
  licenseKey: string;
  productSnapshot: LicenseProductSnapshot;
  orderId: string;
  productId: string;
  status: LicenseStatus;
  activatedAt: string | null;
  expiresAt: string | null;
  email: string;
  createdAt: string;
}
