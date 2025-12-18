import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string;
    githubToken?: string;
    createdAt?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      image?: string;
      githubToken?: string;
      createdAt?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    githubToken?: string;
    createdAt?: string;
  }
}
