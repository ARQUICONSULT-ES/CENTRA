// ==================== CUSTOMER TYPES ====================

export interface Customer {
  id: string;
  customerName: string;
  imageBase64?: string | null;
  infraestructureType?: "Saas" | "OnPremise";
  description?: string | null;
  tenantsCount?: number;
  activeEnvironmentsCount?: number;
}

// ==================== TENANT TYPES ====================

export interface Tenant {
  id: string;
  customerId: string;
  customerName?: string; // Computed from Customer relation
  customerImage?: string | null; // Customer image Base64
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

export interface EnvironmentWithCustomer extends Environment {
  customerId: string;
  customerName: string;
  customerImage?: string | null;
  tenantDescription?: string | null;
  appsCount?: number;
  outdatedAppsCount?: number;
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

// ==================== INSTALLED APP TYPES ====================

export interface InstalledApp {
  tenantId: string;
  environmentName: string;
  id: string;
  name: string;
  version: string;
  publisher: string;
  publishedAs: string; // "tenant" | "global"
  state?: string | null; // "installed" | "updating" | etc.
}

export interface InstalledAppWithEnvironment extends InstalledApp {
  customerId: string;
  customerName: string;
  customerImage?: string | null;
  environmentType?: string | null;
  environmentStatus?: string | null;
}

// Respuesta de la API de Business Central para aplicaciones instaladas
export interface BCInstalledApp {
  id: string;
  name: string;
  publisher: string;
  version: string;
  state: string;
  lastUpdateOperationId?: string;
  lastUpdateAttemptResult?: string;
  appType: string; // "tenant" | "global"
  canBeUninstalled?: boolean;
}

export interface BCInstalledAppsResponse {
  value: BCInstalledApp[];
}
