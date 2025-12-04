import { MetadataRoute } from 'next';
import { industrialProducts } from '@/lib/industrialData';
import { TARGET_CITIES, toSlug } from '@/lib/locations';

// This function generates the sitemap.xml automatically
export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://youthbharat.com'; // CHANGE THIS to your actual domain

    // 1. Base Routes
    const routes = [
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

    // 2. Generate Programmatic Market Routes
    // Combines Every Product x Every City
    const marketRoutes = [];

    // Flatten products list
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

    // Note: For millions of pages, you would split this into sitemap-1.xml, sitemap-2.xml etc.
    // But for the first ~50,000 pages, this single file works.

    return [...routes, ...marketRoutes];
}
