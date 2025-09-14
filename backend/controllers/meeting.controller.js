import { User } from "../models/user.models.js";
import { Meeting } from "../models/meeting.models.js";
import httpStatus from "http-status";

const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)

    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code,
            notes: []
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

// Save meeting notes

// meeting.controller.js
 const saveMeetingNotes = async (req, res) => {
  try {
    const { meetingCode, notes } = req.body;

    // Find meeting
    const meeting = await Meeting.findOne({ meetingCode });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // If no notes yet, create a new one
    if (!meeting.notes || !meeting.notes.data) {
      meeting.notes = {
        name: `${meetingCode}-notes.txt`,
        contentType: "text/plain",
        data: Buffer.from(notes, "utf-8"),
        uploadedAt: new Date(),
      };
    } 
    // Else update existing one
    else {
      meeting.notes.data = Buffer.from(notes, "utf-8");
      meeting.notes.uploadedAt = new Date();
    }

    await meeting.save();
    console.log(meeting.notes);
    res.json({ message: "Notes saved successfully" });

  } catch (error) {
    console.error("Error saving notes:", error);
    res.status(500).json({ message: "Error saving notes" });
  }
};



// Get latest meeting notes
 const getMeetingNotes = async (req, res) => {
  try {
    const { meetingCode } = req.params;
    const meeting = await Meeting.findOne({ meetingCode });

    if (!meeting || !meeting.notes || !meeting.notes.data) {
      return res.json(""); // no notes yet
    }

    // Convert buffer back to text before sending
    const notesText = meeting.notes.data.toString("utf-8");
    res.json(notesText);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Error fetching notes" });
  }
};

const saveMessage = async (req, res) => {
  try {
     console.log("Request Body:", req.body);  // Debugging line
    const { meetingCode, sender, message } = req.body;
    const meeting = await Meeting.findOne({ meetingCode });

    console.log("Meeting Code:", meetingCode); 
     console.log("Meeting Found:", meeting);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // Add message to meeting
    meeting.messages.push({ sender, message });
    await meeting.save();

    res.json({ message: "Message saved successfully" });
  } catch (e) {
    res.status(500).json({ message: `Error saving message: ${e.message}` });
  }
};

const getMessages = async (req, res) => {
  try {
    const { meetingCode } = req.params;
    const meeting = await Meeting.findOne({ meetingCode });

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    res.json(meeting.messages); // send all messages
  } catch (e) {
    res.status(500).json({ message: `Error fetching messages: ${e.message}` });
  }
};


export { getUserHistory, addToHistory, getMeetingNotes, saveMeetingNotes, saveMessage, getMessages }