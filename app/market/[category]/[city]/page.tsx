import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { CheckCircle, MapPin, Star, Phone, Info, TrendingUp } from 'lucide-react';
import { fromSlug } from '@/lib/locations';

type Props = {
    params: { category: string; city: string }
};

// 1. ENHANCED METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const category = fromSlug(params.category);
    const city = fromSlug(params.city);

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

// Helper to generate unique text based on the category/city
const getMarketInsight = (cat: string, city: string) => {
    return `The market for ${cat} in ${city} has seen significant growth in demand recently. ${city} is emerging as a key hub for ${cat} distribution, with major wholesale markets located in its industrial zones. Sourcing locally in ${city} ensures faster logistics and reduces shipping costs for buyers in the region.`;
};

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
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 capitalize">
                    {categoryName} Manufacturers & Wholesalers in {cityName}
                </h1>

                {/* DYNAMIC PROGRAMMATIC CONTENT ENGINE */}
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm mb-8">
                    <div className="prose max-w-none text-gray-700">
                        <p className="text-lg leading-relaxed mb-6 flex gap-3 items-start">
                            <TrendingUp className="text-blue-600 mt-1 flex-shrink-0" size={24} />
                            {getMarketInsight(categoryName, cityName)}
                        </p>
                        
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                Why buy {categoryName} from {cityName}?
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0"/>
                                    <span>Connect directly with verified manufacturers and stockists in {cityName}.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0"/>
                                    <span>Compare bulk rates from {sellers.length > 0 ? sellers.length : 'multiple'} active suppliers instantly.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0"/>
                                    <span>Avail faster delivery within {cityName} and surrounding districts.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Seller List */}
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
                                <Link href={`/supplier/${seller._id}`} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-center hover:bg-blue-700 transition-colors">
                                    Get Best Price
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. RELATED SEARCHES (Internal Linking) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Related Categories in {cityName}</h3>
                    <div className="flex flex-wrap gap-2">
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

                {/* 4. SEO CONTENT BLOCK (Bottom) */}
                <div className="mt-8 prose max-w-none text-gray-600 text-sm bg-gray-100 p-6 rounded-xl">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">About {categoryName} Market in {cityName}</h2>
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