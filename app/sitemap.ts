import { MetadataRoute } from 'next';
import { toSlug } from '@/lib/locations';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

export const revalidate = 3600; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // DOMAIN CHANGE: Update the fallback URL here
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://youthbharatwholesalemart.com';

    // 1. STATIC ROUTES
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

    // 2. MARKET ROUTES
    let marketRoutes: MetadataRoute.Sitemap = [];

    try {
        await dbConnect();
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
                    _id: { category: "$category", city: "$city" },
                    lastUpdated: { $max: "$updatedAt" } 
                } 
            }
        ]);

        marketRoutes = activeMarkets.map((market) => ({
            url: `${baseUrl}/market/${toSlug(market._id.category)}/${toSlug(market._id.city)}`,
            lastModified: market.lastUpdated ? new Date(market.lastUpdated) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

    } catch (error) {
        console.error("❌ [Sitemap] Error fetching active markets:", error);
    }

    // 3. SELLER ROUTES
    let sellerRoutes: MetadataRoute.Sitemap = [];
    
    try {
        const sellers = await Seller.find({ isVerified: true })
            .select('_id updatedAt')
            .lean();

        sellerRoutes = sellers.map((seller) => ({
            url: `${baseUrl}/supplier/${seller._id}`,
            lastModified: seller.updatedAt ? new Date(seller.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9, 
        }));

    } catch (error) {
        console.error("❌ [Sitemap] Error fetching sellers:", error);
    }

    return [...staticRoutes, ...marketRoutes, ...sellerRoutes];
}