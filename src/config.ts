import { config } from "dotenv";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { Either, isLeft } from "fp-ts/lib/Either";

import { logger } from "./log";
import { Errors } from "io-ts";

const ScheduleEnvironmentCodec = t.type({
  GOOGLE_SPREADSHEET_ID: t.string,
  SCHEDULE_SHEET_NAME: t.string,
  MEETINGS_SHEET_NAME: t.string,
  VIRTUAL_OFFICE_BASE_URL: t.string,
  NEWBIE_VIRTUAL_OFFICE_BASE_URL: t.string,
  VIRTUAL_OFFICE_USERNAME: t.string,
  VIRTUAL_OFFICE_PASSWORD: t.string,
  GOOGLE_SERVICE_ACCOUNT_MAIL: t.string,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: t.string,
  ENABLE_ROOM_JOIN_MINUTES_BEFORE_START: t.string,
  SLACK_BASE_URL: t.union([t.string, t.undefined]),
  SLACK_TOKEN: t.union([t.string, t.undefined]),
  SLACK_ENABLE_RATE_LIMITING: t.union([t.literal("true"), t.literal("false"), t.undefined]),
  SCHEDULE_DATE: t.union([t.string, t.undefined]),
  CONFLUENCE_BASE_URL: t.union([t.string, t.undefined]),
  CONFLUENCE_USER: t.union([t.string, t.undefined]),
  CONFLUENCE_PASSWORD: t.union([t.string, t.undefined]),
  CONFLUENCE_SPACE_KEY: t.union([t.string, t.undefined]),
  CONFLUENCE_PARENT_PAGE_ID: t.union([t.string, t.undefined]),
  CONFLUENCE_TEMPLATE_PAGE_ID: t.union([t.string, t.undefined]),
});

const CreateMeetingsEnvironmentCodec = t.type({
  GOOGLE_SPREADSHEET_ID: t.string,
  MEETINGS_SHEET_NAME: t.string,
  ZOOM_JWT: t.string,
  USER_EMAIL_FILE: t.string,
  MEETING_TOPIC: t.string,
  MEETING_PASSWORD: t.string,
  MEETING_START_TIME: t.string,
  MEETING_DURATION: t.string,
  GOOGLE_SERVICE_ACCOUNT_MAIL: t.string,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: t.string,
});

export type ScheduleEnvironment = t.TypeOf<typeof ScheduleEnvironmentCodec>;
export type CreateMeetingsEnvironment = t.TypeOf<typeof CreateMeetingsEnvironmentCodec>;

function parseConfig<T>(decode: (env: any) => Either<Errors, T>): T {
  logger.info("Loading dotenv config from context");
  const result = config();
  if (result.error) {
    throw result.error;
  }

  const configuration = decode(result.parsed);
  if (isLeft(configuration)) {
    throw Error(`Parsing dotenv config failed: ${PathReporter.report(configuration)}`);
  }

  const env = configuration.right;
  logger.info("Successfully parsed dotenv config", env);
  return env;
}

export function parseScheduleConfig(): ScheduleEnvironment {
  return parseConfig((parsed) => ScheduleEnvironmentCodec.decode(parsed));
}

export function parseCreateMeetingsConfig(): CreateMeetingsEnvironment {
  return parseConfig((parsed) => CreateMeetingsEnvironmentCodec.decode(parsed));
}
