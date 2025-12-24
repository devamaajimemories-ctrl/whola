"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Lock, User, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = "force-dynamic";

function BuyerLoginContent() {
    const router = useRouter();
    
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Timer State
    const [timer, setTimer] = useState(0);

    // Auto-redirect if logged in
    useEffect(() => {
        fetch('/api/auth/me').then(res => res.json()).then(data => {
            if (data.success && data.user?.role === 'buyer') router.replace('/buyer/dashboard');
        });
    }, [router]);

    // Countdown Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const sendOtp = async (isResend = false) => {
        if (!name) return setError("Please enter your name");
        if (!phone || phone.length < 10) return setError("Enter valid phone number");
        
        setLoading(true); 
        setError(null);

        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();

            if (data.success) {
                if (!isResend) setStep("OTP");
                setTimer(120); // Start 2 minute timer
                if (isResend) alert("OTP Resent Successfully!");
            } else {
                setError(data.error || "Failed to send OTP");
            }
        } catch (err) { 
            setError("Network Error"); 
        } finally { 
            setLoading(false); 
        }
    };

    const verifyOtp = async () => {
        if (otp.length < 6) return setError("Enter valid OTP");
        setLoading(true);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, name, role: 'buyer' }) 
            });
            const data = await res.json();
            if (data.success) window.location.href = "/buyer/dashboard"; 
            else setError(data.error || "Verification failed");
        } catch (err) { 
            setError("Something went wrong"); 
        } finally { 
            setLoading(false); 
        }
    };

    // Helper to format time (e.g., 1:59)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Buyer Login</h1>
                    <p className="text-gray-500 text-sm">Access quotes & track orders</p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}
                
                {step === "PHONE" ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full Name" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="98765 43210" />
                            </div>
                        </div>
                        <button onClick={() => sendOtp(false)} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors">
                            {loading ? <Loader2 className="animate-spin"/> : <>Get OTP <ArrowRight size={18}/></>}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Enter OTP sent to {phone}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl text-lg tracking-widest focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123456" maxLength={6} />
                            </div>
                        </div>

                        <button onClick={verifyOtp} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-md transition-colors">
                            {loading ? <Loader2 className="animate-spin inline mr-2"/> : "Verify & Login"}
                        </button>

                        <div className="flex justify-between items-center text-sm mt-2">
                            <button onClick={() => setStep("PHONE")} className="text-gray-500 hover:text-blue-600 font-medium">
                                Change Number
                            </button>
                            
                            <button 
                                onClick={() => sendOtp(true)} 
                                disabled={timer > 0 || loading} 
                                className={`font-medium ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800'}`}
                            >
                                {timer > 0 ? `Resend in ${formatTime(timer)}` : "Resend OTP"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center pt-4 border-t border-gray-100">
                    <Link href="/login/seller" className="text-sm text-blue-600 font-medium hover:underline">
                        Are you a Seller? Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function BuyerPage() {
    return <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>}><BuyerLoginContent /></Suspense>;
}