import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "nombre.apellido@arquiconsult.com" },
                password: { label: "Password", type: "password", placeholder: "***" }
            },
            authorize(credentials, req){
                return null
            }
        })
    ]
}

const handler = NextAuth(authOptions);

export {handler as GET, handler as POST};