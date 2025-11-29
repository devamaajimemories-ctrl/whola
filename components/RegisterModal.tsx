"use client";

import React, { useState } from 'react';
import { X, Building2, User, Phone, Mail } from 'lucide-react';
import Image from 'next/image';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        phone: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    company: formData.company,
                    phone: formData.phone,
                    email: formData.email,
                    category: 'General',
                    city: ''
                })
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = '/seller/dashboard';
            } else {
                alert(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex" onClick={(e) => e.stopPropagation()}>
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
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">Register your Company FREE</h3>
                        <p className="text-gray-600 mb-1">Get Verified Buyers for your Product, FREE!</p>
                        <p className="text-sm text-green-600 mb-6">✓ Buyer may connect on this Mobile No. & Email ID</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Input */}
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? 'Creating Account...' : 'Create Account →'}
                            </button>

                            {/* Terms */}
                            <p className="text-xs text-gray-500 text-center">
                                By clicking Create Account, I accept the <a href="/terms" className="text-blue-600 hover:underline">T&C</a> and <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                            </p>
                        </form>

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
