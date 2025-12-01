"use client";

import React, { useState } from 'react';
import { X, Building2, User, Phone, Mail } from 'lucide-react';
import Image from 'next/image';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        phone: '',
        email: ''
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setStep(1);
            setOtp(['', '', '', '', '', '']);
            setLoading(false);
        }
    }, [isOpen]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone })
            });
            const data = await res.json();

            if (data.success) {
                setStep(2);
            } else {
                alert(data.error || "Failed to send OTP");
            }
        } catch (error) {
            console.error("OTP Send Error:", error);
            alert("Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const otpValue = otp.join('');

        try {
            const response = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: formData.phone,
                    otp: otpValue,
                    role: 'seller',
                    // Pass registration details to save on verification
                    name: formData.name,
                    company: formData.company,
                    email: formData.email,
                    category: 'General', // Default
                    city: '' // Default
                })
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = '/seller/dashboard';
            } else {
                alert(data.error || 'Invalid OTP. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col lg:flex-row" onClick={(e) => e.stopPropagation()}>
                {/* Left Side - Image & Info */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-800 to-gray-900 p-12 flex-col justify-between text-white relative overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0 opacity-30">
                        <Image
                            src="/registration-bg.png"
                            alt="Business"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-4">
                            Sell your products to millions of customer!
                        </h2>
                        <p className="text-xl mb-2">Register your Business with us Free</p>
                        <p className="text-lg text-gray-300">Get started with YouthBharat!</p>
                    </div>

                    {/* Stats */}
                    <div className="relative z-10 grid grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                                <Building2 size={32} className="text-blue-300" />
                            </div>
                            <div className="text-2xl font-bold">2 Crore+</div>
                            <div className="text-sm text-gray-300">Products/Services</div>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 bg-green-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                                <User size={32} className="text-green-300" />
                            </div>
                            <div className="text-2xl font-bold">20 Lakh+</div>
                            <div className="text-sm text-gray-300">Suppliers</div>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 bg-purple-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                                <Mail size={32} className="text-purple-300" />
                            </div>
                            <div className="text-2xl font-bold">50 Lakh+</div>
                            <div className="text-sm text-gray-300">Verified Buyers</div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 relative">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="max-w-md mx-auto">
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            {step === 1 ? 'Register your Company FREE' : 'Verify Mobile Number'}
                        </h3>
                        <p className="text-gray-600 mb-1">
                            {step === 1 ? 'Get Verified Buyers for your Product, FREE!' : `Enter the OTP sent to +91 ${formData.phone}`}
                        </p>
                        {step === 1 && <p className="text-sm text-green-600 mb-6">✓ Buyer may connect on this Mobile No. & Email ID</p>}

                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} className="space-y-4 mt-6">
                                {/* Name Input */}
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        required
                                    />
                                </div>

                                {/* Company Name Input */}
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Company Name"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        required
                                    />
                                </div>

                                {/* Mobile Number Input */}
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <div className="flex">
                                        <div className="flex items-center pl-12 pr-2 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
                                            <span className="text-gray-700 font-semibold">🇮🇳 +91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Mobile Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                            pattern="[0-9]{10}"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? 'Sending OTP...' : 'Verify Mobile & Create Account →'}
                                </button>

                                {/* Terms */}
                                <p className="text-xs text-gray-500 text-center">
                                    By clicking Create Account, I accept the <a href="/terms" className="text-blue-600 hover:underline">T&C</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                                </p>
                            </form>
                        ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-6 mt-8">
                                <div className="flex justify-between gap-2">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Change Mobile Number
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Already have account */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <button onClick={() => window.location.href = '/login'} className="text-blue-600 font-semibold hover:underline">
                                    Sign In
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
