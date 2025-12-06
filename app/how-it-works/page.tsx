import React from 'react';
import { Shield, Users, MessageCircle, CreditCard, TrendingUp, CheckCircle, Lock, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">How YouthBharat Works</h1>
                    <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                        India's First Escrow-Protected B2B Marketplace with Zero Upfront Costs
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {/* For Buyers Section */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold mb-4">
                            <Users size={20} />
                            FOR BUYERS
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Multiple Quotes Instantly</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Post your requirement once and receive verified quotes from trusted suppliers
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white rounded-xl shadow-md p-8 text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-blue-600">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Post Requirement</h3>
                            <p className="text-gray-600 text-sm">
                                Tell us what you need - product, quantity, and your budget. Takes less than 2 minutes.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-green-600">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Receive Offers</h3>
                            <p className="text-gray-600 text-sm">
                                Verified sellers will review your request and send you competitive offers directly.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-8 text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-purple-600">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Pay Securely</h3>
                            <p className="text-gray-600 text-sm">
                                Choose the best offer and pay via escrow. Money held until delivery confirmed.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition-colors">
                            Post Requirement - It's Free!
                        </Link>
                    </div>
                </section>

                {/* For Sellers Section */}
                <section className="mb-20 bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-12">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold mb-4">
                            <TrendingUp size={20} />
                            FOR SELLERS
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Zero Upfront Investment</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Grow your business without buying leads or paying subscription fees.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Zap className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Get Matched Automatically</h3>
                                    <p className="text-sm text-gray-600">
                                        Our system connects you with buyers looking for your specific products. No need to hunt for customers.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Lock className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">No Subscription Fees</h3>
                                    <p className="text-sm text-gray-600">
                                        Listing your business and products is completely free. We don't charge for "Leads".
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Chat & Negotiate</h3>
                                    <p className="text-sm text-gray-600">
                                        Secure in-app chat to discuss details and finalize prices directly with interested buyers.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="text-yellow-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Success-Based Earnings</h3>
                                    <p className="text-sm text-gray-600">
                                        We only charge a small 5% platform fee when you successfully complete a deal and get paid.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/login" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg transition-colors">
                            Start Selling Now
                        </Link>
                    </div>
                </section>

                {/* Escrow Protection */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold mb-4">
                            <Shield size={20} />
                            ESCROW PROTECTION
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Money is Safe with Us</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We hold payments in escrow until delivery is confirmed. Both buyers and sellers are protected.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle className="text-blue-600" size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Step 1: Buyer Pays</h4>
                                        <p className="text-gray-600 text-sm">Payment is made via Razorpay and held in YouthBharat's escrow account</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle className="text-green-600" size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Step 2: Seller Ships</h4>
                                        <p className="text-gray-600 text-sm">Seller ships the product and provides tracking details</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle className="text-purple-600" size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Step 3: Buyer Confirms</h4>
                                        <p className="text-gray-600 text-sm">Buyer confirms delivery and product quality</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <CheckCircle className="text-yellow-600" size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Step 4: Payment Released</h4>
                                        <p className="text-gray-600 text-sm">95% of payment goes to seller, 5% platform fee retained</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-900 font-semibold mb-2">💡 Why 5% Commission?</p>
                                <p className="text-sm text-blue-800">
                                    Our small 5% fee covers payment processing, escrow protection, dispute resolution, and platform maintenance.
                                    We only earn when you successfully complete a deal.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-blue-100 mb-8 text-lg">Join thousands of buyers and sellers trading securely on YouthBharat</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/login" className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-lg transition-colors">
                            I'm a Buyer
                        </Link>
                        <Link href="/login" className="bg-blue-800 hover:bg-blue-900 text-white font-bold px-8 py-3 rounded-lg transition-colors border-2 border-white">
                            I'm a Seller
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}