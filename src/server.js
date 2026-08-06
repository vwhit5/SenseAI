const express = require('express');
const dotenv = require('dotenv');
const { setupCalendlyWebhook } = require('./webhooks/calendly');
const { scheduleAgentJoin } = require('./services/zoomScheduler');
const { verifyWebhookSignature } = require('./utils/security');

dotenv.config();

const app = express();
app.use(express.json());

// Middleware for webhook verification
app.use('/webhooks', (req, res, next) => {
  if (!verifyWebhookSignature(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Calendly webhook endpoint
app.post('/webhooks/calendly', async (req, res) => {
  try {
    console.log('Received Calendly webhook:', req.body);

    const event = req.body;

    if (event.event === 'invitee.created') {
      // Schedule the ellevelabs agent to join the Zoom call
      await scheduleAgentJoin(event.payload);
      res.json({ success: true, message: 'Agent scheduled to join meeting' });
    } else {
      res.json({ success: true, message: 'Event received' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup webhook in Calendly (call this once on startup)
app.post('/setup/calendly-webhook', async (req, res) => {
  try {
    const result = await setupCalendlyWebhook();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Webhook URL: ${process.env.WEBHOOK_URL}/webhooks/calendly`);
});
