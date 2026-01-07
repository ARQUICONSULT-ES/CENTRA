import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    githubToken?: string;
    createdAt?: string;
    // Permisos de acceso
    canAccessRepos: boolean;
    canAccessCustomers: boolean;
    allCustomers: boolean;
    canAccessAdmin: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      githubToken?: string;
      createdAt?: string;
      // Permisos de acceso
      canAccessRepos: boolean;
      canAccessCustomers: boolean;
      allCustomers: boolean;
      canAccessAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    githubToken?: string;
    createdAt?: string;
    // Permisos de acceso
    canAccessRepos: boolean;
    canAccessCustomers: boolean;
    allCustomers: boolean;
    canAccessAdmin: boolean;
  }
}
