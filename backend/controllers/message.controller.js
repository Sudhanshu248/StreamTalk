import { Message } from '../models/message.models.js';

// Save a new chat message
const saveChatMessage = async (req, res) => {
  try {
    const { meetingCode, sender, message } = req.body;
    const newMessage = new Message({ meetingCode, sender, message });
    await newMessage.save();
    res.status(201).json({ message: 'Message saved successfully' });
  } catch (e) {
    res.status(500).json({ message: `Error saving message: ${e.message}` });
  }
}

// Get all messages for a meeting
const getChatMessages = async (req, res) => {
  try {
    const { meetingCode } = req.params;
    const messages = await Message.find({ meetingCode }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ message: `Error fetching messages: ${e.message}` });
  }
}

export { saveChatMessage, getChatMessages };