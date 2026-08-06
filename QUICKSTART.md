# Quick Start Guide

Get your Ellevelabs agent integrated with Zoom & Calendly in 5 minutes.

## Prerequisites

- Node.js 14+ installed
- Calendly account with API access
- Zoom account with app creation capability
- Ellevelabs account with active agent

## 1. Get Your Credentials (5 min)

### Calendly
1. Visit: https://calendly.com/app/settings/integrations
2. Click "API Tokens" → "New Token"
3. Name it "Ellevelabs Integration"
4. Copy and save the token

### Zoom
1. Visit: https://marketplace.zoom.us
2. Click "Develop" → "Build App" → "Server-to-Server OAuth"
3. Fill in app details
4. Copy: **Client ID**, **Client Secret**, and **Account ID**

### Ellevelabs
1. Visit your dashboard
2. Copy your **API Key** and **Agent ID**

## 2. Setup Project (2 min)

```bash
# Clone and enter directory
cd /home/user/SenseAI

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## 3. Configure .env (2 min)

Edit `.env` with your credentials:

```env
WEBHOOK_URL=https://your-domain.com
CALENDLY_API_TOKEN=cal_live_xxxxx
CALENDLY_WEBHOOK_SECRET=sk_test_xxxxx
ZOOM_CLIENT_ID=xxxxx
ZOOM_CLIENT_SECRET=xxxxx
ZOOM_ACCOUNT_ID=xxxxx
ELLEVELABS_API_KEY=xxxxx
ELLEVELABS_AGENT_ID=agent_xxxxx
```

## 4. Deploy Server (Choose One)

### Option A: Local Testing with ngrok
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Expose with ngrok
npx ngrok http 3000
# Copy ngrok URL and update WEBHOOK_URL in .env
```

### Option B: Production Deployment
```bash
# Deploy to Heroku
heroku create your-app-name
git push heroku main

# Set environment variables
heroku config:set WEBHOOK_URL=https://your-app-name.herokuapp.com
heroku config:set CALENDLY_API_TOKEN=xxxxx
# ... set all other variables
```

## 5. Register Webhook (1 min)

```bash
curl -X POST https://your-domain.com/setup/calendly-webhook
```

You should see:
```json
{
  "success": true,
  "message": "Calendly webhook configured successfully"
}
```

## Done! 🎉

Now when someone schedules a meeting on your Calendly:
1. Webhook triggers automatically
2. Agent joins 2 minutes before meeting start
3. Your agent is on the call!

## Test It

1. Schedule a meeting on your Calendly
2. Watch server logs for: `✅ Agent successfully joined the meeting!`
3. Check your Zoom meeting - agent should be there!

## Next Steps

- Read [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md) for detailed setup
- Customize agent join time in `src/services/zoomScheduler.js`
- Add custom data fields in `src/services/ellevelabsService.js`
- Handle meeting cancellations in `src/server.js`

## Troubleshooting

**Server won't start?**
```bash
npm install
npm start
```

**Webhook not received?**
- Check WEBHOOK_URL is publicly accessible
- Verify CALENDLY_WEBHOOK_SECRET is correct
- Check server logs

**Agent won't join?**
- Verify Zoom meeting has valid meeting ID
- Check ELLEVELABS_API_KEY is correct
- Review server error logs

See [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md) for more troubleshooting.
