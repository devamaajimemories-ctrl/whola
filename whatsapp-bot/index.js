const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import axios for HTTP requests

const app = express();
const PORT = 4000;

// Configuration
const WEBSITE_WEBHOOK_URL = 'http://localhost:3000/api/chat/webhook'; // Update if your website runs on a different port

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;

// 1. QR Code Generation
client.on('qr', (qr) => {
    console.log('📱 Scan this QR Code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
    console.log('\nOpen WhatsApp on your phone -> Linked Devices -> Link a Device');
});

// 2. Client Ready Event
client.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready!');
    console.log('🚀 Bot server running on http://localhost:' + PORT);
    console.log('👂 Listening for incoming messages...');
    isReady = true;
});

// 3. INCOMING MESSAGE LISTENER (The New Update)
client.on('message', async (msg) => {
    try {
        // Ignore status updates, broadcasts, or messages from groups (optional filter)
        if (msg.isStatus || msg.type !== 'chat') return;

        console.log(`📩 New Message from ${msg.from}: ${msg.body}`);

        // Extract phone number (remove @c.us)
        const sellerPhone = msg.from.replace('@c.us', '');

        // Forward to Website API
        await axios.post(WEBSITE_WEBHOOK_URL, {
            sellerPhone: sellerPhone,
            message: msg.body,
            senderName: msg._data.notifyName || 'WhatsApp User'
        });

        console.log(`✅ Forwarded message from ${sellerPhone} to website.`);

    } catch (error) {
        console.error('❌ Failed to forward message to website:', error.message);
        // Optional: Retry logic could go here
    }
});

// Handle disconnection
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Client was disconnected:', reason);
    isReady = false;
});

// Authentication Success
client.on('authenticated', () => {
    console.log('✅ WhatsApp Client Authenticated');
});

// Authentication Failure
client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
});

// Initialize Client
client.initialize();

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'running',
        whatsappReady: isReady,
        timestamp: new Date().toISOString()
    });
});

// Send Message Endpoint (API used by your Website)
app.post('/send-message', async (req, res) => {
    try {
        const { phone, message } = req.body;

        // Validation
        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and message are required'
            });
        }

        // Check if client is ready
        if (!isReady) {
            return res.status(503).json({
                success: false,
                error: 'WhatsApp client is not ready. Please scan QR code first.'
            });
        }

        // Format phone number
        let formattedPhone = phone.replace(/\D/g, '');

        // Add country code if not present (assuming Indian number)
        if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
            formattedPhone = '91' + formattedPhone;
        }

        // WhatsApp number format
        const whatsappNumber = formattedPhone + '@c.us';

        console.log(`📤 Sending message to ${whatsappNumber}`);

        // Send message
        const result = await client.sendMessage(whatsappNumber, message, { linkPreview: true });

        console.log('✅ Message sent successfully:', result.id._serialized);

        res.json({
            success: true,
            messageId: result.id._serialized,
            timestamp: result.timestamp
        });

    } catch (error) {
        console.error('❌ Error sending message:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send message'
        });
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`🤖 WhatsApp Bot API Server started on port ${PORT}`);
    console.log(`📡 Waiting for WhatsApp connection...`);
});

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down WhatsApp Bot...');
    await client.destroy();
    process.exit(0);
});