import type { Application } from "@/modules/applications/types";
import type { EnvironmentWithCustomer } from "@/modules/customers/types";

export type VersionType = 'release' | 'prerelease';

export interface DeploymentEnvironment extends EnvironmentWithCustomer {
  selected: boolean;
}

export interface DeploymentApplication extends Application {
  order: number;
  versionType: VersionType; // 'release' o 'prerelease'
}

export interface DeploymentState {
  selectedEnvironment: DeploymentEnvironment | null;
  applications: DeploymentApplication[];
}
