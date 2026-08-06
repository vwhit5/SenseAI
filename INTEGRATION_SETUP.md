# Ellevelabs + Zoom + Calendly Integration Guide

This integration allows your Ellevelabs voice AI agent to automatically join Zoom meetings scheduled through Calendly.

## How It Works

1. **Calendly Event Created** → Someone schedules a meeting via your Calendly link
2. **Webhook Triggered** → Calendly sends a webhook notification to your server
3. **Agent Scheduled** → Your server schedules the Ellevelabs agent to join 2 minutes before the meeting
4. **Agent Joins** → At the scheduled time, the agent dials into the Zoom meeting
5. **Meeting Begins** → Your agent is now on the call with the attendee

## Setup Instructions

### Step 1: Get Your API Credentials

#### Calendly
1. Go to [Calendly Settings → Integrations](https://calendly.com/app/settings/integrations)
2. Create a Personal Access Token:
   - Click "Integrations & Apps" → "API Tokens"
   - Create a new token with `event:read` and `webhook:read` permissions
   - Copy the token and save it as `CALENDLY_API_TOKEN`

3. Generate Webhook Signing Secret:
   - This is a custom secret you create for security
   - Store it as `CALENDLY_WEBHOOK_SECRET` (e.g., a 32-character random string)

#### Zoom
1. Go to [Zoom Developer Portal](https://marketplace.zoom.us)
2. Create a Server-to-Server OAuth App:
   - Navigate to "Build" → "Create"
   - Select "Server-to-Server OAuth"
   - Fill in the app details
   - In the credentials page, copy:
     - `Client ID` → `ZOOM_CLIENT_ID`
     - `Client Secret` → `ZOOM_CLIENT_SECRET`
     - Account ID (from account page) → `ZOOM_ACCOUNT_ID`

#### Ellevelabs
1. Go to [Ellevelabs Dashboard](https://dashboard.ellevelabs.com)
2. Copy your:
   - API Key → `ELLEVELABS_API_KEY`
   - Agent ID → `ELLEVELABS_AGENT_ID`

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in all the values:

```env
# Server Configuration
PORT=3000
WEBHOOK_URL=https://your-production-domain.com

# Calendly
CALENDLY_API_TOKEN=cal_live_xxxxxxxxxxxx
CALENDLY_WEBHOOK_SECRET=sk_test_xxxxxxxx_your_secret

# Zoom
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
ZOOM_ACCOUNT_ID=your_account_id

# Ellevelabs
ELLEVELABS_API_KEY=your_api_key
ELLEVELABS_AGENT_ID=agent_xxxxxxxxxx
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Deploy Your Server

You need a publicly accessible server to receive Calendly webhooks. Options:

**Local Development (with tunneling):**
```bash
# Install ngrok or similar
ngrok http 3000
# Copy the ngrok URL and set it as WEBHOOK_URL in .env
```

**Production Deployment:**
- Deploy to Heroku, AWS, DigitalOcean, Railway, or your preferred platform
- Set `WEBHOOK_URL` to your production domain
- Run with: `npm start`

### Step 5: Register Calendly Webhook

Once your server is running, register the webhook:

```bash
curl -X POST http://localhost:3000/setup/calendly-webhook \
  -H "Content-Type: application/json"
```

You should see a response like:
```json
{
  "success": true,
  "webhookUri": "https://api.calendly.com/webhook_subscriptions/xxx",
  "message": "Calendly webhook configured successfully"
}
```

## File Structure

```
src/
├── server.js                    # Main Express server
├── webhooks/
│   └── calendly.js             # Calendly webhook handler
├── services/
│   ├── zoomScheduler.js        # Zoom meeting scheduling logic
│   ├── zoomAuth.js             # Zoom authentication
│   └── ellevelabsService.js    # Ellevelabs agent triggering
└── utils/
    └── security.js             # Webhook signature verification
```

## Testing

### 1. Test Calendly Webhook Locally

Use a tool like Postman or curl to simulate a Calendly event:

```bash
curl -X POST http://localhost:3000/webhooks/calendly \
  -H "Content-Type: application/json" \
  -H "Calendly-Webhook-Signature: base64signature" \
  -d '{
    "event": "invitee.created",
    "payload": {
      "event": "https://api.calendly.com/events/xxx",
      "invitee": "https://api.calendly.com/invitees/xxx"
    }
  }'
```

### 2. Check Server Logs

The server logs detailed information about each step:
- ✅ Webhook received and verified
- 📅 Calendly event details fetched
- 🎥 Zoom meeting extracted
- ⏰ Agent join time scheduled
- 🤖 Agent triggered
- ✅ Agent successfully joined

### 3. Health Check

```bash
curl http://localhost:3000/health
```

## Features

- ✅ Automatic agent joining 2 minutes before meeting start
- ✅ Webhook signature verification for security
- ✅ Support for canceled meetings (job cancellation)
- ✅ Zoom JWT token caching for efficiency
- ✅ Detailed logging for debugging
- ✅ Error handling and recovery

## Customization

### Change Agent Join Time

In `src/services/zoomScheduler.js`, modify this line:
```javascript
const joinTime = new Date(meetingTime.getTime() - 2 * 60 * 1000); // 2 minutes
```

Change `2 * 60 * 1000` to your desired milliseconds (e.g., `5 * 60 * 1000` for 5 minutes).

### Modify Agent Data

In `src/services/ellevelabsService.js`, customize the `custom_data` object to pass different information to your agent:

```javascript
custom_data: {
  event_title: eventTitle,
  attendee_name: inviteeName,
  attendee_email: inviteeEmail,
  // Add custom fields here
  custom_field: 'value'
}
```

### Handle Cancellations

Update `src/server.js` to handle `invitee.canceled` events:

```javascript
if (event.event === 'invitee.canceled') {
  const cancelled = cancelScheduledJoin(
    event.payload.event,
    event.payload.invitee
  );
  res.json({ success: true, cancelled });
}
```

## Troubleshooting

### Webhook not being received?
1. Check that `WEBHOOK_URL` is correct and publicly accessible
2. Verify `CALENDLY_WEBHOOK_SECRET` is the same in `.env` and Calendly settings
3. Check server logs for signature verification errors

### Agent not joining?
1. Verify `ELLEVELABS_API_KEY` and `ELLEVELABS_AGENT_ID` are correct
2. Ensure Zoom meeting has a valid meeting ID in the event details
3. Check that agent is not already in the meeting
4. Review server logs for specific error messages

### Zoom authentication failing?
1. Verify `ZOOM_CLIENT_ID` and `ZOOM_CLIENT_SECRET` are correct
2. Check that Zoom app has `meeting:read` scope
3. Ensure your Zoom account has active meetings enabled

### No events from Calendly?
1. Verify webhook is registered: `curl https://api.calendly.com/webhook_subscriptions -H "Authorization: Bearer YOUR_TOKEN"`
2. Check Calendly dashboard for webhook delivery logs
3. Ensure you're scheduling through a link that has the webhook enabled

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `WEBHOOK_URL` | Yes | Public URL where webhooks are received |
| `CALENDLY_API_TOKEN` | Yes | Calendly personal access token |
| `CALENDLY_WEBHOOK_SECRET` | Yes | Secret for webhook signature verification |
| `ZOOM_CLIENT_ID` | Yes | Zoom OAuth Client ID |
| `ZOOM_CLIENT_SECRET` | Yes | Zoom OAuth Client Secret |
| `ZOOM_ACCOUNT_ID` | Yes | Your Zoom Account ID |
| `ELLEVELABS_API_KEY` | Yes | Ellevelabs API key |
| `ELLEVELABS_AGENT_ID` | Yes | Your agent's ID |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Calendly                              │
│              (Meeting Scheduled by User)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               Your Server (Express)                         │
│          POST /webhooks/calendly                            │
│     1. Verify webhook signature                             │
│     2. Fetch event details from Calendly API                │
│     3. Extract Zoom meeting ID                              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────────┐
│  node-schedule│         │ Zoom API         │
│  2 min before │         │ Get meeting info │
│  meeting      │         └──────────────────┘
└───────┬───────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│               Ellevelabs Agent Service                      │
│  POST /agents/{id}/call with Zoom meeting ID                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Zoom Meeting        │
         │  (Agent Joins Call)   │
         └───────────────────────┘
```

## Support & Issues

For issues specific to:
- **Calendly API**: https://developer.calendly.com
- **Zoom API**: https://developers.zoom.us/docs
- **Ellevelabs**: https://docs.ellevelabs.com

## License

MIT
