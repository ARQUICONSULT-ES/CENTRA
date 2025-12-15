// ==================== TENANT TYPES ====================

export interface Tenant {
  id: string;
  customerName: string;
  createdAt: string | Date;
  modifiedAt: string | Date;
}

// ==================== TENANT CARD TYPES ====================

export interface TenantCardProps {
  tenant: Tenant;
}

// ==================== TENANT LIST TYPES ====================

export interface TenantListProps {
  tenants: Tenant[];
}

export interface TenantListHandle {
  refreshTenants: () => Promise<void>;
  isRefreshing: boolean;
}
