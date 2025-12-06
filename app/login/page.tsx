"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone, Lock, ArrowRight, Loader2, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export const dynamic = "force-dynamic";

function LoginContent() {
    const searchParams = useSearchParams();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
    const [countdown, setCountdown] = useState(0);
    const [canResend, setCanResend] = useState(false);
    const [lastChannel, setLastChannel] = useState<'whatsapp'>('whatsapp');
    const router = useRouter();

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'seller' || roleParam === 'buyer') {
            setRole(roleParam);
        }

        const checkSession = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.success && data.user) {
                    if (data.user.role === 'seller') router.replace('/seller/dashboard');
                    else if (data.user.role === 'buyer') router.replace('/buyer/dashboard');
                }
            } catch (err) {
                console.error("Session check failed", err);
            }
        };
        checkSession();
    }, [searchParams, router]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && step === "OTP") {
            setCanResend(true);
        }
    }, [countdown, step]);

    const sendOtp = async (channel: 'whatsapp' = 'whatsapp', isResend: boolean = false) => {
        if (!phone || phone.length < 10) {
            setError("Please enter a valid phone number");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, channel })
            });
            const data = await res.json();
            setLastChannel(channel);
            setStep("OTP");
            setCountdown(120);
            setCanResend(false);

            if (data.success) {
                if (isResend) {
                    setError(null);
                    alert("New OTP sent successfully!");
                }
            } else {
                setError(data.error || "Failed to send OTP.");
                if (data.remainingSeconds) setCountdown(data.remainingSeconds);
            }
        } catch (err) {
            setError("Something went wrong, but you can still enter OTP if you received it.");
            setLastChannel(channel);
            setStep("OTP");
            setCountdown(120);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp || otp.length < 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, role })
            });
            const data = await res.json();

            if (data.success && data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                setError(data.error || "Invalid OTP");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl mb-4 shadow-2xl">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">{role === 'buyer' ? 'Buyer Sign In' : 'Seller Sign In'}</h1>
                    <p className="text-white/80 text-lg">
                        {role === 'buyer' ? 'Access your buying dashboard' : 'Manage your business & leads'}
                    </p>
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    {step === "PHONE" ? (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Smartphone className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg font-medium text-black" placeholder="Enter your number" />
                                </div>
                            </div>
                            <button onClick={() => sendOtp('whatsapp')} disabled={loading} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50">
                                <div className="flex items-center justify-center">
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Zap className="w-4 h-4 mr-2" /> Send OTP via WhatsApp</>}
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">Enter Verification Code</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <input id="otp" type="text" value={otp} onChange={e => setOtp(e.target.value)} className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg font-medium tracking-widest text-black" placeholder="000000" maxLength={6} />
                                </div>
                            </div>
                            <button onClick={verifyOtp} disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : <span className="flex items-center justify-center">Verify & Continue <ArrowRight className="ml-2 h-5 w-5" /></span>}
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 text-center space-y-3">
                    <p className="text-white/80 text-sm">Don't have an account? <Link href="/register" className="font-semibold text-white underline">Sign up for free</Link></p>
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setRole('buyer')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === 'buyer' ? 'bg-white/20 text-white backdrop-blur-lg' : 'text-white/60 hover:text-white/90'}`}>Buyer Login</button>
                        <span className="text-white/40">|</span>
                        <button onClick={() => setRole('seller')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === 'seller' ? 'bg-white/20 text-white backdrop-blur-lg' : 'text-white/60 hover:text-white/90'}`}>Seller Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-indigo-600 flex items-center justify-center text-white"><Loader2 className="animate-spin h-8 w-8" /></div>}>
            <LoginContent />
        </Suspense>
    );
}