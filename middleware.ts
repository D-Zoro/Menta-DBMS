import { NextResponse } from 'next/server'
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    // Add any custom logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // If there is a token, the user is authorized
    },
  }
)

// Specify which routes should be protected
export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
}