import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { scrapeAndSaveSellers } from '@/lib/scraper-service';
import { toCompanySlug } from '@/lib/slugs';
import { 
    MapPin, CheckCircle, MessageCircle 
} from 'lucide-react';
import { industrialProducts } from '@/lib/industrialData'; 
import { TARGET_CITIES } from '@/lib/locations'; 

export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ slug: string[] }>
};

const parseSlug = (slugArray: string[]) => {
    const raw = slugArray.join(' ');
    let category = raw;
    let city = "India";
    if (raw.includes('-in-')) {
        const parts = raw.split('-in-');
        category = parts[0];
        city = parts[1];
    }
    const cleanCategory = category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const cleanCity = city.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return { categoryName: cleanCategory, cityName: cleanCity, fullQuery: `${cleanCategory} in ${cleanCity}` };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
     const { slug } = await params;
     const { categoryName, cityName } = parseSlug(slug);
     return { title: `Top ${categoryName} Suppliers in ${cityName}`, description: `Find ${categoryName} in ${cityName}.` };
}

export default async function UniversalSearchPage({ params }: Props) {
    await dbConnect();
    const { slug } = await params;
    const { categoryName, cityName, fullQuery } = parseSlug(slug);

    console.log(`🔍 Visitor landed on: "${categoryName}" in "${cityName}"`);

    let sellers = await Seller.find({
        $and: [
            { 
                $or: [
                    { category: { $regex: categoryName, $options: 'i' } },
                    { tags: { $in: [new RegExp(categoryName, 'i')] } },
                    { name: { $regex: categoryName, $options: 'i' } }
                ]
            },
            { city: { $regex: cityName, $options: 'i' } }
        ]
    })
    .sort({ isVerified: -1, ratingAverage: -1 })
    .limit(300)
    .lean();

    if (sellers.length < 20) {
        console.log(`⚡ JIT ACTIVATED: Scraping live data for "${fullQuery}"...`);
        try {
            await scrapeAndSaveSellers(`Wholesale ${categoryName} in ${cityName}`, categoryName, 200);

            sellers = await Seller.find({
                $and: [
                    { 
                        $or: [
                            { category: { $regex: categoryName, $options: 'i' } },
                            { tags: { $in: [new RegExp(categoryName, 'i')] } }
                        ]
                    },
                    { city: { $regex: cityName, $options: 'i' } }
                ]
            })
            .limit(300)
            .sort({ isVerified: -1, createdAt: -1 }) 
            .lean();
            
        } catch (error) { console.error(`⚠️ JIT Scrape Failed:`, error); }
    }

    const hasResults = sellers && sellers.length > 0;

    // ✅ Fallback Data Generation
    const relatedCategories = industrialProducts
        .flatMap(c => c.products)
        .filter(p => p !== categoryName)
        .sort(() => 0.5 - Math.random())
        .slice(0, 15);
        
    const nearbyCities = TARGET_CITIES
        .filter(c => c !== cityName)
        .sort(() => 0.5 - Math.random())
        .slice(0, 12);

    return (
        <main className="min-h-screen bg-gray-50 pb-16">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 py-16 text-center text-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 capitalize leading-tight">
                        {categoryName} <span className="text-blue-200">in {cityName}</span>
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {hasResults ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-8 lg:col-span-9">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sellers.map((seller: any) => (
                                    <div key={seller._id.toString()} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col hover:shadow-lg transition-shadow overflow-hidden group">
                                        
                                        <div className="p-5 flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h2 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        <Link href={`/company/${toCompanySlug(seller.name, seller.city)}`}>
                                                            {seller.name}
                                                        </Link>
                                                    </h2>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        {seller.isVerified && (
                                                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                                                                <CheckCircle size={10} /> Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 min-h-[40px]">
                                                <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                                <span className="line-clamp-2">{seller.address || seller.city}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
                                            <Link href={`/company/${toCompanySlug(seller.name, seller.city)}`} className="flex items-center justify-center py-2 border border-gray-300 bg-white text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                                View Profile
                                            </Link>
                                            <Link 
                                                href={`/buyer/messages?sellerId=${seller._id}&source=find_listing`}
                                                className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                <MessageCircle size={14} /> Chat Now
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-4 lg:col-span-3 space-y-6"></div> 
                    </div>
                ) : (
                    // ✅ FIXED: Soft 404 Prevention
                    <div className="max-w-4xl mx-auto text-center py-12">
                        {/* ⛔ CRITICAL: Tell Google NOT to index this empty page */}
                        <meta name="robots" content="noindex, nofollow" />
                        
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                No direct matches found for "{categoryName}" in "{cityName}"
                            </h2>
                            <p className="text-gray-600 mb-8">
                                We couldn't find exact matches, but you might be interested in these related markets:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                {/* Related Categories Column */}
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Browse Related Categories</h3>
                                    <ul className="space-y-2">
                                        {relatedCategories.map((cat, i) => (
                                            <li key={i}>
                                                <Link href={`/find/${cat.replace(/\s+/g, '-').toLowerCase()}-in-${cityName.replace(/\s+/g, '-').toLowerCase()}`} className="text-blue-600 hover:underline">
                                                    {cat} in {cityName}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Nearby Cities Column */}
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Suppliers in Nearby Cities</h3>
                                    <ul className="space-y-2">
                                        {nearbyCities.map((city, i) => (
                                            <li key={i}>
                                                <Link href={`/find/${categoryName.replace(/\s+/g, '-').toLowerCase()}-in-${city.replace(/\s+/g, '-').toLowerCase()}`} className="text-blue-600 hover:underline">
                                                    {categoryName} in {city}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}