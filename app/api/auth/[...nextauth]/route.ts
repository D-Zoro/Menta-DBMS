import NextAuth from "next-auth";
import CretentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = NextAuth({
    providers: [
        CretentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password)
                    return null;
                const user = await prisma.user.findUnique({
                    where:{ email: credentials.email },
                });

                if(!user || !user.password)
                    return null;
                const isValid = await bcrypt.compare(credentials.password,user.password);
                if(!isValid)
                    return null;

                return { 
                    id: user.id,
                    name: user.name,
                    email:user.email,
                };
            },      
        }),
    ],
    pages:{
        signIn:"/login",
    },
    session:{
        strategy:"jwt",
    },
    secret: process.env.AUTH_SECRET,
});

export { handler as GET , handler as POST };
