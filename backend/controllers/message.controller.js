import { Meeting } from '../models/meeting.models.js';

// Save a new chat message
const saveChatMessage = async (req, res) => {
  try {
    const { meetingCode, sender, message } = req.body;
    
    // Find the meeting and push the new message
    const meeting = await Meeting.findOne({ meetingCode });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    meeting.messages.push({ sender, message });
    await meeting.save();

    const newMessage = meeting.messages[meeting.messages.length - 1];
    res.status(201).json(newMessage);
  } catch (e) {
    res.status(500).json({ message: `Error saving message: ${e.message}` });
  }
};

// Get all messages for a meeting
const getChatMessages = async (req, res) => {
  try {
    const { meetingCode } = req.params;
    const meeting = await Meeting.findOne({ meetingCode });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json(meeting.messages);
  } catch (e) {
    res.status(500).json({ message: `Error fetching messages: ${e.message}` });
  }
};

export { saveChatMessage, getChatMessages };