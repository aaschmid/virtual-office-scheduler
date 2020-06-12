# virtual-office-scheduler
Scheduler for https://github.com/TNG/virtual-office

## Session scheduler
* Parse Google Drive Spreadsheet
* Convert data structure to export JSON
  * Generate random join groups
  * Split up rooms with multiple meeting ids
  * Generate room join links
  * Add a given date to the start time of the rooms
* Export to Virtual Office

Start via
```
npm run start:scheduleSessions
```

Required env variables:
* GOOGLE_SPREADSHEET_ID
* GOOGLE_SHEET_NAME
* VIRTUAL_OFFICE_BASE_URL
* VIRTUAL_OFFICE_USERNAME
* VIRTUAL_OFFICE_PASSWORD

## Meeting scheduler
Meeting scheduler for https://github.com/TNG/virtual-office

* Use a list of users to schedule zoom meetings

Start via
```
npm run start:start:createMeetings
```

Required env variables:
* ZOOM_JWT
* USER_EMAIL_FILE
* MEETING_TOPIC
* MEETING_PASSWORD
* MEETING_START_TIME
* MEETING_DURATION
* GOOGLE_CLIENT_ID
* GOOGLE_CLIENT_SECRET