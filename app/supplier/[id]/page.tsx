import React from 'react';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Product from '@/lib/models/Product';
import { 
    MapPin, 
    ShieldCheck, 
    Calendar, 
    Package, 
    Star, 
    Clock, 
    Building2,
    Megaphone // Imported for the CTA
} from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ id: string }>
};

// 1. SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    await dbConnect();
    const { id } = await params;
    
    try {
        const seller = await Seller.findById(id);
        if (!seller) return { title: 'Supplier Not Found' };

        const type = seller.businessType || seller.category || "Supplier";
        return {
            title: `${seller.name} - Verified ${type} in ${seller.city}`,
            description: `Get quotes from ${seller.name} in ${seller.city}. Leading ${type}. Post your requirement directly on YouthBharat WholesaleMart.`
        };
    } catch (e) {
        return { title: 'Supplier Not Found' };
    }
}

export default async function PublicSupplierProfile({ params }: Props) {
    await dbConnect();
    const { id } = await params;
    
    let seller: any = null;
    let products: any[] = [];

    // 2. Database Fetch
    try {
        seller = await Seller.findById(id).lean(); 
        if (seller) {
            products = await Product.find({ sellerId: id }).lean();
        }
    } catch (e) {
        return notFound();
    }

    if (!seller) return notFound();

    // 3. Schema (Without Phone Number)
    const isService = ['plumber', 'electrician', 'mechanic', 'carpenter', 'painter', 'repair', 'service'].some(t => 
        (seller.category || '').toLowerCase().includes(t) || (seller.businessType || '').toLowerCase().includes(t)
    );
    const schemaType = isService ? "HomeAndConstructionBusiness" : "LocalBusiness";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "name": seller.name,
        "image": seller.images?.[0] || "https://youthbharatwholesalemart.com/default_business_icon.png", 
        "url": `https://youthbharatwholesalemart.com/supplier/${seller._id}`, 
        "address": {
            "@type": "PostalAddress",
            "streetAddress": seller.address || seller.city, 
            "addressLocality": seller.city,
            "addressCountry": "IN"
        },
        "description": `${seller.businessType || seller.category} based in ${seller.city}.`
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-900 to-indigo-900"></div>

            <div className="container mx-auto px-4 -mt-20">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                    
                    {/* Profile Image */}
                    <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
                        {seller.images && seller.images.length > 0 ? (
                            <img src={seller.images[0]} alt={seller.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-blue-600">{seller.name.charAt(0)}</span>
                        )}
                    </div>

                    <div className="flex-1 mt-2">
                        {/* Name & Verification */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
                            {seller.isVerified && (
                                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    <ShieldCheck size={14} /> Verified
                                </span>
                            )}
                        </div>
                        
                        {/* Business Type */}
                        <p className="text-lg text-gray-700 mt-1 font-medium flex items-center gap-2">
                             <Building2 size={18} className="text-gray-400"/>
                             {seller.businessType || `${seller.category} Supplier`}
                        </p>

                        {/* Metadata Rows */}
                        <div className="flex flex-col gap-2 mt-4 text-sm text-gray-500">
                            <span className="flex items-start gap-2 text-gray-700">
                                <MapPin size={16} className="mt-0.5 shrink-0" /> 
                                {seller.address || `${seller.city}, India`}
                            </span>
                            
                            {seller.openingHours && (
                                <span className="flex items-center gap-2 text-green-700 font-medium">
                                    <Clock size={16} /> {seller.openingHours}
                                </span>
                            )}

                            <div className="flex gap-4 mt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar size={16} /> Member since {new Date(seller.createdAt).getFullYear()}
                                </span>
                                <span className="flex items-center gap-1 text-yellow-600 font-bold">
                                    <Star size={16} fill="currentColor"/> {seller.ratingAverage || "4.5"} ({seller.ratingCount || 10} Reviews)
                                </span>
                            </div>
                        </div>
                        
                        {/* Description */}
                        <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-2xl border-t pt-4">
                            {seller.name} is a top-rated {seller.businessType || seller.category} provider in {seller.city}. 
                            Connect with us to get the best quotes for your requirements.
                        </p>
                    </div>

                    {/* NEW: Gated "Post Requirement" Box (Replaces Direct Contact) */}
                    <div className="w-full md:w-[320px] shrink-0">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
                            <p className="text-blue-900 font-bold text-base mb-2 flex items-center gap-2">
                                <Megaphone size={18} className="text-blue-600"/>
                                Looking for {seller.name}?
                            </p>
                            <p className="text-blue-800/80 text-sm mb-4 leading-relaxed">
                                Post a requirement now. Our team will manually connect you with this supplier within 4 hours.
                            </p>
                            
                            <Link 
                                href={`/post-requirement?product=${encodeURIComponent(seller.name)}`}
                                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
                            >
                                Request Supplier Contact
                            </Link>
                            
                            <div className="mt-3 text-center">
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-100">
                                    ⚡ Usually responds in 4 hours
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Products Grid */}
                <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6 flex items-center gap-2">
                    <Package className="text-blue-600" /> Products & Services
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
                                    href={`/post-requirement?product=${encodeURIComponent(p.name)}`} 
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
                            <p className="text-sm text-gray-400">Request a catalog to see available items.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}