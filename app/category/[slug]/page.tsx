import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { scrapeAndSaveSellers } from '@/lib/scraper-service';
import { categoryData } from '@/lib/categoryData';
import { toCompanySlug } from '@/lib/slugs';
import { 
    ArrowLeft, MapPin, Star, ShieldCheck, 
    CheckCircle, Phone, Lock, MessageCircle 
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';

// ✅ VERCEL PRO SETTING: 5 Minutes Timeout
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = categoryData[slug];
    if (!data) return { title: 'Category Not Found' };

    return {
        title: `Top ${data.title} Manufacturers & Wholesalers | Direct Contact`,
        description: `Find verified ${data.title} suppliers, dealers, and exporters. Get best wholesale prices for ${data.title} on YouthBharat.`,
    };
}

export default async function CategoryPage({ params }: Props) {
    await dbConnect();
    const { slug } = await params;
    const data = categoryData[slug];

    if (!data) return notFound();

    const categoryName = data.title; 

    // 1. SEARCH DATABASE
    let sellers = await Seller.find({
        $or: [
            { category: { $regex: categoryName, $options: 'i' } },
            { tags: { $in: [new RegExp(categoryName, 'i')] } }
        ]
    })
    .limit(300) // ✅ SHOW ALL: Increased limit to 300
    .sort({ isVerified: -1, ratingAverage: -1 })
    .lean();

    // 2. JIT SCRAPER TRIGGER (Protected)
    // Trigger if we have fewer than 20 items to ensure we get a full list
    if (sellers.length < 20) {
        console.log(`⚡ JIT PRO: Category "${categoryName}" is low (${sellers.length}). Scraping full list...`);
        
        try {
            const query = `Wholesale ${categoryName} in India`;
            // ✅ REPLICATE GOOGLE MAPS: Fetch 200 items (Deep Scroll)
            await scrapeAndSaveSellers(query, categoryName, 200);
            
            // Re-fetch all data
            sellers = await Seller.find({
                $or: [
                    { category: { $regex: categoryName, $options: 'i' } },
                    { tags: { $in: [new RegExp(categoryName, 'i')] } }
                ]
            })
            .limit(300) // ✅ SHOW ALL
            .sort({ isVerified: -1, createdAt: -1 })
            .lean();
            
        } catch (error) {
            console.error(`⚠️ JIT Scrape Failed for ${categoryName}:`, error);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                
                {/* Header & Breadcrumbs */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
                            <ArrowLeft size={14} /> Home
                        </Link>
                        <span>/</span>
                        <span className="font-bold text-gray-800">{categoryName}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {categoryName} Suppliers
                    </h1>
                    <p className="text-gray-600">
                        Showing {sellers.length} verified wholesalers and manufacturers.
                    </p>
                </div>

                {/* Sub-Categories */}
                <div className="mb-10 overflow-x-auto pb-2">
                    <div className="flex gap-3">
                        {data.subCategories.map((sub, idx) => (
                            <Link 
                                key={idx} 
                                href={`/search?q=${encodeURIComponent(sub)}`}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all whitespace-nowrap shadow-sm"
                            >
                                {sub}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Seller Grid */}
                {sellers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sellers.map((seller: any) => (
                            <div key={seller._id.toString()} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow flex flex-col h-full overflow-hidden group">
                                
                                {/* Card Body */}
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                <Link href={`/company/${toCompanySlug(seller.name, seller.city)}`}>
                                                    {seller.name}
                                                </Link>
                                            </h2>
                                            {seller.isVerified && (
                                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">
                                                    <CheckCircle size={10} /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <div className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shrink-0">
                                            {seller.ratingAverage || 4.5} <Star size={10} fill="currentColor"/>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 text-sm text-gray-600 mb-4 min-h-[40px]">
                                        <MapPin size={16} className="mt-0.5 shrink-0 text-gray-400" />
                                        <span className="line-clamp-2">{seller.address || seller.city}</span>
                                    </div>

                                    {/* Categories Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                            {seller.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                                    <div className="flex flex-col gap-2">
                                        {/* Privacy Note */}
                                        <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-1">
                                            <Lock size={10}/> Number hidden. Contact via Chat.
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link 
                                                href={`/company/${toCompanySlug(seller.name, seller.city)}`}
                                                className="text-center bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                                            >
                                                View
                                            </Link>
                                            {/* ✅ INTERNAL CONTACT: Links to /buyer/messages */}
                                            <Link 
                                                href={`/buyer/messages?sellerId=${seller._id}&source=category_page`}
                                                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                <MessageCircle size={16}/> Chat Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </main>
    );
}