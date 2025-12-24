import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import dbConnect from "@/lib/db";
import Seller from "@/lib/models/Seller";
import fs from 'fs';

// Vercel Pro allows up to 300s, Hobby is 10s.
export const maxDuration = 300; 

// --- CONFIGURATION ---
const DESKTOP_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
];

const PROXY_CONFIG = {
    host: process.env.PROXY_HOST || "brd.superproxy.io",
    port: process.env.PROXY_PORT || "33335",
    username: process.env.PROXY_USERNAME || "",
    password: process.env.PROXY_PASSWORD || "",
    useProxy: !!process.env.PROXY_USERNAME 
};

// CRITICAL: Matches @sparticuz/chromium-min@141.0.0
const CHROMIUM_PACK_URL = "https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.tar";

export async function scrapeAndSaveSellers(query: string, categoryContext: string, targetCount: number = 300) {
    let browser = null;
    
    // Safety: On Vercel, limit items to prevent timeouts
    const effectiveTarget = process.env.NODE_ENV === 'production' ? Math.min(targetCount, 20) : targetCount;
    
    console.log(`🚀 [Scraper] FAST MODE: Searching for "${query}" (Target: ${effectiveTarget})`);

    try {
        await dbConnect();

        // --- 1. BROWSER SETUP ---
        let executablePath = null;
        let launchArgs = [
            "--no-sandbox", 
            "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled", 
            "--disable-features=IsolateOrigins,site-per-process",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--window-size=1920,1080",
            "--hide-scrollbars",
            "--disable-web-security",
        ];
        
        // Add Sparticuz args if in production
        if (process.env.NODE_ENV === 'production') {
            if (chromium.args) {
                launchArgs = [...chromium.args, ...launchArgs];
            }
            // @ts-ignore
            if (chromium.setGraphicsMode) chromium.setGraphicsMode = false;
        }

        if (PROXY_CONFIG.useProxy) {
            launchArgs.push(`--proxy-server=${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`);
        }
        
        if (process.env.NODE_ENV !== 'production') {
            // Local Development Paths
            const paths = [
                'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                '/usr/bin/google-chrome',
                '/usr/bin/chromium-browser'
            ];
            executablePath = paths.find(p => fs.existsSync(p));
        } else {
            // Production (Vercel)
            executablePath = await chromium.executablePath(CHROMIUM_PACK_URL);
        }

        if (!executablePath) {
            console.error("❌ Browser executable not found. Please install Chrome locally or check Vercel config.");
            return [];
        }

        browser = await puppeteer.launch({
            args: launchArgs,
            executablePath: executablePath,
            headless: true,
            ignoreHTTPSErrors: true,
            defaultViewport: { width: 1920, height: 1080 }
        } as any);

        const page = await browser.newPage();
        
        // Proxy Auth
        if (PROXY_CONFIG.useProxy) {
            const sessionID = Math.floor(Math.random() * 1000000).toString();
            await page.authenticate({ 
                username: `${PROXY_CONFIG.username}-session-${sessionID}`, 
                password: PROXY_CONFIG.password 
            });
        }

        await page.setUserAgent(DESKTOP_USER_AGENTS[Math.floor(Math.random() * DESKTOP_USER_AGENTS.length)]);
        
        // --- 2. NAVIGATE ---
        // Using Google Maps Search URL
        const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@20.5937,78.9629,5z?hl=en`;
        
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

        // Handle Cookie Consent (if any)
        try {
            const acceptSelector = 'button[aria-label="Accept all"], button[aria-label="Accept"]';
            const button = await page.$(acceptSelector);
            if (button) await button.click();
        } catch (e) {}

        // --- 3. INFINITE SCROLL LOOP ---
        let totalSaved = 0;
        let sameCountRetries = 0;
        const processedNames = new Set();
        let previousHeight = 0;

        while (totalSaved < effectiveTarget && sameCountRetries < 5) {
            // Scroll Logic
            const scrollResult = await page.evaluate(async (prevHeight) => {
                const feed = document.querySelector('div[role="feed"]');
                if (!feed) return { success: false, height: 0 };
                feed.scrollTop = feed.scrollHeight;
                await new Promise(resolve => setTimeout(resolve, 1500));
                return { success: true, height: feed.scrollHeight };
            }, previousHeight);

            if (!scrollResult.success) {
                console.log("⏳ Waiting for result list...");
                await new Promise(r => setTimeout(r, 1000));
                // Check if it's a single result page
                const isSingle = await page.$('h1.DUwDvf');
                if (isSingle && totalSaved === 0) break;
            }

            if (scrollResult.height === previousHeight) {
                sameCountRetries++;
                console.log(`...Loading more... (${sameCountRetries}/5)`);
                await new Promise(r => setTimeout(r, 1500)); 
            } else {
                sameCountRetries = 0; 
                previousHeight = scrollResult.height;
            }

            // --- DATA EXTRACTION (UPDATED FOR PHONE NUMBERS) ---
            const rawData = await page.evaluate((category) => {
                const items = Array.from(document.querySelectorAll('div[role="article"]'));
                return items.map(el => {
                    const ariaLabel = el.getAttribute("aria-label");
                    const text = (el as HTMLElement).innerText;
                    const lines = text.split('\n');
                    
                    const name = ariaLabel || lines[0];
                    const img = el.querySelector('img')?.src || "";
                    
                    let city = "India";
                    
                    // 1. Try to find the city
                    const addressLine = lines.find(l => l.includes(','));
                    if (addressLine) {
                        const parts = addressLine.split(',');
                        if (parts.length >= 2) city = parts[parts.length - 2].trim().replace(/[0-9]/g, '');
                    }

                    // 2. NEW: Try to find a Real Phone Number using Regex
                    // Looks for patterns like +91..., 011-..., or 10-digit mobile numbers
                    const phoneRegex = /(\+\d{1,3}\s?)?\(?\d{2,5}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}/;
                    const foundPhoneLine = lines.find(l => phoneRegex.test(l));
                    const realPhone = foundPhoneLine ? foundPhoneLine.match(phoneRegex)?.[0] : null;

                    return {
                        name: name,
                        city: city,
                        category: category,
                        images: img.startsWith('http') ? [img] : [],
                        address: lines.join(', '), 
                        ratingAverage: 4.5,
                        realPhone: realPhone, // Pass extracted phone to next step
                        tags: [category, "Scraped", city]
                    };
                });
            }, categoryContext);

            console.log(`🔎 Found ${rawData.length} raw items on page.`);

            const newItems = rawData.filter(d => d.name && !processedNames.has(d.name));

            if (newItems.length > 0) {
                newItems.forEach(d => processedNames.add(d.name));
                
                // --- SAVE OPERATION (UPDATED) ---
                const operations = newItems.map((item: any) => {
                    const cleanName = item.name.replace(/[^a-zA-Z0-9]/g, '').slice(0,10);
                    
                    // Logic: Use Real Phone if found, else fallback to HIDDEN
                    const phoneToSave = item.realPhone 
                        ? item.realPhone 
                        : `HIDDEN-${cleanName}-${Date.now()}-${Math.floor(Math.random()*1000)}`;

                    return {
                        updateOne: {
                            filter: { name: item.name },
                            update: {
                                $set: {
                                    city: item.city,
                                    category: item.category,
                                    address: item.address,
                                    isVerified: true,
                                    ratingAverage: item.ratingAverage,
                                    images: item.images,
                                    phone: phoneToSave // Save the decided phone number
                                },
                                $addToSet: { tags: { $each: item.tags } },
                                $setOnInsert: { createdAt: new Date() }
                            },
                            upsert: true
                        }
                    };
                });

                try {
                    await Seller.bulkWrite(operations, { ordered: false });
                    totalSaved += newItems.length;
                    console.log(`📦 Saved +${newItems.length} items. Total: ${totalSaved}/${effectiveTarget}`);
                } catch (err: any) {
                    if (err.code !== 11000) console.error("Write Error:", err.message);
                }
            }
        }

        await browser.close();
        return Array.from(processedNames);

    } catch (error) {
        console.error("❌ SCRAPER ERROR:", error);
        if (browser) await browser.close();
        return [];
    }
}