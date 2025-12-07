import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Product from '@/lib/models/Product';
import { MapPin, ShieldCheck, Calendar, Package, MessageCircle, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

// 1. Next.js 15 requires params to be a Promise
type Props = {
    params: Promise<{ id: string }>
};

// 2. SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    await dbConnect();
    const { id } = await params; // Await params here
    const seller = await Seller.findById(id);
    
    if (!seller) return { title: 'Supplier Not Found' };
    
    return {
        title: `${seller.name} - Verified ${seller.category} Supplier in ${seller.city}`,
        description: `Contact ${seller.name} in ${seller.city}. Leading manufacturer and wholesaler of ${seller.category}. View products, ratings, and get quotes on YouthBharat.`
    };
}

export default async function PublicSupplierProfile({ params }: Props) {
    await dbConnect();
    const { id } = await params; // Await params here
    
    const seller = await Seller.findById(id);
    const products = await Product.find({ sellerId: id });

    if (!seller) return notFound();

    // 3. Organization Schema for Google Rich Results
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": seller.name,
        "url": `https://youthbharat.com/supplier/${seller._id}`,
        "logo": "https://youthbharat.com/default_business_icon.png",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": seller.city,
            "addressCountry": "IN"
        },
        "description": `${seller.category} Supplier based in ${seller.city}.`
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Inject Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-900 to-indigo-900"></div>

            <div className="container mx-auto px-4 -mt-20">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
                    {/* Profile Image */}
                    <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-4xl font-bold text-blue-600 shrink-0">
                        {seller.name.charAt(0)}
                    </div>

                    <div className="flex-1 mt-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
                            {seller.isVerified && (
                                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    <ShieldCheck size={14} /> Verified Supplier
                                </span>
                            )}
                        </div>
                        <p className="text-lg text-gray-600 mt-1">{seller.category} Manufacturer & Wholesaler</p>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={16} /> {seller.city}, India</span>
                            <span className="flex items-center gap-1">
                                <Calendar size={16} /> Member since {new Date(seller.createdAt).getFullYear()}
                            </span>
                            <span className="flex items-center gap-1 text-yellow-600 font-bold">
                                <Star size={16} fill="currentColor"/> {seller.ratingAverage || "4.5"} ({seller.ratingCount || 10} Reviews)
                            </span>
                        </div>
                        
                        {/* SEO Description Block */}
                        <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-2xl">
                            {seller.name} is a trusted name in the {seller.category} industry, located in {seller.city}. 
                            We specialize in high-quality bulk supplies. Connect with us for the best competitive rates.
                        </p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-3">
                        <Link 
                            href={`/buyer/messages?sellerId=${seller._id}&message=Hi ${seller.name}, I found your profile on YouthBharat and want to discuss a deal.`}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={20} />
                            Contact Supplier
                        </Link>
                        <div className="flex items-center justify-center gap-2 text-xs text-green-700 bg-green-50 py-2 rounded border border-green-100">
                            <CheckCircle size={12} />
                            <span>Typically replies in 2 hours</span>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6 flex items-center gap-2">
                    <Package className="text-blue-600" /> Products from {seller.name}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.length > 0 ? products.map((p: any) => (
                        <div key={p._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                            <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                                {p.images && p.images.length > 0 ? (
                                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/>
                                ) : (
                                    <Package size={48} className="text-gray-300" />
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{p.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-blue-600 font-bold text-lg">₹{p.price}</p>
                                    <span className="text-xs text-gray-400">/{p.unit}</span>
                                </div>
                                <Link 
                                    href={`/buyer/messages?sellerId=${seller._id}&message=I am interested in ${p.name}`} 
                                    className="block mt-3 text-center border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 font-medium text-sm transition-colors"
                                >
                                    Get Best Price
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <Package size={48} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">No products listed yet.</p>
                            <p className="text-sm text-gray-400">Contact the supplier directly for a catalog.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}