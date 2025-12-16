// ==================== TENANT TYPES ====================

export interface Tenant {
  id: string;
  customerName: string;
  createdAt: string | Date;
  modifiedAt: string | Date;
  // Campos de conexión
  connectionId?: string | null;
  grantType?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
  scope?: string | null;
  token?: string | null;
  tokenExpiresAt?: string | Date | null;
}

// ==================== TENANT CARD TYPES ====================

export interface TenantCardProps {
  tenant: Tenant;
  onEdit?: (tenant: Tenant) => void;
}

// ==================== TENANT LIST TYPES ====================

export interface TenantListProps {
  tenants: Tenant[];
  onEdit?: (tenant: Tenant) => void;
}

export interface TenantListHandle {
  refreshTenants: () => Promise<void>;
  isRefreshing: boolean;
}
