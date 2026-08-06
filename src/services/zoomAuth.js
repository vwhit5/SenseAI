const axios = require('axios');
const jwt = require('jsonwebtoken');

let cachedToken = null;
let tokenExpiry = null;

/**
 * Generate JWT token for Zoom Server-to-Server OAuth
 * This uses your Zoom Account ID, Client ID, and Client Secret
 */
function generateZoomJWT() {
  const payload = {
    iss: process.env.ZOOM_CLIENT_ID,
    exp: Math.floor(Date.now() / 1000) + 3600 // Valid for 1 hour
  };

  return jwt.sign(payload, process.env.ZOOM_CLIENT_SECRET, { algorithm: 'HS256' });
}

/**
 * Get Zoom access token using Server-to-Server OAuth
 */
async function getZoomAccessToken() {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const jwtToken = generateZoomJWT();

    const response = await axios.post(
      'https://zoom.us/oauth/token',
      {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwtToken
      }
    );

    cachedToken = response.data.access_token;
    // Cache for 55 minutes (token expires in 60)
    tokenExpiry = Date.now() + (55 * 60 * 1000);

    console.log('🔐 Zoom access token refreshed');
    return cachedToken;
  } catch (error) {
    console.error('Failed to get Zoom access token:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  getZoomAccessToken,
  generateZoomJWT
};
