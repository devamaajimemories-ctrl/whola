import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const path = request.nextUrl.pathname;

    // 1. Define Routes
    const isAdminRoute = path.startsWith('/admin');
    const isAdminLogin = path === '/admin/login';
    const isSellerRoute = path.startsWith('/seller');
    const isBuyerRoute = path.startsWith('/buyer');

    // 2. Allow public access to Admin Login
    if (isAdminLogin) {
        // If already logged in as admin, redirect to dashboard
        if (token) {
            const payload = await verifyToken(token);
            if (payload?.role === 'admin') {
                return NextResponse.redirect(new URL('/admin/requirements', request.url));
            }
        }
        return NextResponse.next();
    }

    // 3. Protect Admin Dashboard
    if (isAdminRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        
        const payload = await verifyToken(token);
        if (!payload || payload.role !== 'admin') {
            // Logged in but NOT an admin? Redirect to their respective home or login
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // 4. Protect Seller/Buyer Routes (Existing Logic)
    if ((isSellerRoute || isBuyerRoute) && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 5. Attach User ID for API Routes
    if (token) {
        const payload = await verifyToken(token);
        if (payload) {
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', payload.userId as string);
            requestHeaders.set('x-user-role', payload.role as string);
            return NextResponse.next({ request: { headers: requestHeaders } });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/seller/:path*', '/buyer/:path*', '/admin/:path*', '/api/:path*'],
};