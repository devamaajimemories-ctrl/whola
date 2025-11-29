
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const sellerSchema = new mongoose.Schema({
    name: String,
    phone: String,
    city: String,
    category: String,
    tags: [String]
}, { strict: false });

const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);

async function checkData() {
    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI is missing in .env.local");
        return;
    }

    try {
        console.log("🔌 Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");

        const count = await Seller.countDocuments();
        console.log(`📊 Total Sellers in DB: ${count}`);

        if (count > 0) {
            const sample = await Seller.findOne();
            console.log("📝 Sample Seller:", JSON.stringify(sample, null, 2));
        } else {
            console.log("⚠️ Database is empty.");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
