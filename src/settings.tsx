/// <reference types="vite-plugin-comlink/client" />

import { createRoot } from "react-dom/client";
import React from "react";
import { Container, TextField, Typography, Box, Button } from "@mui/material";
import { useLocalStorage } from "usehooks-ts";

function Options() {
  const [account, setAccount] = useLocalStorage("account", "");
  const [calendarUrl, setCalendarUrl] = useLocalStorage("calendarUrl", "");
  const [updateIntervalMinutes, setUpdateIntervalMinutes] = useLocalStorage(
    "updateIntervalMinutes",
    5
  );
  const [leadTimeMinutes, setLeadTimeMinutes] = useLocalStorage(
    "leadTimeMinutes",
    2.5
  );

  async function handleTest() {
    try {
      const minDate = new Date(2023, 2, 24, 0, 0, 0, 0);
      const maxDate = new Date(2023, 2, 25, 0, 0, 0, 0);

      const worker = new ComlinkWorker<typeof import("./meeting")>(
        new URL("./meeting", import.meta.url)
      );

      console.log("fetching");
      console.time("fetched");
      const ical = await fetch(calendarUrl).then((response) => response.text());
      console.timeEnd("fetched");

      console.log("parsing");
      console.time("parsed");
      const meetings = await worker.parseAndExtractMeetingsInTimeRange(
        ical,
        account,
        minDate,
        maxDate
      );
      console.timeEnd("parsed");

      for (const meeting of meetings) {
        console.log(meeting);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Maat settings
        </Typography>
        <div>
          <TextField
            id="account"
            label="Google account"
            variant="outlined"
            fullWidth
            placeholder="example@google.com"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            margin="normal"
          />
          <TextField
            id="calendar-url"
            label="Calendar URL"
            variant="outlined"
            fullWidth
            value={calendarUrl}
            onChange={(e) => setCalendarUrl(e.target.value)}
            margin="normal"
          />
          <TextField
            id="update-interval-minutes"
            label="Update Interval (minutes)"
            type="number"
            variant="outlined"
            fullWidth
            value={updateIntervalMinutes}
            onChange={(e) => setUpdateIntervalMinutes(parseInt(e.target.value))}
            margin="normal"
          />
          <TextField
            id="lead-time-minutes"
            label="How long before the meeting the meet page is opened (minutes)"
            type="number"
            variant="outlined"
            fullWidth
            value={leadTimeMinutes}
            onChange={(e) => setLeadTimeMinutes(parseInt(e.target.value))}
            margin="normal"
          />
        </div>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleTest}>
            Test fetching and parsing
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<Options />);
}
