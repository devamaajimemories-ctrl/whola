import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (
                    credentials?.email === adminEmail &&
                    credentials?.password === adminPassword
                ) {
                    return { id: "1", name: "Admin", email: adminEmail };
                }
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
        // Optional: Set session to expire after 1 day instead of 30 days
        maxAge: 24 * 60 * 60, 
    },
    callbacks: {
        // 1. When logging in, save the CURRENT password (or a hash of it) into the token
        async jwt({ token, user }) {
            if (user) {
                token.envPassword = process.env.ADMIN_PASSWORD;
            }
            return token;
        },
        // 2. On every request, check if the token's password matches the .env file
        async session({ session, token }) {
            // If the password in the .env file has changed since this token was issued...
            if (token.envPassword !== process.env.ADMIN_PASSWORD) {
                // ...return null to invalidate the session (Force Logout)
                return null as any; 
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretkey", 
});

export { handler as GET, handler as POST };