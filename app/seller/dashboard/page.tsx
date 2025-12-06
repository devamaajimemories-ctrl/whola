import React from 'react';
import { headers } from 'next/headers';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import { Package, ShoppingBag, DollarSign, TrendingUp, Settings, Plus, CheckCircle, AlertTriangle, Clock, Box } from 'lucide-react';

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default async function SellerDashboard() {
    // --- BACKEND LOGIC START ---
    await dbConnect();
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) return <div className="min-h-screen flex items-center justify-center">Session Expired</div>;

    const [seller, products, recentOrders] = await Promise.all([
        Seller.findById(userId),
        Product.find({ sellerId: userId }),
        Order.find({ sellerId: userId }).sort({ createdAt: -1 }).limit(5)
    ]);

    if (!seller) return <div>Seller account not found.</div>;

    const activeProducts = products.filter((p: any) => p.status === 'APPROVED').length;
    const pendingProducts = products.filter((p: any) => p.status === 'PENDING').length;
    const pendingOrders = recentOrders.filter(o => o.deliveryStatus === 'PENDING' || o.deliveryStatus === 'SHIPPED').length;
    // --- BACKEND LOGIC END ---

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Local Nav */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-20">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg"><TrendingUp className="text-yellow-400" /><span>Seller Center</span></div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                         <Link href="/seller/products" className="hover:text-yellow-300 transition">My Products</Link>
                         <Link href="/seller/orders" className="hover:text-yellow-300 transition">Orders</Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                        <h2 className="font-bold text-gray-900 text-lg">{seller.name}</h2>
                        <Link href="/seller/products/add" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-bold transition mt-4 justify-center">
                            <Plus size={18} /> Add Product
                        </Link>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="lg:col-span-9 space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs uppercase font-bold">Earnings</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(seller.totalEarnings)}</h3>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs uppercase font-bold">Pending Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{pendingOrders}</h3>
                        </div>
                    </div>

                    {/* Product Health */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><ShoppingBag size={20} /> Product Health</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Live Products</span>
                                <span className="font-bold text-green-700">{activeProducts}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-yellow-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Pending Approval</span>
                                <span className="font-bold text-yellow-700">{pendingProducts}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}