import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { CheckCircle, MapPin, Star, Phone, Info } from 'lucide-react'; // Added Info icon
import { fromSlug } from '@/lib/locations';

type Props = {
    params: { category: string; city: string }
};

// 1. ENHANCED METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const category = fromSlug(params.category);
    const city = fromSlug(params.city);
    const date = new Date().toISOString();

    return {
        title: `Wholesale ${category} in ${city} | Price List & Manufacturers`,
        description: `Find ${category} manufacturers and wholesalers in ${city}. Get contact details, addresses, and latest price quotes for ${category} from verified suppliers in ${city}.`,
        alternates: {
            canonical: `https://youthbharat.com/market/${params.category}/${params.city}`
        },
        openGraph: {
            title: `Best ${category} Suppliers in ${city}`,
            description: `Connect with verified ${category} dealers in ${city}.`,
            url: `https://youthbharat.com/market/${params.category}/${params.city}`,
            type: 'website',
        }
    };
}

export default async function MarketPage({ params }: Props) {
    await dbConnect();
    const categoryName = fromSlug(params.category);
    const cityName = fromSlug(params.city);

    const sellers = await Seller.find({
        $and: [
            { category: { $regex: categoryName, $options: 'i' } },
            { city: { $regex: cityName, $options: 'i' } }
        ]
    }).limit(20).sort({ isVerified: -1, ratingAverage: -1 });

    // 2. FAQ SCHEMA (This gets you more space on Google Search Results)
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `How can I find ${categoryName} suppliers in ${cityName}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `You can find verified ${categoryName} suppliers in ${cityName} on YouthBharat. We currently have ${sellers.length} listed manufacturers offering best prices.`
                }
            },
            {
                "@type": "Question",
                "name": `Do these suppliers offer wholesale pricing?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, the sellers listed here are primarily manufacturers, wholesalers, and distributors offering bulk pricing."
                }
            }
        ]
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://youthbharat.com" },
            { "@type": "ListItem", "position": 2, "name": categoryName, "item": `https://youthbharat.com/category/${params.category}` },
            { "@type": "ListItem", "position": 3, "name": `${categoryName} in ${cityName}`, "item": `https://youthbharat.com/market/${params.category}/${params.city}` }
        ]
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <div className="container mx-auto px-4">
                {/* Semantic H1 is crucial */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 capitalize">
                    {categoryName} Manufacturers & Wholesalers in {cityName}
                </h1>
                <p className="text-gray-600 mb-8 max-w-4xl">
                    Are you looking for verified <strong>{categoryName}</strong> suppliers in <strong>{cityName}</strong>?
                    YouthBharat helps you connect with top-rated manufacturers, distributors, and dealers.
                    Compare prices, view contact details, and get the best bulk deals for {categoryName} directly from the source.
                </p>

                {/* Seller List (Your Existing Code) */}
                <div className="grid gap-4 mb-12">
                    {sellers.map((seller) => (
                        <div key={seller._id.toString()} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-blue-700 hover:underline mb-1">
                                    <Link href={`/supplier/${seller._id}`}>{seller.name}</Link>
                                </h2>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                    <span className="flex items-center gap-1"><MapPin size={14} /> {seller.city}</span>
                                    <span className="flex items-center gap-1 text-yellow-600 font-bold">
                                        <Star size={14} fill="currentColor" /> {seller.ratingAverage || "4.5"}
                                    </span>
                                </div>
                                {/* Important for SEO: Display tags as text */}
                                <p className="text-sm text-gray-500">
                                    Deals in: {seller.tags.join(", ") || categoryName}
                                </p>
                            </div>
                            {/* Call to Actions */}
                            <div className="flex flex-col gap-2 min-w-[200px] justify-center">
                                <Link href={`/supplier/${seller._id}`} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-center">
                                    Get Best Price
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. RELATED SEARCHES (Internal Linking) */}
                {/* This mimics IndiaMart's "Explore More" section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Related Categories in {cityName}</h3>
                    <div className="flex flex-wrap gap-2">
                        {/* You should dynamically generate these based on related categories */}
                        {['Industrial Machinery', 'Safety Equipment', 'Packaging Material', 'Electrical Goods'].map(tag => (
                            <Link
                                key={tag}
                                href={`/search?q=${tag} in ${cityName}`}
                                className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 hover:text-blue-600 transition"
                            >
                                {tag} in {cityName}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 4. SEO CONTENT BLOCK (At the bottom) */}
                <div className="mt-8 prose max-w-none text-gray-600 text-sm">
                    <h2 className="text-xl font-bold text-gray-800">About {categoryName} Market in {cityName}</h2>
                    <p>
                        {cityName} is a major hub for {categoryName}. The market caters to retailers, wholesalers, and industrial buyers.
                        Buyers can find a wide range of specifications suitable for various applications.
                        Suppliers in {cityName} are known for competitive pricing and timely delivery.
                    </p>
                </div>
            </div>
        </main>
    );
}