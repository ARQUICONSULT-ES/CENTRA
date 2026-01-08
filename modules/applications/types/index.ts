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
