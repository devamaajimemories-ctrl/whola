import React from 'react';
import { headers } from 'next/headers';
import Link from 'next/link';
import dbConnect from '@/lib/db';

// Models
import Seller from '@/lib/models/Seller';
import Request from '@/lib/models/Request';
import Transaction from '@/lib/models/Transaction';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';

// Icons
import {
    User, Package, ShoppingBag, DollarSign, TrendingUp,
    Settings, Bell, Plus, CheckCircle, AlertTriangle,
    Clock, MapPin, Box
} from 'lucide-react';

// Helper to format currency
const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default async function SellerDashboard() {
    await dbConnect();

    // 1. Authentication Check
    const headersList = await headers();
    const userId = headersList.get("x-user-id");

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Link href="/login" className="text-blue-600 hover:underline font-semibold">
                    Session Expired. Please Log In.
                </Link>
            </div>
        );
    }

    // 2. Fetch All Required Data in Parallel (Fast & Efficient)
    const [seller, products, recentOrders, recentLeads] = await Promise.all([
        Seller.findById(userId),
        Product.find({ sellerId: userId }),
        Order.find({ sellerId: userId }).sort({ createdAt: -1 }).limit(5),
        Request.find({ category: { $exists: true } }).sort({ createdAt: -1 }).limit(5) // Matches general category
    ]);

    if (!seller) return <div className="min-h-screen flex items-center justify-center">Seller account not found.</div>;

    // 3. Calculate Dynamic Stats
    // Using 'any' to bypass strict type checks on Mongoose documents for this dashboard view
    const activeProducts = products.filter((p: any) => p.status === 'APPROVED').length;
    const pendingProducts = products.filter((p: any) => p.status === 'PENDING').length;
    const productsNoImage = products.filter((p: any) => !p.images || p.images.length === 0).length;

    const pendingOrders = recentOrders.filter(o => o.deliveryStatus === 'PENDING' || o.deliveryStatus === 'SHIPPED').length;

    // Calculate Completion Score
    let completionScore = 0;
    if (seller.name) completionScore += 20;
    if (seller.bankAccountNumber) completionScore += 30; // High weight for bank details
    if (seller.gstin) completionScore += 20;
    if (products.length > 0) completionScore += 30;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* --- NAV HEADER --- */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg sticky top-0 z-20">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <TrendingUp className="text-yellow-400" />
                        <span>Seller Center</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/seller/products" className="hover:text-yellow-300 transition">My Products</Link>
                            <Link href="/seller/leads" className="hover:text-yellow-300 transition">Buy Leads</Link>
                            <Link href="/seller/orders" className="hover:text-yellow-300 transition">Orders</Link>
                        </div>
                        <div className="bg-white/10 px-3 py-1 rounded-full flex items-center gap-2 border border-white/20">
                            <DollarSign size={14} />
                            <span>Credits: ₹{seller.walletBalance}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* --- LEFT SIDEBAR (Profile & Actions) --- */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-bold text-2xl border-2 border-blue-100">
                            {seller.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="font-bold text-gray-900 text-lg">{seller.name}</h2>
                        <p className="text-gray-500 text-sm mb-4">{seller.city || 'Location N/A'}</p>

                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Profile Completion</span>
                                <span className="font-bold">{completionScore}%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-1.5">
                                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${completionScore}%` }}></div>
                            </div>
                        </div>

                        {!seller.bankAccountNumber && (
                            <Link href="/seller/add-bank-details" className="block w-full bg-red-50 text-red-600 text-xs font-bold py-2 rounded border border-red-100 hover:bg-red-100 mb-2">
                                ⚠️ Add Bank Details
                            </Link>
                        )}
                        <Link href="/seller/profile" className="text-blue-600 text-sm font-semibold hover:underline">Edit Profile</Link>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 text-sm">Quick Actions</div>
                        <div className="p-2">
                            <Link href="/seller/products/add" className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg text-gray-700 transition">
                                <Plus size={18} className="text-blue-600" /> Add Product
                            </Link>
                            <Link href="/seller/leads" className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg text-gray-700 transition">
                                <Bell size={18} className="text-orange-500" /> Browse Leads
                            </Link>
                            <Link href="/seller/settings" className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg text-gray-700 transition">
                                <Settings size={18} className="text-gray-500" /> Settings
                            </Link>
                        </div>
                    </div>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="lg:col-span-9 space-y-8">

                    {/* 1. KPI CARDS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Earnings</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(seller.totalEarnings)}</h3>
                            <span className="text-xs text-green-600 flex items-center mt-1"><TrendingUp size={12} className="mr-1" /> Lifetime</span>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Pending Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{pendingOrders}</h3>
                            <span className="text-xs text-orange-600 flex items-center mt-1"><Clock size={12} className="mr-1" /> Needs Action</span>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Active Products</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{activeProducts}</h3>
                            <span className="text-xs text-blue-600 flex items-center mt-1"><CheckCircle size={12} className="mr-1" /> Live on Store</span>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Views</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">1.2k</h3>
                            <span className="text-xs text-gray-400 flex items-center mt-1">Last 30 Days</span>
                        </div>
                    </div>

                    {/* 2. RECENT ORDERS (Action Center) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Package className="text-blue-600" size={20} /> Recent Orders
                            </h3>
                            <Link href="/seller/orders" className="text-blue-600 text-sm hover:underline">View All</Link>
                        </div>
                        {recentOrders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium">
                                        <tr>
                                            <th className="p-4">Order ID</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentOrders.map(order => (
                                            <tr key={order._id.toString()} className="hover:bg-gray-50">
                                                <td className="p-4 font-mono font-medium">{order.orderId}</td>
                                                <td className="p-4 text-gray-900 font-bold">{formatCurrency(order.sellerAmount)}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                        order.deliveryStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                        order.deliveryStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {order.deliveryStatus}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <Link href={`/seller/orders/${order.orderId}`} className="text-blue-600 hover:underline font-medium">
                                                        Manage
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <Box size={40} className="mx-auto mb-3 text-gray-300" />
                                <p>No orders yet. Improve your catalog to get sales!</p>
                            </div>
                        )}
                    </div>

                    {/* 3. PRODUCT HEALTH & LEADS */}
                    <div className="grid md:grid-cols-2 gap-8">

                        {/* Product Health */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <ShoppingBag size={20} className="text-purple-600" /> Product Health
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={16} /></div>
                                        <span className="text-gray-700 font-medium">Live Products</span>
                                    </div>
                                    <span className="font-bold text-green-700">{activeProducts}</span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-100 p-2 rounded-full text-yellow-600"><Clock size={16} /></div>
                                        <span className="text-gray-700 font-medium">Pending Approval</span>
                                    </div>
                                    <span className="font-bold text-yellow-700">{pendingProducts}</span>
                                </div>

                                {(productsNoImage > 0) && (
                                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-100 p-2 rounded-full text-red-600"><AlertTriangle size={16} /></div>
                                            <span className="text-gray-700 font-medium">Missing Images</span>
                                        </div>
                                        <span className="font-bold text-red-700">{productsNoImage}</span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 text-center">
                                <Link href="/seller/products" className="text-sm text-blue-600 font-semibold hover:underline">Manage All Products →</Link>
                            </div>
                        </div>

                        {/* New Leads */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Bell size={20} className="text-orange-500" /> New Buy Leads
                                </h3>
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Live</span>
                            </div>

                            <div className="space-y-3">
                                {recentLeads.length > 0 ? recentLeads.map((lead: any) => (
                                    <div key={lead._id.toString()} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <User size={16} className="text-gray-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{lead.product}</p>
                                            <p className="text-xs text-gray-500 flex items-center mt-1">
                                                <MapPin size={10} className="mr-1" /> {lead.city || 'India'} • Qty: {lead.quantity}
                                            </p>
                                        </div>
                                        <Link href={`/seller/dashboard/leads/${lead._id}`} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition">
                                            Unlock
                                        </Link>
                                    </div>
                                )) : (
                                    <p className="text-gray-500 text-sm text-center py-4">No new leads in your category.</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}