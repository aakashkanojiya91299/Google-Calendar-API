// Require google from googleapis package.
const { google } = require('googleapis')
const axios = require('axios');

// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth

// Create a new instance of oAuth and set our Client ID & Client Secret.
const oAuth2Client = new OAuth2(
  // "839926760863-l4onoj6lu1lp5v5ti5e91n52hgn079kb.apps.googleusercontent.com",
  // "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"
)

// Call the setCredentials method on our oAuth2Client instance and set our refresh token.
oAuth2Client.setCredentials({
  // access_token: "ya29.a0Ad52N39ii6ywBlPRo-hKgfD9Jtd_HHXX81-OsWWK3g7-bHThte4w1BLb7bcMyVW6c7M9cuypL3RGurJrYuE_PBKJ2QXE8q98kwmWbhs4xScZrs213QUfQ46-I-n7nKhc6nkd1VFAZZJopxUjqb7BHRPE9x_a-PzjcgaCgYKAdQSARMSFQHGX2MiwxOWPtPgCf_0i9BVPfCA4Q0169",
})

// Create a new calender instance.
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

// Create a new event start date instance for temp uses in our calendar.
const eventStartTime = new Date()
eventStartTime.setDate(eventStartTime.getDay() + 2)

// Create a new event end date instance for temp uses in our calendar.
const eventEndTime = new Date()
eventEndTime.setDate(eventEndTime.getDay() + 4)
eventEndTime.setMinutes(eventEndTime.getMinutes() + 45)

// Create a dummy event for temp uses in our calendar
const event = {
  summary: `Meeting with David`,
  location: `3595 California St, San Francisco, CA 94118`,
  description: `Meet with David to talk about the new client project and how to integrate the calendar for booking.`,
  colorId: 1,
  start: {
    dateTime: eventStartTime,
    timeZone: 'America/Denver',
  },
  end: {
    dateTime: eventEndTime,
    timeZone: 'America/Denver',
  },
}

const addEventToCalendar = async (accessToken) => {
  try {
    const event = {
      summary: 'Sample Event',
      start: {
        dateTime: '2024-04-18T10:00:00',
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: '2024-04-18T12:00:00',
        timeZone: 'America/New_York',
      },
      conferenceData: {
        createRequest: {
          requestId: 'random-id',
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    // Send event to Google Calendar API
    const response = await axios.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', event, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // console.log('Event added:', response.data);
  } catch (error) {
    console.error('Error adding event:', error);
  }
};

const scheduleGoogleMeet = async (accessToken) => {
  const event = {
    summary: 'Google Meet Event', // Title of the event
    start: {
      dateTime: '2024-04-20T10:00:00', // Start time of the event in ISO 8601 format
      timeZone: 'America/New_York', // Time zone for the start time
    },
    end: {
      dateTime: '2024-04-20T12:00:00', // End time of the event in ISO 8601 format
      timeZone: 'America/New_York', // Time zone for the end time
    },
    // Include a conferenceData field to automatically generate a Google Meet link
    conferenceData: {
      createRequest: {
        requestId: 'random-id', // Unique ID for the conference request
        conferenceSolutionKey: { type: 'hangoutsMeet' }, // Specifies that the conference is a Google Meet
      },
    },
    // Specify email notifications
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 30 }, // Email reminder 60 minutes before the event
      ],
    },
    attendees: [
      { email: 'manasi.thalkar@stspl.com' },
      { email: 'sumeet.vishwakarma@stspl.com' },
      // Add more guests as needed
    ],
  };

  try {
    const response = await axios.post(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events', // API endpoint for creating events
      event, // The event object to be created
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Authorization header with the access token
          'Content-Type': 'application/json', // Content-Type header for JSON payload
        },
        params: {
          conferenceDataVersion: 1,
        },
      },

    );
    console.log('Google Meet event scheduled successfully:', response.data);
    sendInvitationEmail(event, accessToken, response.data)
    return response.data;
  } catch (error) {
    console.error('Error scheduling Google Meet event:', error);
    throw error;
  }
};

// Function to send invitation email
const sendInvitationEmail = async (event, accessToken, calendarInvitaion) => {
  const emailContent = `
    <p>You're invited to a Google Meet event:</p>
    <p>Title: ${event.summary}</p>
    <p>Start Time: ${event.start.dateTime}</p>
    <p>End Time: ${event.end.dateTime}</p>
    <p>Google Meet Link: ${calendarInvitaion?.hangoutLink}</p>
  `;

  try {
    await axios.post(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        raw: Buffer.from(`From: Your Email <youremail@example.com>\r\nTo: ${event.attendees.map(attendee => attendee.email).join(', ')}\r\nSubject: Invitation to Google Meet Event\r\nContent-Type: text/html; charset=utf-8\r\nMIME-Version: 1.0\r\n\r\n${emailContent}`).toString('base64'),
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Invitation emails sent successfully');
  } catch (error) {
    console.error('Error sending invitation emails:', error);
    throw error;
  }
};
addEventToCalendar("ya29.a0Ad52N396xwx5HFr8_xJ641BGzmGTiZ4xFT1DXhIsAKS_5QBPlInAdVWW6G-x1QrPo661045gbB6BF0TaQxyUcBQLw7UN6zG3VU2xoPpW8OzZOIjFtiWrZIPdsT4k4m4aRhWI9ttbzS6QtrDd8h2gm2TYU4Q12m2L4waCgYKAUQSARMSFQHGX2MiuNgk7w9xe1hxGOmVvWzqLQ0169")
scheduleGoogleMeet("ya29.a0Ad52N396xwx5HFr8_xJ641BGzmGTiZ4xFT1DXhIsAKS_5QBPlInAdVWW6G-x1QrPo661045gbB6BF0TaQxyUcBQLw7UN6zG3VU2xoPpW8OzZOIjFtiWrZIPdsT4k4m4aRhWI9ttbzS6QtrDd8h2gm2TYU4Q12m2L4waCgYKAUQSARMSFQHGX2MiuNgk7w9xe1hxGOmVvWzqLQ0169")
