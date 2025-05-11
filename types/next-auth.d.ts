import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extend the built-in User type
   */
  interface User {
    id: string
    // Add other user properties here
    // role?: string
  }

  /**
   * Extend the session object
   */
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}