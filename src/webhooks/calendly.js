const axios = require('axios');

const CALENDLY_API_BASE = 'https://api.calendly.com';
const CALENDLY_TOKEN = process.env.CALENDLY_API_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

/**
 * Setup webhook in Calendly to receive notifications when meetings are scheduled
 */
async function setupCalendlyWebhook() {
  try {
    // First, get the current user's URI for webhook registration
    const userResponse = await axios.get(`${CALENDLY_API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${CALENDLY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const userUri = userResponse.data.resource.uri;

    // Create webhook subscription
    const webhookResponse = await axios.post(
      `${CALENDLY_API_BASE}/webhook_subscriptions`,
      {
        url: `${WEBHOOK_URL}/webhooks/calendly`,
        events: ['invitee.created', 'invitee.canceled'],
        organization: userUri.split('/').pop(), // Extract organization UUID
        signing_key: process.env.CALENDLY_WEBHOOK_SECRET
      },
      {
        headers: {
          'Authorization': `Bearer ${CALENDLY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Calendly webhook created:', webhookResponse.data.resource.uri);
    return {
      success: true,
      webhookUri: webhookResponse.data.resource.uri,
      message: 'Calendly webhook configured successfully'
    };
  } catch (error) {
    console.error('❌ Failed to setup Calendly webhook:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get event details from Calendly
 */
async function getEventDetails(eventUri) {
  try {
    const response = await axios.get(eventUri, {
      headers: {
        'Authorization': `Bearer ${CALENDLY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.resource;
  } catch (error) {
    console.error('Failed to get event details:', error.message);
    throw error;
  }
}

/**
 * Get invitee details from Calendly
 */
async function getInviteeDetails(inviteeUri) {
  try {
    const response = await axios.get(inviteeUri, {
      headers: {
        'Authorization': `Bearer ${CALENDLY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.resource;
  } catch (error) {
    console.error('Failed to get invitee details:', error.message);
    throw error;
  }
}

module.exports = {
  setupCalendlyWebhook,
  getEventDetails,
  getInviteeDetails
};
