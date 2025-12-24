import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

// 🚨 PRODUCTION FIX: Fail immediately if secrets are missing
if (!process.env.JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

// Added expiresIn parameter with default '30d'
export async function signToken(payload: any, expiresIn: string = '30d') {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn) 
        .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload;
    } catch (error) {
        return null;
    }
}

// Added isSession parameter
export function createAuthCookie(response: NextResponse, token: string, isSession: boolean = false) {
    const options: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    };

    // Only set maxAge if it's NOT a session cookie
    if (!isSession) {
        options.maxAge = 60 * 60 * 24 * 30; // 30 Days
    }

    response.cookies.set('auth_token', token, options);
    return response;
}