import { MetadataRoute } from 'next';
import { toSlug } from '@/lib/locations';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

// Re-generate sitemap every 1 hour to capture newly scraped/added sellers
export const revalidate = 3600; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://youthbharat.com';

    // =========================================================
    // 1. STATIC ROUTES (Base Pages)
    // =========================================================
    const staticRoutes = [
        '',
        '/search',
        '/login',
        '/register',
        '/how-it-works',
        '/contact',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // =========================================================
    // 2. MARKET ROUTES (Dynamic & Data-Driven)
    // ONLY generate pages for City/Category pairs that exist in DB
    // =========================================================
    let marketRoutes: MetadataRoute.Sitemap = [];

    try {
        await dbConnect();

        // AGGREGATION: Find all unique combinations of 'category' and 'city'
        // that have at least one seller.
        // We filter by 'isVerified: true' to ensure high-quality pages for Google.
        const activeMarkets = await Seller.aggregate([
            { 
                $match: { 
                    isVerified: true,
                    category: { $exists: true, $ne: "" },
                    city: { $exists: true, $ne: "" }
                } 
            },
            { 
                $group: { 
                    _id: { 
                        category: "$category", 
                        city: "$city" 
                    },
                    lastUpdated: { $max: "$updatedAt" } // Get the most recent update in this market
                } 
            }
        ]);

        console.log(`✅ [Sitemap] Found ${activeMarkets.length} active markets in DB.`);

        marketRoutes = activeMarkets.map((market) => ({
            url: `${baseUrl}/market/${toSlug(market._id.category)}/${toSlug(market._id.city)}`,
            lastModified: market.lastUpdated ? new Date(market.lastUpdated) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

    } catch (error) {
        console.error("❌ [Sitemap] Error fetching active markets:", error);
    }

    // =========================================================
    // 3. SELLER ROUTES (Individual Profiles)
    // =========================================================
    let sellerRoutes: MetadataRoute.Sitemap = [];
    
    try {
        // Reuse the db connection from above
        const sellers = await Seller.find({ isVerified: true })
            .select('_id updatedAt')
            .lean();

        sellerRoutes = sellers.map((seller) => ({
            url: `${baseUrl}/supplier/${seller._id}`,
            lastModified: seller.updatedAt ? new Date(seller.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9, 
        }));

        console.log(`✅ [Sitemap] Generated ${sellerRoutes.length} seller URLs`);

    } catch (error) {
        console.error("❌ [Sitemap] Error fetching sellers:", error);
    }

    // =========================================================
    // 4. COMBINE AND RETURN
    // =========================================================
    // If the DB is empty, this will just return static routes (Safe!)
    return [...staticRoutes, ...marketRoutes, ...sellerRoutes];
}