// ==================== CUSTOMER TYPES ====================

export interface Customer {
  id: string;
  customerName: string;
}

// ==================== TENANT TYPES ====================

export interface Tenant {
  id: string;
  customerId: string;
  customerName?: string; // Computed from Customer relation
  customer?: Customer; // Relation to Customer
  description?: string | null;
  createdAt: string | Date;
  modifiedAt: string | Date;
  // Campos de conexión
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

// ==================== CUSTOMER CARD TYPES ====================

export interface CustomerCardProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
}

// ==================== CUSTOMER LIST TYPES ====================

export interface CustomerListProps {
  customers: Customer[];
  onEdit?: (customer: Customer) => void;
}

export interface CustomerListHandle {
  refreshCustomers: () => Promise<void>;
  isRefreshing: boolean;
}
