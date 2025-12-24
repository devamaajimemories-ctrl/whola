// File: app/api/global-search/route.js
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
import { scrapeAndSaveSellers } from '@/lib/scraper-service'; 
import { industrialProducts } from '@/lib/industrialData'; // Import Industrial Data

// --- VERCEL PRO CONFIGURATION ---
// 5 Minutes timeout for Infinite JIT Scraping
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

// --- DB CONNECTION ---
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('Please add your Mongo URI to .env.local');

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const client = await clientPromise;
    const db = client.db(); // Auto-selects database from URI

    const searchRegex = new RegExp(query, 'i');

    // --- 1. SEARCH INDUSTRIAL DATA (STATIC LIST) ---
    // This gives immediate results like "Mango", "Steel Bar" even if DB is empty
    const staticResults = [];
    industrialProducts.forEach(category => {
        category.products.forEach(productName => {
            if (productName.toLowerCase().includes(query.toLowerCase())) {
                staticResults.push({
                    _id: `static-${Math.random()}`, // Temporary ID
                    title: productName,
                    subtitle: category.category, // e.g., "Agriculture: Fresh Fruits"
                    location: "India", // Default location
                    image: null, // Placeholder or category icon
                    type: "Industrial Product",
                    url: `/search?q=${encodeURIComponent(productName)}` // Clicking triggers full search
                });
            }
        });
    });
    // Limit static results to avoid overwhelming the dropdown
    const limitedStatic = staticResults.slice(0, 10);

    // --- 2. SEARCH DATABASE (PIPELINE) ---
    const pipeline = [
      // A. PRODUCTS
      {
        $match: {
          $or: [
            { name: searchRegex },
            { category: searchRegex },
            { tags: { $in: [searchRegex] } },
            { city: searchRegex }
          ]
        }
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          title: "$name",
          subtitle: "$category",
          location: "$city",
          image: { $arrayElemAt: ["$images", 0] },
          price: "$price",
          type: "Product",
          url: { $concat: ["/find/", "$slug"] }
        }
      },

      // B. SERVICES
      {
        $unionWith: {
          coll: "services",
          pipeline: [
            {
              $match: {
                $or: [ { serviceName: searchRegex }, { category: searchRegex } ]
              }
            },
            {
              $project: {
                _id: { $toString: "$_id" },
                title: "$serviceName",
                subtitle: "$category",
                location: "$city",
                image: { $arrayElemAt: ["$images", 0] },
                price: null,
                type: "Service",
                url: { $concat: ["/service/", { $toString: "$_id" }] }
              }
            }
          ]
        }
      },

      // C. SELLERS (SUPPLIERS)
      {
        $unionWith: {
          coll: "sellers",
          pipeline: [
            {
              $match: {
                $or: [
                  { name: searchRegex },
                  { city: searchRegex },
                  { category: searchRegex },
                  { tags: { $in: [searchRegex] } }
                ]
              }
            },
            {
              $project: {
                _id: { $toString: "$_id" },
                title: "$name",
                subtitle: "Verified Supplier",
                location: "$city",
                image: { $arrayElemAt: ["$images", 0] },
                price: null,
                type: "Supplier",
                url: { $concat: ["/seller/", { $toString: "$_id" }] }
              }
            }
          ]
        }
      },

      // LIMIT DB RESULTS (Up to 300 for scroll)
      { $limit: 300 }
    ];

    let dbResults = await db.collection('products').aggregate(pipeline).toArray();

    // --- 3. JIT INFINITE FILL ---
    // If (DB Results + Static Matches) < 300, Trigger Scraper
    const totalFound = dbResults.length + limitedStatic.length;
    const TARGET_LIMIT = 300;

    if (totalFound < TARGET_LIMIT) {
        console.log(`⚡ JIT: Found ${totalFound} items (Target: ${TARGET_LIMIT}). Scraping for "${query}"...`);
        
        // Trigger Scraper (Waits for at least one batch to save)
        await scrapeAndSaveSellers(query, query, TARGET_LIMIT - totalFound);
        
        // Re-run DB Search to get the new items
        dbResults = await db.collection('products').aggregate(pipeline).toArray();
        console.log(`⚡ JIT: Refresh complete. Database now has ${dbResults.length} items.`);
    }

    // --- 4. COMBINE & RETURN ---
    // We put Industrial Data at the top (suggestions), followed by real Suppliers
    const combinedResults = [...limitedStatic, ...dbResults];

    return NextResponse.json({ results: combinedResults });

  } catch (error) {
    console.error("Global Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}