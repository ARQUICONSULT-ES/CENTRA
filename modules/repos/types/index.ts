import { GitHubRepository } from "@/types/github";

// ==================== REPO CARD TYPES ====================

export interface WorkflowStatus {
  status: "queued" | "in_progress" | "completed";
  conclusion: "success" | "failure" | "cancelled" | "skipped" | null;
  html_url: string;
}

export interface ReleaseInfo {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
}

export interface RepoExtraInfo {
  workflow: WorkflowStatus | null;
  release: ReleaseInfo | null;
  prerelease?: ReleaseInfo | null;
  openPRCount?: number;
  branchCount?: number;
}

export interface RepoCardProps {
  repo: GitHubRepository;
  preloadedInfo?: RepoExtraInfo;
  skipIndividualFetch?: boolean;
  isLoadingRelease?: boolean;
  allRepos?: GitHubRepository[];
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  avatar_url?: string;
  date: string;
}

// ==================== REPO LIST TYPES ====================

export interface RepoListProps {
  repos: GitHubRepository[];
  allRepos: GitHubRepository[];
}

export interface RepoListHandle {
  fetchWorkflows: () => Promise<void>;
  isLoadingWorkflows: boolean;
}

// ==================== DEPENDENCIES MODAL TYPES ====================

export interface AppDependencyProbingPath {
  repo: string;
  version: string;
  release_status: string;
  authTokenSecret?: string;
  projects?: string;
}

export interface SettingsData {
  appDependencyProbingPaths: AppDependencyProbingPath[];
  installApps?: string[];
}

export interface FileDependency {
  name: string;
  path: string;
  sha: string;
  size: number;
}

export interface AppDependency {
  id: string;
  name: string;
  publisher: string;
  version: string;
}

export interface AppFileManifestDependency {
  id: string;
  name: string;
  publisher: string;
  minVersion: string;
}

export interface AppFileManifest {
  id: string;
  name: string;
  publisher: string;
  version: string;
  dependencies: AppFileManifestDependency[];
}

export interface AppFileDependencyInfo {
  fileName: string;
  manifest: AppFileManifest | null;
  error?: string;
}

export interface MissingDependencyInfo {
  repoFullName: string;
  missingRepos: string[];
  missingFiles: string[];
}

export interface MissingFileDependencyInfo {
  fileName: string;
  missingDependencies: AppFileManifestDependency[];
}

export interface DependencyTreeNode {
  repo: string;
  depth: number;
  parentRepo: string | null;
  children: string[];
}

export interface RepoDependencies {
  repoFullName: string;
  repoDependencies: AppDependencyProbingPath[];
  fileDependencies: FileDependency[];
  error?: string;
}

export interface DependenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
  allRepos: GitHubRepository[];
}

export type SaveStep = 
  | { status: 'idle' }
  | { status: 'updating-settings'; message: 'Actualizando settings.json...' }
  | { status: 'uploading-files'; message: string; current: number; total: number }
  | { status: 'deleting-files'; message: string; current: number; total: number }
  | { status: 'creating-pr'; message: 'Creando Pull Request...' }
  | { status: 'completed'; message: 'Pull Request creado exitosamente' };

export interface AddRepoModalProps {
  onClose: () => void;
  repos: GitHubRepository[];
  currentRepoFullName: string;
  existingDeps: AppDependencyProbingPath[];
  onAdd: (repos: GitHubRepository[], version: string, releaseStatus: string) => void;
}

export interface AddFileModalProps {
  onClose: () => void;
  onAdd: (files: File[]) => void;
}

export interface AddFolderModalProps {
  onClose: () => void;
  onAdd: (path: string) => void;
}

// ==================== CONSTANTS ====================

export const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  PowerShell: "#012456",
  AL: "#3AA6D0",
};
