import React from "react";
import { headers } from "next/headers";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Seller from "@/lib/models/Seller";
import { scrapeAndSaveSellers } from "@/lib/scraper-service";
import { toCompanySlug } from "@/lib/slugs";
import { MapPin, ArrowRight, ShieldCheck, Star } from "lucide-react";

// Components
import Categories from "@/components/Categories";
import GoogleAd from "@/components/GoogleAd";
import TrendingCategories from "@/components/TrendingCategories";
import ApparelFashion from "@/components/ApparelFashion";
import ConsumerElectronics from "@/components/ConsumerElectronics";
import HomeSupplies from "@/components/HomeSupplies";
import CosmeticsPersonalCare from "@/components/CosmeticsPersonalCare";
import GlobalSearchBar from "@/components/GlobalSearchBar"; // <--- IMPORT ADDED

// ✅ VERCEL PRO: 5 Minutes Timeout for Homepage JIT
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

async function getLocalSellers(city: string) {
  if (!city) return [];
  
  await dbConnect();
  
  // 1. Try finding verified sellers in this city
  let sellers = await Seller.find({
    city: { $regex: city, $options: 'i' },
    isVerified: true
  }).limit(8).sort({ ratingAverage: -1 }).lean();

  // 2. JIT Scrape if empty (Vercel Pro Power)
  if (sellers.length < 4) {
    console.log(`🏠 Homepage: Low data for ${city}. JIT Scraping...`);
    const query = `Wholesalers in ${city}`;
    // Run scrape (waits up to 300s if needed, but usually ~15s for first batch)
    await scrapeAndSaveSellers(query, "Homepage Local");
    
    // Re-fetch
    sellers = await Seller.find({
      city: { $regex: city, $options: 'i' }
    }).limit(8).sort({ createdAt: -1 }).lean();
  }

  return sellers;
}

export default async function Home() {
  // 1. Detect User Location (Vercel Pro Feature)
  const headersList = await headers();
  const city = headersList.get('x-vercel-ip-city') || 'Delhi'; // Fallback to Delhi
  const country = headersList.get('x-vercel-ip-country') || 'IN';

  // 2. Fetch Data (Parallel for speed)
  const localSellers = country === 'IN' ? await getLocalSellers(city) : [];

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      
      {/* --- HERO SECTION --- */}
      <div className="w-full bg-blue-900 pt-16 pb-24 text-center text-white relative overflow-visible"> 
        {/* Note: Changed overflow-hidden to overflow-visible so the Search Dropdown isn't cut off */}
        
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Welcome to <span className="text-yellow-400">YouthBharat</span>
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-4">
            The largest searchable B2B marketplace. Connect with verified sellers and buyers directly.
          </p>
          
          {/* --- ADDED GST NO HERE --- */}
          <p className="text-sm md:text-base opacity-80 mb-8 font-medium">
            GSTNO : 09BRAPA3991A1Z7
          </p>
          
          {/* --- SEARCH BAR INTEGRATION START --- */}
          <div className="mb-4">
             <GlobalSearchBar />
          </div>
          {/* --- SEARCH BAR INTEGRATION END --- */}

        </div>
        
        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      </div>

      {/* --- LOCAL JIT SECTION (NEW) --- */}
      {localSellers.length > 0 && (
        <section className="-mt-16 relative z-20 mb-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="text-red-500" /> Top Wholesalers in {city}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">Verified suppliers near your location</p>
                </div>
                <Link href={`/search?q=Wholesalers%20in%20${city}`} className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-sm">
                  View All <ArrowRight size={16}/>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {localSellers.map((seller: any) => (
                  <Link key={seller._id} href={`/company/${toCompanySlug(seller.name, seller.city)}`} className="group block">
                    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all h-full bg-white group-hover:border-blue-300">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600">
                          {seller.name}
                        </h3>
                        {seller.isVerified && <ShieldCheck size={16} className="text-green-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{seller.address || seller.city}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {seller.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                          {seller.ratingAverage || 4.5} <Star size={10} fill="currentColor"/>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Standard Sections */}
      <Categories />

      <div className="container mx-auto px-4">
        <GoogleAd slot="8483275035" />
      </div>

      <TrendingCategories />
      <ApparelFashion />
      <ConsumerElectronics />

      <div className="container mx-auto px-4">
        <GoogleAd slot="8483275035" />
      </div>

      <HomeSupplies />
      <CosmeticsPersonalCare />
    </main>
  );
}