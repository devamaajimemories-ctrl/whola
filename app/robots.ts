import { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic'; 

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://youthbharatwholesalemart.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/', 
                    '/find/',       // ✅ CRITICAL: Allow the JIT "Trap" pages
                    '/company/',    // ✅ Allow the Real DB pages
                    '/market/',     // ✅ Allow Category Hubs
                    '/locations',
                    '/about'
                ],
                disallow: [
                    '/admin/',
                    '/buyer/',
                    '/seller/',
                    '/api/',
                    '/search?',     // ⛔ Block internal search parameters (duplicate content)
                    '/*?*',         // ⛔ Block all query strings
                    '/_next/',
                    '/private/',
                ],
            },
            // Optimize for Googlebot specifically
            {
                userAgent: 'Googlebot',
                allow: ['/find/', '/company/'],
                crawlDelay: 1 // Optional: Be polite if server load is high
            }
        ],
        sitemap: `${BASE_URL}/sitemap.xml`, // Points to the index generated above
    };
}