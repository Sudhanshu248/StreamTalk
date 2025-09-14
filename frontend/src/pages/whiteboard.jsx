import React, { useState, useContext, useEffect } from "react";
import { Button, TextField, Box, Typography, IconButton, Tooltip } from "@mui/material";
import { Download, Clear, Save, Edit, Notes } from "@mui/icons-material";
import "./whiteboard.css";
import { AuthContext } from "../contexts/AuthContext";
// import { set } from "mongoose";

export default function NotesDownloader() {
  const [notes, setNotes] = useState("");
  const [meetingCode, setMeetingCode] = useState("");
  
  const {getMeetingNotes, saveMeetingNotes, getHistoryOfUser} = useContext(AuthContext);
useEffect(() => {
  const fetchMeetingCode = async () => {
    try {
      const history = await getHistoryOfUser();
      if (history && history.length > 0) {
        const latestMeeting = history[history.length - 1];
        setMeetingCode(latestMeeting.meetingCode);

        try {
          const meetingNotes = await getMeetingNotes(latestMeeting.meetingCode);
          setNotes(meetingNotes || ""); // set string or empty
        } catch {
          setNotes("");
        }
      }
    } catch {
      setMeetingCode("");
      setNotes("");
    }
  };

  fetchMeetingCode();
}, []);


  // const handleDownload = () => {
  //   if (!notes.trim()) {
  //     alert("Please write some notes before downloading!");
  //     return;
  //   }

  //   const blob = new Blob([notes], { type: "text/plain" });
  //   const url = URL.createObjectURL(blob);

  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "notes.txt";
  //   a.click();

  //   URL.revokeObjectURL(url);
  // };


  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all notes?")) {
      setNotes("");
    }
  };

const handleSave = async () => {
  if (!meetingCode || !notes.trim()) return;

  try {
    await saveMeetingNotes(meetingCode, notes);
    console.log(notes);
  } catch (error) {
    console.error("Error saving notes:", error);
  }
};

  return (
    <div style={{ display: 'flex',  flexDirection: 'column', gap: '12px'}}>
      <Box >
        <Typography variant="h5" className="meeting-notes-title">
          Meeting Notes
        </Typography>
      </Box>

      <Box >
        <TextField
          multiline
          fullWidth
          minRows={8}
          variant="outlined"
          value={notes}
          onChange={e => setNotes(e.target.value)}   // <-- Add this line
          placeholder="Start writing your meeting notes here..."
        />
      </Box>

      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClear}
            disabled={!notes.trim()}
          >
            Clear
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={!notes.trim()}
          >
            Save
          </Button>
          
         
      </Box>
    </div>
  );
}
