// abcd/lib/search-logic.ts
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import { scrapeAndSaveSellers } from '@/lib/scraper-service';
import { escapeRegex } from '@/lib/utils';

export interface SearchFilters {
    verified?: boolean;
    topRated?: boolean;
    openNow?: boolean;
}

export async function getSearchResults(
    query: string, 
    location: string = '', 
    page: number = 1,
    filters: SearchFilters = {} 
) {
    await dbConnect();
    const limit = 20;
    const offset = (page - 1) * limit;

    const safeQuery = escapeRegex(query);
    const safeLoc = escapeRegex(location);

    // 1. Build Base Query (Matches "Q")
    const dbFilter: any = {
        $or: [
            { name: { $regex: safeQuery, $options: 'i' } },
            { category: { $regex: safeQuery, $options: 'i' } },
            { tags: { $in: [new RegExp(safeQuery, 'i')] } }
        ]
    };
    
    // 2. Location Filter (Matches "Loc" in City OR Address OR Tags)
    if (location.trim()) {
        const locRegex = new RegExp(safeLoc, 'i');
        // We use $and to ensure results match BOTH the Query AND the Location
        dbFilter.$and = [
            {
                $or: [
                    { city: { $regex: safeLoc, $options: 'i' } },
                    { address: { $regex: safeLoc, $options: 'i' } }, // Check full address
                    { tags: { $in: [locRegex] } } // Check tags (Scraper adds location to tags)
                ]
            }
        ];
    }

    // 3. APPLY EXTRA FILTERS
    if (filters.verified) {
        dbFilter.isVerified = true;
    }
    if (filters.topRated) {
        dbFilter.ratingAverage = { $gte: 4 }; 
    }
    if (filters.openNow) {
        dbFilter.openingHours = { $regex: 'Open', $options: 'i' };
    }

    // 4. JIT Check (Scrape if DB is empty)
    const isStrictFilter = filters.topRated || filters.openNow;
    const totalInDb = await Seller.countDocuments(dbFilter);
    const needed = offset + limit;

    // Scrape if we have fewer results than needed
    if (totalInDb < needed && !isStrictFilter) {
        console.log(`⚡ JIT: Scraping for "${query}" in "${location}"...`);
        
        const isCompanySearch = query.length > 25 || /pvt|ltd|limited|solutions|enterprises/i.test(query);
        const prefix = isCompanySearch ? "" : "Wholesale ";
        
        // Construct a query that definitely includes the location
        const scrapeQuery = location 
            ? `${prefix}${query} in ${location}` 
            : `${prefix}${query}`;

        await scrapeAndSaveSellers(scrapeQuery, query, needed + 20);
    }

    // 5. Fetch Results (Re-run query after scrape)
    const products = await Seller.find(dbFilter)
        .skip(offset)
        .limit(limit)
        .sort({ isVerified: -1, ratingAverage: -1, createdAt: -1 })
        .lean();

    return {
        products: JSON.parse(JSON.stringify(products)),
        hasMore: products.length === limit
    };
}