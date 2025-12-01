import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Get token from cookies
        // Note: In Next.js App Router, we use 'cookies()' from 'next/headers' or request.cookies
        // But since we are in a route handler, request.cookies is available on the NextRequest object if we type it,
        // or we can use the standard Request object and parse 'cookie' header.
        // However, NextRequest is easier.

        // Let's cast to any to access cookies if using standard Request, or better, import NextRequest
        const token = (request as any).cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, user: null }, { status: 200 });
        }

        // 2. Verify Token
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ success: false, user: null }, { status: 200 });
        }

        // 3. Return User Info
        return NextResponse.json({
            success: true,
            user: {
                userId: payload.userId,
                role: payload.role,
                // Add other fields if needed and available in token
            }
        });

    } catch (error) {
        console.error("Auth Check Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
