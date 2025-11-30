const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

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

// QR Code Generation
client.on('qr', (qr) => {
    console.log('📱 Scan this QR Code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
    console.log('\nOpen WhatsApp on your phone -> Linked Devices -> Link a Device');
});

// Client Ready
client.on('ready', () => {
    console.log('✅ WhatsApp Bot is Ready!');
    console.log('🚀 Bot server running on http://localhost:' + PORT);
    isReady = true;
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

// Send Message Endpoint
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

        // Format phone number (remove spaces, dashes, etc.)
        let formattedPhone = phone.replace(/\D/g, '');

        // Add country code if not present (assuming Indian number)
        if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
            formattedPhone = '91' + formattedPhone;
        }

        // WhatsApp number format: countrycode + number + @c.us
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
