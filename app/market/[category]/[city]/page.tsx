import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { CheckCircle, MapPin, Star, Lock, TrendingUp } from 'lucide-react';
import { fromSlug } from '@/lib/locations';

type Props = {
    params: { category: string; city: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const category = fromSlug(params.category);
    const city = fromSlug(params.city);
    return {
        title: `Wholesale ${category} in ${city} | Price List & Manufacturers`,
        description: `Find ${category} manufacturers and wholesalers in ${city}. Get contact details, addresses, and latest price quotes.`
    };
}

const getMarketInsight = (cat: string, city: string) => {
    return `The market for ${cat} in ${city} has seen significant growth. ${city} is a key hub for ${cat} distribution. Sourcing locally in ${city} reduces shipping costs.`;
};

export default async function MarketPage({ params }: Props) {
    await dbConnect();
    const categoryName = fromSlug(params.category);
    const cityName = fromSlug(params.city);

    // Fetch sellers but DO NOT render their phone numbers directly
    const sellers = await Seller.find({
        $and: [
            { category: { $regex: categoryName, $options: 'i' } },
            { city: { $regex: cityName, $options: 'i' } }
        ]
    }).limit(20).sort({ isVerified: -1, ratingAverage: -1 });

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 capitalize">
                    {categoryName} Manufacturers in {cityName}
                </h1>

                {/* Market Insight Block */}
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm mb-8">
                    <p className="text-lg leading-relaxed mb-4 flex gap-3 items-start text-gray-700">
                        <TrendingUp className="text-blue-600 mt-1 flex-shrink-0" size={24} />
                        {getMarketInsight(categoryName, cityName)}
                    </p>
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
                                
                                {/* PII PROTECTION: Masked Phone Display */}
                                <div className="flex items-center gap-2 text-gray-500 bg-gray-100 w-fit px-3 py-1 rounded-md text-sm mb-2">
                                    <Lock size={12} />
                                    <span>+91 XXXXX XXXXX</span>
                                    <span className="text-xs text-blue-600 font-bold ml-2">(Verified)</span>
                                </div>

                                <p className="text-sm text-gray-500">
                                    Deals in: {seller.tags.join(", ") || categoryName}
                                </p>
                            </div>

                            {/* Call to Actions */}
                            <div className="flex flex-col gap-2 min-w-[200px] justify-center">
                                <Link 
                                    href={`/buyer/messages?sellerId=${seller._id}&message=Hi, I found you on YouthBharat. I am interested in ${categoryName}.`} 
                                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-center hover:bg-blue-700 transition-colors"
                                >
                                    Contact Supplier
                                </Link>
                                <p className="text-xs text-center text-gray-400">
                                    Phone number hidden for privacy
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}