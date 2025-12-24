import { NextResponse } from 'next/server';
import { signToken, createAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { password } = await req.json();
        
        // 1. Get Password from Environment Variable
        const envPassword = process.env.ADMIN_PASSWORD;

        if (!envPassword) {
            return NextResponse.json({ success: false, error: "Server Misconfiguration: ADMIN_PASSWORD not set" }, { status: 500 });
        }

        // 2. Verify Password
        if (password !== envPassword) {
            return NextResponse.json({ success: false, error: "Invalid Password" }, { status: 401 });
        }

        // 3. Generate Admin Token (Role: 'admin')
        // We use a static ID 'admin-user' since there's only one super admin
        // EXPIRATION: Set to 12 hours for security (instead of 30 days)
        const token = await signToken({
            userId: 'admin-master',
            role: 'admin',
            name: 'Super Admin'
        }, '12h'); 

        // 4. Set Cookie & Respond
        const response = NextResponse.json({ success: true, message: "Admin Authenticated" });
        
        // COOKIE: Enable isSession=true so it deletes when browser closes
        return createAuthCookie(response, token, true);

    } catch (error) {
        console.error("Admin Login Error:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}