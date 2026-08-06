# Sense AI + Ellevelabs Integration

Automatically deploy your Ellevelabs AI voice agent to Zoom meetings scheduled via Calendly.

## 🎯 What This Does

When someone books a meeting through your Calendly link:
- Your Ellevelabs agent **automatically joins the Zoom call**
- The agent joins **2 minutes before** the scheduled start time
- No manual intervention needed
- Works for unlimited meetings

## ⚡ Quick Start

See [QUICKSTART.md](./QUICKSTART.md) for a 5-minute setup.

For detailed setup with screenshots and troubleshooting, see [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md).

## 🏗️ Architecture

```
Calendly Booking
    ↓
Webhook Notification
    ↓
Verify Signature & Fetch Details
    ↓
Extract Zoom Meeting ID
    ↓
Schedule Agent Join (2 min before)
    ↓
Trigger Ellevelabs Agent
    ↓
Agent Joins Zoom Meeting
```

## 📦 What You Get

- ✅ **Webhook Handler** - Receives Calendly events securely
- ✅ **Zoom Integration** - Extracts meeting details and IDs
- ✅ **Scheduling Engine** - Times agent to join automatically
- ✅ **Ellevelabs Trigger** - Initiates agent calls via API
- ✅ **Security** - HMAC signature verification
- ✅ **Error Handling** - Robust logging and recovery
- ✅ **Production Ready** - Deployable to cloud services

## 🚀 Deployment Options

- **Heroku** - `git push heroku main`
- **DigitalOcean** - Docker container ready
- **AWS Lambda** - Compatible with Serverless Framework
- **Railway** - Connect GitHub repo
- **Local** - For testing with ngrok

## 🔧 Tech Stack

- **Runtime**: Node.js with Express
- **Scheduling**: node-schedule
- **HTTP Client**: axios
- **Auth**: JWT for Zoom, Bearer tokens for APIs
- **Security**: HMAC-SHA256 for webhooks

## 📁 File Structure

```
├── src/
│   ├── server.js                    # Main Express server
│   ├── webhooks/
│   │   └── calendly.js             # Calendly integration
│   ├── services/
│   │   ├── zoomScheduler.js        # Meeting scheduling
│   │   ├── zoomAuth.js             # Zoom OAuth
│   │   └── ellevelabsService.js    # Agent triggering
│   └── utils/
│       └── security.js             # Security functions
├── .env.example                     # Environment template
├── package.json                     # Dependencies
├── QUICKSTART.md                    # 5-minute setup
├── INTEGRATION_SETUP.md             # Detailed guide
└── README.md                        # This file
```

## 🔐 Security

- ✅ **Webhook Signature Verification** - HMAC-SHA256 validation
- ✅ **JWT Tokens** - Zoom Server-to-Server OAuth
- ✅ **API Key Protection** - Stored in environment variables
- ✅ **No Credentials in Code** - All secrets externalized

## 🎛️ Configuration

All configuration happens via `.env` file:

```env
# Server
PORT=3000
WEBHOOK_URL=https://your-domain.com

# Calendly
CALENDLY_API_TOKEN=your_token
CALENDLY_WEBHOOK_SECRET=your_secret

# Zoom
ZOOM_CLIENT_ID=your_id
ZOOM_CLIENT_SECRET=your_secret
ZOOM_ACCOUNT_ID=your_account_id

# Ellevelabs
ELLEVELABS_API_KEY=your_key
ELLEVELABS_AGENT_ID=your_agent_id
```

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `WEBHOOK_URL` | Public URL for receiving Calendly webhooks |
| `CALENDLY_API_TOKEN` | Your Calendly Personal Access Token |
| `CALENDLY_WEBHOOK_SECRET` | Secret for webhook signature verification |
| `ZOOM_CLIENT_ID` | Zoom OAuth Client ID |
| `ZOOM_CLIENT_SECRET` | Zoom OAuth Client Secret |
| `ZOOM_ACCOUNT_ID` | Your Zoom Account ID |
| `ELLEVELABS_API_KEY` | Your Ellevelabs API Key |
| `ELLEVELABS_AGENT_ID` | Your Agent's ID |
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | Environment: development/production |

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 14+
- Active accounts: Calendly, Zoom, Ellevelabs

### 2. Installation
```bash
npm install
```

### 3. Configuration
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Run
```bash
npm start
# Server runs on http://localhost:3000
```

### 5. Deploy
```bash
# Deploy to production (Heroku example)
git push heroku main
```

### 6. Setup Webhook
```bash
curl -X POST https://your-domain.com/setup/calendly-webhook
```

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide
- **[INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md)** - Detailed setup with screenshots
- **[Calendly API Docs](https://developer.calendly.com)**
- **[Zoom API Docs](https://developers.zoom.us)**
- **[Ellevelabs Docs](https://docs.ellevelabs.com)**

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### Test Webhook
```bash
curl -X POST http://localhost:3000/webhooks/calendly \
  -H "Content-Type: application/json" \
  -d '{"event":"invitee.created","payload":{}}'
```

## 🐛 Troubleshooting

### Webhooks not received?
1. Check `WEBHOOK_URL` is publicly accessible
2. Verify `CALENDLY_WEBHOOK_SECRET` is correct
3. Review server logs for signature errors

### Agent not joining?
1. Verify `ELLEVELABS_API_KEY` is correct
2. Check Zoom meeting has valid ID
3. Review server logs for API errors

### Zoom auth failing?
1. Verify `ZOOM_CLIENT_ID` and `ZOOM_CLIENT_SECRET`
2. Check app has correct OAuth scopes
3. Verify `ZOOM_ACCOUNT_ID` is correct

See [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md#troubleshooting) for more help.

## 🔄 How It Works

1. **Event Received**: Calendly sends webhook when meeting is scheduled
2. **Verified**: Server validates webhook signature
3. **Fetched**: Event and invitee details retrieved from Calendly API
4. **Extracted**: Zoom meeting ID extracted from event
5. **Scheduled**: Agent join scheduled 2 minutes before start
6. **Triggered**: At join time, Ellevelabs API called to initiate agent
7. **Joined**: Agent voice joins the Zoom meeting

## 🛠️ Customization

### Change Join Time
Edit `src/services/zoomScheduler.js`:
```javascript
const joinTime = new Date(meetingTime.getTime() - 2 * 60 * 1000); // 2 minutes
```

### Add Custom Agent Data
Edit `src/services/ellevelabsService.js`:
```javascript
custom_data: {
  event_title: eventTitle,
  attendee_name: inviteeName,
  // Add your custom fields
  custom_field: 'value'
}
```

### Handle Cancellations
Edit `src/server.js` to process `invitee.canceled` events.

## 📊 Monitoring

Server logs show detailed information:

```
✅ Ellevelabs agent call initiated
📅 Processing Calendly event...
🎥 Zoom meeting found: https://zoom.us/j/xxx
⏰ Agent scheduled to join at 2026-08-06T14:28:00Z
🤖 Triggering ellevelabs agent to join meeting...
✅ Agent successfully joined the meeting!
```

## 📜 License

MIT

## 🤝 Support

For issues with:
- **This Integration**: Check [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md#troubleshooting)
- **Calendly**: https://developer.calendly.com
- **Zoom**: https://developers.zoom.us/docs
- **Ellevelabs**: https://docs.ellevelabs.com

## 🎓 Learn More

- [Calendly API Documentation](https://developer.calendly.com)
- [Zoom Developers](https://developers.zoom.us)
- [Ellevelabs Platform](https://www.ellevelabs.com)

---

**Questions?** Check the [detailed integration guide](./INTEGRATION_SETUP.md) or the [quick start](./QUICKSTART.md).
