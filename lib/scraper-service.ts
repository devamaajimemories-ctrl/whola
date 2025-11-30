import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import dbConnect from "@/lib/db";
import Seller from "@/lib/models/Seller";

export async function scrapeAndSaveSellers(query: string, categoryContext: string): Promise<any[]> {
    console.log(`⚡ [JIT-Scraper] Sourcing started for: "${query}"`);
    
    let browser = null;
    
    try {
        await dbConnect();

        // 1. Configure Browser
        let executablePath = process.env.CHROME_EXECUTABLE_PATH;
        if (!executablePath) {
            if (process.platform === 'win32') executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
            else if (process.platform === 'darwin') executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        }
        if (process.env.NODE_ENV === 'production' || !executablePath) {
            executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar');
        }

        browser = await puppeteer.launch({
            args: [...chromium.args, "--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
            defaultViewport: null,
            executablePath: executablePath,
            headless: true,
            ignoreDefaultArgs: ['--enable-automation'],
        });

        const page = await browser.newPage();

        // 2. Block Heavy Resources
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(type)) req.abort();
            else req.continue();
        });

        // 3. Navigate
        const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@?hl=en`;
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 45000 });

        // 4. Scroll
        try {
            await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
            await page.evaluate(async () => {
                const wrapper = document.querySelector('div[role="feed"]');
                if (!wrapper) return;
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 1000;
                    let attempts = 0;
                    const timer = setInterval(() => {
                        const scrollHeight = wrapper.scrollHeight;
                        wrapper.scrollBy(0, distance);
                        totalHeight += distance;
                        attempts++;
                        // Scroll more to get at least 15 results for better matching
                        if (document.querySelectorAll('div[role="article"]').length >= 15 || attempts > 8) { 
                            clearInterval(timer);
                            resolve(true);
                        }
                    }, 500);
                });
            });
        } catch (e) {
            console.log("⚠️ [JIT-Scraper] Fast load or no feed detected.");
        }

        // 5. Extract Data
        const rawSellers = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('div[role="article"]'));
            return items.map(item => {
                const text = (item as HTMLElement).innerText || "";
                
                // Phone Regex
                const phoneMatch = text.match(/((\+91|0)?\s?\d{5}\s?\d{5})|(\d{3,5}\s?\d{7})|(\+\d{1,3}\s?\d{3,5}\s?\d{5})/);
                
                let name = item.getAttribute("aria-label") || "";
                if (!name) {
                    const titleEl = item.querySelector('.fontHeadlineSmall');
                    if (titleEl) name = (titleEl as HTMLElement).innerText;
                }

                // Infer City from text content if available
                let city = "India";
                // List of major Indian cities to check against
                const majorCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot"];
                
                for (const c of majorCities) {
                    if (text.includes(c)) {
                        city = c;
                        break;
                    }
                }

                return {
                    name: name || "Unknown Seller",
                    phone: phoneMatch ? phoneMatch[0].trim() : "No Phone",
                    city,
                };
            });
        });

        // 6. Save to DB
        const validSellers = rawSellers.filter(s => s.phone !== "No Phone" && s.name !== "Unknown Seller");
        
        if (validSellers.length > 0) {
            console.log(`💾 [JIT-Scraper] Found ${validSellers.length} items. Saving...`);
            
            const operations = validSellers.map(seller => ({
                updateOne: {
                    filter: { phone: seller.phone },
                    update: {
                        $set: {
                            name: seller.name,
                            city: seller.city,
                            category: categoryContext, 
                            // Add the SEARCH QUERY as a tag so regex search finds it immediately next time
                            tags: [query, "JIT Sourced", "Auto-Verified", categoryContext, seller.city], 
                            isVerified: true
                        },
                        $setOnInsert: {
                            walletBalance: 500,
                            totalEarnings: 0
                        }
                    },
                    upsert: true
                }
            }));

            await Seller.bulkWrite(operations);
            
            // Return actual documents for the API to use
            const phones = validSellers.map(s => s.phone);
            return await Seller.find({ phone: { $in: phones } });
        }

        return [];

    } catch (error) {
        console.error("❌ [JIT-Scraper] Critical Error:", error);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}