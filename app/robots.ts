import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/buyer/dashboard/', '/seller/dashboard/', '/api/'],
        },
        // DOMAIN CHANGE: Point to the new sitemap
        sitemap: 'https://youthbharatwholesalemart.com/sitemap.xml',
    };
}