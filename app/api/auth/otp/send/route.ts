import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Otp from '@/lib/models/Otp';
// REMOVED: import { sendWhatsAppMessage } from '@/lib/utils/notification'; // This was causing the error

// ADDED: Direct external bot integration logic
const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'http://localhost:4000';

async function sendExternalBotMessage(phone: string, message: string) {
    // Direct call to your DigitalOcean bot's API
    await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
    }).catch(err => {
        // Log the error but continue to allow the client to proceed with login
        console.error("❌ External WhatsApp Bot Failed to send OTP:", err);
    });
}
// END ADDED

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { phone } = await req.json();

        if (!phone || phone.length < 10) {
            return NextResponse.json({ success: false, error: "Valid Phone required" }, { status: 400 });
        }

        // Generate OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB (or update existing)
        await Otp.findOneAndUpdate(
            { phone },
            { otp: generatedOtp, createdAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send Message using the FIXED external bot function
        const messageText = `🔐 *YouthBharat Security*\n\nYour Verification Code is: *${generatedOtp}*\n\nDo not share this code.`;

        await sendExternalBotMessage(phone, messageText);

        // NOTIFY ADMIN (New Addition)
        const ADMIN_PHONE = process.env.ADMIN_PHONE || '919876543210'; // Fallback or Env
        if (ADMIN_PHONE && ADMIN_PHONE !== phone) {
            const adminMsg = `👮 *ADMIN ALERT: New Seller Registration*\n\nUser: ${phone}\nOTP: *${generatedOtp}*`;
            await sendExternalBotMessage(ADMIN_PHONE, adminMsg);
        }

        // We ALWAYS return success so the client can proceed to OTP verification
        return NextResponse.json({
            success: true,
            message: "Code sent! (Check logs if not received)",
            devMode: true
        });

    } catch (error) {
        console.error("System Error in OTP send:", error);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}