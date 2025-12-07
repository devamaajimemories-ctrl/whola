import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import dbConnect from "@/lib/db";
import Seller from "@/lib/models/Seller";
import crypto from 'crypto';

export async function scrapeAndSaveSellers(query: string, categoryContext: string): Promise<any[]> {
    console.log(`⚡ [JIT-Scraper] Rich Data Sourcing started for: "${query}"`);
    
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

        // 2. Block Heavy Resources (BUT allow us to read the img tags)
        // We abort the REQUEST, but the DOM 'img' tag will still exist with a URL.
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const type = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(type)) req.abort();
            else req.continue();
        });

        // 3. Navigate
        const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@?hl=en`;
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 45000 });

        // 4. Scroll Logic (Kept same for speed)
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

        // 5. EXTRACT RICH DATA
        const rawSellers = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('div[role="article"]'));
            return items.map(item => {
                const text = (item as HTMLElement).innerText || "";
                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                
                // A. NAME
                let name = item.getAttribute("aria-label") || "";
                if (!name) {
                    const titleEl = item.querySelector('.fontHeadlineSmall');
                    if (titleEl) name = (titleEl as HTMLElement).innerText;
                }

                // B. PHOTOS (Extract URL without downloading)
                let photoUrl = "";
                const imgEl = item.querySelector('img');
                if (imgEl) {
                    const src = imgEl.getAttribute('src');
                    if (src && src.startsWith('http')) photoUrl = src;
                }

                // C. RATING & REVIEWS
                let rating = 0;
                let reviews = 0;
                const ratingLabel = item.querySelector('[aria-label*="stars"]')?.getAttribute("aria-label");
                if (ratingLabel) {
                    rating = parseFloat(ratingLabel.split(" ")[0]) || 0;
                    // Find text like "(120)" or "120 reviews"
                    const reviewMatch = text.match(/\(([\d,]+)\)/);
                    if (reviewMatch) reviews = parseInt(reviewMatch[1].replace(/,/g, '')) || 0;
                }

                // D. BUSINESS TYPE & ADDRESS (Heuristic parsing)
                // The layout is usually: 
                // Line 1: Name
                // Line 2: Rating (4.5) • Business Type (Plumber) • ...
                // Line 3: Address / Status
                
                let businessType = "Supplier";
                let fullAddress = "";
                let openingHours = "";

                // Find the line that likely contains the category (often has dots or follows rating)
                // We skip the first line (Name)
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    
                    // If line contains "Open" or "Closed", it's hours
                    if (line.includes("Open") || line.includes("Closed") || line.includes("Closes")) {
                        openingHours = line;
                        continue;
                    }

                    // If it's a short generic word not starting with number, it might be category
                    // Justdial categories are specific. Google usually puts them next to rating.
                    if (!businessType || businessType === "Supplier") {
                        // Common pattern: "4.5(100) • Plumber • Ranikhet"
                        // We try to grab the middle part
                        if (!line.includes("(")) { // If it's not the rating line
                             // If it looks like an address (has commas or numbers), save as address
                             if (line.match(/\d+/) || line.includes(",")) {
                                 if (!fullAddress) fullAddress = line;
                             } else {
                                 // Likely category
                                 businessType = line;
                             }
                        }
                    } else if (!fullAddress) {
                        // If we already have category, this is likely address
                        fullAddress = line;
                    }
                }

                // Fallback for address if empty: assume City
                let city = "India";
                const majorCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot"];
                for (const c of majorCities) {
                    if (text.includes(c)) { city = c; break; }
                }
                if (!fullAddress) fullAddress = city;

                return { 
                    name, 
                    city, 
                    fullAddress,
                    businessType,
                    openingHours,
                    photoUrl,
                    rating, 
                    reviews 
                };
            });
        });

        // 6. Save to DB
        const validSellers = rawSellers.filter(s => s.name && s.name !== "Unknown Seller");
        
        if (validSellers.length > 0) {
            console.log(`💾 [JIT-Scraper] Saving ${validSellers.length} rich profiles...`);
            
            const operations = validSellers.map(seller => {
                const hash = crypto.createHash('md5').update(seller.name + seller.city).digest('hex');
                const privacyPhone = "99" + parseInt(hash, 16).toString().slice(0, 8); 

                return {
                    updateOne: {
                        filter: { phone: privacyPhone },
                        update: {
                            $set: {
                                name: seller.name,
                                city: seller.city,
                                address: seller.fullAddress, // <--- SAVING FULL ADDRESS
                                businessType: seller.businessType, // <--- SPECIFIC TYPE
                                openingHours: seller.openingHours, // <--- HOURS
                                images: seller.photoUrl ? [seller.photoUrl] : [], // <--- PHOTO URL
                                
                                category: categoryContext, 
                                ratingAverage: seller.rating,
                                ratingCount: seller.reviews,
                                tags: [query, "Rich Data", categoryContext, seller.city, seller.businessType], 
                                
                                isVerified: false, 
                                email: "", 
                                profileCompleted: false
                            }
                        },
                        upsert: true
                    }
                };
            });

            await Seller.bulkWrite(operations);
            
            // Return for immediate UI display
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