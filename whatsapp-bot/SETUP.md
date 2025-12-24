# WhatsApp Bot Setup Guide

## 🚀 Quick Start

This is a **FREE** WhatsApp messaging solution using `whatsapp-web.js`. No need to pay for Twilio or Meta's official API!

### Prerequisites

- Node.js installed on your computer
- A WhatsApp account on your phone
- Stable internet connection

---

## 📦 Installation

### Step 1: Install Dependencies

Navigate to the `whatsapp-bot` directory and install packages:

```bash
cd whatsapp-bot
npm install
```

This will install:
- `whatsapp-web.js` - WhatsApp Web client library
- `qrcode-terminal` - Display QR codes in terminal
- `express` - Web server framework
- `cors` - Enable cross-origin requests
- `body-parser` - Parse JSON request bodies

---

## 🔧 Running the Bot

### Step 2: Start the Bot Server

From the `whatsapp-bot` directory:

```bash
npm start
```

or

```bash
node index.js
```

### Step 3: Scan QR Code

1. A QR code will appear in your terminal
2. Open WhatsApp on your phone
3. Go to **Settings** → **Linked Devices**
4. Tap **Link a Device**
5. Scan the QR code shown in the terminal

### Step 4: Wait for Ready Message

You should see:

```
✅ WhatsApp Bot is Ready!
🚀 Bot server running on http://localhost:4000
```

---

## 🌐 Running Your Next.js App

In a **separate terminal**, navigate to your main project and start the Next.js server:

```bash
cd d:\youthbharatwholesalemart
npm run dev
```

Now you have **two servers running**:
1. **Terminal 1**: WhatsApp Bot (Port 4000)
2. **Terminal 2**: Next.js App (Port 3000)

---

## 📡 API Usage

### Send a Message

**Endpoint**: `POST http://localhost:4000/send-message`

**Request Body**:
```json
{
  "phone": "9876543210",
  "message": "Hello from YouthBharat Wholesalemart!"
}
```

**Phone Number Formats Supported**:
- `9876543210` (10-digit Indian number - will auto-add +91)
- `919876543210` (with country code)
- `+91 9876543210` (with country code and spaces)

**Response** (Success):
```json
{
  "success": true,
  "messageId": "true_919876543210@c.us_ABCD123",
  "timestamp": 1234567890
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "WhatsApp client is not ready"
}
```

### Check Bot Status

**Endpoint**: `GET http://localhost:4000/health`

**Response**:
```json
{
  "status": "running",
  "whatsappReady": true,
  "timestamp": "2025-11-24T02:50:00.000Z"
}
```

---

## 🔗 Integration with Next.js

Your Next.js app can send messages using the `/api/chat/send` route:

```typescript
// Example: Sending a message from your frontend
const response = await fetch('/api/chat/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '9876543210',
    message: 'Hello World!',
    customerName: 'John Doe' // Optional
  })
});

const data = await response.json();
console.log(data);
```

---

## 🛠️ Troubleshooting

### QR Code Not Appearing
- Make sure you're in the `whatsapp-bot` directory
- Check if port 4000 is available
- Try restarting the bot server

### "WhatsApp client is not ready"
- Wait a few seconds after scanning the QR code
- Check if your phone has internet connection
- Restart the bot server and scan again

### Message Not Sending
- Verify the phone number format
- Check if the recipient has WhatsApp installed
- Ensure your WhatsApp account is active

### Bot Disconnects
- Keep the terminal window open
- Don't close the bot server
- If disconnected, restart and scan QR code again

---

## ⚠️ Important Notes

1. **Keep Bot Running**: The bot server must stay running to maintain the WhatsApp Web session
2. **Re-authentication**: If you stop the bot, you'll need to scan the QR code again
3. **Terms of Service**: This uses an unofficial WhatsApp library. Use at your own risk
4. **Rate Limits**: WhatsApp may block your account if you send too many messages too quickly
5. **Session Data**: Authentication data is stored in `.wwebjs_auth` folder (don't delete it)

---

## 💰 Cost Comparison

| Service | Cost |
|---------|------|
| Twilio WhatsApp API | ~₹0.50 per message |
| Meta WhatsApp Business API | ~₹0.30 per message |
| **whatsapp-web.js** | **₹0 (FREE!)** |

---

## 🔄 Production Deployment

For production use:

1. **Deploy on a Server**: Use a VPS (DigitalOcean, AWS, etc.) to keep the bot running 24/7
2. **Use PM2**: Keep the bot alive with process manager
   ```bash
   npm install -g pm2
   pm2 start index.js --name whatsapp-bot
   pm2 save
   ```
3. **Environment Variables**: Add `WHATSAPP_BOT_URL` to your `.env.local`
4. **HTTPS**: Use SSL certificates for secure communication

---

## 📞 Support

If you encounter issues:
1. Check the terminal logs for error messages
2. Verify both servers are running
3. Test the `/health` endpoint
4. Restart both servers if needed

Happy messaging! 🎉
