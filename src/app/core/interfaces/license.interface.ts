export type LicenseStatus = 'active' | 'revoked' | 'expired' | 'pending';

export interface LicenseProductSnapshot {
  name?: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  productType?: 'saas' | 'physical' | 'license';
  image?: string | null;
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
