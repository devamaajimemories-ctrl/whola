import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/buyer/dashboard/', '/seller/dashboard/', '/api/'],
        },
        sitemap: 'https://youthbharat.com/sitemap.xml',
    };
}
