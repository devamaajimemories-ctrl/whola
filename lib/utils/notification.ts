// abcd/lib/utils/notification.ts

// 1. CONFIGURATION
// Get these from https://developers.facebook.com/apps/
const META_TOKEN = process.env.META_API_TOKEN;
const PHONE_ID = process.env.META_PHONE_ID;

// Helper to format phone numbers for WhatsApp (e.g. 9876543210 -> 919876543210)
function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return '91' + cleaned;
    return cleaned;
}

export async function sendWhatsAppMessage(to: string, message: string) {
    const recipient = formatPhone(to);

    // 1. Log for Debugging (Always works even if API fails)
    console.log(`📨 [WhatsApp] Sending to ${recipient}: ${message.substring(0, 50)}...`);

    // 2. Check if API Keys are set
    if (!META_TOKEN || !PHONE_ID) {
        console.warn("⚠️ META_API_TOKEN or META_PHONE_ID missing in .env. Message logged but not sent.");
        return { success: true, method: 'log-only' }; // Return success so app doesn't crash
    }

    try {
        // 3. Send to Meta Cloud API (The "Big Company" Way)
        // Note: For initial contact, you must use Templates. For replies, you can use text.
        // This is a generic text message sender.
        const response = await fetch(`https://graph.facebook.com/v17.0/${PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${META_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: recipient,
                type: "text",
                text: { preview_url: true, body: message }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Meta API Error:", JSON.stringify(data));
            return { success: false, error: data };
        }

        console.log("✅ Message Sent via Meta API");
        return { success: true, data };

    } catch (error) {
        console.error("❌ Network Error Sending WhatsApp:", error);
        return { success: false, error };
    }
}
