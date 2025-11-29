import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import dbConnect from "@/lib/db";
import Seller from "@/lib/models/Seller";

// Types for our scraper
interface ScrapeResult {
    name: string;
    phone: string;
    city: string;
    category: string;
}

export async function scrapeAndSaveSellers(query: string, categoryContext: string): Promise<any[]> {
    console.log(`⚡ [JIT-Scraper] Sourcing started for: "${query}"`);
    
    let browser = null;
    
    try {
        await dbConnect();

        // 1. Configure Browser (Optimized for Speed)
        let executablePath = process.env.CHROME_EXECUTABLE_PATH;
        
        // Local fallback
        if (!executablePath) {
            if (process.platform === 'win32') executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
            else if (process.platform === 'darwin') executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        }

        // Cloud fallback
        if (process.env.NODE_ENV === 'production' || !executablePath) {
            executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar');
        }

        browser = await puppeteer.launch({
            args: [...chromium.args, "--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
            defaultViewport: null, // <--- FIXED: Changed from chromium.defaultViewport to null
            executablePath: executablePath,
            headless: true, // Always headless for speed
            ignoreDefaultArgs: ['--enable-automation'],
        });

        const page = await browser.newPage();

        // 2. PERFORMANCE HACK: Block Images, Fonts, and CSS
        // This reduces data usage and speeds up loading by ~60%
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // 3. Navigate to Search
        const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@?hl=en`;
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

        // 4. Fast Scroll Strategy
        try {
            await page.waitForSelector('div[role="feed"]', { timeout: 5000 });
            await page.evaluate(async () => {
                const wrapper = document.querySelector('div[role="feed"]');
                if (!wrapper) return;
                
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 1000; // Big scroll jumps
                    let attempts = 0;
                    
                    const timer = setInterval(() => {
                        const scrollHeight = wrapper.scrollHeight;
                        wrapper.scrollBy(0, distance);
                        totalHeight += distance;
                        attempts++;

                        // Stop if we have 10+ results or scrolled enough
                        const items = document.querySelectorAll('div[role="article"]').length;
                        if (items >= 10 || attempts > 5) { 
                            clearInterval(timer);
                            resolve(true);
                        }
                    }, 400); // Fast intervals
                });
            });
        } catch (e) {
            console.log("⚠️ [JIT-Scraper] Feed load skipped (might be single result or fast load)");
        }

        // 5. Extraction (Resilient Selectors)
        const rawSellers = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('div[role="article"]'));
            return items.map(item => {
                const text = (item as HTMLElement).innerText || "";
                
                // Robust Phone Regex for India (+91, 0, or plain 10 digit)
                const phoneMatch = text.match(/((\+91|0)?\s?\d{5}\s?\d{5})|(\d{3,5}\s?\d{7})|(\+\d{1,3}\s?\d{3,5}\s?\d{5})/);
                
                let name = item.getAttribute("aria-label") || "";
                if (!name) {
                    const titleEl = item.querySelector('.fontHeadlineSmall');
                    if (titleEl) name = (titleEl as HTMLElement).innerText;
                }

                let city = "India";
                if (text.includes("Mumbai")) city = "Mumbai";
                else if (text.includes("Delhi")) city = "Delhi";
                else if (text.includes("Bangalore")) city = "Bangalore";
                else if (text.includes("Chennai")) city = "Chennai";
                else if (text.includes("Kolkata")) city = "Kolkata";
                else if (text.includes("Pune")) city = "Pune";
                else if (text.includes("Hyderabad")) city = "Hyderabad";

                return {
                    name: name || "Unknown Seller",
                    phone: phoneMatch ? phoneMatch[0].trim() : "No Phone",
                    city,
                    category: "Unknown" // Will be filled outside
                };
            });
        });

        // 6. Database Sync (Bulk Upsert)
        const validSellers = rawSellers.filter(s => s.phone !== "No Phone" && s.name !== "Unknown Seller");
        
        if (validSellers.length > 0) {
            console.log(`💾 [JIT-Scraper] Saving ${validSellers.length} new sellers...`);
            
            const operations = validSellers.map(seller => ({
                updateOne: {
                    filter: { phone: seller.phone },
                    update: {
                        $set: {
                            name: seller.name,
                            city: seller.city,
                            category: categoryContext, // The category user searched for
                            tags: [query, "JIT Sourced", "Auto-Verified", categoryContext],
                            isVerified: true // Auto-verify leads from Maps
                        },
                        $setOnInsert: {
                            walletBalance: 500, // Free credits for new leads
                            totalEarnings: 0
                        }
                    },
                    upsert: true
                }
            }));

            await Seller.bulkWrite(operations);
            
            // Fetch the actual documents to return (needed for ID references)
            const phones = validSellers.map(s => s.phone);
            return await Seller.find({ phone: { $in: phones } });
        }

        return [];

    } catch (error) {
        console.error("❌ [JIT-Scraper] Failed:", error);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}