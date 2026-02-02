import type { Application } from "@/modules/applications/types";
import type { EnvironmentWithCustomer } from "@/modules/customers/types";

export type VersionType = 'release' | 'prerelease' | 'pullrequest';
export type InstallMode = 'Add' | 'ForceSync';

export interface DeploymentEnvironment extends EnvironmentWithCustomer {
  selected: boolean;
}

export interface DeploymentApplication extends Application {
  order: number;
  versionType: VersionType; // 'release' o 'prerelease' o 'pullrequest'
  prNumber?: number; // Número del PR cuando versionType es 'pullrequest'
  installMode: InstallMode; // 'Add' (Añadir) o 'ForceSync' (Obligar)
}

export interface DeploymentState {
  selectedEnvironment: DeploymentEnvironment | null;
  applications: DeploymentApplication[];
}
