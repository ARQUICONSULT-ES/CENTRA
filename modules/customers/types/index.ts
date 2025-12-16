// ==================== CUSTOMER TYPES ====================

export interface Customer {
  id: string;
  customerName: string;
  imageBase64?: string | null;
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

// ==================== ENVIRONMENT TYPES ====================

export interface Environment {
  tenantId: string;
  name: string;
  type?: string | null;
  applicationVersion?: string | null;
  status?: string | null;
  webClientUrl?: string | null;
  locationName?: string | null;
  platformVersion?: string | null;
}

// Respuesta de la API de Business Central
export interface BCEnvironment {
  aadTenantId: string;
  applicationFamily: string;
  type: string;
  name: string;
  countryCode: string;
  applicationVersion: string;
  status: string;
  webClientLoginUrl: string;
  webServiceUrl: string;
  appInsightsKey?: string;
  ringName?: string;
  locationName?: string;
  platformVersion?: string;
}

export interface BCEnvironmentsResponse {
  value: BCEnvironment[];
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
