const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define a minimal schema to interact with the collection
const sellerSchema = new mongoose.Schema({
    name: String,
    phone: String
}, { strict: false });

const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);

async function removeInvalidSellers() {
    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI is missing in .env.local");
        return;
    }

    try {
        console.log("🔌 Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");

        // 1. Check how many bad records exist
        const badCount = await Seller.countDocuments({
            $or: [
                { phone: "No Phone" },
                { phone: null },
                { phone: "" }
            ]
        });

        console.log(`⚠️ Found ${badCount} sellers with invalid/missing phones.`);

        if (badCount > 0) {
            // 2. Perform the deletion
            const result = await Seller.deleteMany({
                $or: [
                    { phone: "No Phone" },
                    { phone: null },
                    { phone: "" }
                ]
            });

            console.log(`🗑️ Successfully DELETED ${result.deletedCount} records.`);
        } else {
            console.log("✨ No invalid records found. Database is clean!");
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Disconnected.");
    }
}

removeInvalidSellers();