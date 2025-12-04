import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Product from '@/lib/models/Product';
import { MapPin, ShieldCheck, Calendar, Package, Lock, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { id: string } }) {
    await dbConnect();
    const seller = await Seller.findById(params.id);
    if (!seller) return { title: 'Supplier Not Found' };
    return {
        title: `${seller.name} - ${seller.category} Manufacturer in ${seller.city}`,
        description: `Contact ${seller.name} in ${seller.city} for bulk ${seller.category} deals.`
    };
}

export default async function PublicSupplierProfile({ params }: { params: { id: string } }) {
    await dbConnect();
    const seller = await Seller.findById(params.id);
    const products = await Product.find({ sellerId: params.id });

    if (!seller) return notFound();

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-900 to-indigo-900"></div>

            <div className="container mx-auto px-4 -mt-20">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
                    {/* Profile Image */}
                    <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-4xl font-bold text-blue-600">
                        {seller.name.charAt(0)}
                    </div>

                    <div className="flex-1 mt-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
                            {seller.isVerified && <ShieldCheck className="text-green-500" size={24} />}
                        </div>
                        <p className="text-lg text-gray-600 mt-1">{seller.category} Supplier</p>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={16} /> {seller.city}, India</span>
                            <span className="flex items-center gap-1">
                                <Calendar size={16} /> Member since {new Date((seller as any).createdAt).getFullYear()}
                            </span>
                        </div>
                        
                        {/* PII BLUR BOX */}
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-100 p-2 rounded-full text-yellow-700">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                                    <p className="text-lg font-bold text-gray-800 tracking-widest blur-[4px] select-none">
                                        +91 98765 43210
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <Link 
                                        href={`/buyer/messages?sellerId=${seller._id}&message=Hi, I want to discuss a deal.`}
                                        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded font-bold hover:bg-blue-700"
                                    >
                                        Reveal in Chat
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-3">
                        <Link 
                            href={`/buyer/messages?sellerId=${seller._id}`}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={20} />
                            Contact Supplier
                        </Link>
                        <p className="text-xs text-gray-500 text-center max-w-[200px]">
                            Secure payments & communications protected by YouthBharat Escrow.
                        </p>
                    </div>
                </div>

                {/* Products Grid */}
                <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6 flex items-center gap-2">
                    <Package className="text-blue-600" /> Products from {seller.name}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.length > 0 ? products.map((p: any) => (
                        <div key={p._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                            <div className="h-48 bg-gray-100 flex items-center justify-center">
                                <Package size={48} className="text-gray-300" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{p.name}</h3>
                                <p className="text-blue-600 font-bold mt-2 text-lg">₹{p.price}</p>
                                <Link 
                                    href={`/buyer/messages?sellerId=${seller._id}&message=Inquiry for ${p.name}`} 
                                    className="block mt-3 text-center border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 font-medium"
                                >
                                    Send Enquiry
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No products listed yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}