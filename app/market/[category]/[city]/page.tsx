import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { scrapeAndSaveSellers } from '@/lib/scraper-service';
import { fromSlug, toCompanySlug } from '@/lib/slugs';
import { MapPin, MessageCircle } from 'lucide-react';

export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ category: string; city: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category, city } = await params;
    const catName = fromSlug(category);
    const cityName = fromSlug(city);
    return {
        title: `Top ${catName} Suppliers in ${cityName} | Best Wholesale Rates`,
        description: `Find verified ${catName} dealers and manufacturers in ${cityName}. Connect directly with suppliers for best quotes.`,
    };
}

export default async function MarketPage({ params }: Props) {
    await dbConnect();
    const { category, city } = await params;
    const categoryName = fromSlug(category);
    const cityName = fromSlug(city);

    let sellers = await Seller.find({
        $or: [
            { category: { $regex: categoryName, $options: 'i' } },
            { tags: { $in: [new RegExp(categoryName, 'i')] } }
        ],
        city: { $regex: cityName, $options: 'i' }
    })
    .limit(300)
    .sort({ isVerified: -1, ratingAverage: -1 })
    .lean();

    if (sellers.length < 20) {
        console.log(`⚡ JIT ACTIVATED: Scraping live data for "${categoryName} in ${cityName}"...`);
        try {
            const query = `Wholesale ${categoryName} in ${cityName}`;
            await scrapeAndSaveSellers(query, categoryName, 200);
            
            sellers = await Seller.find({
                $or: [
                    { category: { $regex: categoryName, $options: 'i' } },
                    { tags: { $in: [new RegExp(categoryName, 'i')] } }
                ],
                city: { $regex: cityName, $options: 'i' }
            })
            .limit(300)
            .sort({ isVerified: -1 })
            .lean();
        } catch (e) { console.error("Scrape failed"); }
    }

    if (!sellers || sellers.length === 0) {
        // ✅ FIXED: Add Noindex to prevent Soft 404
        return (
             <main className="min-h-screen bg-gray-50 py-16">
                 {/* ⛔ PREVENT INDEXING OF EMPTY PAGES */}
                 <meta name="robots" content="noindex, nofollow" />
                 
                <div className="container mx-auto px-4 text-center max-w-lg">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">No Suppliers Found</h1>
                    <p className="text-gray-600 mb-8">
                        We couldn't find any {categoryName} suppliers in {cityName} at the moment.
                    </p>
                    <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700">
                        Back to Home
                    </Link>
                </div>
             </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                    <Link href="/" className="hover:text-blue-600">Home</Link> <span>/</span>
                    <span className="capitalize">{cityName}</span> <span>/</span>
                    <span className="font-bold capitalize text-blue-600">{categoryName}</span>
                </nav>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 capitalize mb-2">
                        {categoryName} Wholesalers in {cityName}
                    </h1>
                    <p className="text-gray-600">
                        Found <span className="font-bold text-gray-900">{sellers.length}</span> verified suppliers.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sellers.map((seller: any) => (
                        <div key={seller._id.toString()} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full">
                            <div className="p-6">
                                <h2 className="text-lg font-bold text-gray-900 line-clamp-2">
                                    <Link href={`/company/${toCompanySlug(seller.name, seller.city)}`} className="hover:text-blue-600 transition-colors">
                                        {seller.name}
                                    </Link>
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                    <MapPin size={14} className="text-gray-400 shrink-0"/>
                                    <span className="truncate">{seller.address || seller.city}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 mt-auto border-t border-gray-100 flex gap-3">
                                <Link href={`/company/${toCompanySlug(seller.name, seller.city)}`} className="flex-1 text-center py-2 bg-white border border-gray-300 rounded text-sm font-bold text-gray-700">View</Link>
                                <Link 
                                    href={`/buyer/messages?sellerId=${seller._id}&source=market_listing`} 
                                    className="flex-1 text-center py-2 bg-blue-600 rounded text-sm font-bold text-white flex items-center justify-center gap-2 hover:bg-blue-700"
                                >
                                    <MessageCircle size={16} /> Chat
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}