"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Smartphone, Lock, ArrowRight, Loader2, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export const dynamic = "force-dynamic";

// 1. Component containing useSearchParams and all logic
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

        // CHECK IF ALREADY LOGGED IN
        const checkSession = async () => {
            try {
                const res = await fetch('/api/auth/me');
                const data = await res.json();
                if (data.success && data.user) {
                    // Redirect based on role
                    if (data.user.role === 'seller') router.replace('/seller/dashboard');
                    else if (data.user.role === 'buyer') router.replace('/buyer/dashboard');
                }
            } catch (err) {
                console.error("Session check failed", err);
            }
        };
        checkSession();

    }, [searchParams, router]);

    // Countdown Timer Effect
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
                setError(data.error || "Failed to send OTP. You can still enter OTP if you received it.");
                if (data.remainingSeconds) {
                    setCountdown(data.remainingSeconds);
                }
            }
        } catch (err) {
            setError("Something went wrong, but you can still enter OTP if you received it.");
            setLastChannel(channel);
            setStep("OTP");
            setCountdown(120);
            setCanResend(false);
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

            // Check the correct key used in the API response (redirectUrl)
            if (data.success && data.redirectUrl) {
                // Force a hard reload to ensure cookies are sent correctly
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

    // The entire layout JSX
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* The main login content block */}
            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl mb-4 shadow-2xl">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {role === 'buyer' ? 'Buyer Sign In' : 'Seller Sign In'}
                    </h1>
                    <p className="text-white/80 text-lg">
                        {role === 'buyer'
                            ? 'Access your buying dashboard'
                            : 'Manage your business & leads'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <div className="flex items-center">
                                <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    )}

                    {step === "PHONE" ? (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Smartphone className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-lg font-medium text-black"
                                        placeholder="Enter your number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => sendOtp('whatsapp')}
                                    disabled={loading}
                                    className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <div className="flex items-center justify-center">
                                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                            <>
                                                <Zap className="w-4 h-4 mr-2" />
                                                Send OTP via WhatsApp
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Enter Verification Code
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-lg font-medium tracking-widest text-black"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Code sent to <span className="font-semibold text-gray-700">{phone}</span>
                                    </p>
                                    {countdown > 0 ? (
                                        <p className="text-sm font-mono text-indigo-600">
                                            Resend in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                                        </p>
                                    ) : canResend ? (
                                        <button
                                            onClick={() => sendOtp(lastChannel, true)}
                                            disabled={loading}
                                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                                        >
                                            Resend via WhatsApp
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <button
                                onClick={verifyOtp}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : (
                                    <span className="flex items-center justify-center">
                                        Verify & Continue
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={() => setStep("PHONE")}
                                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                            >
                                ← Change Phone Number
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center space-y-3">
                    <p className="text-white/80 text-sm">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-semibold text-white hover:text-white/90 underline underline-offset-2">
                            Sign up for free
                        </Link>
                    </p>

                    {/* Role Switcher */}
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => setRole('buyer')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === 'buyer'
                                ? 'bg-white/20 text-white backdrop-blur-lg'
                                : 'text-white/60 hover:text-white/90'
                                }`}
                        >
                            Buyer Login
                        </button>
                        <span className="text-white/40">|</span>
                        <button
                            onClick={() => setRole('seller')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${role === 'seller'
                                ? 'bg-white/20 text-white backdrop-blur-lg'
                                : 'text-white/60 hover:text-white/90'
                                }`}
                        >
                            Seller Login
                        </button>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 flex items-center justify-center gap-8 text-white/60 text-xs">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Secure Login</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span>Instant Access</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 2. The final default export which wraps LoginContent in a Suspense boundary
// This fixes the 'useSearchParams' CSR bailout error during build/prerendering.
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden text-white justify-center items-center">
                <Loader2 className="animate-spin h-8 w-8 mr-2" /> Loading Login...
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}