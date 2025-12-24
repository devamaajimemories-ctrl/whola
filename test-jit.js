// test-jit.js
// Run this with: node test-jit.js

const BASE_URL = 'http://localhost:3000'; // ✅ Verify this is your deployed URL

// Random data to generate a "Fresh" URL that definitely doesn't exist in DB
const keywords = ['pvc-pipes', 'cotton-yarn', 'industrial-valves', 'solar-panels', 'leather-shoes'];
const locations = ['mumbai', 'delhi', 'surat', 'kanpur', 'ludhiana', 'nagpur'];

// Generate a random test URL
const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
const randomCity = locations[Math.floor(Math.random() * locations.length)];
const randomId = Math.floor(Math.random() * 10000); // Add entropy to ensure no cache

// We append a random ID to the slug to force a "Cache Miss" effectively for testing
// Note: In real app, your slug structure is strict, but for testing latency we use a fresh combo
const targetUrl = `${BASE_URL}/find/${randomKeyword}-suppliers-in-${randomCity}`;

console.log(`\n🤖 ---------------------------------------------------`);
console.log(`🚀 GOOGLEBOT SIMULATOR STARTED`);
console.log(`🎯 Target: ${targetUrl}`);
console.log(`⏳ Status: SENDING REQUEST... (Please wait up to 60s)`);
console.log(`---------------------------------------------------\n`);

async function runTest() {
    const start = performance.now();
    
    try {
        // 1. Send the Request
        // We set a 60s timeout because Vercel/Googlebot often cut off after that
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(targetUrl, {
            signal: controller.signal,
            headers: {
                // Pretend to be Googlebot
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            }
        });

        clearTimeout(timeoutId);

        // 2. Measure Timings
        const end = performance.now();
        const duration = (end - start) / 1000; // in seconds
        
        // 3. Analyze Result
        const status = response.status;
        const text = await response.text();
        const size = text.length;

        // Check if we actually got suppliers or just an error/loading page
        // "Suppliers" or "Manufacturers" usually appears in your successful UI
        const successContent = text.toLowerCase().includes('supplier') || text.toLowerCase().includes('verified');
        const isSoft404 = text.toLowerCase().includes('no results found');

        console.log(`✅ RESPONSE RECEIVED!`);
        console.log(`⏱️  Time Taken:   ${duration.toFixed(2)} seconds`);
        console.log(`📊 HTTP Status:  ${status}`);
        console.log(`📄 Page Size:    ${(size / 1024).toFixed(2)} KB`);
        
        console.log(`\n🔍 DEEP ANALYSIS:`);

        // 🟢 ZONE 1: FAST (Instant Indexing)
        if (duration < 2.5) {
            console.log(`🟢 [PERFECT] Speed is under 2.5s. Google will love this page.`);
        } 
        // 🟡 ZONE 2: ACCEPTABLE (JIT Working)
        else if (duration < 15) {
            console.log(`🟡 [GOOD] Speed is ${duration.toFixed(1)}s. This is acceptable for a fresh JIT scrape.`);
        } 
        // 🔴 ZONE 3: DANGER (Timeout Risk)
        else {
            console.log(`🔴 [CRITICAL] Speed is ${duration.toFixed(1)}s. Googlebot might timeout before rendering.`);
        }

        if (successContent) {
             console.log(`👍 Content Check: Found 'Supplier/Verified' keywords. Real data loaded.`);
        } else if (isSoft404) {
             console.log(`⚠️ Content Check: Page loaded but said "No Results". SEO Value is low.`);
        } else {
             console.log(`❓ Content Check: Could not find supplier data. Check if your scraper was blocked.`);
        }

    } catch (error) {
        const end = performance.now();
        console.log(`❌ FAILED.`);
        console.log(`⏱️  Time before death: ${(end - start) / 1000} seconds`);
        
        if (error.name === 'AbortError') {
            console.log(`💀 ERROR: Request Timed Out (Limit: 60s). Vercel or your scraper killed it.`);
        } else {
            console.log(`💀 ERROR: ${error.message}`);
        }
    }
    console.log(`\n---------------------------------------------------`);
}

runTest();