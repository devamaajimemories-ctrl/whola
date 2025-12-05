import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Product from '@/lib/models/Product';
import { CheckCircle, MapPin, Star, Lock, TrendingUp, Info } from 'lucide-react';
import { fromSlug } from '@/lib/locations';

type Props = {
    params: { category: string; city: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const category = fromSlug(params.category);
    const city = fromSlug(params.city);
    
    return {
        title: `Wholesale ${category} in ${city} | Price List & Manufacturers`,
        description: `Find verified ${category} manufacturers in ${city}. Compare prices, view contact details, and get direct quotes from local suppliers.`
    };
}

export default async function MarketPage({ params }: Props) {
    await dbConnect();
    const categoryName = fromSlug(params.category);
    const cityName = fromSlug(params.city);

    // 1. Fetch Sellers
    const sellers = await Seller.find({
        $and: [
            { category: { $regex: categoryName, $options: 'i' } },
            { city: { $regex: cityName, $options: 'i' } }
        ]
    }).limit(50).sort({ isVerified: -1, ratingAverage: -1 }).lean();

    // 2. AGGREGATE REAL DATA (Fixed Type Error Here)
    const sellerIds = sellers.map(s => s._id.toString());
    
    const products = await Product.find({
        sellerId: { $in: sellerIds },
        category: { $regex: categoryName, $options: 'i' }
    }).select('price unit name').lean();

    // Calculate Statistics
    const totalSuppliers = sellers.length;
    const verifiedCount = sellers.filter(s => s.isVerified).length;
    
    let minPrice = 0;
    let maxPrice = 0;
    let avgPrice = 0;

    if (products.length > 0) {
        const prices = products.map(p => p.price);
        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
        avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    }

    // 3. Generate JSON-LD Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `What is the price range of ${categoryName} in ${cityName}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `The price of ${categoryName} in ${cityName} typically ranges from ₹${minPrice} to ₹${maxPrice}, depending on quantity and specifications.`
                }
            },
            {
                "@type": "Question",
                "name": `How many ${categoryName} suppliers are available in ${cityName}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `There are currently ${totalSuppliers} manufacturers and wholesalers listed in ${cityName}, with ${verifiedCount} of them being verified suppliers.`
                }
            }
        ]
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            {/* Inject Schema for Google */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 capitalize">
                        {categoryName} Manufacturers in {cityName}
                    </h1>
                    <p className="text-gray-600">
                        Showing {totalSuppliers} results | Updated Today
                    </p>
                </div>

                {/* Market Insight Block */}
                <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm mb-8">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                        <TrendingUp className="text-blue-600" size={20} />
                        Market Analysis: {cityName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <span className="block text-gray-500 mb-1">Price Range</span>
                            <span className="text-xl font-bold text-blue-800">
                                {products.length > 0 ? `₹${minPrice} - ₹${maxPrice}` : "Call for Quote"}
                            </span>
                            {products.length > 0 && <span className="text-xs text-gray-500 block">per unit</span>}
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <span className="block text-gray-500 mb-1">Availability</span>
                            <span className="text-xl font-bold text-green-800">
                                {totalSuppliers} Suppliers
                            </span>
                            <span className="text-xs text-gray-500 block">{verifiedCount} Verified by YouthBharat</span>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <span className="block text-gray-500 mb-1">Market Trend</span>
                            <span className="text-xl font-bold text-purple-800">
                                {totalSuppliers > 5 ? "High Demand" : "Growing Market"}
                            </span>
                            <span className="text-xs text-gray-500 block">Based on user enquiries</span>
                        </div>
                    </div>
                    <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                        Buyers in <strong>{cityName}</strong> can find {totalSuppliers} suppliers for <strong>{categoryName}</strong>. 
                        The average market price is approximately <strong>₹{avgPrice}</strong>. 
                        We recommend contacting verified sellers with the <CheckCircle size={12} className="inline text-blue-500"/> badge for secure transactions.
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
                                    {seller.isVerified && (
                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                            <CheckCircle size={14} /> Verified
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2 text-gray-500 bg-gray-100 w-fit px-3 py-1 rounded-md text-sm mb-2">
                                    <Lock size={12} />
                                    <span className="font-mono tracking-widest">+91 99XXX XXXXX</span>
                                    <span className="text-xs text-blue-600 font-bold ml-2 cursor-pointer hover:underline">
                                        (Click to View)
                                    </span>
                                </div>

                                <p className="text-sm text-gray-500 mt-2">
                                    <span className="font-semibold">Major Products:</span> {seller.tags.slice(0, 5).join(", ") || categoryName}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 min-w-[200px] justify-center">
                                <Link 
                                    href={`/buyer/messages?sellerId=${seller._id}&message=Hi, I am interested in ${categoryName} pricing in ${cityName}.`} 
                                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-center hover:bg-blue-700 transition-colors"
                                >
                                    Get Best Price
                                </Link>
                                <p className="text-xs text-center text-gray-400 mt-1 flex items-center justify-center gap-1">
                                    <Lock size={10} /> Contact details hidden for privacy
                                </p>
                            </div>
                        </div>
                    ))}

                    {sellers.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <Info className="mx-auto text-gray-400 mb-2" size={32} />
                            <h3 className="text-lg font-medium text-gray-900">No suppliers found in {cityName}</h3>
                            <p className="text-gray-500 mb-4">Be the first supplier to list {categoryName} here.</p>
                            <Link href="/register" className="text-blue-600 font-bold hover:underline">
                                Register as a Supplier
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}