import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import zlib from 'zlib';

// --- IMPORTS ---
import { ALL_LOCATIONS } from '../lib/locations';
import { industrialProducts } from '../lib/industrialData';

dotenv.config({ path: '.env.local' });

// --- MONGOOSE MODELS ---
const SellerSchema = new mongoose.Schema({ isVerified: Boolean, name: String, city: String, updatedAt: Date });
const ProductSchema = new mongoose.Schema({ status: String, slug: String, updatedAt: Date });
const Seller = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// --- CONFIG ---
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://youthbharatwholesalemart.com';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const MAX_URLS_PER_FILE = 49000; // Safety cap (Google limit is 50k)

// --- HELPERS ---
function toSlug(text: string) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')            
        .replace(/[^\w\-]+/g, '')        
        .replace(/\-\-+/g, '-')          
        .replace(/^-+/, '')              
        .replace(/-+$/, '');             
}

function toCompanySlug(name: string, city: string) {
    return `${toSlug(name)}-${toSlug(city)}`;
}

// --- TEMPLATES ---
const SITEMAP_INDEX_TEMPLATE = (files: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map(file => `  <sitemap>
    <loc>${BASE_URL}/${file}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

const URL_SET_TEMPLATE_START = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

const URL_SET_TEMPLATE_END = `\n</urlset>`;

const URL_TEMPLATE = (loc: string, lastmod: string, freq: string, priority: string) => 
`  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

// --- COMPRESSION HELPER ---
function writeCompressedSitemap(filename: string, urls: string[]) {
    const content = URL_SET_TEMPLATE_START + '\n' + urls.join('\n') + URL_SET_TEMPLATE_END;
    const compressed = zlib.gzipSync(content);
    fs.writeFileSync(path.join(PUBLIC_DIR, filename), compressed);
    console.log(`   ✅ Created ${filename} (${urls.length} URLs) - Size: ${(compressed.length / 1024).toFixed(2)} KB`);
}

// --- MAIN GENERATOR ---
async function generate() {
    console.log('🚀 Starting Compressed Sitemap Generation...');
    
    if (!process.env.MONGODB_URI) throw new Error('❌ MONGODB_URI is missing');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');

    const today = new Date().toISOString();
    const sitemapFiles: string[] = [];

    // --------------------------------------------------
    // 1. STATIC PAGES (Small, so we keep it uncompressed .xml)
    // --------------------------------------------------
    console.log('🔹 Generating Static Pages...');
    const staticUrls = [
        URL_TEMPLATE(`${BASE_URL}`, today, 'monthly', '1.0'),
        URL_TEMPLATE(`${BASE_URL}/about`, today, 'monthly', '0.8'),
        URL_TEMPLATE(`${BASE_URL}/contact`, today, 'monthly', '0.8'),
        URL_TEMPLATE(`${BASE_URL}/login`, today, 'monthly', '0.8'),
        URL_TEMPLATE(`${BASE_URL}/register`, today, 'monthly', '0.8'),
        URL_TEMPLATE(`${BASE_URL}/search`, today, 'weekly', '0.9'),
    ];
    // Write plain XML for static (easier for humans to read)
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-static.xml'), URL_SET_TEMPLATE_START + '\n' + staticUrls.join('\n') + URL_SET_TEMPLATE_END);
    sitemapFiles.push('sitemap-static.xml');


    // --------------------------------------------------
    // 2. SELLERS (Compressed)
    // --------------------------------------------------
    console.log('🔹 Generating Sellers...');
    let sellerUrls: string[] = [];
    let sellerFileCount = 1;
    const sellers = await Seller.find({}).select('name city updatedAt').lean();
    
    for (const seller of sellers) {
        if (!seller.name || !seller.city) continue;

        sellerUrls.push(URL_TEMPLATE(
            `${BASE_URL}/company/${toCompanySlug(seller.name as string, seller.city as string)}`,
            seller.updatedAt ? new Date(seller.updatedAt).toISOString() : today,
            'weekly',
            '0.8'
        ));

        if (sellerUrls.length >= MAX_URLS_PER_FILE) {
            const fileName = `sitemap-sellers-${sellerFileCount}.xml.gz`;
            writeCompressedSitemap(fileName, sellerUrls);
            sitemapFiles.push(fileName);
            sellerUrls = [];
            sellerFileCount++;
        }
    }
    if (sellerUrls.length > 0) {
        const fileName = `sitemap-sellers-${sellerFileCount}.xml.gz`;
        writeCompressedSitemap(fileName, sellerUrls);
        sitemapFiles.push(fileName);
    }


    // --------------------------------------------------
    // 3. PRODUCTS (Compressed)
    // --------------------------------------------------
    console.log('🔹 Generating Products...');
    let productUrls: string[] = [];
    let productFileCount = 1;
    const products = await Product.find({}).select('slug updatedAt').lean();

    for (const product of products) {
        if (!product.slug) continue;

        productUrls.push(URL_TEMPLATE(
            `${BASE_URL}/product/${product.slug}`,
            product.updatedAt ? new Date(product.updatedAt).toISOString() : today,
            'daily',
            '0.7'
        ));

        if (productUrls.length >= MAX_URLS_PER_FILE) {
            const fileName = `sitemap-products-${productFileCount}.xml.gz`;
            writeCompressedSitemap(fileName, productUrls);
            sitemapFiles.push(fileName);
            productUrls = [];
            productFileCount++;
        }
    }
    if (productUrls.length > 0) {
        const fileName = `sitemap-products-${productFileCount}.xml.gz`;
        writeCompressedSitemap(fileName, productUrls);
        sitemapFiles.push(fileName);
    }


    // --------------------------------------------------
    // 4. MARKET PAGES (Compressed - Massive List)
    // --------------------------------------------------
    console.log('🔹 Generating Market Pages (This may take a while)...');
    let marketUrls: string[] = [];
    let marketFileCount = 1;
    
    // Get Base Keywords
    const baseKeywords: string[] = [];
    industrialProducts.forEach(cat => {
        baseKeywords.push(...cat.products);
    });

    console.log(`   ℹ️  Processing: ${baseKeywords.length} Keywords x ${ALL_LOCATIONS.length} Locations`);
    
    for (const keyword of baseKeywords) {
        const keywordSlug = toSlug(keyword);
        if (!keywordSlug) continue;

        for (const location of ALL_LOCATIONS) {
            const locationSlug = toSlug(location);
            if (!locationSlug) continue;

            marketUrls.push(URL_TEMPLATE(
                `${BASE_URL}/market/${keywordSlug}/${locationSlug}`,
                today,
                'monthly',
                '0.6'
            ));

            if (marketUrls.length >= MAX_URLS_PER_FILE) {
                const fileName = `sitemap-market-${marketFileCount}.xml.gz`;
                writeCompressedSitemap(fileName, marketUrls);
                sitemapFiles.push(fileName);
                marketUrls = [];
                marketFileCount++;
            }
        }
    }
    if (marketUrls.length > 0) {
        const fileName = `sitemap-market-${marketFileCount}.xml.gz`;
        writeCompressedSitemap(fileName, marketUrls);
        sitemapFiles.push(fileName);
    }

    // --------------------------------------------------
    // 5. INDEX (The Main Map)
    // --------------------------------------------------
    console.log('🔹 Generating Main Index...');
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), SITEMAP_INDEX_TEMPLATE(sitemapFiles));

    console.log('🎉 SITEMAP COMPLETE!');
    console.log(`👉 Main Index: ${BASE_URL}/sitemap.xml`);
    console.log(`👉 Total Files Generated: ${sitemapFiles.length}`);
    
    process.exit(0);
}

generate().catch(e => {
    console.error(e);
    process.exit(1);
});