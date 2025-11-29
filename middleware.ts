import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    // 1. Get the token from cookies
    const token = request.cookies.get('auth_token')?.value;

    // 2. Define protected routes (Seller & Buyer Dashboards & APIs)
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith('/seller') ||
        request.nextUrl.pathname.startsWith('/buyer') ||
        request.nextUrl.pathname.startsWith('/api/seller') ||
        request.nextUrl.pathname.startsWith('/api/buyer') ||
        request.nextUrl.pathname.startsWith('/api/products/add');

    // 3. Redirect to Login if no token on protected routes
    if (isProtectedRoute && !token) {
        // If it's an API call, return JSON error
        if (request.nextUrl.pathname.startsWith('/api/')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        // If it's a Page, redirect to Login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 4. Verify Token and Set Headers for API
    if (token) {
        const payload = await verifyToken(token);

        if (!payload) {
            // Invalid token - clear it and redirect
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth_token');
            return response;
        }

        // 5. Pass User ID to the Backend (This makes your API work!)
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId as string);
        requestHeaders.set('x-user-role', payload.role as string);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        '/seller/:path*',
        '/buyer/:path*',
        '/api/seller/:path*',
        '/api/buyer/:path*',
        '/api/products/:path*',
        '/api/chat/:path*', // <--- ADDED: Ensures chat APIs get the x-user-id header
        '/admin/:path*',
    ],
};