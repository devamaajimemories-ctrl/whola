import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { CheckCircle, MapPin, Star, Phone, ShieldCheck, Lock, Info, TrendingUp } from 'lucide-react';
import { fromSlug } from '@/lib/locations';

// 1. UPDATE TYPE: Params is a Promise in Next.js 15
type Props = {
    params: Promise<{ category: string; city: string }>
};

// Helper: Generate Unique SEO Descriptions
const generateSeoDescription = (seller: any, category: string) => {
    const type = seller.businessType || "Wholesaler";
    const ratingText = seller.ratingAverage > 0 
        ? `rated ${seller.ratingAverage}/5 stars` 
        : "a verified supplier";
    
    return `${seller.name} is a leading ${type} in ${seller.city} specializing in ${category}. Currently ${ratingText} by trusted buyers. Contact directly for best pricing.`;
};

// 2. METADATA: Await params here
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    await dbConnect();
    
    // AWAIT PARAMS BEFORE USING
    const { category, city } = await params;
    
    const categoryName = fromSlug(category);
    const cityName = fromSlug(city);
    
    const count = await Seller.countDocuments({
        category: { $regex: categoryName, $options: 'i' },
        city: { $regex: cityName, $options: 'i' }
    });

    if (count === 0) {
        return {
            title: `${categoryName} in ${cityName} - YouthBharat`,
            robots: { index: false, follow: true }
        };
    }

    return {
        title: `Top ${count}+ ${categoryName} Manufacturers in ${cityName} | Verified Suppliers`,
        description: `Find best ${categoryName} wholesale dealers in ${cityName}. Compare ${count} verified suppliers, check reviews, and chat for best price quotes.`,
    };
}

// 3. PAGE COMPONENT: Await params here
export default async function MarketPage({ params }: Props) {
    await dbConnect();
    
    // AWAIT PARAMS BEFORE USING
    const { category, city } = await params;

    const categoryName = fromSlug(category);
    const cityName = fromSlug(city);

    const sellers = await Seller.find({
        $and: [
            { category: { $regex: categoryName, $options: 'i' } },
            { city: { $regex: cityName, $options: 'i' } }
        ]
    }).limit(50).sort({ isVerified: -1, ratingAverage: -1 }).lean();

    const totalReviews = sellers.reduce((acc, s) => acc + (s.ratingCount || 0), 0);
    const avgRating = sellers.length > 0
        ? (sellers.reduce((acc, s) => acc + (s.ratingAverage || 0), 0) / sellers.length).toFixed(1)
        : "4.5";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": `Best ${categoryName} Suppliers in ${cityName}`,
        "description": `List of verified ${categoryName} wholesalers in ${cityName}.`,
        "url": `https://youthbharat.com/market/${category}/${city}`,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": avgRating,
            "reviewCount": totalReviews || 10,
            "bestRating": "5",
            "worstRating": "1"
        },
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": sellers.map((seller, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "LocalBusiness",
                    "name": seller.name,
                    "image": "https://youthbharat.com/default_business_icon.png",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": seller.city,
                        "addressCountry": "IN"
                    },
                    "url": `https://youthbharat.com/supplier/${seller._id}`
                }
            }))
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 capitalize">
                        {categoryName} in {cityName}
                    </h1>
                    <p className="text-gray-600 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600"/> 
                        {sellers.length} Verified Suppliers found
                    </p>
                </div>

                <div className="grid gap-4 mb-12">
                    {sellers.map((seller) => (
                        <div key={seller._id.toString()} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-blue-700">
                                        <Link href={`/supplier/${seller._id}`} className="hover:underline">
                                            {seller.name}
                                        </Link>
                                    </h2>
                                    {seller.isVerified && <ShieldCheck size={18} className="text-green-600" />}
                                </div>

                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {generateSeoDescription(seller, categoryName)}
                                </p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} /> {seller.city}
                                    </span>
                                    <span className="flex items-center gap-1 text-yellow-600 font-bold">
                                        <Star size={14} fill="currentColor" /> {seller.ratingAverage || "4.5"}
                                    </span>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                        {seller.ratingCount ? `${seller.ratingCount} Reviews` : "Verified"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[200px] justify-center border-l pl-0 md:pl-6 border-gray-100">
                                <Link 
                                    href={`/buyer/messages?sellerId=${seller._id}&message=Hi, I am interested in ${categoryName}.`} 
                                    className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg text-center hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Phone size={16} /> Contact Supplier
                                </Link>
                                <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                                    <Lock size={10} /> Number hidden
                                </p>
                            </div>
                        </div>
                    ))}

                    {sellers.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <Info className="mx-auto text-gray-400 mb-3" size={40} />
                            <h3 className="text-xl font-medium text-gray-900">We are expanding in {cityName}</h3>
                            <p className="text-gray-500 mb-6">Be the first supplier to list here.</p>
                            <Link href="/register" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
                                List Your Business Free
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}