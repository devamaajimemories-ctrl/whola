import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import dbConnect from "@/lib/db";
import Seller from "@/lib/models/Seller";
import crypto from 'crypto'; // For generating Privacy IDs

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

        // 2. Block Heavy Resources (Images/Fonts) for Speed
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(type)) req.abort();
            else req.continue();
        });

        // 3. Navigate to Google Maps
        // We append "&hl=en" to ensure English results
        const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@?hl=en`;
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 45000 });

        // 4. Scroll to Load More Items
        try {
            await page.waitForSelector('div[role="feed"]', { timeout: 10000 });
            await page.evaluate(async () => {
                const wrapper = document.querySelector('div[role="feed"]');
                if (!wrapper) return;
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    const distance = 800;
                    let attempts = 0;
                    const timer = setInterval(() => {
                        const scrollHeight = wrapper.scrollHeight;
                        wrapper.scrollBy(0, distance);
                        totalHeight += distance;
                        attempts++;
                        // Scroll enough to get ~15-20 results
                        if (document.querySelectorAll('div[role="article"]').length >= 15 || attempts > 6) { 
                            clearInterval(timer);
                            resolve(true);
                        }
                    }, 500);
                });
            });
        } catch (e) {
            console.log("⚠️ [JIT-Scraper] Fast load or no feed detected.");
        }

        // 5. Extract Rich Data (Like Justdial)
        const rawSellers = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('div[role="article"]'));
            return items.map(item => {
                const text = (item as HTMLElement).innerText || "";
                
                // Name
                let name = item.getAttribute("aria-label") || "";
                if (!name) {
                    const titleEl = item.querySelector('.fontHeadlineSmall');
                    if (titleEl) name = (titleEl as HTMLElement).innerText;
                }

                // Rating & Reviews (e.g. "4.5(120)")
                let rating = 0;
                let reviews = 0;
                const ratingText = item.querySelector('[aria-label*="stars"]')?.getAttribute("aria-label");
                if (ratingText) {
                    const parts = ratingText.split(" ");
                    rating = parseFloat(parts[0]) || 0;
                    // Try to find count in brackets
                    const reviewMatch = text.match(/\(([\d,]+)\)/);
                    if (reviewMatch) {
                        reviews = parseInt(reviewMatch[1].replace(/,/g, '')) || 0;
                    }
                }

                // Business Type (e.g. "Manufacturer", "Wholesaler") - Usually the first line of text
                const textLines = text.split('\n');
                // The structure usually has Name -> Rating -> Category
                // We pick a likely candidate for category if it matches common B2B terms
                let businessType = "Supplier"; 
                if (textLines.length > 2) {
                    const potentialType = textLines[1].trim(); // Usually category is 2nd line
                    if (potentialType.length < 30) businessType = potentialType;
                }

                // Infer City
                let city = "India";
                const majorCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot"];
                for (const c of majorCities) {
                    if (text.includes(c)) { city = c; break; }
                }

                return { name, city, rating, reviews, businessType };
            });
        });

        // 6. Save to DB with Privacy Protection
        const validSellers = rawSellers.filter(s => s.name && s.name !== "Unknown Seller");
        
        if (validSellers.length > 0) {
            console.log(`💾 [JIT-Scraper] Found ${validSellers.length} items. Saving with Privacy Mask...`);
            
            const operations = validSellers.map(seller => {
                // PRIVACY ID GENERATION
                // We create a stable ID from Name + City so we don't duplicate, 
                // but we NEVER save a real phone number.
                const hash = crypto.createHash('md5').update(seller.name + seller.city).digest('hex');
                // Create a fake "99..." number for the DB ID
                const privacyPhone = "99" + parseInt(hash, 16).toString().slice(0, 8); 

                return {
                    updateOne: {
                        filter: { phone: privacyPhone },
                        update: {
                            $set: {
                                name: seller.name,
                                city: seller.city,
                                category: categoryContext, 
                                businessType: seller.businessType, // Scraped Category (e.g. "Pipe Supplier")
                                ratingAverage: seller.rating,
                                ratingCount: seller.reviews,
                                
                                // Tagging for Search
                                tags: [query, "JIT Sourced", "Directory Listing", categoryContext, seller.city, seller.businessType], 
                                
                                // Privacy Flags
                                isVerified: false, 
                                email: "", 
                                profileCompleted: false
                            },
                            $setOnInsert: {
                                walletBalance: 0,
                                totalEarnings: 0
                            }
                        },
                        upsert: true
                    }
                };
            });

            await Seller.bulkWrite(operations);
            
            // Return these sellers so the UI updates immediately
            const hashes = validSellers.map(s => "99" + parseInt(crypto.createHash('md5').update(s.name + s.city).digest('hex'), 16).toString().slice(0, 8));
            return await Seller.find({ phone: { $in: hashes } });
        }

        return [];

    } catch (error) {
        console.error("❌ [JIT-Scraper] Critical Error:", error);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}