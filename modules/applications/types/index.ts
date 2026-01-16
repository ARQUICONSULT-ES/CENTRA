export interface Application {
  id: string;
  name: string;
  publisher: string;
  githubRepoName: string;
  githubUrl?: string | null;
  latestReleaseVersion?: string | null;
  latestReleaseDate?: string | null;
  logoBase64?: string | null;
  createdAt: string;
  updatedAt: string;
  // Campos adicionales opcionales para vistas enriquecidas
  totalInstallations?: number;
  outdatedInstallations?: number;
  totalCustomers?: number;
}

export interface ApplicationFormData {
  name: string;
  publisher: string;
  githubRepoName: string;
}

export interface ApplicationsResponse {
  applications: Application[];
}

export interface Customer {
  id: string;
  customerName: string;
  imageBase64?: string;
}

export interface Environment {
  tenantId: string;
  name: string;
  type?: string;
  status?: string;
}

export interface CustomerTenantPair {
  customer: Customer;
  tenant: import("@/modules/customers/types").Tenant;
  environments: Environment[];
}

export interface AddGitHubEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selectedEnvironments: { tenantId: string; environmentName: string; customerName: string }[], mode: 'manual' | 'auto') => void;
  owner: string;
  repo: string;
}
