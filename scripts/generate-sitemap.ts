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
// We need these schemas to read the DB
const SellerSchema = new mongoose.Schema({ 
    isVerified: Boolean, 
    name: String, 
    city: String, 
    category: String, 
    tags: [String], 
    updatedAt: Date 
});
const ProductSchema = new mongoose.Schema({ 
    status: String, 
    slug: String, 
    updatedAt: Date 
});

const Seller = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// --- CONFIG ---
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://youthbharatwholesalemart.com';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const MAX_URLS_PER_FILE = 49000; // Google limit is 50k

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
    console.log('🚀 Starting Smart Sitemap Generation...');
    
    if (!process.env.MONGODB_URI) throw new Error('❌ MONGODB_URI is missing');
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
    console.log('✅ Connected to DB');

    const today = new Date().toISOString();
    const sitemapFiles: string[] = [];

    // --------------------------------------------------
    // 1. STATIC PAGES
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
    fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap-static.xml'), URL_SET_TEMPLATE_START + '\n' + staticUrls.join('\n') + URL_SET_TEMPLATE_END);
    sitemapFiles.push('sitemap-static.xml');

    // --------------------------------------------------
    // 2. SELLERS (Active Only)
    // --------------------------------------------------
    console.log('🔹 Fetching Verified Sellers...');
    // ✅ Filter: Only Verified Sellers
    const sellers = await Seller.find({ isVerified: true }).select('name city category tags updatedAt').lean();
    
    let sellerUrls: string[] = [];
    let sellerFileCount = 1;

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
    // 3. PRODUCTS (Approved Only)
    // --------------------------------------------------
    console.log('🔹 Fetching Approved Products...');
    // ✅ Filter: Only APPROVED products
    const products = await Product.find({ status: 'APPROVED' }).select('slug updatedAt').lean();

    let productUrls: string[] = [];
    let productFileCount = 1;

    for (const product of products) {
        if (!product.slug) continue;

        productUrls.push(URL_TEMPLATE(
            `${BASE_URL}/product/${product.slug}`,
            product.updatedAt ? new Date(product.updatedAt).toISOString() : today,
            'daily',
            '0.9'
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
    // 4. MARKET PAGES (Smart Filtering)
    // --------------------------------------------------
    console.log('🔹 Generating Smart Market Pages...');
    
    // ✅ STEP 1: Build a "Set" of valid combinations from the DB
    // This tells us: "We have data for 'Pumps' in 'Mumbai'"
    const validCombinations = new Set<string>();
    
    console.log(`   Scanning ${sellers.length} sellers to find active markets...`);
    
    sellers.forEach((s: any) => {
        if (s.city) {
            const citySlug = toSlug(s.city);
            
            // Add their main category
            if (s.category) {
                validCombinations.add(`${toSlug(s.category)}|${citySlug}`);
            }
            // Add their tags (keywords)
            if (s.tags && s.tags.length > 0) {
                s.tags.forEach((tag: string) => {
                    validCombinations.add(`${toSlug(tag)}|${citySlug}`);
                });
            }
        }
    });

    console.log(`   ✅ Found ${validCombinations.size} valid City+Category combinations.`);

    // ✅ STEP 2: Generate URLs ONLY if they exist in the Set
    let marketUrls: string[] = [];
    let marketFileCount = 1;
    
    const baseKeywords: string[] = [];
    industrialProducts.forEach(cat => {
        baseKeywords.push(...cat.products);
    });

    for (const keyword of baseKeywords) {
        const keywordSlug = toSlug(keyword);
        if (!keywordSlug) continue;

        for (const location of ALL_LOCATIONS) {
            const locationSlug = toSlug(location);
            if (!locationSlug) continue;

            // ⚠️ THE CHECK: Does this exist in our database?
            const signature = `${keywordSlug}|${locationSlug}`;
            
            if (validCombinations.has(signature)) {
                marketUrls.push(URL_TEMPLATE(
                    `${BASE_URL}/market/${keywordSlug}/${locationSlug}`,
                    today,
                    'monthly',
                    '0.7'
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
    }
    
    if (marketUrls.length > 0) {
        const fileName = `sitemap-market-${marketFileCount}.xml.gz`;
        writeCompressedSitemap(fileName, marketUrls);
        sitemapFiles.push(fileName);
    }

    // --------------------------------------------------
    // 5. INDEX
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