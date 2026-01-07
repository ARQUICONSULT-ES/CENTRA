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

                    // Comparar la contraseña con el hash
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        throw new Error("Contraseña incorrecta");
                    }

                    // Si todo es correcto, retornar el usuario
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.githubAvatar || undefined,
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
                token.role = user.role;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.image = token.image as string;
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