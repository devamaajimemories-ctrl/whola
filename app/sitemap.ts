import { MetadataRoute } from 'next';
import { industrialProducts } from '@/lib/industrialData';
import { TARGET_CITIES, toSlug } from '@/lib/locations';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';

// Re-generate sitemap every 1 hour to capture newly scraped sellers
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
    // 2. MARKET ROUTES (Programmatic SEO - "The SEO Honey Pots")
    // Combinations of Product x City (Old Code)
    // =========================================================
    const marketRoutes: MetadataRoute.Sitemap = [];
    const allProducts = industrialProducts.flatMap(cat => cat.products);

    for (const product of allProducts) {
        for (const city of TARGET_CITIES) {
            marketRoutes.push({
                url: `${baseUrl}/market/${toSlug(product)}/${toSlug(city)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            });
        }
    }

    // =========================================================
    // 3. SELLER ROUTES (Database Content - "The Inventory")
    // Fetching verified sellers from MongoDB (New Code)
    // =========================================================
    let sellerRoutes: MetadataRoute.Sitemap = [];
    
    try {
        await dbConnect();
        
        // Fetch only Verified sellers. 
        // We use .lean() for performance and select only needed fields.
        const sellers = await Seller.find({ isVerified: true })
            .select('_id updatedAt')
            .lean();

        sellerRoutes = sellers.map((seller) => ({
            url: `${baseUrl}/supplier/${seller._id}`,
            // Use the actual update time of the seller, or fallback to now
            lastModified: seller.updatedAt ? new Date(seller.updatedAt) : new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9, // High priority: These are real businesses
        }));

        console.log(`✅ [Sitemap] Generated ${sellerRoutes.length} seller URLs`);

    } catch (error) {
        console.error("❌ [Sitemap] Error fetching sellers from DB:", error);
        // We do not throw error here, so that at least static and market routes are returned
    }

    // =========================================================
    // 4. COMBINE AND RETURN
    // =========================================================
    return [...staticRoutes, ...marketRoutes, ...sellerRoutes];
}