import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import dbConnect from "@/lib/db";
import Seller from "@/lib/models/Seller";

// Allow longer timeout for scraping operations
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        // 1. SETUP
        const body = await req.json();
        const { query, config } = body;

        if (!query) {
            return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 });
        }

        console.log(`🔍 [Scraper] Starting for: "${query}"`);

        // Connect to DB immediately to ensure we can save later
        await dbConnect();

        // 2. BROWSER PATH DETECTION
        let executablePath = process.env.CHROME_EXECUTABLE_PATH;

        if (!executablePath) {
            // Local Development Paths (Windows/Mac)
            if (process.platform === 'win32') {
                executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
            } else if (process.platform === 'darwin') {
                executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            }
        }

        // Production / Vercel Path
        if (process.env.NODE_ENV === 'production' || !executablePath) {
            executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar');
        }

        // Determine Headless Mode
        // Priority: 1. Production (Always True) -> 2. Config (Frontend Request) -> 3. Default (True/Background)
        const isHeadless = process.env.NODE_ENV === 'production'
            ? true
            : (config?.headless !== undefined ? config.headless : true);

        // 3. LAUNCH BROWSER
        const browser = await puppeteer.launch({
            args: process.env.NODE_ENV === 'production' ? chromium.args : ['--start-maximized'],
            defaultViewport: null,
            executablePath: executablePath,
            headless: isHeadless, // Use boolean directly
            ignoreDefaultArgs: ['--enable-automation'],
        });

        const page = await browser.newPage();

        // 4. NAVIGATE
        // We search directly on Google Maps
        const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@?hl=en`;

        try {
            await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        } catch (e) {
            console.log("⚠️ [Scraper] Navigation took too long, but continuing...");
        }

        // 5. AUTO-SCROLL (Crucial for loading data)
        try {
            await page.waitForSelector('div[role="feed"]', { timeout: 15000 });
            await page.evaluate(async () => {
                const wrapper = document.querySelector('div[role="feed"]');
                if (!wrapper) return;

                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 800;
                    let timer = setInterval(() => {
                        const scrollHeight = wrapper.scrollHeight;
                        wrapper.scrollBy(0, distance);
                        totalHeight += distance;

                        // Stop scrolling if we have enough items (30+)
                        const items = document.querySelectorAll('div[role="article"]').length;
                        if (totalHeight >= scrollHeight || items >= 30) {
                            clearInterval(timer);
                            resolve(true);
                        }
                    }, 500);
                });
            });
        } catch (e) {
            console.log("⚠️ [Scraper] Feed selector not found, scraping visible items only.");
        }

        // 6. EXTRACT DATA
        const rawSellers = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('div[role="article"]'));

            return items.map(item => {
                // Extract Name
                let name = item.getAttribute("aria-label") || "";
                if (!name) {
                    const titleEl = item.querySelector('.fontHeadlineSmall');
                    if (titleEl) name = (titleEl as HTMLElement).innerText;
                }

                // Extract Phone (Indian Formats)
                const text = (item as HTMLElement).innerText;
                const phoneMatch = text.match(/((\+91|0)?\s?\d{5}\s?\d{5})|(\d{3,5}\s?\d{7})|(\+\d{1,3}\s?\d{3,5}\s?\d{5})/);

                // Simple City Detection
                let city = "India";
                if (text.includes("Mumbai")) city = "Mumbai";
                else if (text.includes("Delhi")) city = "Delhi";
                else if (text.includes("Bangalore")) city = "Bangalore";
                else if (text.includes("Chennai")) city = "Chennai";
                else if (text.includes("Kolkata")) city = "Kolkata";

                return {
                    name: name || "Unknown Seller",
                    phone: phoneMatch ? phoneMatch[0].trim() : "No Phone",
                    city: city
                };
            });
        });

        await browser.close();

        // 7. DATABASE SYNC (Auto-Save)
        // Filter valid data
        const validSellers = rawSellers.filter(s => s.phone !== "No Phone" && s.name !== "Unknown Seller");

        if (validSellers.length > 0) {
            console.log(`💾 [Scraper] Saving ${validSellers.length} items to MongoDB...`);

            // Prepare Bulk Operations
            const operations = validSellers.map(seller => ({
                updateOne: {
                    filter: { phone: seller.phone }, // Use Phone as unique ID
                    update: {
                        $set: {
                            name: seller.name,
                            city: seller.city,
                            // IMPORTANT: Save the SEARCH QUERY as the Category so Search finds it
                            category: query,
                            tags: [query, seller.city, "Scraped", "Verified"],
                            isVerified: true
                        }
                    },
                    upsert: true // Create if new, Update if exists
                }
            }));

            await Seller.bulkWrite(operations);
            console.log(`✅ [Scraper] Database Updated Successfully.`);
        } else {
            console.log(`⚠️ [Scraper] No valid sellers found with phone numbers.`);
        }

        return NextResponse.json({
            success: true,
            data: validSellers,
            savedCount: validSellers.length,
            debug: { totalFound: rawSellers.length }
        });

    } catch (error: any) {
        console.error("❌ [Scraper] Critical Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Scraping Failed" }, { status: 500 });
    }
}
