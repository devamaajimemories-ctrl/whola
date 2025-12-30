// app/robots.ts
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
                    '/find/',       
                    '/company/',   
                    '/product/',    // ✅ ADDED: Allow crawling of product pages
                    '/market/',     
                    '/locations',
                    '/about'
                ],
                disallow: [
                    '/admin/',
                    '/buyer/',
                    '/seller/',
                    '/api/',
                    '/search?',     
                    '/*?*',         
                    '/_next/',
                    '/private/',
                ],
            },
            {
                userAgent: 'Googlebot',
                allow: ['/find/', '/company/', '/product/'], // ✅ ADDED here as well
                crawlDelay: 1 
            }
        ],
        sitemap: `${BASE_URL}/sitemap.xml`, 
    };
}