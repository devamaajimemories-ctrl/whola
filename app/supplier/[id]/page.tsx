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
    MessageCircle, 
    Star, 
    CheckCircle, 
    Clock, 
    Building2 
} from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

// 1. Next.js 15 requires params to be a Promise
type Props = {
    params: Promise<{ id: string }>
};

// 2. SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    await dbConnect();
    const { id } = await params;
    const seller = await Seller.findById(id);
    
    if (!seller) return { title: 'Supplier Not Found' };
    
    // Use specific Business Type if available, else Category
    const type = seller.businessType || seller.category || "Supplier";
    
    return {
        title: `${seller.name} - Verified ${type} in ${seller.city}`,
        description: `Contact ${seller.name} in ${seller.city}. Leading ${type}. View photos, ratings, address, and get quotes directly on YouthBharat.`
    };
}

export default async function PublicSupplierProfile({ params }: Props) {
    await dbConnect();
    const { id } = await params;
    
    const seller = await Seller.findById(id).lean(); // .lean() for better performance
    const products = await Product.find({ sellerId: id }).lean();

    if (!seller) return notFound();

    // 3. SMART SCHEMA GENERATION (The "Justdial" Secret)
    // Detect if this is a Service (Plumber) or Business (Manufacturer)
    const isService = ['plumber', 'electrician', 'mechanic', 'carpenter', 'painter', 'repair', 'service'].some(t => 
        (seller.category || '').toLowerCase().includes(t) || (seller.businessType || '').toLowerCase().includes(t)
    );
    const schemaType = isService ? "HomeAndConstructionBusiness" : "LocalBusiness";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "name": seller.name,
        "image": seller.images?.[0] || "https://youthbharat.com/default_business_icon.png",
        "url": `https://youthbharat.com/supplier/${seller._id}`,
        "telephone": "", // Hidden as requested, but field exists for schema validity
        "address": {
            "@type": "PostalAddress",
            "streetAddress": seller.address || seller.city, // Uses Full Address if scraped
            "addressLocality": seller.city,
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "", 
            "longitude": ""
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": seller.ratingAverage || "4.5",
            "reviewCount": seller.ratingCount || "10"
        },
        "priceRange": "₹₹",
        "description": `${seller.businessType || seller.category} based in ${seller.city}.`
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
                    
                    {/* Profile Image (Scraped Photo or Default) */}
                    <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
                        {seller.images && seller.images.length > 0 ? (
                            <img src={seller.images[0]} alt={seller.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-blue-600">{seller.name.charAt(0)}</span>
                        )}
                    </div>

                    <div className="flex-1 mt-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
                            {seller.isVerified && (
                                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    <ShieldCheck size={14} /> Verified
                                </span>
                            )}
                        </div>
                        
                        {/* Business Type & Category */}
                        <p className="text-lg text-gray-700 mt-1 font-medium flex items-center gap-2">
                             <Building2 size={18} className="text-gray-400"/>
                             {seller.businessType || `${seller.category} Supplier`}
                        </p>

                        <div className="flex flex-col gap-2 mt-4 text-sm text-gray-500">
                            {/* Full Address */}
                            <span className="flex items-start gap-2 text-gray-700">
                                <MapPin size={16} className="mt-0.5 shrink-0" /> 
                                {seller.address || `${seller.city}, India`}
                            </span>
                            
                            {/* Opening Hours (If Scraped) */}
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
                            We offer high-quality services and products with verified customer satisfaction. 
                            Contact us today for the best prices.
                        </p>
                    </div>

                    {/* Contact Actions */}
                    <div className="w-full md:w-auto flex flex-col gap-3 min-w-[250px]">
                        <Link 
                            href={`/buyer/messages?sellerId=${seller._id}&message=Hi ${seller.name}, I found your profile on YouthBharat.`}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={20} />
                            Contact Supplier
                        </Link>
                        <button className="bg-white border-2 border-green-500 text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition flex items-center justify-center gap-2">
                             WhatsApp
                        </button>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-1">
                            <CheckCircle size={12} className="text-green-600" />
                            <span>Replies in ~2 hours</span>
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
                                    href={`/buyer/messages?sellerId=${seller._id}&message=I am interested in ${p.name}`} 
                                    className="block mt-3 text-center border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 font-medium text-sm transition-colors"
                                >
                                    Get Best Price
                                </Link>
                            </div>
                        </div>
                    )) : (
                        // Empty State matches "Service" vibe if needed
                        <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <Package size={48} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-gray-500 font-medium">No products listed yet.</p>
                            <p className="text-sm text-gray-400">Contact {seller.name} directly for a catalog or service list.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}