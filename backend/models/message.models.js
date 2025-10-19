import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
  meetingCode: { type: String, required: true }, // Reference to the meeting
  sender: { type: String, required: true },      // Username or user ID
  message: { type: String, required: true },     // Message content
  timestamp: { type: Date, default: Date.now }   // When the message was sent
});

const Message = mongoose.model("Message", messageSchema);

export { Message };