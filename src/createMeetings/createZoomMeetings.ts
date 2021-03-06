import { CreateMeetingsEnvironment } from "../config";
import { logger } from "../log";
import { createMeeting, getAllUpcomingMeetingsForUser, ZoomMeeting, ZoomUser } from "./zoom";

/* eslint-disable @typescript-eslint/camelcase */
// Zoom API uses snake_case therefore ignore in this file

async function createOrGetMeeting(user: ZoomUser, config: CreateMeetingsEnvironment): Promise<ZoomMeeting> {
  const meetings = await getAllUpcomingMeetingsForUser(user.id, config.ZOOM_JWT);
  const existingMeeting = meetings.find((meeting) => meeting.topic === config.MEETING_TOPIC);
  if (existingMeeting) {
    logger.info("Meeting already exists", { id: existingMeeting.id });
    return existingMeeting;
  }

  logger.info("Meeting not found, creating...");
  return createMeeting(
    user.id,
    {
      topic: config.MEETING_TOPIC,
      type: 3,
      password: config.MEETING_PASSWORD,
      tracking_fields: [{ field: "origin", value: "virtual-office-meeting-scheduler" }],
      settings: { join_before_host: true, participant_video: true, mute_upon_entry: false, waiting_room: false },
    },
    config.ZOOM_JWT
  );
}

export interface Meeting {
  user: ZoomUser;
  meeting: ZoomMeeting;
}

export async function createZoomMeetings({
  config,
  zoomUsers,
}: {
  config: CreateMeetingsEnvironment;
  zoomUsers: ZoomUser[];
}): Promise<Meeting[]> {
  const meetings: Meeting[] = [];
  for (const user of zoomUsers) {
    logger.info("Creating or retrieving zoom meeting for user", {
      id: user.id,
      email: user.email,
    });
    const meeting = await createOrGetMeeting(user, config);
    meetings.push({ user, meeting });
  }
  return meetings;
}
