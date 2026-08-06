const crypto = require('crypto');

/**
 * Verify Calendly webhook signature
 * Calendly sends a signature header that we need to validate
 */
function verifyWebhookSignature(req) {
  // Get the signature from headers
  const signature = req.get('Calendly-Webhook-Signature');

  if (!signature) {
    console.warn('❌ No webhook signature provided');
    return false;
  }

  // Get the request body as a string
  const body = JSON.stringify(req.body);

  // Create HMAC using your webhook signing secret
  const secret = process.env.CALENDLY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('❌ CALENDLY_WEBHOOK_SECRET not configured');
    return false;
  }

  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');

  // Compare signatures (use timing-safe comparison)
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );

  if (!isValid) {
    console.warn('❌ Invalid webhook signature');
  }

  return isValid;
}

module.exports = {
  verifyWebhookSignature
};
