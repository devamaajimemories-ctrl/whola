"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Smartphone, MapPin, Tag, ArrowRight, Loader2, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1); // 1 = Details, 2 = OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Form Data
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', city: '', category: '' });
    const [otp, setOtp] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.phone || formData.phone.length < 10) return setError("Invalid phone number");
        
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone })
            });
            const data = await res.json();

            if (data.success) {
                setStep(2); // Move to OTP step
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify & Create Account
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if(otp.length < 6) return setError("Invalid OTP");

        setLoading(true);
        setError(null);

        try {
            // We call the same verify route, but PASS THE PROFILE DATA
            // This triggers the "Registration/Upsert" logic in the API
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: formData.phone,
                    otp: otp,
                    role: 'seller', // This page is for Sellers
                    name: formData.name,
                    email: formData.email,
                    city: formData.city,
                    category: formData.category
                })
            });
            const data = await res.json();

            if (data.success) {
                window.location.href = data.redirectUrl; // Redirect to Dashboard
            } else {
                setError(data.error || 'Verification failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full max-w-2xl relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl mb-4 shadow-2xl">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Join YouthBharat</h1>
                    <p className="text-white/80 text-lg">Start your wholesale journey today</p>
                </div>

                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute inset-y-0 left-0 pl-4 h-full w-9 text-cyan-500 flex items-center pointer-events-none" />
                                    <input name="name" type="text" required value={formData.name} onChange={handleChange} className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-base" placeholder="Enter your full name" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Smartphone className="absolute inset-y-0 left-0 pl-4 h-full w-9 text-cyan-500 flex items-center pointer-events-none" />
                                        <input name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-base" placeholder="10-digit number" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input name="email" type="email" required value={formData.email} onChange={handleChange} className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-base" placeholder="you@example.com" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                    <div className="relative">
                                        <MapPin className="absolute inset-y-0 left-0 pl-4 h-full w-9 text-cyan-500 flex items-center pointer-events-none" />
                                        <input name="city" type="text" required value={formData.city} onChange={handleChange} className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-base" placeholder="Your city" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                    <div className="relative">
                                        <Tag className="absolute inset-y-0 left-0 pl-4 h-full w-9 text-cyan-500 flex items-center pointer-events-none" />
                                        <select name="category" required value={formData.category} onChange={handleChange} className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-base appearance-none bg-white">
                                            <option value="">Select Category</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Fashion">Fashion</option>
                                            <option value="Industrial">Industrial</option>
                                            <option value="General">General</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-6 flex justify-center items-center">
                                {loading ? <Loader2 className="animate-spin" /> : <>Verify Mobile <ArrowRight className="ml-2 h-5 w-5" /></>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP sent to {formData.phone}</label>
                                <div className="relative">
                                    <Lock className="absolute inset-y-0 left-0 pl-4 h-full w-9 text-cyan-500 flex items-center pointer-events-none" />
                                    <input 
                                        type="text" 
                                        value={otp} 
                                        onChange={e => setOtp(e.target.value)} 
                                        className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 text-lg font-bold tracking-widest" 
                                        placeholder="123456" 
                                        maxLength={6} 
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex justify-center items-center">
                                {loading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                            </button>
                            <button type="button" onClick={() => setStep(1)} className="block w-full text-center text-sm text-gray-500 hover:text-cyan-600">
                                Change Details
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-white/80 text-sm">Already have an account? <Link href="/login" className="font-semibold text-white underline">Sign in here</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}