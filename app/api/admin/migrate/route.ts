import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/db';
import Seller from '@/lib/models/Seller';
import Chat from '@/lib/models/Chat';

export async function POST(req: Request) {
    try {
        await dbConnect();

        const dataDir = path.join(process.cwd(), 'data');
        const sellersPath = path.join(dataDir, 'sellers.json');
        const chatsPath = path.join(dataDir, 'chats.json');

        const results = {
            sellers: { inserted: 0, errors: 0 },
            chats: { inserted: 0, errors: 0 }
        };

        // 1. Migrate Sellers
        if (fs.existsSync(sellersPath)) {
            const sellersData = JSON.parse(fs.readFileSync(sellersPath, 'utf-8'));
            console.log(`Found ${sellersData.length} sellers to migrate.`);

            for (const s of sellersData) {
                try {
                    // Check if exists
                    const exists = await Seller.findOne({ phone: s.phone });
                    if (!exists) {
                        // FIX: Cast to 'any' to bypass strict TypeScript Mongoose overload errors
                        await Seller.create({
                            name: s.name,
                            email: s.email || `${s.phone}@temp.whola.in`, // Fallback for required email
                            phone: s.phone,
                            city: s.city || 'Unknown',
                            category: s.category || 'General',
                            tags: s.tags || [],
                            isVerified: s.isVerified || false
                        } as any); 
                        results.sellers.inserted++;
                    }
                } catch (err) {
                    console.error(`Failed to migrate seller ${s.name}:`, err);
                    results.sellers.errors++;
                }
            }
        }

        // 2. Migrate Chats
        if (fs.existsSync(chatsPath)) {
            const chatsData = JSON.parse(fs.readFileSync(chatsPath, 'utf-8'));
            console.log(`Found ${chatsData.length} chats to migrate.`);

            for (const c of chatsData) {
                try {
                    // Avoid duplicates based on timestamp + sellerId (heuristic)
                    const exists = await Chat.findOne({
                        sellerId: c.sellerId,
                        timestamp: c.timestamp,
                        message: c.message
                    });

                    if (!exists) {
                        // Cast to 'any' here as well to be safe
                        await Chat.create({
                            sellerId: c.sellerId,
                            userId: 'guest', // Default for migrated chats
                            sender: c.sender === 'seller' ? 'seller' : 'user',
                            message: c.message,
                            isBlocked: c.isBlocked || false,
                            createdAt: new Date(c.timestamp)
                        } as any);
                        results.chats.inserted++;
                    }
                } catch (err) {
                    console.error(`Failed to migrate chat:`, err);
                    results.chats.errors++;
                }
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error("Migration Error:", error);
        return NextResponse.json({ success: false, error: "Migration Failed" }, { status: 500 });
    }
}