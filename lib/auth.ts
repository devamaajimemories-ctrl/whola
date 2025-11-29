import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

// 🚨 PRODUCTION FIX: Fail immediately if secrets are missing
if (!process.env.JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d') // Session lasts 30 days
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

export function createAuthCookie(response: NextResponse, token: string) {
    response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 Days
        path: '/',
    });
    return response;
}