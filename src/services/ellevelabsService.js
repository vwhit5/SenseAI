const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const ELLEVELABS_API_BASE = process.env.ELLEVELABS_API_BASE || 'https://api.ellevelabs.com';
const ELLEVELABS_API_KEY = process.env.ELLEVELABS_API_KEY;
const ELLEVELABS_AGENT_ID = process.env.ELLEVELABS_AGENT_ID;

/**
 * Trigger the ellevelabs agent to join a Zoom meeting
 * The agent will dial into the Zoom meeting using the provided meeting ID
 */
async function triggerEllevelabsAgent(meetingData) {
  try {
    const {
      meetingId,
      joinUrl,
      eventTitle,
      inviteeName,
      inviteeEmail,
      startTime,
      endTime
    } = meetingData;

    console.log('Triggering ellevelabs agent with data:', {
      meetingId,
      inviteeName,
      eventTitle
    });

    // Create the agent call payload
    const payload = {
      agent_id: ELLEVELABS_AGENT_ID,
      zoom_meeting_id: meetingId,
      custom_data: {
        event_title: eventTitle,
        attendee_name: inviteeName,
        attendee_email: inviteeEmail,
        meeting_start: startTime,
        meeting_end: endTime,
        join_url: joinUrl,
        call_id: uuidv4() // Unique identifier for this call
      }
    };

    // Make API call to ellevelabs to trigger the agent
    const response = await axios.post(
      `${ELLEVELABS_API_BASE}/agents/${ELLEVELABS_AGENT_ID}/call`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${ELLEVELABS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Ellevelabs agent call initiated:', response.data);

    return {
      success: true,
      callId: response.data.call_id || payload.custom_data.call_id,
      agentId: ELLEVELABS_AGENT_ID,
      meetingId: meetingId
    };
  } catch (error) {
    console.error('❌ Failed to trigger ellevelabs agent:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get agent status (optional - for monitoring)
 */
async function getAgentStatus(callId) {
  try {
    const response = await axios.get(
      `${ELLEVELABS_API_BASE}/calls/${callId}`,
      {
        headers: {
          'Authorization': `Bearer ${ELLEVELABS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to get agent status:', error.message);
    throw error;
  }
}

/**
 * End agent call (optional - for cleanup)
 */
async function endAgentCall(callId) {
  try {
    const response = await axios.post(
      `${ELLEVELABS_API_BASE}/calls/${callId}/end`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${ELLEVELABS_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Agent call ended:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to end agent call:', error.message);
    throw error;
  }
}

module.exports = {
  triggerEllevelabsAgent,
  getAgentStatus,
  endAgentCall
};
