import NextAuth, { AuthOptions, NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { User } from "next-auth";

// Extend the Session type to include the id property
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       name?: string | null;
//       email?: string | null;
//       image?: string | null;
//     };
//   }
// }

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define authentication options
const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<User | null> {
        // Check if credentials are provided
        if (!credentials?.email || !credentials?.password) {
          console.log("Auth failed: Missing email or password");
          return null;
        }
        
        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // Check if user exists and has password
          if (!user || !user.password) {
            console.log(`Auth failed: User not found for email ${credentials.email}`);
            return null;
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            console.log(`Auth failed: Invalid password for ${credentials.email}`);
            return null;
          }

          console.log(`Auth successful: ${user.email} logged in`);
          
          // Return user data
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            // role: user.role || "user", // Include role if you have it in your schema
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login?error=true", // Add error page
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days session
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add additional data to token from user
      if (user) {
        token.id = user.id;
        // token.role = user.role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      // Add additional data to session from token
      if (session.user) {
        session.user.id = token.id as string; // Ensure id is added to the session type
        // session.user.role = token.role as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET || "fallback-secret-do-not-use-in-production",
};

// Create handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
