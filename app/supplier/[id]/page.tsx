import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Product from '@/lib/models/Product';
import { MapPin, ShieldCheck, Calendar, Package } from 'lucide-react';
import Link from 'next/link';

// Metadata Generator for dynamic titles
export async function generateMetadata({ params }: { params: { id: string } }) {
    await dbConnect();
    const seller = await Seller.findById(params.id);
    if (!seller) return { title: 'Supplier Not Found' };

    return {
        title: `${seller.name} - ${seller.category} Manufacturer in ${seller.city}`,
        description: `Contact ${seller.name} in ${seller.city} for bulk ${seller.category} deals. Verified Supplier on YouthBharat.`
    };
}

export default async function PublicSupplierProfile({ params }: { params: { id: string } }) {
    await dbConnect();
    const seller = await Seller.findById(params.id);
    const products = await Product.find({ sellerId: params.id });

    if (!seller) return notFound();

    // Organization Schema (Vital for entity ranking)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": seller.name,
        "url": `https://youthbharat.com/supplier/${seller._id}`,
        "logo": "https://youthbharat.com/logo.png",
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "sales",
            "areaServed": "IN"
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": seller.city,
            "addressCountry": "IN"
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-3">
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg">
                            Contact Supplier
                        </button>
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
                                {/* Replace with actual image logic */}
                                <Package size={48} className="text-gray-300" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                                <p className="text-blue-600 font-bold mt-2 text-lg">₹{p.price} <span className="text-xs text-gray-500 font-normal">/ {p.unit}</span></p>
                                <Link href={`/buyer/messages?sellerId=${seller._id}&message=Hi, I am interested in ${p.name}`} className="block mt-3 text-center border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 font-medium">
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