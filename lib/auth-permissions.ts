import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export interface UserPermissions {
  isAuthenticated: boolean;
  userId?: string;
  // Permisos de módulos
  canAccessRepos: boolean;
  canAccessCustomers: boolean;
  allCustomers: boolean;
  canAccessAdmin: boolean;
  // Clientes permitidos (vacío = todos si allCustomers es true)
  allowedCustomerIds: string[];
}

export async function getUserPermissions(): Promise<UserPermissions> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      isAuthenticated: false,
      canAccessRepos: false,
      canAccessCustomers: false,
      allCustomers: false,
      canAccessAdmin: false,
      allowedCustomerIds: [],
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      canAccessRepos: true,
      canAccessCustomers: true,
      allCustomers: true,
      canAccessAdmin: true,
      allowedCustomers: {
        select: {
          customerId: true,
        },
      },
    },
  });

  if (!user) {
    return {
      isAuthenticated: false,
      canAccessRepos: false,
      canAccessCustomers: false,
      allCustomers: false,
      canAccessAdmin: false,
      allowedCustomerIds: [],
    };
  }

  return {
    isAuthenticated: true,
    userId: user.id,
    canAccessRepos: user.canAccessRepos,
    canAccessCustomers: user.canAccessCustomers,
    allCustomers: user.allCustomers,
    canAccessAdmin: user.canAccessAdmin,
    // Si tiene acceso a clientes y allCustomers es true, array vacío significa "sin restricciones"
    // Si allCustomers es false, devolver solo los clientes permitidos
    allowedCustomerIds: user.allCustomers 
      ? [] 
      : user.allowedCustomers.map((ac) => ac.customerId),
  };
}
