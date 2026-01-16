export interface GitHubEnvironment {
  id: number;
  node_id: string;
  name: string;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  protection_rules?: Array<{
    id: number;
    type: string;
    wait_timer?: number;
  }>;
  deployment_branch_policy?: {
    protected_branches: boolean;
    custom_branch_policies: boolean;
  } | null;
}

export interface GitHubEnvironmentSecret {
  name: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubEnvironmentsResponse {
  total_count: number;
  environments: GitHubEnvironment[];
}

export interface GitHubSecretsResponse {
  total_count: number;
  secrets: GitHubEnvironmentSecret[];
}
