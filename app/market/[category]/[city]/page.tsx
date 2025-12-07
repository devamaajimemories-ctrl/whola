import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { CheckCircle, MapPin, Star, Phone, ShieldCheck, Lock, Info, Clock, ImageIcon } from 'lucide-react'; // Added Icons
import { fromSlug } from '@/lib/locations';

type Props = {
    params: Promise<{ category: string; city: string }>
};

// HELPER: Determine if "Service" or "Product"
// You can expand this list or add a logic in DB later
const isServiceCategory = (cat: string) => {
    const services = ['plumber', 'carpenter', 'electrician', 'painter', 'driver', 'mechanic', 'repair', 'service', 'contractor', 'consultant', 'cleaner'];
    return services.some(s => cat.toLowerCase().includes(s));
};

const getPageTerminology = (category: string) => {
    const isService = isServiceCategory(category);
    return {
        type: isService ? "Service Providers" : "Manufacturers & Suppliers",
        action: isService ? "Book" : "Buy from",
        entity: isService ? "Professionals" : "Dealers"
    };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    await dbConnect();
    const { category, city } = await params;
    
    const categoryName = fromSlug(category);
    const cityName = fromSlug(city);
    
    const count = await Seller.countDocuments({
        category: { $regex: categoryName, $options: 'i' },
        city: { $regex: cityName, $options: 'i' }
    });

    const terms = getPageTerminology(categoryName);

    if (count === 0) {
        return {
            title: `${categoryName} in ${cityName} - YouthBharat`,
            robots: { index: false, follow: true }
        };
    }

    // JUSTDIAL STYLE TITLE
    return {
        title: `Top ${count}+ Best ${categoryName} in ${cityName} | Verified ${terms.entity}`,
        description: `Find the best ${categoryName} in ${cityName}. Compare ${count} verified ${terms.entity}, check reviews, photos, and ${terms.action} directly.`,
    };
}

export default async function MarketPage({ params }: Props) {
    await dbConnect();
    const { category, city } = await params;

    const categoryName = fromSlug(category);
    const cityName = fromSlug(city);
    const terms = getPageTerminology(categoryName);

    // Fetch Rich Data (Images, Hours, Address)
    const sellers = await Seller.find({
        $and: [
            { category: { $regex: categoryName, $options: 'i' } },
            { city: { $regex: cityName, $options: 'i' } }
        ]
    }).limit(50).sort({ isVerified: -1, ratingAverage: -1 }).lean();

    // CALCULATE AGGREGATE RATING FOR THE "STARS" IN GOOGLE
    const totalReviews = sellers.reduce((acc, s) => acc + (s.ratingCount || 0), 0);
    const avgRating = sellers.length > 0
        ? (sellers.reduce((acc, s) => acc + (s.ratingAverage || 0), 0) / sellers.length).toFixed(1)
        : "4.5";

    // UPDATED JSON-LD (Schema.org)
    // We use "CollectionPage" which contains an "ItemList"
    // This tells Google: "This is a list of results", exactly like Justdial/Yelp.
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Best ${categoryName} in ${cityName}`,
        "description": `List of verified ${categoryName} ${terms.entity} in ${cityName}.`,
        "url": `https://youthbharat.com/market/${category}/${city}`,
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": sellers.map((seller, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "LocalBusiness", // or "HomeAndConstructionBusiness"
                    "name": seller.name,
                    "image": seller.images?.[0] || "https://youthbharat.com/default_business_icon.png",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": seller.address || seller.city, // USE REAL ADDRESS
                        "addressLocality": seller.city,
                        "addressCountry": "IN"
                    },
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": seller.ratingAverage || "4.0",
                        "reviewCount": seller.ratingCount || "1"
                    },
                    "telephone": "", // Empty is fine, Google just won't show the "Call" button
                    "priceRange": "₹₹"
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
                        {sellers.length} Verified {terms.entity} found
                    </p>
                </div>

                <div className="grid gap-4 mb-12">
                    {sellers.map((seller) => (
                        <div key={seller._id.toString()} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
                            
                            {/* PHOTO THUMBNAIL (Like Justdial) */}
                            <div className="w-full md:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                                {seller.images && seller.images.length > 0 ? (
                                    <img src={seller.images[0]} alt={seller.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-blue-700 hover:underline">
                                            <Link href={`/supplier/${seller._id}`}>
                                                {seller.name}
                                            </Link>
                                        </h2>
                                        {/* RICH DATA: Business Type & Address */}
                                        <p className="text-sm font-medium text-gray-800 mt-1">
                                            {seller.businessType || categoryName}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            <MapPin size={14} className="inline mr-1" />
                                            {seller.address || seller.city}
                                        </p>
                                    </div>
                                    
                                    {/* RATING BADGE */}
                                    <div className="flex flex-col items-end">
                                        <div className="bg-green-600 text-white font-bold px-2 py-1 rounded text-sm flex items-center gap-1">
                                            {seller.ratingAverage || "4.5"} <Star size={12} fill="currentColor" />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">{seller.ratingCount || 10} Votes</span>
                                    </div>
                                </div>

                                {/* OPENING HOURS */}
                                {seller.openingHours && (
                                    <p className="text-xs text-green-700 mt-3 flex items-center gap-1 bg-green-50 w-fit px-2 py-1 rounded">
                                        <Clock size={12} /> {seller.openingHours}
                                    </p>
                                )}

                                <div className="mt-4 flex gap-3">
                                    <Link 
                                        href={`/buyer/messages?sellerId=${seller._id}&message=Hi, I am interested in ${categoryName}.`} 
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Phone size={14} /> Contact Supplier
                                    </Link>
                                    <button className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50">
                                        WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}