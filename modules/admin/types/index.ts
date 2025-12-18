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
  role: 'ADMIN' | 'USER';
  githubToken?: string | null;
  allowedCustomers?: AllowedCustomer[];
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'USER';
  githubToken?: string;
  allowedCustomerIds?: string[];
}

export interface UsersResponse {
  users: User[];
}
