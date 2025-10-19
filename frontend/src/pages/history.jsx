import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { Download } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import "./history.css";

export default function History() {
  const { getHistoryOfUser, getMeetingNotes } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notesStatus, setNotesStatus] = useState({}); // Store which meetings have notes

  // Handle Download for specific meeting
  const handleDownload = async (meetingCode) => {
    try {
      const notes = await getMeetingNotes(meetingCode);
      if (!notes || !notes.trim()) return;

      const blob = new Blob([notes], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${meetingCode}-notes.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading notes: " + error.message);
    }
  };

  // Fetch history and check notes availability
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);

        // Check if notes exist for each meeting
        const statusObj = {};
        for (let m of history) {
          try {
            const notes = await getMeetingNotes(m.meetingCode);
            statusObj[m.meetingCode] = !!(notes && notes.trim());
          } catch {
            statusObj[m.meetingCode] = false;
          }
        }
        setNotesStatus(statusObj);
      } catch {
        // Handle error with Snackbar if needed
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div
      className="history-container"
      style={sidebarOpen ? { width: "400px" } : { width: "60px" }}
    >
       <div className="history-header">
    <button className="history-icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
      <i className="fa-solid fa-clock-rotate-left"></i>
    </button>
    {sidebarOpen && <h2 className="history-word">History</h2>}
  </div>

  {sidebarOpen && (
    <div className="history-scroll-container">
      {meetings.length !== 0 &&
        meetings.slice().reverse().map((e, i) => (
          <Card key={i} variant="outlined" style={{ padding: "20px 0px 0" }}>
            <CardContent style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                  Code: {e.meetingCode}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Date: {formatDate(e.date)}
                </Typography>
              </div>
              <div>
                <Button variant="contained">
                  Summary
                  <img src="/images/ai.png" alt="" style={{ width: "40px" }} />
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={() => handleDownload(e.meetingCode)}
                  disabled={!notesStatus[e.meetingCode]}
                >
                  Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )}
    </div>
  );
}
