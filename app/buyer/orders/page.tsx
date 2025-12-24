"use client";

import React, { useState, useEffect } from 'react';
// ❌ REMOVED: import Order from '@/lib/models/Order'; (This was causing the crash)
import { Package, Truck, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BuyerOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders/my-orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelivery = async (orderId: string) => {
        if (!confirm("Confirm that you have received this order?")) return;

        setProcessingOrderId(orderId);
        try {
            const res = await fetch('/api/orders/confirm-delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });

            if (res.ok) {
                alert("Delivery confirmed! Seller will receive payment shortly.");
                fetchOrders(); // Refresh
            } else {
                const data = await res.json();
                alert(data.error || "Failed to confirm delivery");
            }
        } catch (error) {
            alert("Network error");
        }
        setProcessingOrderId(null);
    };

    // Helper functions for UI
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DELIVERED': return <CheckCircle className="text-green-600" size={20} />;
            case 'OUT_FOR_DELIVERY': return <Truck className="text-purple-600" size={20} />;
            case 'SHIPPED': return <Truck className="text-blue-600" size={20} />;
            case 'PACKED': return <Package className="text-indigo-600" size={20} />;
            case 'CONFIRMED': return <CheckCircle className="text-teal-600" size={20} />;
            case 'PENDING': return <Clock className="text-yellow-600" size={20} />;
            case 'CANCELLED': return <XCircle className="text-red-600" size={20} />;
            default: return <Package className="text-gray-600" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-700';
            case 'OUT_FOR_DELIVERY': return 'bg-purple-100 text-purple-700';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700';
            case 'PACKED': return 'bg-indigo-100 text-indigo-700';
            case 'CONFIRMED': return 'bg-teal-100 text-teal-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                    <p className="text-blue-200">Track all your purchases and deliveries</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <Package size={64} className="mx-auto mb-4 text-gray-300" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                        <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition-colors">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order: any) => (
                            <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Order ID</p>
                                            <p className="font-bold text-gray-900">{order.orderId}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Order Date</p>
                                            <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                                                order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' :
                                                order.paymentStatus === 'RELEASED_TO_SELLER' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Delivery Status</p>
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.deliveryStatus)}`}>
                                                {getStatusIcon(order.deliveryStatus)}
                                                {order.deliveryStatus}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-500">Total Amount</p>
                                                <p className="text-2xl font-bold text-gray-900">₹{order.amount}</p>
                                            </div>
                                            
                                            {/* Logic for Confirm Button */}
                                            {(order.deliveryStatus === 'SHIPPED' || order.deliveryStatus === 'OUT_FOR_DELIVERY') && order.paymentStatus === 'PAID' && (
                                                <button
                                                    onClick={() => handleConfirmDelivery(order.orderId)}
                                                    disabled={!!processingOrderId}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {processingOrderId === order.orderId ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={18} />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={18} />
                                                            Confirm Delivery
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {order.trackingNumber && (
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Tracking Number</p>
                                                    <p className="font-semibold text-blue-600">{order.trackingNumber}</p>
                                                    {order.courierName && <p className="text-xs text-gray-400">{order.courierName}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {order.sellerNotes && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                            <p className="text-sm font-semibold text-blue-900 mb-1">Seller Notes:</p>
                                            <p className="text-sm text-blue-800">{order.sellerNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}