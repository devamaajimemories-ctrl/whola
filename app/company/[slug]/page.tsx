import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Product from '@/lib/models/Product';
import { scrapeAndSaveSellers } from '@/lib/scraper-service';
import { 
    MapPin, ShieldCheck, Package, Star, Building2, Megaphone,
    Store, ArrowRight, MessageCircle
} from 'lucide-react';
import { toCompanySlug } from '@/lib/slugs';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ slug: string }>
};

const parseSlug = (slug: string) => {
    const parts = slug.split('-');
    const city = parts[parts.length - 1]; 
    const nameParts = parts.slice(0, parts.length - 1);
    const name = nameParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const cityName = city.charAt(0).toUpperCase() + city.slice(1);
    return { name, cityName, fullQuery: `${name} in ${cityName}` };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { name, cityName } = parseSlug(slug);

    await dbConnect();
    const seller = await Seller.findOne({
        $or: [
            { slug: slug },
            { name: { $regex: name, $options: 'i' } }
        ]
    }).select('name city businessType category').lean();

    if (seller) {
        const type = seller.businessType || seller.category || "Supplier";
        return {
            title: `${seller.name} - Verified ${type} in ${seller.city}`,
            description: `Get contact details for ${seller.name} in ${seller.city}. Leading ${type}. Connect for wholesale prices on YouthBharat.`,
        };
    }

    return {
        title: `${name} in ${cityName} - Business Profile & Contact`,
        description: `View business details for ${name} in ${cityName}. Address, phone number, and wholesale reviews. Is this your business? Claim it now on YouthBharat.`,
    };
}

export default async function CompanyProfile({ params }: Props) {
    await dbConnect();
    const { slug } = await params;
    const { name: urlName, cityName: urlCity, fullQuery } = parseSlug(slug);

    let seller: any = await Seller.findOne({
        $or: [
            { slug: slug },
            { name: { $regex: urlName, $options: 'i' } },
            { tags: { $in: [new RegExp(urlName, 'i')] } }
        ]
    }).lean();

    if (!seller) {
        console.log(`⚡ JIT PRO: Profile "${urlName}" missing. Scraping live...`);
        try {
            await scrapeAndSaveSellers(fullQuery, "General", 200);
            seller = await Seller.findOne({
                $or: [
                    { name: { $regex: urlName, $options: 'i' } },
                    { tags: { $in: [new RegExp(urlName, 'i')] } }
                ]
            }).lean();
        } catch (e) {
            console.error("Scrape failed, continuing with mock profile.");
        }
    }

    if (!seller) {
        console.log("⚠️ Scrape returned no data. Generating Smart Mock Profile.");
        seller = {
            _id: "temp-id",
            name: urlName,
            city: urlCity,
            address: `${urlCity}, India`,
            category: "Unverified Listing",
            description: `Business listing for ${urlName} located in ${urlCity}. This profile is currently unclaimed on YouthBharat. Are you the owner? Claim this listing to update your catalog and receive wholesale inquiries directly.`,
            images: [], 
            isVerified: false,
            ratingAverage: 0, 
            ratingCount: 0,
            createdAt: new Date().toISOString()
        };
    }

    const isMockProfile = seller._id === "temp-id";

    let products: any[] = [];
    if (!isMockProfile) {
        products = await Product.find({ sellerId: seller._id }).lean();
    }

    const schemaType = "LocalBusiness";
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "name": seller.name,
        "image": seller.images?.[0] || "https://youthbharatwholesalemart.com/default_business_icon.png", 
        "url": `https://youthbharatwholesalemart.com/company/${slug}`, 
        "address": {
            "@type": "PostalAddress",
            "streetAddress": seller.address || seller.city, 
            "addressLocality": seller.city,
            "addressCountry": "IN"
        },
        "description": seller.description
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* ⛔ VITAL FIX: NoIndex for Mock Profiles to prevent 'Thin Content' penalty */}
            {isMockProfile && <meta name="robots" content="noindex, nofollow" />}
            
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="container mx-auto px-4 pt-8">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start border border-gray-100">
                    
                    <div className="w-32 h-32 bg-white rounded-full border-4 border-gray-50 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                        {seller.images && seller.images.length > 0 ? (
                            <img src={seller.images[0]} alt={seller.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-bold text-blue-600">{seller.name.charAt(0)}</span>
                        )}
                    </div>

                    <div className="flex-1 mt-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
                            {seller.isVerified ? (
                                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    <ShieldCheck size={14} /> Verified
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    <Store size={14} /> Unclaimed Listing
                                </span>
                            )}
                        </div>
                        
                        <p className="text-lg text-gray-700 mt-1 font-medium flex items-center gap-2">
                             <Building2 size={18} className="text-gray-400"/>
                             {seller.businessType || seller.category}
                        </p>

                        <div className="flex flex-col gap-2 mt-4 text-sm text-gray-500">
                            <span className="flex items-start gap-2 text-gray-700">
                                <MapPin size={16} className="mt-0.5 shrink-0 text-red-500" /> 
                                {seller.address || `${seller.city}, India`}
                            </span>
                            
                            <div className="flex gap-4 mt-1">
                                <span className="flex items-center gap-1 text-yellow-600 font-bold">
                                    <Star size={16} fill="currentColor"/> {seller.ratingAverage || "0"} ({seller.ratingCount || 0} Reviews)
                                </span>
                            </div>
                        </div>
                        
                        <p className="mt-4 text-sm text-gray-600 leading-relaxed max-w-2xl border-t pt-4">
                           {seller.description}
                        </p>
                    </div>

                    <div className="w-full md:w-[320px] shrink-0">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
                            <p className="text-blue-900 font-bold text-base mb-2 flex items-center gap-2">
                                <Megaphone size={18} className="text-blue-600"/>
                                Contact {seller.name}
                            </p>
                            <p className="text-blue-800/80 text-sm mb-4 leading-relaxed">
                                Chat directly with this supplier on our platform. Number is hidden for privacy.
                            </p>
                            
                            <Link 
                                href={isMockProfile ? "/post-requirement" : `/buyer/messages?sellerId=${seller._id}&source=company_profile`}
                                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
                            >
                                <MessageCircle size={18} />
                                {isMockProfile ? "Request Contact" : "Chat with Supplier"}
                            </Link>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6 flex items-center gap-2">
                    <Package className="text-blue-600" /> Products & Services
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.length > 0 ? products.map((p: any) => (
                        <div key={p._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                            <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                                {p.images && p.images.length > 0 ? (
                                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/>
                                ) : (
                                    <Package size={48} className="text-gray-300" />
                                )}
                            </div>
                            
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{p.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-blue-600 font-bold text-lg">₹{p.price}</p>
                                    <span className="text-xs text-gray-400">/{p.unit}</span>
                                </div>
                                <Link 
                                    href={`/post-requirement?product=${encodeURIComponent(p.name)}`} 
                                    className="block mt-3 text-center border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 font-medium text-sm transition-colors"
                                >
                                    Get Best Price
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                            <p className="text-gray-500 font-medium">No products listed directly.</p>
                        </div>
                    )}
                </div>

                {isMockProfile && (
                    <div className="mt-12 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Rated Alternatives in {urlCity}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            While {seller.name} is unverified, check out these top-rated suppliers for similar products:
                        </p>
                        <Link 
                            href={`/market/${toCompanySlug(urlName)}/${toCompanySlug(urlCity)}`}
                            className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                        >
                            View Verified {urlName} Suppliers in {urlCity} <ArrowRight size={16}/>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}