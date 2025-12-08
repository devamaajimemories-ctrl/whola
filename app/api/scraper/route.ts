import { NextResponse } from "next/server";
import { headers } from "next/headers";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import dbConnect from "@/lib/db";
import Seller from "@/lib/models/Seller";

// Keep the timeout high (5 mins) to allow finding 200 items
export const maxDuration = 300; 
export const dynamic = "force-dynamic";

// Simple in-memory store for rate limiting
const rateLimit = new Map<string, number>();

export async function POST(req: Request) {
    try {
        // 1. SECURITY & RATE LIMITING
        const headersList = await headers();
        const ip = headersList.get("x-forwarded-for") || "unknown";
        
        const lastRequest = rateLimit.get(ip);
        const COOLDOWN = 10000; 

        if (lastRequest && Date.now() - lastRequest < COOLDOWN) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please wait 10 seconds." }, 
                { status: 429 }
            );
        }
        rateLimit.set(ip, Date.now());

        // 2. SETUP
        const body = await req.json();
        const { query, config } = body;

        if (!query) {
            return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 });
        }

        console.log(`🔍 [Scraper] Starting for: "${query}" (IP: ${ip})`);
        await dbConnect();

        // 3. BROWSER PATH DETECTION
        let executablePath = process.env.CHROME_EXECUTABLE_PATH;
        if (!executablePath) {
            if (process.platform === 'win32') {
                executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
            } else if (process.platform === 'darwin') {
                executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            }
        }

        if (process.env.NODE_ENV === 'production' || !executablePath) {
            executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar');
        }

        const isHeadless = process.env.NODE_ENV === 'production'
            ? true
            : (config?.headless !== undefined ? config.headless : true);

        // 4. LAUNCH BROWSER
        const browser = await puppeteer.launch({
            args: process.env.NODE_ENV === 'production' ? chromium.args : ['--start-maximized'],
            defaultViewport: null,
            executablePath: executablePath,
            headless: isHeadless, 
            ignoreDefaultArgs: ['--enable-automation'],
        });

        const page = await browser.newPage();

        // 5. NAVIGATE
        const searchUrl = `http://googleusercontent.com/maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en`;

        try {
            await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        } catch (e) {
            console.log("⚠️ [Scraper] Navigation took too long, but continuing...");
        }

        // 6. AUTO-SCROLL (TARGET: 200 Items)
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
                        const items = document.querySelectorAll('div[role="article"]').length;
                        
                        // 🛑 STOP SCRAPING WHEN WE HIT 200 ITEMS
                        if (totalHeight >= scrollHeight || items >= 200) {
                            clearInterval(timer);
                            resolve(true);
                        }
                    }, 500);
                });
            });
        } catch (e) {
            console.log("⚠️ [Scraper] Feed selector not found, scraping visible items only.");
        }

        // 7. EXTRACT DATA
        const rawSellers = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('div[role="article"]'));
            return items.map(item => {
                let name = item.getAttribute("aria-label") || "";
                if (!name) {
                    const titleEl = item.querySelector('.fontHeadlineSmall');
                    if (titleEl) name = (titleEl as HTMLElement).innerText;
                }
                const text = (item as HTMLElement).innerText;
                const phoneMatch = text.match(/((\+91|0)?\s?\d{5}\s?\d{5})|(\d{3,5}\s?\d{7})|(\+\d{1,3}\s?\d{3,5}\s?\d{5})/);
                let city = "India";
                const majorCities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Surat", "Jaipur"];
                for (const c of majorCities) { if (text.includes(c)) { city = c; break; } }

                return {
                    name: name || "Unknown Seller",
                    phone: phoneMatch ? phoneMatch[0].trim() : "No Phone",
                    city: city
                };
            });
        });

        await browser.close();

        // 8. DATABASE SYNC (Save ALL 200 items)
        const validSellers = rawSellers.filter(s => s.phone !== "No Phone" && s.name !== "Unknown Seller");

        if (validSellers.length > 0) {
            const operations = validSellers.map(seller => ({
                updateOne: {
                    filter: { phone: seller.phone },
                    update: {
                        $set: {
                            name: seller.name,
                            city: seller.city,
                            category: query,
                            tags: [query, seller.city, "Scraped", "Verified"],
                            isVerified: true
                        }
                    },
                    upsert: true
                }
            }));
            
            // 💾 THIS SAVES ALL 200 TO DATABASE
            await Seller.bulkWrite(operations);
            console.log(`💾 [Scraper] Saved ${validSellers.length} real contacts to DB.`);
        }

        // 9. PREPARE FRONTEND RESPONSE (Slice to 50)
        // We take the big list (validSellers) and only grab the first 50 for the UI
        const displayLimit = 50; 
        
        const safeSellers = validSellers
            .slice(0, displayLimit) // <--- TRUNCATE HERE FOR FRONTEND
            .map(seller => ({
                name: seller.name,
                city: seller.city,
                category: query,
                phone: null, 
                email: null, 
                isVerified: true,
                contactLabel: "Login to Contact" 
            }));

        return NextResponse.json({
            success: true,
            data: safeSellers, // Sends only 50
            savedCount: validSellers.length, // Tells frontend "We actually found 200"
            message: `Successfully scraped and saved ${validSellers.length} sellers. Showing top ${displayLimit}.`
        });

    } catch (error: any) {
        console.error("❌ [Scraper] Critical Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Scraping Failed" }, { status: 500 });
    }
}