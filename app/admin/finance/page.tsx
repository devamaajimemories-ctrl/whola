"use client";
import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, Download, RefreshCcw, CheckCircle, Clock } from 'lucide-react';

export default function AdminFinancePage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/finance');
            const json = await res.json();
            if (json.success) setData(json);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Financial Control Room</h1>
                        <p className="text-gray-500">Track GMV, Commissions, and Seller Payouts</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Card 1: Total Revenue (Your 5%) */}
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-green-100 font-medium mb-1">Net Revenue (5% Commission)</p>
                                <h3 className="text-3xl font-bold">
                                    {data ? formatCurrency(data.summary.revenue) : "..."}
                                </h3>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <DollarSign size={24} className="text-white" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-green-100 bg-green-800/30 px-3 py-1 rounded-full inline-block">
                            Pure Profit
                        </div>
                    </div>

                    {/* Card 2: Total GMV (Flow) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-500 font-medium mb-1">Total Order Value (GMV)</p>
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {data ? formatCurrency(data.summary.gmv) : "..."}
                                </h3>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <TrendingUp size={24} className="text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">Total money processed</p>
                    </div>

                    {/* Card 3: Pending Payouts */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-500 font-medium mb-1">Seller Payouts (95%)</p>
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {data ? formatCurrency(data.summary.payouts) : "..."}
                                </h3>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg">
                                <Users size={24} className="text-purple-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">Money held for sellers</p>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <CreditCard size={20} className="text-gray-500" />
                            Recent Transactions
                        </h2>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {data?.orders.length || 0} Orders
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm">
                                    <th className="p-4 font-semibold border-b">Order ID / Date</th>
                                    <th className="p-4 font-semibold border-b">Buyer & Seller</th>
                                    <th className="p-4 font-semibold border-b text-right">Total (Paid)</th>
                                    <th className="p-4 font-semibold border-b text-right bg-green-50 text-green-800">Our Cut (5%)</th>
                                    <th className="p-4 font-semibold border-b text-right">Seller Share (95%)</th>
                                    <th className="p-4 font-semibold border-b text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">Loading financial data...</td>
                                    </tr>
                                ) : data?.orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">No orders found yet.</td>
                                    </tr>
                                ) : (
                                    data?.orders.map((order: any) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors border-b last:border-0">
                                            <td className="p-4">
                                                <div className="font-mono text-xs font-bold text-gray-700">{order.orderId}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {new Date(order.date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-blue-600">B: {order.buyerName}</span>
                                                    <span className="text-gray-500">S: {order.sellerName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-bold text-gray-900">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="p-4 text-right font-bold text-green-700 bg-green-50/50">
                                                +{formatCurrency(order.platformFee)}
                                            </td>
                                            <td className="p-4 text-right text-gray-600">
                                                {formatCurrency(order.sellerPayout)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === 'RELEASED_TO_SELLER'
                                                        ? 'bg-green-100 text-green-700'
                                                        : order.status === 'PAID'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.status === 'RELEASED_TO_SELLER' && <CheckCircle size={12} />}
                                                    {order.status === 'PENDING' && <Clock size={12} />}
                                                    {order.status === 'RELEASED_TO_SELLER' ? 'Completed' : order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
