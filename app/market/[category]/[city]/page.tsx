// app/market/[category]/[city]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { scrapeAndSaveSellers } from '@/lib/scraper-service';
import Navbar from '@/components/Navbar';
import { MapPin, Filter, AlertCircle, ShieldCheck, Star, MessageCircle, ArrowRight } from 'lucide-react';

// --- CONFIGURATION ---
export const dynamic = 'force-dynamic';
export const revalidate = 3600; 

type Props = {
    params: Promise<{ category: string; city: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// --- HELPERS ---
const normalizeText = (slug: string) => {
    if (!slug) return '';
    return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const toCompanySlug = (name: string, city: string) => {
    const sName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sCity = city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${sName}-${sCity}`;
};

// --- SEO METADATA ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category, city } = await params;
    const catName = normalizeText(category);
    const cityName = normalizeText(city);

    return {
        title: `${catName} Manufacturers & Suppliers in ${cityName} | YouthBharat`,
        description: `Find verified ${catName} manufacturers, wholesalers, and suppliers in ${cityName}. Get best price quotes directly from factories in ${cityName}.`,
        alternates: {
            canonical: `/market/${category}/${city}`
        }
    };
}

// --- MAIN PAGE COMPONENT ---
export default async function MarketPage({ params }: Props) {
    const { category, city } = await params;
    const catName = category.replace(/-/g, ' '); 
    const cityName = city.replace(/-/g, ' ');

    await dbConnect();

    // 1. Build Query
    const query = {
        city: { $regex: new RegExp(`^${cityName}$`, 'i') },
        $or: [
            { category: { $regex: new RegExp(catName, 'i') } },
            { tags: { $in: [new RegExp(catName, 'i')] } }
        ]
    };

    // 2. Fetch Sellers
    let sellers = await Seller.find(query)
        .sort({ isVerified: -1, ratingAverage: -1 }) 
        .limit(50)
        .lean();

    // 3. JIT Scraping Fallback
    if (sellers.length < 5) {
        console.log(`⚡ Market: Low data for ${catName} in ${cityName}. Triggering Scraper...`);
        try {
            const scrapeQuery = `${catName} manufacturers in ${cityName}`;
            await scrapeAndSaveSellers(scrapeQuery, "Market", 100);
            
            // Re-fetch
            sellers = await Seller.find(query)
                .sort({ isVerified: -1, ratingAverage: -1 })
                .limit(50)
                .lean();
        } catch (error) {
            console.error("Scraping failed:", error);
        }
    }

    // 4. Soft 404 Prevention
    if (!sellers || sellers.length === 0) {
        notFound(); 
    }

    // 5. Render
    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />
            
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8">
                    <nav className="text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-blue-600">Home</Link> 
                        <span className="mx-2">/</span>
                        <Link href={`/find/${category}-in-india`} className="hover:text-blue-600 capitalize">
                            {catName}
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium capitalize">{cityName}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
                                {catName} in {cityName}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Found <span className="font-bold text-blue-600">{sellers.length}</span> verified suppliers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold mb-4 text-gray-800">Location</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="font-medium text-blue-600 flex items-center gap-2">
                                    <MapPin size={14} /> {normalizeText(city)}
                                </li>
                                <li>
                                    <Link href={`/find/${category}-in-india`} className="hover:text-blue-600 pl-6">
                                        All India
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </aside>

                    {/* Sellers Grid */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sellers.map((seller: any) => (
                                <div key={seller._id.toString()} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col h-full group">
                                    <div className="p-6 flex-1">
                                        {/* Header: Name & Badge */}
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                <Link href={`/company/${toCompanySlug(seller.name, seller.city)}`}>
                                                    {seller.name}
                                                </Link>
                                            </h2>
                                            {seller.isVerified && (
                                                <span className="shrink-0 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase flex items-center gap-1">
                                                    <ShieldCheck size={12} /> Verified
                                                </span>
                                            )}
                                        </div>

                                        {/* Meta: Rating & Location */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-1 text-yellow-600 font-medium">
                                                <Star size={14} fill="currentColor" />
                                                <span>{seller.ratingAverage || '4.0'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <MapPin size={14} />
                                                <span className="truncate max-w-[120px]">{seller.city}</span>
                                            </div>
                                        </div>

                                        {/* Tags/Category */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded border border-gray-100">
                                                {seller.category || catName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 mt-auto">
                                        <Link 
                                            href={`/company/${toCompanySlug(seller.name, seller.city)}`}
                                            className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 text-center flex items-center justify-center gap-2"
                                        >
                                            View Profile <ArrowRight size={14} />
                                        </Link>
                                        <Link 
                                            href={`/buyer/messages?sellerId=${seller._id}&source=market_listing`}
                                            className="flex-1 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 text-center flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <MessageCircle size={16} /> Chat
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* End of Results */}
                        <div className="mt-12 flex justify-center">
                            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200">
                                <AlertCircle size={16} />
                                <span>End of results for {normalizeText(category)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}