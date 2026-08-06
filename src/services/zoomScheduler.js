const axios = require('axios');
const schedule = require('node-schedule');
const { getZoomAccessToken } = require('./zoomAuth');
const { triggerEllevelabsAgent } = require('./ellevelabsService');
const { getEventDetails, getInviteeDetails } = require('../webhooks/calendly');

const scheduledJobs = new Map();

/**
 * Parse meeting link from Calendly event to extract Zoom meeting ID
 */
function extractZoomMeetingId(eventDescription) {
  // Zoom meeting links are in format: https://zoom.us/j/MEETING_ID
  const zoomMatch = eventDescription?.match(/zoom\.us\/j\/(\d+)/);
  return zoomMatch ? zoomMatch[1] : null;
}

/**
 * Get Zoom meeting details (join link, etc.)
 */
async function getZoomMeetingDetails(meetingId) {
  try {
    const accessToken = await getZoomAccessToken();
    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to get Zoom meeting details:', error.message);
    throw error;
  }
}

/**
 * Schedule the ellevelabs agent to join a Zoom meeting at the scheduled time
 * This is triggered when a Calendly event is created
 */
async function scheduleAgentJoin(calendlyPayload) {
  try {
    console.log('📅 Processing Calendly event...');

    // Extract event URI and invitee URI from payload
    const eventUri = calendlyPayload.event;
    const inviteeUri = calendlyPayload.invitee;

    // Get detailed event and invitee information
    const [eventDetails, inviteeDetails] = await Promise.all([
      getEventDetails(eventUri),
      getInviteeDetails(inviteeUri)
    ]);

    console.log('Event Details:', {
      title: eventDetails.name,
      startTime: eventDetails.start_time,
      endTime: eventDetails.end_time
    });

    console.log('Invitee:', {
      name: inviteeDetails.name,
      email: inviteeDetails.email
    });

    // Extract Zoom meeting ID from event location/description
    const zoomMeetingId = extractZoomMeetingId(
      eventDetails.location?.join_url || eventDetails.description
    );

    if (!zoomMeetingId) {
      console.log('⚠️  No Zoom meeting found in event details');
      return;
    }

    // Get Zoom meeting details
    const meetingDetails = await getZoomMeetingDetails(zoomMeetingId);
    console.log('🎥 Zoom meeting found:', meetingDetails.join_url);

    // Calculate when to join (2 minutes before meeting starts)
    const meetingTime = new Date(eventDetails.start_time);
    const joinTime = new Date(meetingTime.getTime() - 2 * 60 * 1000);

    const jobKey = `${eventUri}-${inviteeUri}`;

    // Cancel any existing scheduled job for this meeting
    if (scheduledJobs.has(jobKey)) {
      scheduledJobs.get(jobKey).cancel();
    }

    // Schedule the agent to join
    const job = schedule.scheduleJob(joinTime, async () => {
      try {
        console.log('🤖 Triggering ellevelabs agent to join meeting...');

        await triggerEllevelabsAgent({
          meetingId: zoomMeetingId,
          joinUrl: meetingDetails.join_url,
          eventTitle: eventDetails.name,
          inviteeName: inviteeDetails.name,
          inviteeEmail: inviteeDetails.email,
          startTime: eventDetails.start_time,
          endTime: eventDetails.end_time
        });

        console.log('✅ Agent successfully joined the meeting!');
        scheduledJobs.delete(jobKey);
      } catch (error) {
        console.error('❌ Failed to trigger agent:', error.message);
      }
    });

    scheduledJobs.set(jobKey, job);

    console.log(`⏰ Agent scheduled to join at ${joinTime.toISOString()}`);
    console.log(`   Meeting starts at: ${meetingTime.toISOString()}`);

    return {
      success: true,
      scheduledTime: joinTime,
      meetingTime: meetingTime,
      zoomMeetingId: zoomMeetingId
    };
  } catch (error) {
    console.error('❌ Error scheduling agent join:', error.message);
    throw error;
  }
}

/**
 * Cancel scheduled agent join for a meeting (e.g., if meeting is canceled)
 */
function cancelScheduledJoin(eventUri, inviteeUri) {
  const jobKey = `${eventUri}-${inviteeUri}`;
  if (scheduledJobs.has(jobKey)) {
    scheduledJobs.get(jobKey).cancel();
    scheduledJobs.delete(jobKey);
    console.log(`Canceled scheduled agent join for ${jobKey}`);
    return true;
  }
  return false;
}

module.exports = {
  scheduleAgentJoin,
  cancelScheduledJoin,
  extractZoomMeetingId,
  getZoomMeetingDetails
};
