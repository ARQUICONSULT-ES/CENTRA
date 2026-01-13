import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "nombre.apellido@arquiconsult.com" },
                password: { label: "Password", type: "password", placeholder: "***" }
            },
            async authorize(credentials, req){
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Por favor ingrese email y contraseña");
                }

                try {
                    // Buscar usuario en la base de datos
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email
                        }
                    });

                    // Si no existe el usuario
                    if (!user) {
                        throw new Error("No existe un usuario con ese email");
                    }

                    // Verificar si el usuario está activo
                    if (!user.isActive) {
                        throw new Error("Tu cuenta está pendiente de activación. Revisa tu email para completar el registro.");
                    }

                    // Verificar si tiene contraseña configurada
                    if (!user.password) {
                        throw new Error("Tu cuenta no tiene contraseña configurada. Contacta con tu administrador.");
                    }

                    // Comparar la contraseña con el hash
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        throw new Error("Contraseña incorrecta");
                    }

                    // Si todo es correcto, retornar el usuario con los permisos
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.githubAvatar || undefined,
                        canAccessRepos: user.canAccessRepos,
                        canAccessCustomers: user.canAccessCustomers,
                        allCustomers: user.allCustomers,
                        canAccessAdmin: user.canAccessAdmin,
                    };
                } catch (error) {
                    console.error("Error en authorize:", error);
                    // Re-lanzar el error para que sea capturado por NextAuth
                    if (error instanceof Error) {
                        throw error;
                    }
                    throw new Error("Error al conectar con la base de datos. Por favor, intente más tarde.");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.image = user.image;
                token.canAccessRepos = user.canAccessRepos;
                token.canAccessCustomers = user.canAccessCustomers;
                token.allCustomers = user.allCustomers;
                token.canAccessAdmin = user.canAccessAdmin;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.image = token.image as string;
                session.user.canAccessRepos = token.canAccessRepos as boolean;
                session.user.canAccessCustomers = token.canAccessCustomers as boolean;
                session.user.allCustomers = token.allCustomers as boolean;
                session.user.canAccessAdmin = token.canAccessAdmin as boolean;
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
        signOut: '/',
        error: '/',
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 días
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };