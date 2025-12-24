"use client";

import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, Loader2, ChevronLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Reusing the same API. 
            // NOTE: Ensure your /api/orders/my-orders route handles "x-user-id" for SELLER logic too
            // OR create a dedicated /api/seller/orders route.
            // For now, assuming you implemented the /api/seller/orders route from previous steps or reuse:
            const res = await fetch('/api/seller/orders'); 
            const data = await res.json();
            if (data.success) {
                setOrders(data.data || []);
            }
        } catch (e) {
            console.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'PENDING') return ['PENDING', 'CONFIRMED', 'PACKED'].includes(order.deliveryStatus);
        if (activeTab === 'COMPLETED') return ['SHIPPED', 'DELIVERED', 'OUT_FOR_DELIVERY'].includes(order.deliveryStatus);
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/seller/dashboard" className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                            <ChevronLeft size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                    </div>
                    <div className="flex gap-2">
                        {['ALL', 'PENDING', 'COMPLETED'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg font-bold text-xs transition ${
                                    activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 space-y-6">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Package size={48} className="mx-auto mb-3 opacity-20"/>
                        <p>No orders found.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <OrderCard key={order._id} order={order} refresh={fetchOrders} />
                    ))
                )}
            </div>
        </div>
    );
}

// Sub-component for individual Order Logic
function OrderCard({ order, refresh }: { order: any, refresh: () => void }) {
    const [loading, setLoading] = useState(false);
    const [courierName, setCourierName] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');

    const updateStatus = async (status: string) => {
        if (status === 'SHIPPED' && (!courierName || !trackingNumber)) {
            alert("Please enter Courier Name and Tracking Number");
            return;
        }
        if(!confirm(`Mark this order as ${status}?`)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/orders/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.orderId,
                    status,
                    courierName,
                    trackingNumber
                })
            });
            const data = await res.json();
            if (data.success) {
                refresh();
            } else {
                alert("Failed: " + data.error);
            }
        } catch (e) {
            alert("Error updating status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-lg text-gray-800">{order.orderId}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                order.deliveryStatus === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                order.deliveryStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>{order.deliveryStatus}</span>
                        </div>
                        <p className="text-xs text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-xs text-gray-500 uppercase font-bold">Earnings</p>
                         <p className="font-bold text-xl text-green-600">₹{order.sellerAmount}</p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                    <strong>Buyer ID:</strong> {order.buyerId.substring(0,8)}...
                </div>

                {/* DYNAMIC ACTIONS */}
                <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
                    {/* 1. ACCEPT */}
                    {order.deliveryStatus === 'PENDING' && (
                        <button 
                            onClick={() => updateStatus('CONFIRMED')} 
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition"
                        >
                            {loading ? 'Processing...' : 'Accept Order'}
                        </button>
                    )}
                    
                    {/* 2. PACK */}
                    {order.deliveryStatus === 'CONFIRMED' && (
                        <button 
                            onClick={() => updateStatus('PACKED')} 
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition"
                        >
                            {loading ? 'Processing...' : 'Mark as Packed'}
                        </button>
                    )}

                    {/* 3. SHIP */}
                    {order.deliveryStatus === 'PACKED' && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-end">
                            <input 
                                placeholder="Courier Name" 
                                className="border p-2 rounded text-sm w-full sm:w-32"
                                onChange={(e) => setCourierName(e.target.value)}
                            />
                            <input 
                                placeholder="Tracking ID" 
                                className="border p-2 rounded text-sm w-full sm:w-32"
                                onChange={(e) => setTrackingNumber(e.target.value)}
                            />
                            <button 
                                onClick={() => updateStatus('SHIPPED')} 
                                disabled={loading}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 transition whitespace-nowrap"
                            >
                                {loading ? '...' : 'Ship Order'}
                            </button>
                        </div>
                    )}

                    {/* 4. OUT FOR DELIVERY */}
                    {order.deliveryStatus === 'SHIPPED' && (
                        <button 
                            onClick={() => updateStatus('OUT_FOR_DELIVERY')} 
                            disabled={loading}
                            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-teal-700 transition"
                        >
                            {loading ? 'Processing...' : 'Mark Out For Delivery'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}