import React from 'react';
import { headers } from 'next/headers';
import Link from 'next/link';
import dbConnect from '@/lib/db';

// Models
import Seller from '@/lib/models/Seller';
import Request from '@/lib/models/Request';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';

// Icons
import {
    User, Package, ShoppingBag, DollarSign, TrendingUp,
    Settings, Bell, Plus, CheckCircle, AlertTriangle,
    Clock, MapPin, Box, ShieldCheck, CreditCard,
    ChevronRight, Zap, BarChart3, Lock
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
                <ShieldCheck size={48} className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Session Expired</h2>
                <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Log In to Dashboard
                </Link>
            </div>
        );
    }

    // 2. Fetch All Required Data in Parallel
    const [seller, products, recentOrders, relevantLeads] = await Promise.all([
        Seller.findById(userId),
        Product.find({ sellerId: userId }),
        Order.find({ sellerId: userId }).sort({ createdAt: -1 }).limit(5),
        // Find leads roughly matching the seller's category or general ones
        Request.find({ 
            $or: [
                { category: { $exists: true } } 
            ] 
        }).sort({ createdAt: -1 }).limit(10)
    ]);

    if (!seller) return <div className="min-h-screen flex items-center justify-center">Seller account not found.</div>;

    // 3. Smart Stats Calculation
    const activeProducts = products.filter((p: any) => p.status === 'APPROVED').length;
    
    // ✅ FIXED: Count all active order statuses, not just PENDING
    const pendingOrders = recentOrders.filter((o: any) => 
        ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.deliveryStatus)
    ).length;
    
    // --- PROFILE COMPLETION ENGINE ---
    // Weighted scoring system
    const completionSteps = [
        { id: 'basic', label: 'Basic Info', isComplete: !!(seller.name && seller.phone), weight: 10 },
        { id: 'address', label: 'Business Address', isComplete: !!(seller.address && seller.city && seller.state), weight: 20 },
        { id: 'gst', label: 'GST Verification', isComplete: !!seller.gstin, weight: 20 },
        { id: 'bank', label: 'Bank Account', isComplete: !!seller.bankAccountNumber, weight: 30 },
        { id: 'product', label: 'Add 1st Product', isComplete: products.length > 0, weight: 20 },
    ];

    const completionScore = completionSteps.reduce((acc, step) => step.isComplete ? acc + step.weight : acc, 0);
    const nextStep = completionSteps.find(step => !step.isComplete);

    // --- SMART LEAD MATCHING ---
    // Filter relevant leads locally to ensure better accuracy than simple DB query
    const myLeads = relevantLeads.filter((l: any) => 
        !seller.category || 
        seller.category === 'General' || 
        l.category?.toLowerCase().includes(seller.category.toLowerCase()) || 
        seller.category.toLowerCase().includes(l.category?.toLowerCase())
    );
    // Fallback to recent leads if no direct match found
    const displayLeads = myLeads.length > 0 ? myLeads.slice(0, 5) : relevantLeads.slice(0, 5);

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-12">
            {/* --- TOP HEADER --- */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-6 py-3 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <TrendingUp size={20} />
                    </div>
                    <span className="font-bold text-gray-800 text-lg hidden md:block">Seller Center</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/seller/leads" className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                        <Bell size={20} />
                        {displayLeads.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                    </Link>
                    <div className="h-8 w-px bg-gray-300 mx-1 hidden md:block"></div>
                    <div className="flex items-center gap-3 pl-2">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold text-gray-800">{seller.name}</p>
                            <p className="text-xs text-gray-500">{seller.isVerified ? 'Verified Supplier' : 'Free Member'}</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            {seller.name.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* --- 1. ACTION CENTER & WELCOME --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl p-6 text-white shadow-lg lg:col-span-2 relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-2xl font-bold mb-2">Welcome back, {seller.name}! 👋</h1>
                            <p className="text-blue-100 mb-6 max-w-lg">
                                You have <strong className="text-white">{pendingOrders} active orders</strong> and <strong className="text-white">{displayLeads.length} new leads</strong> matching your profile today.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/seller/products/add" className="bg-white text-blue-900 px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-50 transition shadow-sm flex items-center gap-2">
                                    <Plus size={16} /> Add Product
                                </Link>
                                <Link href="/seller/messages" className="bg-blue-700/50 hover:bg-blue-700 text-white border border-blue-500/30 px-5 py-2.5 rounded-lg font-bold text-sm transition flex items-center gap-2">
                                    <Settings size={16} /> Check Messages
                                </Link>
                            </div>
                        </div>
                        {/* Decor */}
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <ShoppingBag size={180} />
                        </div>
                    </div>

                    {/* Profile Completion Meter */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-gray-800">Profile Health</h3>
                                <span className={`text-sm font-bold px-2 py-1 rounded ${completionScore === 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {completionScore}%
                                </span>
                            </div>
                            
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4 overflow-hidden">
                                <div 
                                    className={`h-2.5 rounded-full transition-all duration-1000 ${completionScore === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-orange-400 to-red-500'}`} 
                                    style={{ width: `${completionScore}%` }}
                                ></div>
                            </div>

                            {completionScore < 100 && nextStep ? (
                                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="bg-orange-100 p-1.5 rounded-full text-orange-600 mt-0.5">
                                        <AlertTriangle size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-orange-800 uppercase mb-0.5">Action Required</p>
                                        <p className="text-sm text-gray-700">Complete <strong>{nextStep.label}</strong> to boost visibility.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center gap-3">
                                    <CheckCircle size={20} className="text-green-600" />
                                    <p className="text-sm font-medium text-green-800">Your profile is top-notch!</p>
                                </div>
                            )}
                        </div>

                        {completionScore < 100 && (
                            <Link href="/seller/profile" className="mt-4 block w-full text-center py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition">
                                Complete Profile
                            </Link>
                        )}
                    </div>
                </div>

                {/* --- 2. BUSINESS HEALTH CARDS --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Earnings</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(seller.totalEarnings)}</h3>
                        <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                            <TrendingUp size={12}/> +0% this week
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Package size={20} /></div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Orders</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{recentOrders.length}</h3>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Lifetime total</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><ShoppingBag size={20} /></div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Products</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{activeProducts}</h3>
                        <p className="text-xs text-blue-600 mt-1 font-medium">Live on store</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><BarChart3 size={20} /></div>
                            <span className="text-xs font-bold text-gray-500 uppercase">Visits</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{seller.totalViews || 0}</h3>
                        <p className="text-xs text-gray-400 mt-1 font-medium">Profile views</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- 3. RECENT ORDERS (Left Column) --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Clock size={18} className="text-blue-600" /> Recent Orders
                                </h3>
                                <Link href="/seller/orders" className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">
                                    View All
                                </Link>
                            </div>
                            
                            {recentOrders.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-medium">
                                            <tr>
                                                <th className="p-4 pl-6">Order ID</th>
                                                <th className="p-4">Amount</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 pr-6 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {recentOrders.map((order: any) => (
                                                <tr key={order._id.toString()} className="hover:bg-gray-50 group transition-colors">
                                                    <td className="p-4 pl-6 font-mono text-gray-600">{order.orderId}</td>
                                                    <td className="p-4 font-bold text-gray-900">{formatCurrency(order.sellerAmount)}</td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                            order.deliveryStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                            order.deliveryStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                            order.deliveryStatus === 'PACKED' ? 'bg-indigo-100 text-indigo-700' :
                                                            order.deliveryStatus === 'CONFIRMED' ? 'bg-teal-100 text-teal-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {order.deliveryStatus === 'DELIVERED' && <CheckCircle size={10} className="mr-1"/>}
                                                            {order.deliveryStatus}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 pr-6 text-right">
                                                        <Link href={`/seller/orders`} className="text-gray-400 hover:text-blue-600 font-bold text-xs flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform">
                                                            Manage <ChevronRight size={14} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-10 text-center flex flex-col items-center justify-center text-gray-500">
                                    <div className="bg-gray-100 p-4 rounded-full mb-3">
                                        <Box size={32} className="text-gray-400" />
                                    </div>
                                    <p className="font-medium">No orders yet</p>
                                    <p className="text-sm mt-1">Enhance your catalog to attract buyers.</p>
                                </div>
                            )}
                        </div>

                        {/* --- 4. DYNAMIC ACTION BANNER (BANK DETAILS) --- */}
                        {!seller.bankAccountNumber ? (
                            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between shadow-lg animate-pulse">
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                    <div className="bg-white/20 p-3 rounded-full">
                                        <AlertTriangle size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Missing Bank Details</h3>
                                        <p className="text-red-100 text-sm">You cannot receive payments until you link a bank account.</p>
                                    </div>
                                </div>
                                <Link href="/seller/add-bank-details" className="bg-white text-red-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-red-50 transition shadow-md whitespace-nowrap">
                                    Add Bank Details
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                    <div className="bg-white/10 p-3 rounded-full">
                                        <CreditCard size={24} className="text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Payments Active</h3>
                                        <p className="text-gray-300 text-sm">Your account is ready to receive payouts via Razorpay.</p>
                                    </div>
                                </div>
                                <button disabled className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 opacity-90 cursor-default">
                                    <CheckCircle size={16} /> Linked
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- 5. SMART BUY LEADS (Right Column) --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                            <div className="p-5 border-b border-gray-100 bg-orange-50/50 rounded-t-xl">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Zap size={18} className="text-orange-500" /> Recommended Leads
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Matched to your category: <strong>{seller.category}</strong>
                                </p>
                            </div>

                            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[600px] custom-scrollbar">
                                {displayLeads.length > 0 ? displayLeads.map((lead: any) => (
                                    <div key={lead._id.toString()} className="p-4 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {lead.product}
                                            </h4>
                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {lead.city || 'India'}</span>
                                            <span className="flex items-center gap-1"><Box size={12} /> {lead.quantity} {lead.unit}</span>
                                        </div>

                                        <Link 
                                            href={`/seller/unlock-lead?id=${lead._id}`} 
                                            className="block w-full text-center bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-2 rounded-lg text-xs font-bold transition-all shadow-sm"
                                        >
                                            <Lock size={12} className="inline mr-1 mb-0.5" /> Unlock Contact
                                        </Link>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                        <Box size={32} className="text-gray-300 mb-2"/>
                                        <p>No matching leads found.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-4 border-t border-gray-100 text-center bg-gray-50 rounded-b-xl">
                                <Link href="/seller/leads" className="text-sm font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">
                                    Browse All Leads <ChevronRight size={14}/>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}