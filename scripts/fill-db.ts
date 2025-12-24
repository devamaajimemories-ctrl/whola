// scripts/fill-db.ts
import dbConnect from '../lib/db';
import { scrapeAndSaveSellers } from '../lib/scraper-service';
import { categoryData } from '../lib/categoryData';
import { TARGET_CITIES } from '../lib/locations';

const CATEGORIES = Object.keys(categoryData);

async function run() {
  await dbConnect();
  console.log("🔥 Starting Local Scraper...");

  for (const city of TARGET_CITIES) {
    for (const cat of CATEGORIES) {
      console.log(`\n🔎 Scraping: ${cat} in ${city}...`);
      try {
        // This runs on YOUR machine, so no Vercel timeout!
        await scrapeAndSaveSellers(`Wholesale ${cat} in ${city}`, cat, 50);
        console.log(`✅ Success: ${cat} in ${city}`);
      } catch (e) {
        console.error(`❌ Failed: ${cat} in ${city}`);
      }
      // Wait 2 seconds to be polite
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

run();