export interface AllowedCustomer {
  id: string;
  name: string;
  logo?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean; // Usuario activo tras establecer contraseña
  githubToken?: string | null;
  githubAvatar?: string | null;
  allowedCustomers?: AllowedCustomer[];
  createdAt: string;
  updatedAt: string;
  // Permisos de acceso
  canAccessRepos: boolean;
  canAccessCustomers: boolean;
  allCustomers: boolean;
  canAccessAdmin: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  githubToken?: string;
  allowedCustomerIds?: string[];
  sendActivationEmail?: boolean; // Si es true, no requiere password y envía email
  // Permisos de acceso
  canAccessRepos?: boolean;
  canAccessCustomers?: boolean;
  allCustomers?: boolean;
  canAccessAdmin?: boolean;
}

export interface UsersResponse {
  users: User[];
}
