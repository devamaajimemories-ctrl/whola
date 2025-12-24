import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth'; // Your existing auth helper

export default async function DashboardTrafficCop() {
    const headersList = await headers();
    
    // The middleware should have already validated the token, 
    // but we can double check or extract the role here.
    
    // In your custom setup, we often have to read the cookie manually 
    // if not passed via headers, but let's assume middleware passed x-user-role
    const role = headersList.get("x-user-role");

    if (role === 'seller') {
        redirect('/seller/dashboard');
    } else if (role === 'buyer') {
        redirect('/buyer/dashboard');
    } else if (role === 'admin') {
        redirect('/admin/dashboard');
    } else {
        // If no role found (Guest), kick to login
        redirect('/login/buyer');
    }
    
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Redirecting...</p>
        </div>
    );
}