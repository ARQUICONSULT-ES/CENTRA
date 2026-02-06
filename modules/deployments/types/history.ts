import type { DeploymentStatus } from "@/app/generated/prisma";

export interface DeploymentHistoryItem {
  id: string;
  customerId: string;
  tenantId: string;
  environmentName: string;
  status: DeploymentStatus;
  userId: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  totalApps: number;
  successfulApps: number;
  failedApps: number;
  errorMessage: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    githubAvatar: string | null;
  };
  customer: {
    id: string;
    customerName: string;
    imageBase64: string | null;
  } | null;
  environment: {
    name: string;
    type: string | null;
    status: string | null;
    tenant: {
      id: string;
      description: string | null;
    };
  } | null;
  details: DeploymentHistoryDetail[];
}

export interface DeploymentHistoryDetail {
  id: string;
  deploymentId: string;
  applicationId: string | null;
  appName: string;
  appType: string;
  version: string;
  status: DeploymentStatus;
  order: number;
  prNumber: number | null;
  installMode: string | null;
  startedAt: string | null;
  completedAt: string | null;
  downloadedSizeKb: number | null;
  errorMessage: string | null;
  application: {
    id: string;
    name: string;
    publisher: string;
    logoBase64: string | null;
  } | null;
}

export interface DeploymentHistoryFilters {
  customerId?: string;
  tenantId?: string;
  environmentName?: string;
  applicationId?: string;
}
